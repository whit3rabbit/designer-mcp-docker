import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { sha256, validAssetPath, validSlug, variantFingerprint } from "../scripts/lib/frontend-paths.mjs";
import { copy, listFiles, stageTemplates, write } from "./templates.mjs";
import { captureThumbnails } from "./thumbnails.mjs";
import { stageTailwindGallery } from "./tailwind-gallery.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const modules = join(here, "node_modules");
const deckModules = join(here, "deck", "node_modules");
const vendor = join(here, "vendor");
const arg = (name) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const cache = resolve(arg("--cache") || join(here, "..", "bake"));
const output = resolve(arg("--out") || join(here, "..", "dist", "frontend"));
const hyperui = resolve(arg("--hyperui") || join(here, "..", "dist", "hyperui-source"));
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const writeJson = (file, data) => write(file, JSON.stringify(data, null, 2) + "\n");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { ...options, stdio: ["pipe", "inherit", "inherit"] });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

async function bundle(scratch, entryPoints, outdir, options = {}) {
  const { metafile } = await build({
    // Keep generated sources relative to the build root so chunk names survive rebuilds.
    absWorkingDir: scratch, entryPoints, outdir, nodePaths: [modules],
    bundle: true, splitting: true, format: "esm", platform: "browser", jsx: "automatic",
    minify: true, target: "es2022", define: { "process.env.NODE_ENV": '"production"' },
    entryNames: "[dir]/[name]", chunkNames: "chunks/[name]-[hash]", outExtension: { ".js": ".mjs" },
    legalComments: "linked", metafile: true, ...options,
  });
  const packages = new Set();
  for (const [file, output] of Object.entries(metafile.outputs)) {
    for (const link of output.imports) {
      if (link.external) throw new Error(`Unbundled import ${link.path} in ${file}`);
    }
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      const path = resolve(scratch, input);
      const base = path.lastIndexOf("/node_modules/");
      if (!bytesInOutput || base === -1) continue;
      const start = base + "/node_modules/".length;
      const parts = path.slice(start).split("/");
      const name = parts.slice(0, parts[0].startsWith("@") ? 2 : 1).join("/");
      packages.add(path.slice(0, start) + name);
    }
  }
  return packages;
}

function tailwind(source, outputFile) {
  run(process.execPath, [
    join(modules, "@tailwindcss", "cli", "dist", "index.mjs"), "--input", source, "--output", outputFile, "--minify",
  ], { cwd: here });
}

async function verifyVendor() {
  const files = await readJson(join(vendor, "checksums.json"));
  for (const { file, sha256: expected } of files) {
    if (!validAssetPath(file) || sha256(await readFile(join(vendor, file))) !== expected) {
      throw new Error(`Frontend vendor checksum mismatch: ${file}`);
    }
  }
  return files;
}

function demoCode(variant) {
  const code = variant.code.replace(/from ["']lucide-react["']/g,
    `from ${JSON.stringify(join(here, "preview-icons.mjs"))}`);
  if (variant.id !== "mic-picker") return code;
  const pattern = /function useRealMicrophone\(\) \{[\s\S]+?(?=\nexport default function Demo\()/;
  const permissionButton = /\{!real && \(\s*<button[\s\S]*?Use my microphone[\s\S]*?<\/button>\s*\)\}/;
  if (!pattern.test(code) || !permissionButton.test(code)) {
    throw new Error("Update the simulated microphone adapter for mic-picker");
  }
  // The original demo already drives the meter from sample input when no device is connected.
  return code.replace(pattern, `function useRealMicrophone() {
    const levelRef = useRef(0);
    return { devices: null as MicDevice[] | null, levelRef,
      error: "Sample devices and simulated levels", start: async (_deviceId?: string) => undefined };
  }
`).replace(permissionButton, "");
}

async function buildPreviews(scratch, out) {
  const index = await readJson(join(cache, "components.json"));
  const demos = join(scratch, "demos");
  const entries = {};
  const previews = {};
  for (const { slug } of index.components) {
    if (!validSlug(slug)) throw new Error(`Invalid component slug: ${slug}`);
    const { variants } = await readJson(join(cache, "components", `${slug}.json`));
    previews[slug] = {};
    for (const variant of variants) {
      if (!validSlug(variant.id) || Object.hasOwn(previews[slug], variant.id)) {
        throw new Error(`Invalid or duplicate variant ID: ${slug}/${variant.id}`);
      }
      const path = `demos/${slug}/${variant.id}`;
      const code = join(demos, slug, `${variant.id}.tsx`);
      const entry = join(scratch, "entries", slug, `${variant.id}.mjs`);
      await write(code, demoCode(variant));
      await write(entry, `import Demo from ${JSON.stringify(code)};
import { mount } from ${JSON.stringify(join(here, "preview-root.mjs"))};
mount(Demo);
`);
      entries[path] = entry;
      previews[slug][variant.id] = { fingerprint: variantFingerprint(variant), module: `previews/${path}.mjs` };
    }
  }
  if (!Object.keys(entries).length) throw new Error("No component demos in the baked catalog");
  const css = join(scratch, "previews.css");
  await write(css, `@import "${join(modules, "tailwindcss", "index.css")}" source(none);
@source "./demos";
${await readFile(join(here, "preview.css"), "utf8")}
`);
  const packages = await bundle(scratch, entries, join(out, "previews"), {
    jsxImportSource: "@offline-preview",
    alias: { "@offline-preview/jsx-runtime": join(here, "preview-jsx.mjs") },
  });
  tailwind(css, join(out, "previews", "preview.css"));
  console.log(`Compiled ${Object.keys(entries).length} catalog demos`);
  return { previews, packages };
}

async function stageFonts(out, names) {
  const families = [];
  for (const name of names.filter((name) => name.startsWith("@fontsource"))) {
    const path = join(modules, name);
    const family = name.split("/").at(-1);
    const styles = family === "google-sans-flex" ? ["full"] : name.startsWith("@fontsource-variable/") ? ["wght", "wght-italic"] :
      family === "caprasimo" ? ["400"] : ["400", "500", "600", "700"];
    const sheets = [];
    for (const style of styles) {
      const css = (await readFile(join(path, `${style}.css`), "utf8"))
        .replace(/(font-family:\s*'[^']+) Variable'/g, "$1'")
        .replace(/, url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, "");
      for (const [, file] of css.matchAll(/url\(\.\/files\/([a-z0-9-]+\.woff2)\)/g)) {
        await copy(join(path, "files", file), join(out, "fonts", family, file));
      }
      sheets.push(css.replaceAll("./files/", "./"));
    }
    await write(join(out, "fonts", family, "index.css"), sheets.join("\n"));
    families.push(family);
  }
  await write(join(out, "fonts", "fonts.css"), families.map((name) => `@import "./${name}/index.css";`).join("\n") + "\n");
}

function resolveShadcn(source) {
  const icons = new Set();
  const resolved = source
    .replace(/import \{ IconPlaceholder \} from "[^"]+"\r?\n/g, "")
    .replace(/from "@\/registry\/radix-vega\/(?:ui|lib)\/([a-z-]+)"/g, 'from "./$1"')
    .replace(/<IconPlaceholder\b([\s\S]*?)\/>/g, (_, attrs) => {
      const name = attrs.match(/\blucide="(\w+)"/)?.[1];
      if (!name) throw new Error("shadcn icon placeholder lacks its Lucide mapping");
      icons.add(name);
      return `<${name}${attrs.replace(/\s+(?:lucide|tabler|hugeicons|phosphor|remix|feather|heroicons|iconoir)="[^"]*"/g, "")}/>`;
    });
  if (resolved.includes('"@/') || resolved.includes("IconPlaceholder")) {
    throw new Error("Unresolved shadcn registry alias");
  }
  return (icons.size ? `import { ${[...icons].join(", ")} } from "lucide-react"\n` : "") + resolved;
}

async function stageShadcn(out, vendorFiles) {
  const names = [];
  for (const { file } of vendorFiles) {
    if (!file.endsWith(".json")) continue;
    const item = await readJson(join(vendor, file));
    for (const { path, content } of item.files ?? []) {
      const base = path.split("/").at(-1);
      if (!validAssetPath(base)) throw new Error(`Invalid shadcn filename: ${path}`);
      await write(join(out, "shadcn", base), resolveShadcn(content));
      names.push(base);
    }
  }
  return names;
}

const browserModules = {
  react: "react", "react-dom": "react-dom", "react-dom/client": "react-dom-client",
  "react/jsx-runtime": "react-jsx-runtime", motion: "motion", "motion/react": "motion-react",
  gsap: "gsap", "@gsap/react": "gsap-react", "gsap/ScrollTrigger": "gsap-scroll-trigger",
  "gsap/Flip": "gsap-flip", "gsap/SplitText": "gsap-split-text",
  "lucide-react": "lucide-react", "@phosphor-icons/react": "phosphor-react",
  "radix-ui": "radix-ui", cn: "cn", "class-variance-authority": "class-variance-authority",
};

async function buildStarter(scratch, out, shadcnFiles) {
  const entries = {};
  const imports = {};
  for (const [specifier, name] of Object.entries(browserModules)) {
    const entry = join(scratch, "modules", `${name}.mjs`);
    const needsDefault = /^(react(?:-dom(?:\/client)?)?|gsap(?:\/.*)?)$/.test(specifier);
    await write(entry, `export * from ${JSON.stringify(specifier)};\n` +
      (needsDefault ? `export { default } from ${JSON.stringify(specifier)};\n` : ""));
    entries[`modules/${name}`] = entry;
    imports[specifier] = `./modules/${name}.mjs`;
  }
  for (const file of shadcnFiles) {
    const name = file.replace(/\.tsx?$/, "");
    entries[`modules/shadcn/${name}`] = join(out, "shadcn", file);
    imports[`shadcn/${name}`] = `./modules/shadcn/${name}.mjs`;
  }
  entries["modules/example"] = join(out, "starter.tsx");
  entries["modules/shadcn-gallery"] = join(out, "shadcn-gallery.tsx");
  const packages = await bundle(scratch, entries, out);
  const importMap = { imports };
  await writeJson(join(out, "import-map.json"), importMap);
  await write(join(out, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline design starter</title>
<link rel="stylesheet" href="./starter.css">
<link rel="stylesheet" href="./fonts/fonts.css">
<script type="importmap">${JSON.stringify(importMap)}</script>
<script type="module" src="./modules/example.mjs"></script>
</head>
<body><div id="root"></div></body>
</html>
`);

  const { cssVars } = await readJson(join(vendor, "theme.json"));
  const roles = Object.keys(cssVars.light);
  const values = (theme) => Object.entries(cssVars[theme]).map(([name, value]) => `--${name}: hsl(${value});`).join("\n");
  const css = join(scratch, "starter.css");
  await write(css, `@import "${join(modules, "tailwindcss", "index.css")}" source(none);
@import "${join(modules, "tw-animate-css", "dist", "tw-animate.css")}";
@import "${join(vendor, "shadcn-tailwind.css")}";
@source "${join(out, "starter.tsx")}";
@source "${join(out, "shadcn-gallery.tsx")}";
@source "${join(out, "shadcn")}";
@custom-variant dark (&:is(.dark *));
:root { ${values("light")} --radius: .625rem; }
.dark { ${values("dark")} }
@theme inline {
  ${roles.map((name) => `--color-${name}: var(--${name});`).join("\n")}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; font-family: Inter, system-ui, sans-serif; }
}
`);
  tailwind(css, join(out, "starter.css"));
  await copy(join(vendor, "shadcn-tailwind.css"), join(out, "css", "shadcn-tailwind.css"));
  await copy(join(modules, "tw-animate-css", "dist", "tw-animate.css"), join(out, "css", "tw-animate.css"));
  await copy(join(modules, "@tailwindcss", "browser", "dist", "index.global.js"), join(out, "vendor", "tailwind-browser.js"));
  for (const name of ["gsap", "ScrollTrigger", "Flip", "SplitText"]) {
    await copy(join(modules, "gsap", "dist", `${name}.min.js`), join(out, "vendor", `${name}.min.js`));
  }
  return packages;
}

async function stageLicenses(out, packages, deckPackages, bundlePackages, vendorFiles) {
  const result = [];
  const direct = packages.map((name) => join(modules, name));
  const bundled = [...bundlePackages].filter((dir) => !direct.includes(dir)).sort();
  for (const [directories, group] of [
    [direct, ""],
    [deckPackages.map((name) => join(deckModules, name)), "deck"],
    [bundled, "dependency"],
  ]) {
    for (const dir of directories) {
      const { name, version, license } = await readJson(join(dir, "package.json"));
      const licenses = (await readdir(dir)).filter((file) => /^(?:license|notice)(?:\.|$)/i.test(file)).sort();
      const dest = ["licenses", group, name.replace(/^@/, "").replaceAll("/", "-"), version].filter(Boolean).join("/");
      const files = [];
      for (const license of licenses) {
        const path = `${dest}/${license}`;
        await copy(join(dir, license), join(out, path));
        files.push(path);
      }
      const upstreamNotice = name === "gsap" || name === "@gsap/react" ? "gsap-LICENSE.txt" :
        name === "react-remove-scroll-bar" ? "react-remove-scroll-bar-LICENSE.txt" : null;
      if (upstreamNotice) {
        const path = `${dest}/LICENSE.txt`;
        await copy(join(vendor, upstreamNotice), join(out, path));
        files.push(path);
      }
      if (!files.length) throw new Error(`Missing license notice for ${name}`);
      result.push({ name, version, license: license ?? null, notices: files, ...(group && { group }) });
    }
  }
  const notice = "licenses/shadcn/LICENSE.md";
  await copy(join(vendor, "shadcn-LICENSE.md"), join(out, notice));
  const shadcn = vendorFiles.find(({ file }) => file === "shadcn-tailwind.css").package;
  result.push({ ...shadcn, notices: [notice] });
  return result;
}

async function inspectFiles(root) {
  const result = {};
  for await (const file of listFiles(root)) {
    const path = relative(root, file);
    if (!validAssetPath(path)) throw new Error(`Invalid output path ${path}`);
    const bytes = await readFile(file);
    result[path] = { sha256: sha256(bytes), bytes: bytes.length };
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, "en")));
}

const scratch = await mkdtemp(join(tmpdir(), "designer-frontend-"));
try {
  const out = join(scratch, "output", "public");
  const pack = join(out, "starter");
  const packages = Object.keys((await readJson(join(here, "package.json"))).dependencies);
  const deckPackages = Object.keys((await readJson(join(here, "deck", "package.json"))).dependencies);
  const vendorFiles = await verifyVendor();
  const shadcn = await stageShadcn(pack, vendorFiles);
  await stageFonts(pack, packages);
  await copy(join(here, "starter.tsx"), join(pack, "starter.tsx"));
  await copy(join(here, "shadcn-gallery.tsx"), join(pack, "shadcn-gallery.tsx"));
  const starterPackages = await buildStarter(scratch, pack, shadcn);
  const templates = await stageTemplates(cache, out, deckModules);
  // Templates reference the same font faces and binaries as the downloadable starter.
  const templateFontImport = '@import "../starter/fonts/fonts.css";\n';
  await write(join(out, "fonts", "fonts.css"), templateFontImport);
  const { previews, packages: previewPackages } = await buildPreviews(scratch, out);
  const tailwindGallery = await stageTailwindGallery(out, hyperui, cache, modules, shadcn);
  await captureThumbnails(out, previews, tailwindGallery);
  const browserPackages = packages.filter((name) => !["esbuild", "parse5", "@tailwindcss/cli"].includes(name));
  const licenses = await stageLicenses(pack, browserPackages, deckPackages, new Set([...starterPackages, ...previewPackages]), vendorFiles);
  await writeJson(join(pack, "packages.json"), { packages: licenses, vendorSnapshot: vendorFiles });
  await write(join(pack, "README.txt"), `Offline design starter

Serve this directory with a local static HTTP server, for example:
  python3 -m http.server 8080
Then open http://127.0.0.1:8080/.

Use the relative import map to load the browser modules. starter.tsx and
shadcn/ contain source. starter.css contains the compiled example utilities.
For new utility classes, compile Tailwind with your project sources or load
vendor/tailwind-browser.js in a local development page. Use fonts/fonts.css
for self-hosted font faces. Package versions and licenses are in packages.json.
`);
  const packFiles = await inspectFiles(pack);
  for (const file of Object.keys(packFiles)) {
    const date = new Date("2000-01-01T00:00:00Z");
    await utimes(join(pack, file), date, date);
  }
  run("zip", ["-q", "-X", join(out, "starter.zip"), "-@"], {
    cwd: pack, input: Object.keys(packFiles).join("\n") + "\n",
  });
  const files = await inspectFiles(out);
  const version = sha256(JSON.stringify(files)).slice(0, 20);
  const manifest = { version, files, previews, templates, tailwindGallery, packages: licenses, vendorSnapshot: vendorFiles };
  await writeJson(join(scratch, "output", "manifest.json"), manifest);

  // Copy completely before replacing an existing cache, and never replace unrelated files.
  const existing = await readdir(output).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  if (existing.length && (existing.some((file) => !["manifest.json", "public"].includes(file)) ||
      !existing.includes("manifest.json"))) throw new Error(`Refusing to replace a non-frontend directory: ${output}`);
  await mkdir(dirname(output), { recursive: true });
  const staging = await mkdtemp(`${output}.staging-`);
  try {
    await copy(join(scratch, "output", "manifest.json"), join(staging, "manifest.json"));
    for await (const file of listFiles(out)) await copy(file, join(staging, "public", relative(out, file)));
    await rm(output, { recursive: true, force: true });
    await rename(staging, output);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  console.log(`Frontend cache ${version} written to ${output} (starter ZIP ${(await stat(join(out, "starter.zip"))).size} bytes)`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
