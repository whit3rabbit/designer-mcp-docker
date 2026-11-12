#!/usr/bin/env node
/**
 * design-cache — shared cache primitives for the design-system catalog.
 *
 * ONE cache directory holds every source. The layout is a superset of the
 * upstream `fidgetcoding-refero-mcp` cache format, so the upstream server
 * can still read the Refero half with zero changes:
 *
 *   <cache>/
 *     catalog.json            { updatedAt, designs[] }   <- merged, generic
 *     styles/<uuid>.json      { updatedAt, style }       <- upstream shape
 *     systems/<slug>.json     { updatedAt, system }      <- opendesign shape
 *     systems/packages/<slug>.json   original OpenDesign package files
 *     thumbs/<id>.jpg         local thumbnail bytes
 *     index.json              { updatedAt, counts, sources }
 *
 * Why `designs` and not `styles` in the merged catalog
 * ---------------------------------------------------
 * The upstream package looks for `catalog.json` with a `styles` array. To stay
 * wire-compatible with it we keep `catalog.json` in the upstream shape and
 * merge every source into it, tagging each entry with `source`. That way the
 * upstream MCP server serves Refero entries unchanged, and our own tools can
 * read the same file and see OpenDesign entries too.
 *
 * Entry shape (merged):
 *   {
 *     id, source, siteName, url, northStar, colorScheme, colors[], fonts[],
 *     industry, createdAt, screenshotUrl, thumbnailUrl, ...
 *   }
 *
 * `source` is "refero" or "opendesign". Everything downstream filters on it.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/** Cache root. `DESIGN_CACHE_DIR` is the generic name; `REFERO_CACHE_DIR` is
 *  still honoured so existing installs and the upstream package keep working. */
export const CACHE_DIR =
  process.env.DESIGN_CACHE_DIR ||
  process.env.REFERO_CACHE_DIR ||
  join(homedir(), ".design-cache");

export const CATALOG_PATH = join(CACHE_DIR, "catalog.json");
export const INDEX_PATH = join(CACHE_DIR, "index.json");
export const THUMBS_DIR = join(CACHE_DIR, "thumbs");
export const STYLES_DIR = join(CACHE_DIR, "styles");
export const SYSTEMS_DIR = join(CACHE_DIR, "systems");

export const SOURCE = {
  REFERO: "refero",
  OPENDESIGN: "opendesign",
};

/** Atomic write — a crash mid-write must not leave a truncated JSON file. */
export async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}`;
  await writeFile(tmp, JSON.stringify(value), "utf8");
  await rename(tmp, path);
}

export async function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Read the merged catalog. Returns `{ updatedAt, designs[] }` with a
 * `styles` alias so upstream-compatible code can read either key.
 *
 * Entries with no `source` tag predate the multi-source catalog and are
 * Refero styles, so they are tagged here — otherwise every consumer would
 * have to guess.
 */
export async function readCatalog() {
  const raw = await readJson(CATALOG_PATH);
  if (!raw) return { updatedAt: 0, designs: [] };
  const list = raw.designs || raw.styles || [];
  const designs = list.map((d) =>
    d.source ? d : { ...d, source: SOURCE.REFERO },
  );
  return { updatedAt: raw.updatedAt || 0, designs };
}

/**
 * Write the merged catalog in the upstream-compatible shape:
 *   { updatedAt, styles: [...] }
 * plus a `designs` alias and per-entry `source` tags.
 */
export async function writeCatalog(designs) {
  const payload = {
    updatedAt: Date.now(),
    styles: designs,
    designs,
  };
  await writeJsonAtomic(CATALOG_PATH, payload);
  return payload;
}

/** Full detail for one design, across sources. */
export async function readDesign(id, source) {
  if (source === SOURCE.OPENDESIGN) {
    const raw = await readJson(join(SYSTEMS_DIR, `${id}.json`));
    return raw?.system ?? null;
  }
  const raw = await readJson(join(STYLES_DIR, `${id}.json`));
  return raw?.style ?? null;
}

/**
 * Merge a catalog entry with its detail payload into one record.
 *
 * The two sources store different things:
 *   - Refero: the detail file holds the full style record (with fullResult).
 *   - OpenDesign: the detail file holds the package payload (design prose,
 *     tokens, manifest) while the catalog entry holds the normalised
 *     `fullResult` shape the renderer expects.
 *
 * Both end up with the same keys so callers never branch on source.
 */
export function mergeDesign(entry, payload) {
  if (!payload) return null;
  if ((entry?.source || SOURCE.REFERO) !== SOURCE.OPENDESIGN) return payload;
  return {
    ...entry,
    ...payload,
    // The renderer reads `fullResult`; OpenDesign keeps it in the catalog.
    fullResult: entry.fullResult ?? payload.fullResult,
    // The upstream renderer reads `fullResult.designSystem`; for OpenDesign
    // the prose is the original document, which is richer than anything we
    // could synthesise — so it is carried under `designMd`.
    designMd: payload.designMd ?? payload.design ?? "",
    usage: payload.usage ?? "",
    manifest: payload.manifest ?? null,
    tokensCss: payload.tokensCss ?? "",
    tokens: payload.tokens ?? null,
  };
}

export async function writeDesign(id, source, payload) {
  const path =
    source === SOURCE.OPENDESIGN
      ? join(SYSTEMS_DIR, `${id}.json`)
      : join(STYLES_DIR, `${id}.json`);
  const key = source === SOURCE.OPENDESIGN ? "system" : "style";
  await writeJsonAtomic(path, { updatedAt: Date.now(), [key]: payload });
}

export async function readOpenDesignPackage(id) {
  return readJson(join(SYSTEMS_DIR, "packages", `${id}.json`));
}

export async function writeOpenDesignPackage(id, files) {
  await writeJsonAtomic(join(SYSTEMS_DIR, "packages", `${id}.json`), { files });
}

/** Local thumbnail path for a design id, if one has been cached. */
export function thumbPath(id) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = join(THUMBS_DIR, `${id}${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Ids of every design that already has a local thumbnail. */
export async function cachedThumbIds() {
  if (!existsSync(THUMBS_DIR)) return new Set();
  const files = await readdir(THUMBS_DIR);
  return new Set(
    files
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .map((f) => f.replace(/\.(jpe?g|png|webp)$/i, "")),
  );
}

/**
 * The GradientDeck component index.
 *
 * Written by scripts/fetch-gradientdeck.mjs. Returns an empty index when
 * the cache has no components, so the server still starts and the page
 * explains what to run.
 */
export async function readComponentsIndex() {
  const path = join(CACHE_DIR, "components.json");
  if (!existsSync(path)) return { updatedAt: null, total: 0, variants: 0, components: [] };
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return { updatedAt: null, total: 0, variants: 0, components: [] };
  }
}

/** One component's full record, including every variant's source code. */
export async function readComponent(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const path = join(CACHE_DIR, "components", `${slug}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** The preset catalog index (which catalogs exist). */
export async function readPresetsIndex() {
  const path = join(CACHE_DIR, "presets.json");
  if (!existsSync(path)) return { updatedAt: null, total: 0, catalogs: [] };
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return { updatedAt: null, total: 0, catalogs: [] };
  }
}

/** One preset catalog, with every preset record. */
export async function readPresetCatalog(kind) {
  if (!/^[a-z0-9-]+$/i.test(kind)) return null;
  const path = join(CACHE_DIR, "presets", `${kind}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * The vendored design-system template index.
 *
 * Written by scripts/stage-design-systems.mjs (live cache) and by
 * `npm run bake` (baked cache). Returns an empty index when the cache has
 * no templates, so the server still starts.
 */
export async function readDesignSystemsIndex() {
  const path = join(CACHE_DIR, "design-systems.json");
  const empty = { updatedAt: null, total: 0, systems: [] };
  if (!existsSync(path)) return empty;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return empty;
  }
}

/**
 * One design-system template's full record: theme knobs, the token list,
 * the filled manifest, and the file listing. The system's actual files sit
 * under <cache>/design-systems/<slug>/.
 */
export async function readDesignSystem(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const path = join(CACHE_DIR, "design-systems", `${slug}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** Aggregate counts for the health endpoint and the index file. */
export async function writeIndex() {
  const { designs } = await readCatalog();
  const counts = {};
  for (const d of designs) {
    const s = d.source || SOURCE.REFERO;
    counts[s] = (counts[s] || 0) + 1;
  }
  const index = {
    updatedAt: Date.now(),
    total: designs.length,
    counts,
    sources: Object.keys(counts),
  };
  await writeJsonAtomic(INDEX_PATH, index);
  return index;
}

export async function readIndex() {
  return (await readJson(INDEX_PATH)) ?? { updatedAt: 0, total: 0, counts: {} };
}
