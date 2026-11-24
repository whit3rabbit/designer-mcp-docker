/**
 * refero-styles-docs.mjs — offline readers for the baked Refero Styles layer.
 *
 * Reads `<cache>/refero-styles/` on disk (the catalog of compact rows, one
 * full record per style with its DESIGN.md, the mirrored preview assets, and
 * the provenance) or the same endpoints on a `DESIGN_REMOTE_URL` static host.
 * Every path a caller can influence is checked against traversal before it
 * touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-refero-styles.mjs):
 *   refero-styles/catalog.json         { updatedAt, totals, styles[] }
 *   refero-styles/styles/<uuid>.json   one full record (data, views.design_md, assets)
 *   refero-styles/assets/<hash16>.<ext>  mirrored svg/webp/jpg previews
 *   refero-styles/assets.json          url -> { file, bytes, mime }
 *   refero-styles/provenance.json      robots verdict, counts, checksums, gaps
 *   refero-styles/NOTICE.md            attribution
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, REFERO_STYLES_DIR, createBoundedCache } from "./cache.mjs";

const EMPTY_CATALOG = {
  updatedAt: null,
  totals: { styles: 0, withDesignMd: 0, withPreviews: 0, withScreenshots: 0 },
  styles: [],
};

const UUID_RE = /^[0-9a-f][0-9a-f-]{35}$/i;
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
  return remoteOr(kind, `api/refero-styles/${rel}`, local);
}

/** The catalog written by the fetcher, or an empty one when the layer is missing. */
export async function readReferoStylesCatalog() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/refero-styles.json");
    // A 404 is the host's answer: this layer is not published there.
    if (remote === null) return EMPTY_CATALOG;
    // Unreachable, or not a catalog: fall back to the one on disk.
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.styles)) return remote;
  }
  const raw = await readTextUnder(REFERO_STYLES_DIR, "catalog.json");
  if (!raw) return EMPTY_CATALOG;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.styles) ? parsed : EMPTY_CATALOG;
  } catch {
    return EMPTY_CATALOG;
  }
}

/** One full style record by uuid: analysis, DESIGN.md, mapped assets. */
export async function readReferoStyle(uuid) {
  const clean = String(uuid || "").toLowerCase();
  if (!UUID_RE.test(clean)) return null;
  return remoteFirst("json", `style/${clean}.json`, () => readReferoStyleLocal(clean));
}

async function readReferoStyleLocal(clean) {
  const raw = await readTextUnder(REFERO_STYLES_DIR, `styles/${clean}.json`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * A mirrored preview asset (svg/webp/jpg) under assets/, as bytes. The name
 * is held to one plain content-addressed file name, and remote mode follows
 * the same 404-is-the-answer rule as the text readers. The remote path is
 * the same /refero-styles/asset/<file> the gallery pages reference, so the
 * static site emits the bytes once for both.
 */
export async function readReferoStylesAsset(file) {
  const clean = String(file || "").replace(/^\/+/, "");
  if (!/^assets\/[\w.-]+$/.test(clean)) return null;
  const name = clean.slice("assets/".length);
  if (getRemoteUrl()) {
    // Binary, so it bypasses the shared text/JSON fetcher. `name` is held to
    // one plain file name by the check above.
    try {
      const res = await fetch(`${getRemoteUrl()}/refero-styles/asset/${name}`, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (res.status === 404) return null;
    } catch {
      // Unreachable host: fall through to the copy on disk.
    }
  }
  const full = resolve(join(REFERO_STYLES_DIR, clean));
  if (!full.startsWith(resolve(REFERO_STYLES_DIR) + "/") || !existsSync(full)) return null;
  return await readFile(full);
}

/** The fetch provenance ({ fetchedAt, robots, fetch, gaps, checksums }), or null. */
export async function readReferoStylesProvenance() {
  return remoteFirst("json", "provenance.json", () => readReferoStylesProvenanceLocal());
}

async function readReferoStylesProvenanceLocal() {
  const raw = await readTextUnder(REFERO_STYLES_DIR, "provenance.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Term search over the catalog index (names, domains, descriptions, font
 * families and substitutes, palette hexes and names). Cheap on purpose: the
 * catalog already carries one row per style.
 */
export async function searchReferoStyles({ query = "", limit = 20 } = {}) {
  const catalog = await readReferoStylesCatalog();
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const filtered = catalog.styles.filter((row) => {
    if (!terms.length) return true;
    const fonts = (row.fonts || []).map((f) => `${f.family} ${f.substitute || ""}`).join(" ");
    const palette = (row.palette || []).map((c) => `${c.name} ${c.value}`).join(" ");
    const hay = `${row.name} ${row.domain} ${row.description} ${fonts} ${palette}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  return {
    query: q,
    total: filtered.length,
    results: filtered.slice(0, Math.min(Math.max(1, Number(limit) || 20), 200)),
  };
}
