/**
 * daisyui-docs.mjs — offline readers for the baked daisyUI layer.
 *
 * Reads `<cache>/daisyui/` on disk (the catalog, per-component records with
 * their rendered examples, the fully compiled css with every theme, and the
 * provenance) or the same endpoints on a `DESIGN_REMOTE_URL` static host.
 * Every path a caller can influence is checked against traversal before it
 * touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-daisyui.mjs):
 *   daisyui/catalog.json              { version, totals, components[], themes[] }
 *   daisyui/components/<slug>.json    docs, classes, syntax, rendered example
 *   daisyui/css/daisyui.css           the compiled css (components + themes)
 *   daisyui/css/themes.css            theme variables only
 *   daisyui/css/compat.css            authored utilities the examples use
 *   daisyui/themes.json               { total, themes[] }
 *   daisyui/docs/                     the vendored skills/daisyui tree
 *   daisyui/provenance.json           versions, urls, checksums, gaps
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, DAISYUI_DIR, createBoundedCache } from "./cache.mjs";

const EMPTY_CATALOG = {
  updatedAt: null,
  version: { css: null, source: null },
  totals: { components: 0, previewable: 0, themes: 0 },
  components: [],
  themes: [],
};

const contentCache = createBoundedCache(64);

async function readTextUnder(base, rel) {
  const clean = String(rel || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\") || !/^[\w./-]+$/.test(clean)) return null;
  const root = resolve(base);
  const full = resolve(root, clean);
  if (!full.startsWith(root + sep) || !existsSync(full)) return null;
  if (contentCache.has(full)) return contentCache.get(full);
  const text = await readFile(full, "utf8");
  contentCache.set(full, text);
  return text;
}

/**
 * One file from this layer's tree on the remote host, else `local()`.
 *
 * A 404 is the host's answer (null), the same rule as the catalog: a layer
 * the host does not publish must not reappear item by item from disk. Only
 * an unreachable host falls back to disk, and that is reported in the reply.
 */
function remoteFirst(kind, rel, local) {
  return remoteOr(kind, `api/daisyui/${rel}`, local);
}

/** The catalog written by the fetcher, or an empty one when the layer is missing. */
export async function readDaisyuiCatalog() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/daisyui.json");
    // A 404 is the host's answer: this layer is not published there.
    if (remote === null) return EMPTY_CATALOG;
    // Unreachable, or not a catalog: fall back to the one on disk.
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.components)) return remote;
  }
  const raw = await readTextUnder(DAISYUI_DIR, "catalog.json");
  if (!raw) return EMPTY_CATALOG;
  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_CATALOG;
  }
}

/** One component record by slug: docs, classes, verbatim syntax, rendered example. */
export async function readDaisyuiComponent(slug) {
  const clean = String(slug || "").toLowerCase();
  if (!/^[a-z0-9-]+$/.test(clean)) return null;
  return remoteFirst("json", `component/${clean}.json`, () => readDaisyuiComponentLocal(clean));
}

async function readDaisyuiComponentLocal(clean) {
  const raw = await readTextUnder(DAISYUI_DIR, `components/${clean}.json`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** A stylesheet under the layer's css/ directory, as text ("daisyui", "themes", "compat"). */
export async function readDaisyuiCss(name) {
  const clean = String(name || "").toLowerCase().replace(/\.css$/, "");
  if (!/^[a-z0-9-]+$/.test(clean)) return null;
  return remoteFirst("text", `css/${clean}.css`, () => readTextUnder(join(DAISYUI_DIR, "css"), `${clean}.css`));
}

/** The theme index ({ total, themes[] }), or null when the layer is missing. */
export async function readDaisyuiThemes() {
  return remoteFirst("json", "themes.json", () => readDaisyuiThemesLocal());
}

async function readDaisyuiThemesLocal() {
  const raw = await readTextUnder(DAISYUI_DIR, "themes.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** The vendored-package provenance ({ fetchedAt, pin, npm, source, gaps }), or null. */
export async function readDaisyuiProvenance() {
  return remoteFirst("json", "provenance.json", () => readDaisyuiProvenanceLocal());
}

async function readDaisyuiProvenanceLocal() {
  const raw = await readTextUnder(DAISYUI_DIR, "provenance.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Term search over the catalog index (names, slugs, groups, descriptions,
 * class names). Cheap on purpose: the catalog already carries one row per
 * component; class names come from the per-component records on demand.
 */
export async function searchDaisyui({ query = "", group = "", limit = 20 } = {}) {
  const catalog = await readDaisyuiCatalog();
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const cat = String(group || "").trim().toLowerCase();
  const pool = catalog.components.filter((c) => !cat || String(c.group || "").toLowerCase() === cat);
  const filtered = [];
  for (const entry of pool) {
    if (terms.length) {
      const classNames = (entry.classes || []).flatMap((g) => g.classes || []).join(" ");
      const hay = `${entry.name} ${entry.slug} ${entry.group} ${entry.description} ${classNames}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) {
        // Fallback for older catalogs without indexed classes.
        if (!entry.classes) {
          const record = await readDaisyuiComponent(entry.slug);
          const classHay = record ? JSON.stringify(record.classes).toLowerCase() : "";
          if (!terms.every((t) => `${hay} ${classHay}`.includes(t))) continue;
        } else {
          continue;
        }
      }
    }
    filtered.push(entry);
  }
  return {
    query: q,
    group: cat || null,
    total: filtered.length,
    results: filtered.slice(0, Math.min(Math.max(1, Number(limit) || 20), 100)),
  };
}
