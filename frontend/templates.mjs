import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { validAssetPath, validSlug } from "../scripts/lib/frontend-paths.mjs";

const deckRuntime = {
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "react/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "react-dom/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js": "@babel/standalone/babel.min.js",
};

export async function* listFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const file = join(dir, entry.name);
    if (entry.isDirectory()) yield* listFiles(file);
    else if (entry.isFile()) yield file;
  }
}

export async function write(file, body) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function copy(file, target) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(file, target);
}

export async function stageTemplates(cache, output, deckModules) {
  const systems = JSON.parse(await readFile(join(cache, "design-systems.json"), "utf8")).systems;
  const root = join(cache, "design-systems");
  const runtimes = {};
  for (const [url, file] of Object.entries(deckRuntime)) {
    const name = file.split("/").at(-1);
    const bytes = await readFile(join(deckModules, file));
    const integrity = "sha384-" + createHash("sha384").update(bytes).digest("base64");
    runtimes[url] = { name, integrity };
    await write(join(output, "starter", "vendor", "deck", name), bytes);
  }

  const templates = {};
  for (const { slug, path, starterTemplates } of systems) {
    const directory = path.replace(/\/$/, "");
    if (!validSlug(slug) || !validAssetPath(directory)) throw new Error(`Invalid template ${slug}`);
    const source = join(root, directory);
    const dest = join(output, "templates", slug);
    const entries = {};
    for (const { name, entryPath } of starterTemplates) {
      if (!validAssetPath(entryPath)) throw new Error(`Invalid template entry: ${entryPath}`);
      entries[entryPath] = { name, kind: entryPath.includes("/deck/") ? "deck" : "landing" };
      await readFile(join(source, entryPath));
      await write(join(dest, dirname(entryPath), "image-slots.state.json"), "{}\n");
    }
    templates[slug] = entries;
    for await (const file of listFiles(source)) {
      const rel = relative(source, file);
      const target = join(dest, rel);
      if (rel === "styles.css") {
        const css = (await readFile(file, "utf8")).replace(
          /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/[^'"]+['"]\)\s*;/g,
          '@import "../../fonts/fonts.css";',
        );
        if (/@import[^;]*(?:https?:|\/\/)/i.test(css)) throw new Error(`External stylesheet in ${file}`);
        await write(target, css);
      } else if (rel === "templates/deck/support.js") {
        let js = await readFile(file, "utf8");
        for (const [url, { name, integrity }] of Object.entries(runtimes)) {
          if (!js.includes(url) || !js.includes(integrity)) throw new Error(`Unexpected deck runtime in ${file}: ${url}`);
          js = js.replaceAll(url, `../../../../starter/vendor/deck/${name}`);
        }
        await write(target, js);
      } else if (/^(?:templates\/(?:deck|landing)\/|assets\/|_ds_bundle\.js$)/.test(rel)) {
        if (rel.endsWith("/image-slot.js")) {
          const js = await readFile(file, "utf8");
          await write(target, js.replaceAll("'.image-slots.state.json'", "'image-slots.state.json'"));
        } else {
          await copy(file, target);
        }
      }
    }
  }
  return templates;
}
