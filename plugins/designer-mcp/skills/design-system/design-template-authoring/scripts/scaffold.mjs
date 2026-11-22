#!/usr/bin/env node
/* Scaffold a vendored design-system template skeleton from this skill's
   template/ tree, filling markers and generating the mechanical files
   (token sheet, registry, lint contract, namespace bundle). Plain Node, no
   dependencies. Run verify.mjs afterwards. */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, "..", "template");

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const target = resolve(process.argv[2] || "");
if (!target || target === process.argv[2]) {
  console.error("usage: node scaffold.mjs <target-dir> --slug <slug> --name <Name> [options]");
  console.error("  --bg --surface --text --accent --accent2   palette roles (hex)");
  console.error("  --font-heading --heading-weight            type identity");
  console.error("  --description --layout --dividers --radius --image  knob strings");
  console.error("  --force                                    regenerate owned files");
  process.exit(1);
}
const slug = (arg("--slug") || "").toLowerCase();
const name = arg("--name") || slug;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error(`invalid or missing --slug: ${slug}`);
  process.exit(1);
}
if (existsSync(join(target, ".scaffold.json")) && arg("--force") === undefined) {
  console.error(`${target} already scaffolded — pass --force to regenerate owned files`);
  process.exit(1);
}

const pascal = (s) => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase()).replace(/-/g, "");
const opt = (k, d) => arg(k) !== undefined ? arg(k) : d;
const bg = opt("--bg", "#ffffff");
const surface = opt("--surface", "#f3f3f3");
const text = opt("--text", "#212730");
const accent = opt("--accent", "#4cb45f");
const accent2 = opt("--accent2", "#2f9c4d");
const divider = opt("--divider", "#e3e7ea");
const ring = opt("--ring", "#eceff2");
const font = opt("--font-heading", "Avenir Next");
const fontWeight = opt("--heading-weight", "700");
const description = opt("--description", `The ${name} design system, cloned from a reference and tuned per request.`);
const layout = opt("--layout", "band");
const dividers = opt("--dividers", "hairline");
const radius = opt("--radius", "2");
const image = opt("--image", "natural");
const namespace = opt("--namespace", `${pascal(name)}_${slug}`);
const hue = opt("--hue", String(Math.round(srgbToOklch(hexToRgb(accent)).h)));

/* ---------- color math: hex <-> OKLCH, tonal ramps ---------- */
function hexToRgb(hex) {
  const m = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
}
function rgbToHex([r, g, b]) {
  const h = (c) => Math.round(255 * Math.min(1, Math.max(0, c))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
function srgbToLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function linearToSrgb(c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
function srgbToOklch(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}
function oklchToHex({ l, c, h }) {
  const hr = h * Math.PI / 180;
  const a = c * Math.cos(hr), b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const lr = l_ ** 3, mr = m_ ** 3, sr = s_ ** 3;
  return rgbToHex([
    linearToSrgb(4.0767416621 * lr - 3.3077115913 * mr + 0.2309699292 * sr),
    linearToSrgb(-1.2684380046 * lr + 2.6097574011 * mr - 0.3413193965 * sr),
    linearToSrgb(-0.0041960863 * lr - 0.7034186147 * mr + 1.7076147010 * sr),
  ]);
}
const rampFactors = [0.30, 0.55, 0.78, 0.93, 1.0, 0.95, 0.85, 0.7, 0.55];
const rampLightness = (i) => 0.96 - (i / 8) * 0.60;
function buildRamp(hexRole, chromaScale = 1) {
  const role = srgbToOklch(hexToRgb(hexRole));
  return [100, 200, 300, 400, 500, 600, 700, 800, 900].map((step, i) => {
    if (i === 4) return { step, value: rgbToHex(hexToRgb(hexRole)) }; /* 500 is the role color itself */
    const l = rampLightness(i);
    const c = Math.max(0, role.c * rampFactors[i] * chromaScale);
    return { step, value: oklchToHex({ l, c, h: role.h }) };
  });
}
const neutralRamp = buildRamp(text, 0.28);
const accentRamp = buildRamp(accent);
const accent2Ramp = buildRamp(accent2);

function tokenLines() {
  const lines = [];
  lines.push(`  --color-bg: ${bg};`);
  lines.push(`  --color-surface: ${surface};`);
  lines.push(`  --color-text: ${text};`);
  lines.push(`  --color-accent: ${accent};`);
  lines.push(`  --color-accent-2: ${accent2};`);
  lines.push(`  --color-divider: ${divider};`);
  lines.push(`  --color-ring-ghost: ${ring};`);
  const emit = (label, ramp) => ramp.forEach(({ step, value }) => lines.push(`  --color-${label}-${step}: ${value};`));
  emit("neutral", neutralRamp);
  emit("accent", accentRamp);
  emit("accent-2", accent2Ramp);
  lines.push(`  --font-heading: "${font}", "Segoe UI", "Helvetica Neue", Arial, sans-serif;`);
  lines.push(`  --font-heading-weight: ${fontWeight};`);
  lines.push(`  --font-body: "${font}", "Segoe UI", "Helvetica Neue", Arial, sans-serif;`);
  lines.push(`  --font-body-weight: 400;`);
  lines.push(`  --space-1: 4px;`);
  lines.push(`  --space-2: 8px;`);
  lines.push(`  --space-3: 12px;`);
  lines.push(`  --space-4: 16px;`);
  lines.push(`  --space-6: 24px;`);
  lines.push(`  --space-8: 32px;`);
  lines.push(`  --radius-sm: 2px;`);
  lines.push(`  --radius-md: 3px;`);
  lines.push(`  --radius-lg: 8px;`);
  lines.push(`  --shadow-sm: 0 1px 2px color-mix(in srgb, ${text} 10%, transparent);`);
  lines.push(`  --shadow-md: 0 3px 10px color-mix(in srgb, ${text} 12%, transparent);`);
  lines.push(`  --shadow-lg: 0 12px 32px color-mix(in srgb, ${text} 18%, transparent);`);
  lines.push(`  --pad-x: 64px;`);
  lines.push(`  --pad-y: 48px;`);
  lines.push(`  --type-display: 96px;`);
  lines.push(`  --type-title: 56px;`);
  lines.push(`  --type-kicker: 14px;`);
  lines.push(`  --type-caption: 12px;`);
  return lines.join("\n");
}

/* ---------- copy the template tree with markers filled ---------- */
mkdirSync(join(target, "assets"), { recursive: true });
cpSync(templateDir, target, { recursive: true });
const markers = {
  "__SLUG__": slug,
  "__NAME__": name,
  "__PNAME__": pascal(name),
  "__NAMESPACE__": namespace,
  "__FONT__": font,
  "__FONT_WEIGHT__": fontWeight,
  "__DESCRIPTION__": description,
  "__BG__": bg,
  "__SURFACE__": surface,
  "__TEXT__": text,
  "__ACCENT__": accent,
  "__ACCENT2__": accent2,
  "__DIVIDER__": divider,
  "__RING__": ring,
  "__HUE__": hue,
  "__BAND__": opt("--band", "light"),
  "__SCHEME__": opt("--scheme", "mono"),
  "__SAT__": opt("--sat", "0.62"),
  "__RADIUS__": radius,
  "__LAYOUT__": layout,
  "__DIVIDERS__": dividers,
  "__IMAGE__": image,
  "__FONTCLASS__": opt("--fontclass", "geometric"),
};
const authored = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.(css|html|json|md)$/.test(entry.name)) continue;
    let body = readFileSync(full, "utf8");
    for (const [marker, value] of Object.entries(markers)) body = body.replaceAll(marker, value);
    writeFileSync(full, body);
    authored.push(relative(target, full));
  }
})(target);

/* styles.css: replace the @TOKENS marker with the generated block */
const stylesPath = join(target, "styles.css");
let styles = readFileSync(stylesPath, "utf8");
styles = styles.replace("/* @TOKENS */", tokenLines());
styles = styles.replaceAll('"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif', `"${font}", "Segoe UI", "Helvetica Neue", Arial, sans-serif`);
writeFileSync(stylesPath, styles);

/* registry: parse the emitted styles.css so tokens match exactly */
const root = styles.split(":root")[1].split("}")[0];
const tokens = [...root.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => {
  const name2 = "--" + m[1];
  const kind = name2.startsWith("--color") ? "color"
    : name2.startsWith("--font") || name2.startsWith("--type") ? "font"
    : name2.startsWith("--space") || name2.startsWith("--pad") ? "spacing"
    : name2.startsWith("--radius") ? "radius"
    : name2.startsWith("--shadow") ? "shadow" : "color";
  return { name: name2, value: m[2].trim(), kind, definedIn: "styles.css" };
});
const cards = [
  { path: "theme.html", group: "Theme", name: "Parameters", subtitle: "The parameters this system was derived from", viewport: "640x520" },
  { path: "foundations/color.html", group: "Foundations", name: "Color", subtitle: "Role colors and the tonal ramps", viewport: "640x560" },
  { path: "foundations/type.html", group: "Foundations", name: "Type", subtitle: "The heading and body pairing at real sizes", viewport: "640x520" },
  { path: "foundations/image.html", group: "Foundations", name: "Image", subtitle: "Photography treatment and masks", viewport: "640x520" },
  { path: "foundations/layout.html", group: "Foundations", name: "Layout", subtitle: "Bands, rules and the spacing scale", viewport: "640x420" },
  { path: "foundations/icons.html", group: "Foundations", name: "Icons", subtitle: "Lucide at interface sizes", viewport: "640x420" },
  { path: "components/buttons.html", group: "Components", name: "Buttons", subtitle: "TODO: the button grammar", viewport: "640x520" },
  { path: "components/cards.html", group: "Components", name: "Cards", subtitle: "TODO: cards and panels", viewport: "640x560" },
  { path: "components/stats.html", group: "Components", name: "Stats", subtitle: "Stat callouts and progress bars", viewport: "640x420" },
  { path: "components/grids.html", group: "Components", name: "Grids", subtitle: "The bullet chip and the photo masks", viewport: "640x520" },
  { path: "components/navigation.html", group: "Components", name: "Navigation", subtitle: "The header bar with the wordmark lockup", viewport: "640x360" },
  { path: "components/table.html", group: "Components", name: "Table", subtitle: "A data table with themed rules", viewport: "640x420" },
];
const registry = {
  namespace,
  components: [],
  startingPoints: [],
  hasThumbnailHtml: true,
  globalCssPaths: ["styles.css"],
  cards,
  templates: [
    { name: "Deck", folder: "templates/deck", entryPath: "templates/deck/Deck.dc.html", description: "TODO: one sentence listing the slide inventory this starter ships." },
    { name: "Landing", folder: "templates/landing", entryPath: "templates/landing/index.html", description: "TODO: one sentence listing the page inventory." },
  ],
  tokens,
  themes: [],
  fonts: [],
  brandFonts: [{ family: font, status: "ok", tokens: ["--font-heading", "--font-body"], path: "styles.css" }],
  source: "spa",
};
writeFileSync(join(target, "_ds_manifest.json"), JSON.stringify(registry, null, 2) + "\n");

/* lint contract */
const adherence = {
  plugins: ["react", "import"],
  rules: {
    "react/forbid-elements": ["warn", { forbid: [] }],
    "no-restricted-imports": ["warn", { patterns: [] }],
    "no-restricted-syntax": [
      "warn",
      { selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]", message: "Raw hex color — use a design-system color token via var()." },
      { selector: "Literal[value=/\\b\\d+px\\b/]", message: "Raw px value — use a design-system spacing token via var()." },
      { selector: `Literal[value=/font-family\\s*:\\s*(?!['\\"]?(?:${font}))/i]`, message: `Font not provided by the design system. Available: ${font}.` },
    ],
  },
  overrides: [{ files: ["**/index.js"], rules: { "no-restricted-imports": "off" } }],
  "x-omelette": {
    components: {},
    tokens: tokens.map((t) => t.name),
    tokenKinds: Object.fromEntries(tokens.map((t) => [t.name, t.kind])),
    fontFamilies: [font],
  },
};
writeFileSync(join(target, "_adherence.oxlintrc.json"), JSON.stringify(adherence, null, 2) + "\n");

/* namespace bundle */
writeFileSync(
  join(target, "_ds_bundle.js"),
  `/* @ds-bundle: {"format":4,"namespace":"${namespace}","components":[],"sourceHashes":{},"inlinedExternals":[],"unexposedExports":[]} */\n\n(() => {\n\nconst __ds_ns = (window.${namespace} = window.${namespace} || {});\n\nconst __ds_scope = {};\n\n(__ds_ns.__errors = __ds_ns.__errors || []);\n\n})();\n`,
);

/* receipt: files the scaffold owns (safe to regenerate with --force) */
const receipt = {
  slug, name, namespace, generatedAt: new Date().toISOString(),
  owned: ["theme.json", "styles.css", "_ds_manifest.json", "_adherence.oxlintrc.json", "_ds_bundle.js", "theme.html", "thumbnail.html"],
};
writeFileSync(join(target, ".scaffold.json"), JSON.stringify(receipt, null, 2) + "\n");

/* registration block: files[] built from the folder as it stands now */
const BINARY = new Set([".jpg", ".jpeg", ".webp", ".png"]);
const listFiles = (dir, base = "") => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.name.startsWith(".") || e.name === ".scaffold.json" || e.name === "thumbnail.webp") return [];
  const rel = base ? `${base}/${e.name}` : e.name;
  if (e.isDirectory()) return listFiles(join(dir, e.name), rel);
  return [{ path: rel, ...(BINARY.has(e.name.split(".").pop().toLowerCase()) ? { binary: true } : {}) }];
});
const entry = {
  slug, name, description, path: `${slug}/`,
  ground: bg, text, accent, headingFont: font,
  thumbnail: `${slug}/thumbnail.html`, thumbnailImage: `${slug}/thumbnail.webp`,
  readme: `${slug}/readme.md`, theme: `${slug}/theme.json`,
  files: listFiles(target),
};
console.log(`
scaffolded ${slug} into ${target}

next steps:
  1. fill the TODO markers (readme.md is the parser contract; see reference/anatomy.md)
  2. copy the deck runtime verbatim from an existing system:
     cp data/design-systems/modernist/templates/deck/{deck-stage,support,image-slot,ds-base}.js \\
        ${target}/templates/deck/
  3. add ${target}/assets/photo.jpg (free license, ~1280px)
  4. render the thumbnail:
     chrome --headless --screenshot=thumb.png --window-size=1280,854 "file://$PWD/thumbnail.html"
     then convert thumb.png to thumbnail.webp
  5. verify:
     node ${here}/verify.mjs ${target} --forbid "<reference name>" --manifest data/design-systems/manifest.json
  6. register: append this entry to data/design-systems/manifest.json (and bump
     the count in its $comment plus scripts/selftest.mjs):

${JSON.stringify(entry, null, 2).split("\n").map((l) => "    " + l).join("\n")}
`);
