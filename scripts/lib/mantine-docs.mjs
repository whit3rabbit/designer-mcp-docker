/**
 * mantine-docs.mjs — offline readers for the baked Mantine UI layer.
 *
 * Reads `<cache>/mantine/` on disk (the ui.mantine.dev catalog: per-component
 * TSX + CSS modules, category illustrations, demo images, the vendored npm
 * packages and their provenance) or the same endpoints on a
 * `DESIGN_REMOTE_URL` static host. Every path a caller can influence is
 * checked against traversal before it touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-mantine.mjs):
 *   mantine/index.json          { updatedAt, source, total, groups, components[] }
 *   mantine/components/<slug>.json   per component: files[], packages, remote[]
 *   mantine/images/<cat>-{light,dark}.svg  category illustrations
 *   mantine/assets/<sha>.<ext>  + assets.json   demo images, keyed by url
 *   mantine/vendor/<npm>/<version>/             runtime packages (pin.json)
 *   mantine/provenance.json     versions, urls, checksums, gaps
 *   mantine/LICENCE
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, MANTINE_DIR, createBoundedCache } from "./cache.mjs";

const EMPTY_CATALOG = {
  updatedAt: null,
  source: { site: "https://ui.mantine.dev/", license: "MIT" },
  total: 0,
  groups: [],
  packages: [],
  components: [],
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
  return remoteOr(kind, `api/mantine/${rel}`, local);
}

/** The catalog written by the fetcher, or an empty one when the layer is missing. */
export async function readMantineCatalog() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/mantine.json");
    // A 404 is the host's answer: this layer is not published there.
    if (remote === null) return EMPTY_CATALOG;
    // Unreachable, or not a catalog: fall back to the one on disk.
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.components)) return remote;
  }
  const raw = await readTextUnder(MANTINE_DIR, "index.json");
  if (!raw) return EMPTY_CATALOG;
  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_CATALOG;
  }
}

/** One component detail by slug: title, packages, and the full source files. */
export async function readMantineComponent(slug) {
  const clean = String(slug || "").toLowerCase();
  if (!/^[a-z0-9-]+$/.test(clean)) return null;
  return remoteFirst("json", `component/${clean}.json`, () => readMantineComponentLocal(clean));
}

async function readMantineComponentLocal(clean) {
  const raw = await readTextUnder(MANTINE_DIR, `components/${clean}.json`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** The vendored-package provenance ({ fetchedAt, pin, packages, gaps }), or null. */
export async function readMantineProvenance() {
  return remoteFirst("json", "provenance.json", () => readMantineProvenanceLocal());
}

async function readMantineProvenanceLocal() {
  const raw = await readTextUnder(MANTINE_DIR, "provenance.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * A binary under the layer's images/ or assets/ trees (category
 * illustrations, downloaded demo images), as bytes. Only those two
 * directories are servable.
 */
export async function readMantineAsset(rel) {
  const clean = String(rel || "").replace(/^\/+/, "");
  if (!/^(?:images|assets)\/[\w.-]+$/.test(clean)) return null;
  if (getRemoteUrl()) {
    // Binary, so it bypasses the shared text/JSON fetcher. `clean` is held to
    // images/ or assets/ plus one plain file name by the check above.
    try {
      const res = await fetch(`${getRemoteUrl()}/mantine/${clean}`, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (res.status === 404) return null;
    } catch {
      // Unreachable host: fall through to the copy on disk.
    }
  }
  const full = resolve(join(MANTINE_DIR, clean));
  if (!full.startsWith(resolve(MANTINE_DIR) + "/") || !existsSync(full)) return null;
  return await readFile(full);
}

/** The MIT licence text the upstream catalog travels with, or null. */
export async function readMantineLicence() {
  return remoteFirst("text", "LICENCE", () => readTextUnder(MANTINE_DIR, "LICENCE"));
}

/**
 * Term search over the catalog index (names, slugs, titles, categories,
 * npm packages). Cheap on purpose: the index already carries one row per
 * component.
 */
export async function searchMantine({ query = "", category = "", limit = 20 } = {}) {
  const catalog = await readMantineCatalog();
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const cat = String(category || "").trim().toLowerCase();
  const pool = catalog.components.filter((c) => !cat || c.category === cat);
  const filtered = pool.filter((entry) => {
    if (!terms.length) return true;
    const hay = `${entry.name} ${entry.slug} ${entry.title} ${entry.category} ${(entry.packages || []).join(" ")}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  return {
    query: q,
    category: cat || null,
    total: filtered.length,
    results: filtered.slice(0, Math.min(Number(limit) || 20, 100)),
  };
}
