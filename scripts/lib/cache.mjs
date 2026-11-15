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

let REMOTE_URL = (process.env.DESIGN_REMOTE_URL || "").replace(/\/+$/, "");
const remoteCache = new Map();

/** Base URL when reading from a hosted static site (e.g. GitLab Pages), or "". */
export function getRemoteUrl() {
  return REMOTE_URL;
}

/** Point cache reads at a hosted static site (or "" for local disk). */
export function setRemoteUrl(url) {
  REMOTE_URL = String(url || "").replace(/\/+$/, "");
  remoteCache.clear();
}

async function fetchRemoteJson(rel) {
  if (!REMOTE_URL) return null;
  if (remoteCache.has(rel)) return remoteCache.get(rel);
  const res = await fetch(`${REMOTE_URL}/${rel}`, { signal: AbortSignal.timeout(15000) });
  if (res.status === 404) {
    remoteCache.set(rel, null);
    return null;
  }
  if (!res.ok) throw new Error(`Remote fetch ${rel} failed: HTTP ${res.status}`);
  const data = await res.json();
  remoteCache.set(rel, data);
  return data;
}

export const CATALOG_PATH = join(CACHE_DIR, "catalog.json");
export const INDEX_PATH = join(CACHE_DIR, "index.json");
export const THUMBS_DIR = join(CACHE_DIR, "thumbs");
export const STYLES_DIR = join(CACHE_DIR, "styles");
export const SYSTEMS_DIR = join(CACHE_DIR, "systems");
export const REUI_DIR = join(CACHE_DIR, "reui");
export const DASHBOARDS_DIR = join(CACHE_DIR, "dashboards");

/**
 * The Claude Design layer, one directory per system.
 *
 * The Agent Kit ships Claude's own file format for every design system —
 * tokens.json, design-system.json, README.md and a cover preview. These are
 * what Claude builds a Design System artifact from, so they are kept apart
 * from the OpenDesign package files they accompany.
 */
export const CLAUDE_DIR = join(CACHE_DIR, "claude");

/**
 * The gallery artifacts the Agent Kit publishes for every system:
 * the rendered preview, the Claude Design view, its cover, and a thumbnail.
 *
 * These are built by the kit's own gallery pipeline and fetched once, so the
 * server serves them from disk and never reaches the network.
 */
export const GALLERY_DIR = join(CACHE_DIR, "gallery");

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
  const raw = REMOTE_URL
    ? await fetchRemoteJson("api/catalog.json")
    : await readJson(CATALOG_PATH);
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
  if (REMOTE_URL) {
    return fetchRemoteJson(`api/designs/${encodeURIComponent(id)}.json`);
  }
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
  if (REMOTE_URL) return fetchRemoteJson(`api/packages/${encodeURIComponent(id)}.json`);
  return readJson(join(SYSTEMS_DIR, "packages", `${id}.json`));
}

/** Write the OpenDesign package file inventory for one system. */
export async function writeOpenDesignPackageFiles(id, files) {
  await writeJsonAtomic(join(SYSTEMS_DIR, "packages", `${id}.json`), { files });
}

export async function writeOpenDesignPackage(id, files) {
  await writeJsonAtomic(join(SYSTEMS_DIR, "packages", `${id}.json`), { files });
}

/**
 * The Claude Design package for one system, or null.
 *
 * Files are stored as `{ path, content }` pairs under
 * `<cache>/claude/<slug>.json`.
 */
export async function readClaudePackage(id) {
  if (!/^[a-z0-9-]+$/i.test(id)) return null;
  if (REMOTE_URL) return fetchRemoteJson(`api/claude/${encodeURIComponent(id)}.json`);
  return readJson(join(CLAUDE_DIR, `${id}.json`));
}

/** Write the Claude Design package for one system. */
export async function writeClaudePackage(id, files) {
  await writeJsonAtomic(join(CLAUDE_DIR, `${id}.json`), { updatedAt: Date.now(), files });
}

/**
 * The Agent Kit's curated descriptors.
 *
 * Tokens give theme, accent, type and shape; these give what tokens cannot:
 * the mood, the industry and the surface each system is for. The gallery
 * filters on them, which is how a reader thinks about a design system.
 *
 * Stored as `{ <slug>: { kind, moods[], industries[], surfaces[] } }`.
 */
export const DESCRIPTORS_PATH = join(CACHE_DIR, "descriptors.json");

/** The descriptors for every catalogued design system, or an empty map. */
export async function readDescriptors() {
  const raw = REMOTE_URL
    ? await fetchRemoteJson("api/descriptors.json")
    : await readJson(DESCRIPTORS_PATH);
  return raw?.systems ?? {};
}

/** Write the descriptors for every design system. */
export async function writeDescriptors(systems) {
  await writeJsonAtomic(DESCRIPTORS_PATH, { updatedAt: Date.now(), systems });
}

/**
 * A cached gallery artifact for one system, as raw bytes.
 *
 * `rel` is a path inside the system's gallery directory, e.g.
 * "preview.html" or "claude/view.html". Returns null when the artifact was
 * never fetched, so the caller can fall back to its own rendering.
 */
export async function readGalleryArtifact(id, rel) {
  if (!/^[a-z0-9-]+$/i.test(id)) return null;
  if (!/^[a-z0-9._/-]+$/i.test(rel) || rel.includes("..")) return null;
  const path = join(GALLERY_DIR, id, rel);
  if (!existsSync(path)) return null;
  return readFile(path);
}

/** The cached thumbnail for one system, or null. */
export async function readGalleryThumb(id) {
  if (!/^[a-z0-9-]+$/i.test(id)) return null;
  const path = join(GALLERY_DIR, "thumbs", `${id}.webp`);
  if (!existsSync(path)) return null;
  return readFile(path);
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
  if (REMOTE_URL) {
    return (await fetchRemoteJson("api/components.json")) ?? { updatedAt: null, total: 0, variants: 0, components: [] };
  }
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
  if (REMOTE_URL) return fetchRemoteJson(`api/component/${encodeURIComponent(slug)}.json`);
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
  if (REMOTE_URL) {
    return (await fetchRemoteJson("api/presets.json")) ?? { updatedAt: null, total: 0, catalogs: [] };
  }
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
  if (REMOTE_URL) return fetchRemoteJson(`api/presets/${encodeURIComponent(kind)}.json`);
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
  const empty = { updatedAt: null, total: 0, systems: [] };
  if (REMOTE_URL) return (await fetchRemoteJson("api/templates.json")) ?? empty;
  const path = join(CACHE_DIR, "design-systems.json");
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
  if (REMOTE_URL) return fetchRemoteJson(`api/template/${encodeURIComponent(slug)}.json`);
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

/** ReUI component library index: { updatedAt, total, categories[] }. */
export async function readReuiIndex() {
  const empty = { updatedAt: null, total: 0, categories: [] };
  if (REMOTE_URL) return (await fetchRemoteJson("api/reui.json")) ?? empty;
  return (await readJson(join(REUI_DIR, "index.json"))) ?? empty;
}

/** One ReUI category with all its component items (Radix UI & Base UI TSX). */
export async function readReuiCategory(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  if (REMOTE_URL) return fetchRemoteJson(`api/reui/${encodeURIComponent(slug)}.json`);
  return readJson(join(REUI_DIR, "categories", `${slug}.json`));
}

/** Raw bytes for a ReUI category screenshot PNG. */
export async function readReuiScreenshot(filename) {
  if (!/^[a-z0-9-]+-(?:light|dark)\.png$/i.test(filename)) return null;
  const path = join(REUI_DIR, "screenshots", filename);
  if (!existsSync(path)) return null;
  return readFile(path);
}

/** Dashboard starter templates index: { updatedAt, total, dashboards[] }. */
export async function readDashboardsIndex() {
  const empty = { updatedAt: null, total: 0, dashboards: [] };
  if (REMOTE_URL) return (await fetchRemoteJson("api/dashboards.json")) ?? empty;
  return (await readJson(join(DASHBOARDS_DIR, "index.json"))) ?? empty;
}

/** Full dashboard template record, including files[], dependencies[], pages[]. */
export async function readDashboard(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  if (REMOTE_URL) return fetchRemoteJson(`api/dashboard/${encodeURIComponent(slug)}.json`);
  return readJson(join(DASHBOARDS_DIR, slug, "dashboard.json"));
}

/** Safe file read inside a dashboard template's source/ directory. */
export async function readDashboardFile(slug, relPath) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const clean = String(relPath || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\")) return null;
  const base = join(DASHBOARDS_DIR, slug, "source");
  const full = join(base, clean);
  if (!full.startsWith(base + "/") || !existsSync(full)) return null;
  return readFile(full);
}

/** Cover PNG bytes for a dashboard template. */
export async function readDashboardCover(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const path = join(DASHBOARDS_DIR, slug, "cover.png");
  if (!existsSync(path)) return null;
  return readFile(path);
}

/** Downloadable ZIP archive bytes ("template" or "fonts") for a dashboard template. */
export async function readDashboardArchive(slug, kind = "template") {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = kind === "fonts" ? "fonts.zip" : "template.zip";
  const path = join(DASHBOARDS_DIR, slug, file);
  if (!existsSync(path)) return null;
  return readFile(path);
}
