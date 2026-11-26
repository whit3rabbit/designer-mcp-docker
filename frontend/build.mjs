import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { daisyuiPreviewDocument } from "../scripts/lib/frontend.mjs";
import { sha256, validAssetPath, validSlug, variantFingerprint } from "../scripts/lib/frontend-paths.mjs";
import { nativePreviewDocument } from "../scripts/lib/slopstrap.mjs";
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
    const detail = await readJson(join(cache, "components", `${slug}.json`));
    // Non-React catalog entries (the vendored Slopstrap framework) ship as
    // gallery examples instead; no preview entry means no iframe in the UI.
    if (detail.previewable === false) continue;
    const { variants } = detail;
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

/**
 * Stage the vendored Slopstrap framework into the public root so the
 * /assets file server can serve it. Gracefully absent: a cache without the
 * layer just loses the easter egg, not the build.
 */
async function stageSlopstrap(out) {
  const src = join(cache, "slopstrap");
  const inputs = {
    zip: join(src, "slopstrap.zip"),
    css: join(src, "dist", "slopstrap.css"),
    js: join(src, "dist", "slopstrap.js"),
  };
  if (!existsSync(inputs.zip) || !existsSync(inputs.css) || !existsSync(inputs.js)) {
    console.log("Slopstrap layer not found in the cache; skipped");
    return null;
  }
  const files = { zip: "slopstrap/slopstrap.zip", css: "slopstrap/slopstrap.css", js: "slopstrap/slopstrap.js" };
  await copy(inputs.zip, join(out, files.zip));
  await copy(inputs.css, join(out, files.css));
  await copy(inputs.js, join(out, files.js));
  await write(join(out, "slopstrap", "README.txt"), `Slopstrap v4.2.0
https://slopstrap.mikelacher.com/ — by Mike Lacher (https://mikelacher.com).
MIT license; the upstream README ships inside slopstrap.zip. Vendored
verbatim by the designer-mcp gallery. Unzip the archive, place an example
next to dist/, and open it in a browser, or load slopstrap.css plus
slopstrap.js directly in any page.
`);
  return files;
}

/**
 * Native previews for catalog entries that are plain HTML documents rather
 * than React demos (previewable: false with a preview.css/js pair): each
 * variant's example is inlined with the framework CSS and JS into one
 * self-contained file, so gallery iframes, the static site, and the
 * thumbnail capturer need no asset resolution at all.
 */
async function buildNativePreviews(scratch, out) {
  const index = await readJson(join(cache, "components.json"));
  const result = {};
  let count = 0;
  for (const { slug } of index.components) {
    const detail = await readJson(join(cache, "components", `${slug}.json`));
    if (detail.previewable !== false || !detail.preview?.css || !detail.preview?.js) continue;
    const css = await readFile(join(cache, detail.preview.css), "utf8");
    const js = await readFile(join(cache, detail.preview.js), "utf8");
    result[slug] = {};
    for (const variant of detail.variants || []) {
      if (!validSlug(variant.id)) throw new Error(`Invalid variant ID: ${slug}/${variant.id}`);
      const file = `previews/native/${slug}/${variant.id}.html`;
      await write(join(out, file), nativePreviewDocument(variant.code, css, js));
      result[slug][variant.id] = { fingerprint: variantFingerprint(variant), native: file };
      count += 1;
    }
  }
  if (count) console.log(`Built ${count} native HTML previews`);
  return result;
}

const OFFLINE_AVATAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%2327272a'/%3E%3Ccircle cx='32' cy='25' r='10' fill='%2371717a'/%3E%3Cpath d='M16 54c2-10 10-14 16-14s14 4 16 14' fill='%2371717a'/%3E%3C/svg%3E";

function sanitizeReuiCode(code) {
  return String(code || "")
    .replace(/https:\/\/images\.unsplash\.com\/[^"'\s`)]+/g, OFFLINE_AVATAR_SVG)
    .replace(/https:\/\/github\.com\/shadcn\.png/g, OFFLINE_AVATAR_SVG)
    .replace(/`https:\/\/randomuser\.me\/api\/portraits\/[^`]+`/g, JSON.stringify(OFFLINE_AVATAR_SVG))
    .replace(/https:\/\/randomuser\.me\/api\/portraits\/[^"'\s`)]+/g, OFFLINE_AVATAR_SVG);
}

function resolveFileCandidate(base) {
  for (const ext of ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"]) {
    const candidate = base + ext;
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function reuiAliasPlugin(runtimeDir) {
  return {
    name: "reui-alias",
    setup(build) {
      build.onResolve({ filter: /^@\/app\/\(create\)\/components\/icon-placeholder$/ }, () => ({
        path: join(here, "reui-icon-placeholder.tsx"),
      }));
      build.onResolve({ filter: /^next-themes$/ }, () => ({
        path: join(here, "reui-next-themes.mjs"),
      }));
      build.onResolve({ filter: /^@\// }, (args) => {
        const rel = args.path.slice(2);
        const resolved = resolveFileCandidate(join(runtimeDir, rel));
        if (resolved) return { path: resolved };
        return null;
      });
    },
  };
}

async function buildReuiPreviews(scratch, out) {
  const reuiDir = join(cache, "reui");
  const indexPath = join(reuiDir, "index.json");
  if (!existsSync(indexPath)) return { reuiPreviews: {}, packages: new Set() };
  const index = await readJson(indexPath);
  const runtimeDir = join(reuiDir, "runtime");
  const demos = join(scratch, "reui-demos");
  const entries = {};
  const reuiPreviews = {};

  for (const { slug } of index.categories || []) {
    if (!validSlug(slug)) throw new Error(`Invalid ReUI category slug: ${slug}`);
    const cat = await readJson(join(reuiDir, "categories", `${slug}.json`));
    if (!cat?.items?.length) continue;
    reuiPreviews[slug] = {};
    for (const item of cat.items) {
      if (!validSlug(item.name)) throw new Error(`Invalid ReUI item name: ${slug}/${item.name}`);
      if (!item.radixCode) continue;
      const path = `reui/${slug}/${item.name}`;
      const codeFile = join(demos, slug, `${item.name}.tsx`);
      const entryFile = join(scratch, "reui-entries", slug, `${item.name}.mjs`);
      await write(codeFile, sanitizeReuiCode(item.radixCode));
      await write(entryFile, `import Demo from ${JSON.stringify(codeFile)};
import { mount } from ${JSON.stringify(join(here, "reui-preview-root.mjs"))};
mount(Demo);
`);
      entries[path] = entryFile;
      reuiPreviews[slug][item.name] = { module: `previews/${path}.mjs` };
    }
  }

  if (!Object.keys(entries).length) return { reuiPreviews: {}, packages: new Set() };

  const packages = await bundle(scratch, entries, join(out, "previews"), {
    plugins: [reuiAliasPlugin(runtimeDir)],
    jsxImportSource: "react",
  });

  const { cssVars } = await readJson(join(vendor, "theme.json"));
  const roles = Object.keys(cssVars.light);
  // The vendored theme predates shadcn's sidebar palette, which the reui
  // style sheets @apply. Provide the standard values for the reui previews.
  const sidebarRoles = ["sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
    "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"];
  const sidebarVars = {
    light: "hsl(0 0% 98%)|hsl(240 5.3% 26.1%)|hsl(240 5.9% 10%)|hsl(0 0% 98%)|hsl(240 4.8% 95.9%)|hsl(240 5.9% 10%)|hsl(220 13% 91%)|hsl(217.2 91.2% 59.8%)",
    dark: "hsl(240 5.9% 10%)|hsl(240 4.8% 95.9%)|hsl(224.3 76.3% 48%)|hsl(0 0% 100%)|hsl(240 3.7% 15.9%)|hsl(240 4.8% 95.9%)|hsl(240 3.7% 15.9%)|hsl(217.2 91.2% 59.8%)",
  };
  const sidebarByRole = (theme) => sidebarRoles
    .map((name, i) => `  --${name}: ${sidebarVars[theme].split("|")[i]};`)
    .join("\n");
  const values = (theme) => Object.entries(cssVars[theme]).map(([name, value]) => `--${name}: hsl(${value});`).join("\n")
    + "\n" + sidebarByRole(theme);
  const styleSheet = join(runtimeDir, "styles", "style-nova.css");
  if (!existsSync(styleSheet)) {
    throw new Error(`ReUI style sheet is missing: ${styleSheet}. Re-run \`npm run reui\` so the cn-* component classes are cached.`);
  }
  const css = join(scratch, "reui.css");
  await write(css, `@import "${join(modules, "tailwindcss", "index.css")}" source(none);
@import "${join(modules, "tw-animate-css", "dist", "tw-animate.css")}";
@import "${join(vendor, "shadcn-tailwind.css")}";
@import "${styleSheet}";
@source "./reui-demos";
@source "${runtimeDir}";
@custom-variant dark (&:is(.dark *));
:root { ${values("light")} --radius: .625rem; }
.dark { ${values("dark")} }
@theme inline {
  ${roles.concat(sidebarRoles).map((name) => `--color-${name}: var(--${name});`).join("\n  ")}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; font-family: Inter, system-ui, sans-serif; }
}
${await readFile(join(here, "preview.css"), "utf8")}
`);
  tailwind(css, join(out, "previews", "reui.css"));
  console.log(`Compiled ${Object.keys(entries).length} ReUI component previews`);
  return { reuiPreviews, packages };
}

// ------------------------------------------------------- Mantine previews
// The ui.mantine.dev demos are real React components importing real npm
// packages. One shared vendor chunk carries @mantine/* (bundled from the
// vendored tarballs, with react externalized to the import map so demos and
// library share one react instance); each demo bundles its own icons, css
// modules and helpers on top. A demo that fails to bundle is skipped with a
// logged count — the gallery then shows its source without an iframe.

/**
 * Expand the Mantine PostCSS mixins the demo CSS modules use (@mixin dark,
 * light, hover, smaller-than/larger-than) and un-nest every rule, so plain
 * browser CSS comes out the other side. Class names are collected and
 * exported as the module's default: the modules stay un-hashed, so a class
 * name resolves to itself.
 */
function expandMantineCss(source) {
  const classes = new Set();
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");

  // Parse the stylesheet into nested { rule | decl } nodes.
  function parseNodes(s, start, end) {
    const nodes = [];
    let i = start;
    while (i < end) {
      let brace = -1;
      let semi = -1;
      let paren = 0;
      for (let j = i; j < end; j++) {
        const ch = s[j];
        if (ch === "(") paren++;
        else if (ch === ")") paren--;
        else if (!paren && ch === "{") { brace = j; break; }
        else if (!paren && ch === ";") { semi = j; break; }
      }
      if (semi !== -1 && (brace === -1 || semi < brace)) {
        const decl = s.slice(i, semi).trim();
        if (decl) nodes.push({ type: "decl", text: decl });
        i = semi + 1;
      } else if (brace === -1) {
        const trailing = s.slice(i, end).trim();
        if (trailing) nodes.push({ type: "decl", text: trailing });
        break;
      } else {
        let close = brace;
        let inner = 1;
        for (let j = brace + 1; j < end; j++) {
          if (s[j] === "{") inner++;
          else if (s[j] === "}") { inner--; if (!inner) { close = j; break; } }
        }
        nodes.push({ type: "rule", prelude: s.slice(i, brace).trim(), children: parseNodes(s, brace + 1, close) });
        i = close + 1;
      }
    }
    return nodes;
  }

  // postcss-preset-mantine puts breakpoint lengths in em, 0.1px under the edge.
  const emMedia = (params, max) => {
    const m = /^\s*([\d.]+)\s*(px|em|rem)\s*$/.exec(params || "");
    if (!m) return null;
    const value = parseFloat(m[1]) * (m[2] === "px" ? 1 / 16 : 1) - 0.1 / 16;
    return `@media (${max ? "max" : "min"}-width: ${value.toFixed(2)}em)`;
  };
  const splitSelectors = (sel) => {
    const parts = [];
    let current = "";
    let paren = 0;
    for (const ch of sel) {
      if (ch === "(") paren++;
      if (ch === ")") paren--;
      if (ch === "," && !paren) { parts.push(current.trim()); current = ""; }
      else current += ch;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  };
  const collectClasses = (selectors) => {
    for (const sel of selectors) {
      for (const match of sel.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) classes.add(match[1]);
    }
  };

  // Render nodes against a parent selector list; parent === null at top level.
  function render(nodes, parents, insideKeyframes) {
    const chunks = [];
    const decls = nodes.filter((n) => n.type === "decl").map((n) => n.text);
    const resolved = parents && !insideKeyframes
      ? parents
      : null;
    if (decls.length && resolved) chunks.push(`${resolved.join(", ")} { ${decls.join("; ")}; }`);
    else if (decls.length && insideKeyframes) chunks.push(decls.join("; "));
    else if (decls.length) chunks.push(decls.join(";\n"));

    for (const node of nodes) {
      if (node.type !== "rule") continue;
      const prelude = node.prelude;
      if (insideKeyframes) {
        chunks.push(`${prelude} { ${render(node.children, null, true).join(" ")} }`);
        continue;
      }
      const mixin = /^@mixin\s+([\w-]+)(?:\(([^)]*)\))?$/.exec(prelude);
      if (mixin) {
        const [, name, arg] = mixin;
        const scheme = name === "dark" || name === "light" ? `[data-mantine-color-scheme='${name}']` : null;
        if (scheme && parents) {
          const selectors = parents.map((p) => `${scheme} ${p}`);
          collectClasses(selectors);
          chunks.push(render(node.children, selectors, false).join("\n"));
        } else if ((name === "hover" || name === "where-hover") && parents) {
          const selectors = parents.map((p) => (name === "hover" ? `${p}:hover` : `${p}:where(:hover)`));
          collectClasses(selectors);
          const body = declsOf(node.children);
          chunks.push(`@media (hover: hover) { ${selectors.join(", ")} { ${body} } }`);
        } else if (name === "smaller-than" || name === "larger-than") {
          const media = emMedia(arg, name === "smaller-than");
          if (!media || !parents) throw new Error(`unsupported @mixin ${prelude}`);
          collectClasses(parents);
          chunks.push(`${media} { ${parents.join(", ")} { ${declsOf(node.children)} } }`);
        } else {
          throw new Error(`unsupported @mixin ${prelude}`);
        }
        continue;
      }
      if (prelude.startsWith("@keyframes")) {
        chunks.push(`${prelude} { ${render(node.children, null, true).join(" ")} }`);
        continue;
      }
      if (prelude.startsWith("@media") || prelude.startsWith("@supports") || prelude.startsWith("@container")) {
        const inner = render(node.children, parents, false).join("\n");
        chunks.push(inner ? `${prelude} { ${inner} }` : "");
        continue;
      }
      if (prelude.startsWith("@")) {
        // @font-face and friends carry declarations, not nested selectors.
        const declText = declsOf(node.children);
        chunks.push(`${prelude} { ${declText} }`);
        continue;
      }
      const selectors = splitSelectors(prelude).map((sel) =>
        parents
          ? parents.map((p) => (sel.includes("&") ? sel.replaceAll("&", p) : `${p} ${sel}`))
          : [sel],
      ).flat();
      if (!selectors.length) continue;
      collectClasses(selectors);
      chunks.push(render(node.children, selectors, false).join("\n"));
    }
    return chunks.filter(Boolean);
  }

  function declsOf(nodes) {
    return nodes.filter((n) => n.type === "decl").map((n) => n.text).join("; ");
  }

  const css = render(parseNodes(text, 0, text.length), null, false).join("\n");
  return { css, classes: Object.fromEntries([...classes].map((name) => [name, name])) };
}

/** A "css modules lite" loader: the module exports its own class names, and
 *  the expanded css is collected for the shared mantine stylesheet. */
function mantineCssModulesPlugin(collector) {
  const MARK = "\0mantine-module:";
  return {
    name: "mantine-css-modules",
    setup(build) {
      build.onResolve({ filter: /\.module\.css$/ }, (args) => ({
        // Resolve here: the onLoad callback receives the path verbatim.
        path: MARK + resolve(args.resolveDir || process.cwd(), args.path),
        namespace: "mantine-mod",
      }));
      build.onLoad({ filter: /.*/, namespace: "mantine-mod" }, async (args) => {
        const real = args.path.slice(MARK.length);
        const { css, classes } = expandMantineCss(await readFile(real, "utf8"));
        collector.set(real, css);
        return {
          contents: `export default ${JSON.stringify(classes)}`,
          loader: "js",
          resolveDir: dirname(real),
        };
      });
    },
  };
}

/** Exact-match externals: react rides the import map, never the bundle. */
function externalExactPlugin(specifiers) {
  const set = new Set(specifiers);
  return {
    name: "external-exact",
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) =>
        set.has(args.path) ? { path: args.path, external: true } : null);
    },
  };
}

const MANTINE_REACT_EXTERNALS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime"];
const MANTINE_LOADER = {
  ".svg": "dataurl", ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl",
  ".gif": "dataurl", ".webp": "dataurl", ".avif": "dataurl",
};

async function buildMantinePreviews(scratch, out) {
  const mantineDir = join(cache, "mantine");
  const indexPath = join(mantineDir, "index.json");
  if (!existsSync(indexPath)) {
    console.log("Mantine layer not found in the cache; skipped");
    return null;
  }
  const index = await readJson(indexPath);
  const vendorRoot = join(mantineDir, "vendor");
  const versions = {};
  if (existsSync(join(mantineDir, "provenance.json"))) {
    for (const [name, rec] of Object.entries((await readJson(join(mantineDir, "provenance.json"))).packages || {})) {
      versions[name] = rec.version;
    }
  }
  for (const required of ["@mantine/core", "@mantine/hooks"]) {
    if (!versions[required]) {
      console.log(`Mantine vendor tree is missing ${required}; run npm run mantine; skipped`);
      return null;
    }
  }

  const work = join(scratch, "mantine");
  const cssStore = new Map();
  const previews = {};
  const failures = [];
  const remoteUrls = new Map(); // url -> { file, mime }
  const dataUrls = new Map(); // url -> data url (both code and css rewrite to it)
  const seenSlugs = new Set();

  // Stage every demo's sources (and the siblings it imports) as a plain file
  // tree the bundler can resolve. Remote image urls are inlined as data urls:
  // a plain string replacement that is valid everywhere the url appears
  // (JSX attributes, object values, css url()), same trick the ReUI layer uses.
  const stageComponent = async (slug, errors) => {
    const detail = await readJson(join(mantineDir, "components", `${slug}.json`));
    if (!detail) {
      errors.push(`${slug}: detail missing from the cache`);
      return null;
    }
    for (const file of detail.files || []) {
      let code = file.code;
      for (const [url, dataUrl] of dataUrls) code = code.split(url).join(dataUrl);
      await write(join(work, detail.name, file.name), code);
    }
    for (const asset of detail.assets || []) {
      const from = join(mantineDir, asset.path);
      if (existsSync(from)) await copy(from, join(work, detail.name, asset.name));
      else errors.push(`${slug}: local asset missing: ${asset.name}`);
    }
    return detail;
  };

  // Base64 for every cached remote image up front: staging and the css
  // rewrite share it, and the map doubles as the rewrite table.
  for (const entry of index.components) {
    const detail = await readJson(join(mantineDir, "components", `${entry.slug}.json`));
    for (const { url, file, mime } of detail?.remote || []) {
      if (dataUrls.has(url)) continue;
      const bytes = join(mantineDir, "assets", file);
      if (!existsSync(bytes)) {
        console.log(`  - ${entry.slug}: cached remote image missing (${file}); its demo may show a gap`);
        continue;
      }
      remoteUrls.set(url, { file, mime });
      dataUrls.set(url, `data:${mime};base64,${(await readFile(bytes)).toString("base64")}`);
    }
  }

  const skipped = [];
  for (const comp of index.components) {
    if (!validSlug(comp.slug)) {
      skipped.push(`${comp.slug}: invalid slug`);
      continue;
    }
    seenSlugs.add(comp.slug);
    const errors = [];
    const detail = await stageComponent(comp.slug, errors);
    // Staging is idempotent, so a sibling that is itself a catalog entry
    // (NavbarLinksGroup needs UserButton) is simply staged twice.
    for (const require of detail?.requires || []) await stageComponent(require.slug, errors);
    if (errors.length) skipped.push(...errors);
  }

  // The vendor chunk: @mantine plus dayjs, react externalized to the import
  // map so demos and library share one react instance. Bare imports resolve
  // into the vendored npm trees via esbuild's alias option: it keeps subpath
  // imports ("@mantine/core/styles.css") working and applies the vendored
  // package.json resolution.
  const vendorAlias = {};
  for (const [name, version] of Object.entries(versions)) {
    vendorAlias[name] = join(vendorRoot, name, version);
  }
  const demosOut = join(out, "previews", "mantine");

  // Content-addressed single-file chunk: built without writing, hashed, and
  // written under its content name.
  const writeHashed = async (relBase, outputFiles) => {
    const js = outputFiles.find((file) => file.path.endsWith(".mjs"));
    if (!js) throw new Error("no .mjs output from a mantine chunk build");
    const rel = `${relBase}-${sha256(js.contents).slice(0, 8)}.mjs`;
    await write(join(out, rel), js.contents);
    return rel;
  };

  const vendorEntry = join(work, "vendor-entry.mjs");
  await write(vendorEntry, `export * from "@mantine/core";
export * from "@mantine/hooks";
export * from "@mantine/form";
export * from "@mantine/dates";
export { default } from "dayjs";
`);
  const vendorBuild = await build({
    absWorkingDir: scratch, entryPoints: [vendorEntry], outdir: join(out, "previews", "mantine"),
    entryNames: "vendor", bundle: true, splitting: false, format: "esm", platform: "browser",
    minify: true, target: "es2022", define: { "process.env.NODE_ENV": '"production"' },
    metafile: true, outExtension: { ".js": ".mjs" }, legalComments: "none", write: false,
    alias: vendorAlias,
    plugins: [externalExactPlugin(MANTINE_REACT_EXTERNALS)],
  });
  const vendorFile = await writeHashed("previews/mantine/vendor", vendorBuild.outputFiles);
  const vendorExternals = Object.values(vendorBuild.metafile.outputs)
    .flatMap((output) => output.imports)
    .filter((link) => link.external)
    .map((link) => link.path);
  for (const external of vendorExternals) {
    if (!MANTINE_REACT_EXTERNALS.includes(external)) {
      throw new Error(`mantine vendor chunk left an unexpected external: ${external}`);
    }
  }

  // The react family rides the import map, not the bundle: react is CJS, so
  // `export *` cannot see its names statically (the starter's react module
  // therefore only re-exports the default). These entries bundle react +
  // react-dom once and re-export every name the demos and @mantine use; one
  // esbuild build for both entries keeps a single react instance, which the
  // demo bundles then share through the import map.
  // Newer Node also lists a "module.exports" key on a CJS namespace. It is
  // not an identifier, so `export const module.exports` would not parse.
  const exportName = (key) => key !== "default" && /^[A-Za-z_$][\w$]*$/.test(key);
  const reactKeys = Object.keys(await import("react")).filter(exportName);
  const reactDomKeys = Object.keys(await import("react-dom"))
    .filter((key) => exportName(key) && !reactKeys.includes(key));
  const clientKeys = ["createRoot", "hydrateRoot"].filter((key) => !reactKeys.includes(key) && !reactDomKeys.includes(key));
  const reactEntry = join(work, "react-entry.mjs");
  await write(reactEntry, [
    'import * as React from "react";',
    'import * as ReactDOM from "react-dom";',
    'import { createRoot, hydrateRoot } from "react-dom/client";',
    'const ReactDefault = React.default !== void 0 ? React.default : React;',
    "export default ReactDefault;",
    ...reactKeys.map((key) => `export const ${key} = React.${key};`),
    ...reactDomKeys.map((key) => `export const ${key} = ReactDOM.${key};`),
    ...(clientKeys.length ? [`export { ${clientKeys.join(", ")} };`] : []),
  ].join("\n") + "\n");
  const jsxEntry = join(work, "jsx-entry.mjs");
  await write(jsxEntry, [
    'import { Fragment, jsx, jsxs } from "react/jsx-runtime";',
    "export { Fragment, jsx, jsxs };",
    "",
  ].join("\n"));
  const reactBuild = await build({
    absWorkingDir: scratch, entryPoints: [reactEntry, jsxEntry], outdir: demosOut,
    entryNames: "[name]", bundle: true, splitting: true, format: "esm", platform: "browser",
    minify: true, target: "es2022", define: { "process.env.NODE_ENV": '"production"' },
    metafile: true, outExtension: { ".js": ".mjs" }, chunkNames: "chunks/chunk-[hash]",
    legalComments: "none", nodePaths: [modules],
  });
  const reactOutput = async (entryPath) => {
    for (const [key, output] of Object.entries(reactBuild.metafile.outputs)) {
      if (output.entryPoint && resolve(scratch, output.entryPoint) === resolve(entryPath)) {
        // Content-address the entry, like the vendor chunk; its chunk
        // imports are directory-relative and survive the rename.
        const abs = join(scratch, key);
        const bytes = await readFile(abs);
        const rel = `previews/mantine/${basename(key, ".mjs")}-${sha256(bytes).slice(0, 8)}.mjs`;
        await write(join(out, rel), bytes);
        await rm(abs, { force: true });
        return rel;
      }
    }
    throw new Error("the mantine react chunk produced no output");
  };
  const reactFile = await reactOutput(reactEntry);
  const jsxFile = await reactOutput(jsxEntry);

  const vendorSpecifiers = {
    "@mantine/core": vendorFile, "@mantine/hooks": vendorFile, "@mantine/form": vendorFile,
    "@mantine/dates": vendorFile, dayjs: vendorFile,
    react: reactFile, "react-dom": reactFile, "react-dom/client": reactFile,
    "react/jsx-runtime": jsxFile,
  };

  // One entry per demo.
  const entries = {};
  for (const comp of index.components) {
    if (!seenSlugs.has(comp.slug) || skipped.some((line) => line.startsWith(`${comp.slug}:`))) continue;
    const codeFile = join(work, comp.name, `${comp.name}.tsx`);
    if (!existsSync(codeFile)) {
      skipped.push(`${comp.slug}: no ${comp.name}.tsx to lead with`);
      continue;
    }
    const lines = [
      `import { mount } from ${JSON.stringify(join(here, "mantine-preview-root.mjs"))};`,
      `import { ${comp.name} as Demo } from ${JSON.stringify(codeFile)};`,
      `mount(Demo);`,
    ];
    entries[comp.slug] = join(scratch, "mantine-entries", `${comp.slug}.mjs`);
    await write(entries[comp.slug], lines.join("\n") + "\n");
  }

  const buildOptions = {
    absWorkingDir: scratch, outdir: demosOut, bundle: true, splitting: true, format: "esm", platform: "browser",
    jsx: "automatic", jsxImportSource: "react", minify: true, target: "es2022",
    define: { "process.env.NODE_ENV": '"production"' }, metafile: true,
    outExtension: { ".js": ".mjs" }, entryNames: "[dir]/[name]", chunkNames: "chunks/chunk-[hash]",
    loader: MANTINE_LOADER, nodePaths: [modules], legalComments: "none",
    alias: vendorAlias,
    plugins: [
      externalExactPlugin([...MANTINE_REACT_EXTERNALS, ...Object.keys(vendorSpecifiers)]),
      mantineCssModulesPlugin(cssStore),
    ],
  };

  const moduleFor = (metafile, entryPath) => {
    for (const [key, output] of Object.entries(metafile.outputs)) {
      if (output.entryPoint && resolve(scratch, output.entryPoint) === resolve(entryPath)) {
        return relative(out, join(scratch, key)).replaceAll("\\", "/");
      }
    }
    return null;
  };

  // Try all demos in one build first (esbuild then shares icons and helpers
  // between demos through chunks); a single failure falls back to per-demo
  // builds so the healthy demos still ship.
  let metafile = null;
  try {
    const result = await build({ ...buildOptions, entryPoints: Object.values(entries) });
    metafile = result.metafile;
    console.log(`Compiled ${Object.keys(entries).length} Mantine demos in one pass`);
  } catch (error) {
    console.log(`Mantine batch build failed, building demos one by one: ${String(error.message).split("\n")[0]}`);
    let done = 0;
    for (const [slug, entry] of Object.entries(entries)) {
      try {
        const result = await build({
          ...buildOptions, entryPoints: [entry], splitting: false, chunkNames: undefined,
        });
        metafile = { outputs: { ...metafile?.outputs, ...result.metafile.outputs } };
        done++;
      } catch (demoError) {
        failures.push({ slug, error: String(demoError.message).split("\n").find((line) => line.trim()) || "unknown error" });
      }
    }
    console.log(`Compiled ${done}/${Object.keys(entries).length} Mantine demos individually`);
  }

  for (const [slug, entry] of Object.entries(entries)) {
    const module = metafile ? moduleFor(metafile, entry) : null;
    if (module) previews[slug] = { module };
    else failures.push({ slug, error: "no bundle produced" });
  }

  // The shared stylesheet: the vendored @mantine styles plus every expanded
  // demo css module, with remote image urls inlined as data urls.
  const cssParts = [];
  for (const pkg of ["@mantine/core", "@mantine/dates", "@mantine/carousel", "@mantine/dropzone"]) {
    const styles = versions[pkg] ? join(vendorRoot, pkg, versions[pkg], "styles.css") : null;
    if (styles && existsSync(styles)) cssParts.push(await readFile(styles, "utf8"));
  }
  cssParts.push(`html { color-scheme: light; -webkit-text-size-adjust: 100%; }
body { margin: 0; }
#preview-root { min-height: 100vh; display: flow-root; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}`);
  cssParts.push(...cssStore.values());
  let mantineCss = cssParts.join("\n");
  for (const [url, dataUrl] of dataUrls) {
    if (mantineCss.includes(url)) mantineCss = mantineCss.split(url).join(dataUrl);
  }
  const cssFile = `previews/mantine/mantine-${sha256(mantineCss).slice(0, 8)}.css`;
  await write(join(out, cssFile), mantineCss);

  for (const failure of failures) skipped.push(`${failure.slug}: ${failure.error}`);
  if (skipped.length) {
    console.log(`Mantine demos without a live preview (${skipped.length}):`);
    for (const line of skipped) console.log(`  - ${line}`);
  }
  return {
    css: cssFile,
    vendor: vendorSpecifiers,
    previews,
    failures: failures.map(({ slug, error }) => ({ slug, error })),
  };
}

/**
 * daisyUI previews: one self-contained markup document per catalog component
 * (the rendered example plus the readiness handshake), all linking one shared
 * copy of the compiled daisyui.css that sits beside them. Like the Mantine
 * builder this runs directly off the cache layer, so a cache without it just
 * loses the section.
 */
async function buildDaisyuiPreviews(out) {
  const daisyuiDir = join(cache, "daisyui");
  const catPath = join(daisyuiDir, "catalog.json");
  if (!existsSync(catPath)) {
    console.log("daisyUI layer not found in the cache; skipped");
    return null;
  }
  const catalog = await readJson(catPath);
  if (!existsSync(join(daisyuiDir, "css", "daisyui.css"))) {
    console.log("daisyUI css is missing from the cache; run npm run daisyui; skipped");
    return null;
  }
  await copy(join(daisyuiDir, "css", "daisyui.css"), join(out, "previews", "daisyui", "daisyui.css"));
  await copy(join(daisyuiDir, "css", "compat.css"), join(out, "previews", "daisyui", "compat.css"));
  const previews = {};
  let count = 0;
  for (const entry of catalog.components) {
    if (!validSlug(entry.slug)) throw new Error(`Invalid daisyUI component slug: ${entry.slug}`);
    if (!entry.previewable) continue;
    const detail = await readJson(join(daisyuiDir, "components", `${entry.slug}.json`));
    if (!detail?.example) continue;
    const file = `previews/daisyui/${entry.slug}.html`;
    await write(join(out, file), daisyuiPreviewDocument(detail.example, "./", "light", `daisyUI ${entry.name} preview`));
    previews[entry.slug] = { file, theme: "light" };
    count += 1;
  }
  if (!count) return null;
  console.log(`Built ${count} daisyUI previews`);
  return { css: "previews/daisyui/daisyui.css", themes: catalog.themes || [], previews };
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
      const sheetPath = join(path, `${style}.css`);
      if (!existsSync(sheetPath)) continue;
      const css = (await readFile(sheetPath, "utf8"))
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
  html { color-scheme: light dark; -webkit-text-size-adjust: 100%; }
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; font-family: Inter, system-ui, sans-serif; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
`);
  tailwind(css, join(out, "starter.css"));
  await copy(join(vendor, "shadcn-tailwind.css"), join(out, "css", "shadcn-tailwind.css"));
  await copy(join(modules, "tw-animate-css", "dist", "tw-animate.css"), join(out, "css", "tw-animate.css"));
  await copy(join(modules, "@tailwindcss", "browser", "dist", "index.global.js"), join(out, "vendor", "tailwind-browser.js"));
  for (const name of ["gsap", "ScrollTrigger", "Flip", "SplitText"]) {
    await copy(join(modules, "gsap", "dist", `${name}.min.js`), join(out, "vendor", `${name}.min.js`));
  }
  // Dashboard & data-visualization libraries (offline UMD/CSS bundles).
  const vendorCopies = [
    ["sigma/dist/sigma.min.js", "vendor/sigma.min.js"],
    ["graphology/dist/graphology.umd.min.js", "vendor/graphology.umd.min.js"],
    ["echarts/dist/echarts.min.js", "vendor/echarts.min.js"],
    ["d3/dist/d3.min.js", "vendor/d3.min.js"],
    ["apexcharts/dist/apexcharts.min.js", "vendor/apexcharts.min.js"],
    ["apexcharts/dist/apexcharts.css", "css/apexcharts.css"],
    ["gridstack/dist/gridstack-all.js", "vendor/gridstack-all.js"],
    ["gridstack/dist/gridstack.min.css", "css/gridstack.min.css"],
    ["tabulator-tables/dist/js/tabulator.min.js", "vendor/tabulator.min.js"],
    ["tabulator-tables/dist/css/tabulator.min.css", "css/tabulator.min.css"],
    ["tabulator-tables/dist/css/tabulator_midnight.min.css", "css/tabulator_midnight.min.css"],
    ["lucide/dist/umd/lucide.min.js", "vendor/lucide.min.js"],
    ["@ui-sdk/web/browser/web.css", "css/ui-sdk-web.css"],
    ["@ui-sdk/web/browser/web.js", "vendor/ui-sdk/web.js"],
  ];
  for (const [src, dest] of vendorCopies) {
    await copy(join(modules, src), join(out, dest));
  }
  for await (const file of listFiles(join(modules, "@ui-sdk", "web", "browser", "web"))) {
    await copy(file, join(out, "vendor", "ui-sdk", "web", relative(join(modules, "@ui-sdk", "web", "browser", "web"), file)));
  }
  return { packages, importMap: imports };
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
      if (!files.length) {
        if (!license) throw new Error(`Missing license notice for ${name}`);
        const path = `${dest}/LICENSE.txt`;
        await write(join(out, path), `${name}@${version}\nLicense: ${license}\n`);
        files.push(path);
      }
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
  const { packages: starterPackages, importMap: starterImports } = await buildStarter(scratch, pack, shadcn);
  // The starter's map is relative to the starter root (`./modules/...`); the
  // manifest form is relative to the assets base (`starter/modules/...`), so
  // the /assets/importmap.json route can compose absolute URLs from it.
  const starterImportMap = Object.fromEntries(
    Object.entries(starterImports).map(([specifier, file]) => [specifier, file.replace(/^\.\//, "starter/")]),
  );
  // Templates reference the same font faces and binaries as the downloadable starter.
  const templateFontImport = '@import "../starter/fonts/fonts.css";\n';
  await write(join(out, "fonts", "fonts.css"), templateFontImport);
  const [
    templates,
    slopstrap,
    { previews, packages: previewPackages },
    nativePreviews,
    mantinePreviews,
    daisyuiPreviews,
    tailwindGallery,
  ] = await Promise.all([
    stageTemplates(cache, out, deckModules),
    stageSlopstrap(out),
    buildPreviews(scratch, out),
    buildNativePreviews(scratch, out),
    buildMantinePreviews(scratch, out),
    buildDaisyuiPreviews(out),
    stageTailwindGallery(out, hyperui, cache, modules, shadcn),
  ]);
  // ReUI previews share `out/previews/chunks/` with `buildPreviews`, so run after it completes.
  const { reuiPreviews, packages: reuiPackages } = await buildReuiPreviews(scratch, out);
  await captureThumbnails(out, previews, tailwindGallery, nativePreviews, mantinePreviews, daisyuiPreviews);
  const browserPackages = packages.filter((name) => !["esbuild", "parse5", "@tailwindcss/cli"].includes(name));
  const licenses = await stageLicenses(pack, browserPackages, deckPackages, new Set([...starterPackages, ...previewPackages, ...reuiPackages]), vendorFiles);
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
  // The Mantine vendor chunk joins the published import map so any page on
  // this origin can import @mantine/* the same way it imports react. The
  // starter ZIP itself is untouched: its map was written before this.
  if (mantinePreviews) Object.assign(starterImportMap, mantinePreviews.vendor);
  const manifest = { version, files, previews: { ...previews, ...nativePreviews }, reuiPreviews, mantinePreviews, daisyuiPreviews, templates, tailwindGallery, slopstrap, packages: licenses, vendorSnapshot: vendorFiles, importMap: starterImportMap };
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
