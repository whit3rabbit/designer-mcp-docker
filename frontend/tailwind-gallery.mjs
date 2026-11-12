import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parse, serialize } from "parse5";
import { previewHtml } from "../scripts/lib/frontend.mjs";
import { copy, listFiles, write } from "./templates.mjs";

const groupPath = /^(application|marketing|neobrutalism)\/([a-z0-9-]+)\/(\d+(?:-dark)?)\.html$/;
const labels = { accordion: "Accordion", badge: "Badge", button: "Button", card: "Card",
  dialog: "Dialog", "dropdown-menu": "Dropdown menu", input: "Input", tabs: "Tabs", tooltip: "Tooltip" };

function humanize(slug) {
  return slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function offlineHtml(source) {
  const document = parse(source);
  function visit(parent) {
    if (!parent.childNodes) return;
    parent.childNodes = parent.childNodes.filter((node) => {
      if (["iframe", "embed", "object", "base"].includes(node.tagName)) return false;
      const attrs = node.attrs ?? [];
      const src = attrs.find(({ name }) => name === "src");
      const href = attrs.find(({ name }) => name === "href");
      if (node.tagName === "meta" && attrs.some(({ name }) => name === "http-equiv")) return false;
      if (node.tagName === "link") {
        if (href?.value !== "/component.css") return false;
        href.value = "../../component.css";
      }
      if (node.tagName === "script" && src) {
        if (!/^https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@4\.5\.1\/dist\/chart\.umd\.min\.js$/.test(src.value)) return false;
        src.value = "../../../../starter/vendor/chart.umd.min.js";
      }
      if (node.tagName === "img" && /^https:\/\/images\.unsplash\.com\//.test(src?.value ?? "")) {
        src.value = "../../sample.jpg";
      }
      node.attrs = attrs.filter(({ name, value }) => {
        if (["action", "formaction", "ping", "srcset"].includes(name)) return false;
        if (["href", "src", "poster"].includes(name)) {
          return value.startsWith("#") || value.startsWith("../") || (node.tagName === "img" && value.startsWith("data:image/"));
        }
        return true;
      });
      visit(node);
      return true;
    });
  }
  visit(document);
  return serialize(document);
}

export async function stageTailwindGallery(output, hyperui, cache, modules, shadcnFiles) {
  const root = join(output, "tailwind");
  const source = join(hyperui, "examples");
  const css = (await readFile(join(hyperui, "component.css"), "utf8")).replace(
    /@import\s+"https:\/\/fonts\.googleapis\.com\/[^"]+";/,
    '@import "../../starter/fonts/google-sans-flex/index.css";',
  );
  if (/@import[^;]*https?:/.test(css)) throw new Error("External CSS in the HyperUI snapshot");
  await write(join(root, "hyperui", "component.css"), css);
  await copy(join(hyperui, "LICENSE"), join(root, "hyperui", "LICENSE.txt"));
  await copy(join(cache, "design-systems", "organic", "assets", "photo.jpg"), join(root, "hyperui", "sample.jpg"));
  await copy(join(modules, "chart.js", "dist", "chart.umd.min.js"), join(output, "starter", "vendor", "chart.umd.min.js"));

  const hyperuiGroups = new Map();
  const files = [];
  for await (const file of listFiles(source)) files.push(file);
  for (const file of files.sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
    const [, category, family, id] = groupPath.exec(relative(source, file)) ?? [];
    if (!family) continue;
    const slug = `${category}-${family}`;
    const group = hyperuiGroups.get(slug) ?? { slug, name: humanize(family), category, variants: [] };
    const base = `tailwind/hyperui/${category}/${family}`;
    const example = { id, preview: `${base}/${id}.html`, source: `${base}/${id}.txt` };
    const code = await readFile(file, "utf8");
    await write(join(output, example.source), code);
    await write(join(output, example.preview), offlineHtml(code));
    group.variants.push(example);
    hyperuiGroups.set(slug, group);
  }
  if (!hyperuiGroups.size) throw new Error("The pinned HyperUI snapshot has no component examples");

  const shadcn = [];
  for (const file of shadcnFiles) {
    const slug = file.replace(/\.tsx$/, "");
    if (!Object.hasOwn(labels, slug)) continue;
    const preview = `tailwind/shadcn/${slug}/index.html`;
    const html = previewHtml("../../../starter/modules/shadcn-gallery.mjs", "../../../starter/starter.css")
      .replace('data-preview="loading"', `data-preview="loading" data-demo="${slug}"`);
    await write(join(output, preview), html);
    shadcn.push({ slug, name: labels[slug], variants: [{ id: "default", preview, source: `starter/shadcn/${file}` }] });
  }
  const hyperuiCatalog = [...hyperuiGroups.values()];
  for (const { variants } of hyperuiCatalog) {
    variants.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10) ||
      Number(a.id.endsWith("-dark")) - Number(b.id.endsWith("-dark")));
  }
  return { hyperui: hyperuiCatalog, shadcn };
}
