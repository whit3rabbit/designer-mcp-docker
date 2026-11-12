/**
 * ds-manifest.mjs — the design-system manifest template and record builder.
 *
 * The repo vendors six generic design systems under `data/design-systems/`
 * (modernist, classical, nocturne, organic, broadsheet, industry). Each is a
 * self-contained folder: a token sheet (`styles.css`), a theme seed
 * (`theme.json`), an internal registry (`_ds_manifest.json`), a written guide
 * (`readme.md`) and starter templates. The root `manifest.json` indexes them.
 *
 * This module turns those folders into a cache layer:
 *
 *   blankManifestTemplate()  the canonical design-system manifest JSON —
 *                            sections mirror a design-system editor
 *                            (overview, colors, typography, spacing, radius,
 *                            shadows, components, assets)
 *   buildSystemRecord()      one system's full record, with the manifest
 *                            filled from its theme/tokens/readme
 *   installDesignSystems()   copy the tree + records + index into a cache dir
 *
 * `installDesignSystems` is called by `bake-cache.mjs` (build output) and by
 * `scripts/stage-design-systems.mjs` (populate a live cache for local dev).
 * Everything here reads only the vendored data — no network.
 */

import { existsSync } from "node:fs";
import { cp, readFile, rm, stat, readdir, writeFile, rename } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const MANIFEST_SCHEMA_VERSION = "design-system-manifest/v1";

const HERE = dirname(fileURLToPath(import.meta.url));

/** The vendored systems, in the repo checkout. */
export const DESIGN_SYSTEMS_SRC = join(HERE, "..", "..", "data", "design-systems");

// ------------------------------------------------------------------ template

/**
 * The canonical design-system manifest, blank.
 *
 * Every `$comment` documents what belongs in its section. A consuming agent
 * fills this in (or starts from a vendored system, which fills it already)
 * and keeps it beside the built work as the machine-readable contract for
 * what the system allows.
 */
export function blankManifestTemplate() {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    $comment:
      "A design-system manifest: the machine-readable contract for one design system. " +
      "Fill every section; keep it beside the work and in step with the tokens. " +
      "Sections mirror a design-system editor: overview, colors, typography, spacing, " +
      "corner radius, shadows, components, assets.",
    name: "",
    slug: "",
    description: "",
    overview: {
      $comment: "What the system is for and the rules it follows. Read before designing anything.",
      direction: "",
      principles: [],
      antiPatterns: [],
      usingTokens: "",
      usingComponents: "",
      accessibility: "",
    },
    colors: {
      $comment: "Roles first, then ramp steps. hex values. Never invent a color outside roles and ramps. swatches is the flat list for manifests seeded from a parsed DESIGN.md.",
      ground: "",
      text: "",
      accent: "",
      roles: { bg: "", surface: "", text: "", accent: "", accent2: "", divider: "" },
      ramps: { neutral: {}, accent: {}, accent2: {} },
      swatches: [],
      usage: "",
    },
    typography: {
      $comment: "Two font roles and a fixed px scale. Never name a font family directly; use the tokens. list is the flat family list for manifests seeded from a parsed DESIGN.md.",
      heading: { family: "", familyToken: "--font-heading", weight: "", weights: [] },
      body: { family: "", familyToken: "--font-body" },
      scale: [],
      list: [],
      usage: "",
    },
    spacing: {
      $comment: "The spacing scale in px, plus the density multiplier that produced it.",
      density: 1,
      scale: [],
    },
    radius: {
      $comment: "Corner radius tokens. Zero is a valid, deliberate choice.",
      sm: "",
      md: "",
      lg: "",
    },
    shadows: {
      $comment: "Elevation tokens, already tuned to the ground color. Use them rather than ad-hoc box-shadows.",
      sm: "",
      md: "",
      lg: "",
    },
    components: {
      $comment: "The CSS class library. Build with these rather than inventing parallel ones.",
      classes: [],
    },
    assets: {
      $comment: "How imagery and icons are treated. Every content photograph goes through the treatment.",
      imageTreatment: "",
      iconSet: "",
      photos: [],
    },
    tokens: {
      $comment: "The full flat token list: { name, value, kind } with kind in color|font|spacing|radius|shadow.",
      all: [],
    },
    files: {
      $comment: "Every file of the source system, folder-relative. binary:true marks non-text assets.",
      all: [],
    },
    starterTemplates: {
      $comment: "Copyable starting points that consume the system the intended way.",
      all: [],
    },
    theme: {
      $comment: "The generation knobs the system was derived from. Edit these, then regenerate, not the output.",
      params: {},
    },
  };
}

// ------------------------------------------------------------------ parsing

/** Split a readme into its fixed sections. Returns { title, intro, sections }. */
function parseReadme(md) {
  const sections = new Map();
  let title = "";
  let intro = [];
  let current = null;
  let buf = [];
  const flush = () => {
    if (current !== null) sections.set(current, buf.join("\n").trim());
  };
  for (const line of md.split("\n")) {
    const h1 = line.match(/^# (.+)$/);
    if (h1 && !current && !title) {
      title = h1[1].trim();
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      if (current === null) intro = buf.join("\n").trim();
      else flush();
      current = h2[1].trim();
      buf = [];
      continue;
    }
    buf.push(line);
  }
  flush();
  return { title, intro, sections };
}

/** Bullet items ("- ...") of a section body. */
function listItems(body) {
  return (body || "")
    .split("\n")
    .map((l) => l.replace(/^-\s+/, "").trim())
    .filter((l, i, arr) => l && !(l === arr[i - 1]));
}

/** The `| Class | What it is | Shown in |` table of the Components section. */
function parseComponentTable(body) {
  const rows = [];
  for (const line of (body || "").split("\n")) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length < 3) continue;
    if (cells.every((c) => /^-{3,}$/.test(c))) continue;
    if (/^class$/i.test(cells[0])) continue;
    rows.push({ class: cells[0], what: cells[1], demo: cells[2] });
  }
  return rows;
}

/** The h1-h6 + body px scale from the token sheet. */
function parseTypeScale(css) {
  const scale = [];
  for (const m of css.matchAll(/^h([1-6])\s*\{[^}]*?font-size:\s*([\d.]+px)/gm)) {
    scale.push({ tag: `h${m[1]}`, size: m[2] });
  }
  const body = css.match(/^body\s*\{[^}]*?font-size:\s*([\d.]+px)/m);
  if (body) scale.push({ tag: "body", size: body[1] });
  return scale;
}

/** Group `--color-<role>-<step>` tokens into ramps: { neutral: {100..900} }. */
function parseRamps(tokens) {
  const ramps = {};
  for (const t of tokens) {
    const m = t.name.match(/^--color-(.+?)-(\d{3})$/);
    if (m) (ramps[m[1]] ??= {})[m[2]] = t.value;
  }
  return ramps;
}

/** Best-effort icon set name: theme knob first, else the readme's Icons prose. */
function parseIconSet(theme, iconsProse) {
  if (theme?.iconSet) return theme.iconSet;
  const m = (iconsProse || "").match(/\b(lucide|phosphor)([- ](bold|thin|duotone|fill))?/i);
  if (m) return (m[1] + (m[3] ? `-${m[3].toLowerCase()}` : "")).toLowerCase();
  return "";
}

// ------------------------------------------------------------------ record

async function readJsonFile(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Build the full record for one vendored system.
 *
 * @param {object} entry   the system's entry from the root manifest.json
 * @param {string} systemDir  path to the system folder on disk
 */
export async function buildSystemRecord(entry, systemDir) {
  const theme = (await readJsonFile(join(systemDir, "theme.json"))) || {};
  const registry = (await readJsonFile(join(systemDir, "_ds_manifest.json"))) || {};
  const readmeRaw = existsSync(join(systemDir, "readme.md"))
    ? await readFile(join(systemDir, "readme.md"), "utf8")
    : "";
  const cssRaw = existsSync(join(systemDir, "styles.css"))
    ? await readFile(join(systemDir, "styles.css"), "utf8")
    : "";

  const readme = parseReadme(readmeRaw);
  const sec = (name) => readme.sections.get(name) || "";
  const tokens = registry.tokens || [];
  const tokenByName = new Map(tokens.map((t) => [t.name, t.value]));

  const headingWeight = tokenByName.get("--font-heading-weight") ||
    String(theme.fonts?.headingWeight ?? "");

  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    name: entry.name,
    slug: entry.slug,
    description: entry.description,
    overview: {
      direction: sec("Direction"),
      principles: listItems(sec("Do")),
      antiPatterns: listItems(sec("Don't")),
      usingTokens: listItems(sec("How to use this"))[0] || "",
      usingComponents: listItems(sec("How to use this"))[1] || "",
      accessibility: sec("Interaction states"),
    },
    colors: {
      ground: entry.ground,
      text: entry.text,
      accent: entry.accent,
      roles: {
        bg: tokenByName.get("--color-bg") || theme.palette?.bg || "",
        surface: tokenByName.get("--color-surface") || theme.palette?.surface || "",
        text: tokenByName.get("--color-text") || theme.palette?.text || "",
        accent: tokenByName.get("--color-accent") || theme.palette?.accent || "",
        accent2: tokenByName.get("--color-accent-2") || theme.palette?.accent2 || "",
        divider: tokenByName.get("--color-divider") || "",
      },
      ramps: parseRamps(tokens),
      swatches: [],
      usage: sec("Color"),
    },
    typography: {
      heading: {
        family: theme.fonts?.heading?.family || entry.headingFont || "",
        familyToken: "--font-heading",
        weight: headingWeight,
        weights: theme.fonts?.heading?.weights || [],
      },
      body: {
        family: theme.fonts?.body?.family || "",
        familyToken: "--font-body",
      },
      scale: parseTypeScale(cssRaw),
      list: [],
      usage: sec("Type"),
    },
    spacing: {
      density: theme.density ?? 1,
      scale: tokens
        .filter((t) => t.kind === "spacing")
        .map((t) => ({ token: t.name, value: t.value })),
    },
    radius: {
      sm: tokenByName.get("--radius-sm") || "",
      md: tokenByName.get("--radius-md") || "",
      lg: tokenByName.get("--radius-lg") || "",
    },
    shadows: {
      sm: tokenByName.get("--shadow-sm") || "",
      md: tokenByName.get("--shadow-md") || "",
      lg: tokenByName.get("--shadow-lg") || "",
    },
    components: {
      classes: parseComponentTable(sec("Components")),
    },
    assets: {
      imageTreatment: theme.imageTreatment || "",
      iconSet: parseIconSet(theme, sec("Icons")),
      photos: (entry.files || []).filter((f) => f.binary).map((f) => f.path),
    },
    tokens: { all: tokens },
    files: { all: entry.files || [] },
    starterTemplates: {
      all: (registry.templates || []).map((t) => ({
        name: t.name,
        folder: t.folder,
        entryPath: t.entryPath,
        description: t.description,
      })),
    },
    theme: { params: theme },
  };

  return {
    slug: entry.slug,
    name: entry.name,
    description: entry.description,
    namespace: registry.namespace || "",
    path: entry.path,
    ground: entry.ground,
    text: entry.text,
    accent: entry.accent,
    headingFont: entry.headingFont,
    thumbnail: entry.thumbnail,
    thumbnailImage: entry.thumbnailImage,
    readme: entry.readme,
    themePath: entry.theme,
    theme,
    tokens,
    tokensCount: tokens.length,
    brandFonts: registry.brandFonts || [],
    cards: registry.cards || [],
    files: entry.files || [],
    manifest,
  };
}

// ------------------------------------------------------------------ install

async function dirBytes(dir) {
  let total = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) total += await dirBytes(p);
    else total += (await stat(p)).size;
  }
  return total;
}

const fmt = (b) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${(b / 1e3).toFixed(0)}KB`;

/**
 * Install the design-systems layer into a cache directory.
 *
 * Layout written:
 *   <target>/design-systems.json          the index
 *   <target>/design-systems/manifest.json the vendored index, verbatim
 *   <target>/design-systems/manifest-template.json  the blank canonical manifest
 *   <target>/design-systems/<slug>/...    each system's files, verbatim
 *   <target>/design-systems/<slug>.json   the system's full record (cache
 *                                         metadata — not part of files[])
 *
 * @param {string} target  the cache directory to write into
 * @param {string} [src]   the vendored source dir (default data/design-systems)
 * @returns {{total:number, bytes:number}} summary
 */
export async function installDesignSystems(target, src = DESIGN_SYSTEMS_SRC) {
  const indexPath = join(src, "manifest.json");
  if (!existsSync(indexPath)) {
    throw new Error(`no design-system index at ${indexPath}`);
  }
  const index = JSON.parse(await readFile(indexPath, "utf8"));
  const systems = index.systems || [];

  const outDir = join(target, "design-systems");
  await rm(outDir, { recursive: true, force: true });
  await cp(src, outDir, {
    recursive: true,
    filter: (s) => !s.endsWith(".DS_Store"),
  });

  const summaries = [];
  for (const entry of systems) {
    const record = await buildSystemRecord(entry, join(src, entry.path));
    await writeFileAtomic(join(outDir, `${entry.slug}.json`), record);
    summaries.push({
      slug: entry.slug,
      name: entry.name,
      description: entry.description,
      path: entry.path,
      ground: entry.ground,
      text: entry.text,
      accent: entry.accent,
      headingFont: entry.headingFont,
      thumbnail: entry.thumbnail,
      thumbnailImage: entry.thumbnailImage,
      tokensCount: record.tokensCount,
      filesCount: (entry.files || []).length,
      starterTemplates: record.manifest.starterTemplates.all.map((t) => ({
        name: t.name,
        entryPath: t.entryPath,
      })),
      source: "vendored",
    });
  }

  await writeFileAtomic(
    join(target, "design-systems.json"),
    { updatedAt: Date.now(), total: summaries.length, systems: summaries },
  );

  const bytes = await dirBytes(outDir);
  return { total: summaries.length, bytes };
}

/** Atomic write — a crash mid-write must not leave a truncated JSON file. */
async function writeFileAtomic(path, value) {
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}`;
  await writeFile(tmp, JSON.stringify(value), "utf8");
  await rename(tmp, path);
}

/** Convenience for scripts: install and print one line per system. */
export async function installDesignSystemsVerbose(target, src) {
  const { total, bytes } = await installDesignSystems(target, src);
  console.log(`  design-systems  ${total} systems, ${fmt(bytes)}`);
  return { total, bytes };
}
