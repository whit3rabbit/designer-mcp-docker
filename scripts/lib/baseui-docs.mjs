/**
 * baseui-docs.mjs — offline readers for the baked Base UI docs layer.
 *
 * Base UI (@base-ui/react) is headless, so this layer is pure documentation:
 * the llms.txt index baked into a catalog plus every linked .md page, fetched
 * by scripts/fetch-baseui.mjs from the public pages robots.txt permits. Reads
 * `<cache>/baseui/` on disk, or the same endpoints on a `DESIGN_REMOTE_URL`
 * static host (api/baseui.json + api/baseui/doc/<path>). Every path a caller
 * can influence is checked against traversal before it touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-baseui.mjs):
 *   baseui/catalog.json   { version, license, totals, sections, components[], guides[] }
 *   baseui/docs/          components/<slug>.md, overview/…, handbook/…, utils/<slug>.md
 *   baseui/LICENSE        upstream MIT licence, verbatim
 *
 * `components` holds the 37 headless component pages; `guides` holds
 * everything else (overview incl. release notes, handbook, utilities) — the
 * search kind filter and the gallery treat them as component|guide.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, BASEUI_DIR } from "./cache.mjs";

const EMPTY_CATALOG = {
  updatedAt: null,
  version: null,
  license: null,
  totals: { components: 0, guides: 0, pages: 0, upstreamPages: 0 },
  sections: {},
  components: [],
  guides: [],
  hasLicense: false,
};

const contentCache = new Map();

/** Any accepted spelling ("AlertDialog", "alert dialog") -> kebab slug ("alert-dialog"). */
export function baseUiSlug(name) {
  return String(name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readTextUnder(base, rel) {
  const clean = String(rel || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\") || !/^[\w./-]+$/.test(clean)) return null;
  const full = resolve(join(base, clean));
  if (!full.startsWith(resolve(base) + "/") || !existsSync(full)) return null;
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
  return remoteOr(kind, `api/baseui/${rel}`, local);
}

/** The catalog written by the fetcher, or an empty one when the layer is missing. */
export async function readBaseUiCatalog() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/baseui.json");
    // A 404 is the host's answer: this layer is not published there.
    if (remote === null) return EMPTY_CATALOG;
    // Unreachable, or not a catalog: fall back to the one on disk.
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.components)) return remote;
  }
  const raw = await readTextUnder(BASEUI_DIR, "catalog.json");
  if (!raw) return EMPTY_CATALOG;
  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_CATALOG;
  }
}

/** One doc by its catalog path ("components/dialog.md"). */
export async function readBaseUiDoc(docPath) {
  const clean = String(docPath || "").replace(/^\/+/, "");
  return remoteFirst("text", `doc/${clean}`, () => readTextUnder(join(BASEUI_DIR, "docs"), clean));
}

/**
 * Term search over the catalog index (names, slugs, sections, descriptions).
 * kind filters to "component" or "guide" (guides = overview, handbook and
 * utilities pages). Cheap on purpose: the catalog already carries one
 * description per entry.
 */
export async function searchBaseUiDocs({ query = "", kind = "", limit = 20 } = {}) {
  const catalog = await readBaseUiCatalog();
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const pool = [
    ...catalog.components.map((c) => ({ ...c, kind: "component" })),
    ...catalog.guides.map((g) => ({ ...g, kind: "guide" })),
  ];
  const filtered = pool.filter((entry) => {
    if (kind && entry.kind !== kind) return false;
    if (!terms.length) return true;
    const hay = `${entry.name} ${entry.slug} ${entry.section} ${entry.group} ${entry.description}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  return {
    query: q,
    total: filtered.length,
    results: filtered.slice(0, Math.min(Number(limit) || 20, 100)),
  };
}
