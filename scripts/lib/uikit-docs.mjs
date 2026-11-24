/**
 * uikit-docs.mjs — offline readers for the baked UI kits layer.
 *
 * One generic layer covering the frameworks the bespoke layers do not:
 * Chakra UI, Material UI, Ant Design, PrimeReact (MIT line), coss ui,
 * Magic UI, Motion Primitives, UnoCSS, Panda CSS, vanilla-extract, StyleX,
 * Open Props and Ark UI are baked; React Bits, Aceternity UI and 21st.dev are
 * pointer kits (first-party llms.txt index only, no component code).
 *
 * Reads `<cache>/uikits/` on disk or the same endpoints on a
 * `DESIGN_REMOTE_URL` static host. Every path a caller can influence is
 * checked against traversal before it touches the filesystem.
 *
 * Layer layout (written by scripts/fetch-uikits.mjs):
 *   uikits/index.json            { updatedAt, totals, kits[] }
 *   uikits/<kit>/catalog.json    { kit, totals, items[] }
 *   uikits/<kit>/files.json      { files: { relpath: bytes } }
 *   uikits/<kit>/docs/           doc markdown, re-rooted from the upstream tree
 *   uikits/<kit>/source/         component/example source
 *   uikits/<kit>/registry/       shadcn-style registry JSONs (verbatim)
 *   uikits/<kit>/assets/         css token files (open-props)
 *   uikits/<kit>/pointer/        llms.txt for pointer kits
 */

import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { getRemoteUrl, remoteJson, remoteOr, REMOTE_DOWN, UIKITS_DIR, createBoundedCache } from "./cache.mjs";

const EMPTY_INDEX = {
  updatedAt: null,
  totals: { kits: 0, baked: 0, items: 0 },
  kits: [],
};

const contentCache = createBoundedCache(64);

function cacheText(full, text) {
  contentCache.set(full, text);
  return text;
}

/** Kit ids and file paths are kebab-ish; anything else never reaches disk. */
export function uikitSlug(name) {
  const clean = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return /^[a-z0-9-]+$/.test(clean) ? clean : "";
}

async function readTextUnder(base, rel) {
  const clean = String(rel || "").replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\") || !/^[\w./-]+$/.test(clean)) return null;
  const full = resolve(join(base, clean));
  if (!full.startsWith(resolve(base) + "/") || !existsSync(full)) return null;
  if (contentCache.has(full)) {
    // Re-insert so a hit stays fresh and the least recently used entry goes first.
    const hit = contentCache.get(full);
    contentCache.delete(full);
    contentCache.set(full, hit);
    return hit;
  }
  // A directory passes existsSync, and reading one as text throws EISDIR.
  if (!statSync(full).isFile()) return null;
  return cacheText(full, await readFile(full, "utf8"));
}

/**
 * One file from this layer's tree on the remote host, else `local()`.
 * A 404 is the host's answer (null), never a reason to fall back to disk;
 * only an unreachable host does that, and the reply carries the note.
 */
function remoteFirst(kind, rel, local) {
  return remoteOr(kind, `api/uikits/${rel}`, local);
}

/** The kit index written by the fetcher, or an empty one when missing. */
export async function readUikitsIndex() {
  if (getRemoteUrl()) {
    const remote = await remoteJson("api/uikits.json");
    if (remote === null) return EMPTY_INDEX;
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.kits)) return remote;
  }
  const raw = await readTextUnder(UIKITS_DIR, "index.json");
  if (!raw) return EMPTY_INDEX;
  try {
    return JSON.parse(raw);
  } catch {
    return EMPTY_INDEX;
  }
}

/** One kit's catalog (items with docs/source paths), or null when absent. */
export async function readUikitCatalog(kit) {
  const slug = uikitSlug(kit);
  if (!slug) return null;
  if (getRemoteUrl()) {
    const remote = await remoteJson(`api/uikits/${slug}/catalog.json`);
    if (remote === null) return null;
    if (remote !== REMOTE_DOWN && Array.isArray(remote?.items)) return remote;
  }
  const raw = await readTextUnder(join(UIKITS_DIR, slug), "catalog.json");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed : null;
  } catch {
    return null;
  }
}

/** The kit's baked file manifest ({ files: { relpath: bytes } }), or null. */
export function readUikitFiles(kit) {
  const slug = uikitSlug(kit);
  if (!slug) return null;
  return remoteFirst("json", `${slug}/files.json`, readUikitFilesLocal(slug));
}

function readUikitFilesLocal(slug) {
  return async () => {
    const raw = await readTextUnder(join(UIKITS_DIR, slug), "files.json");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
}

/**
 * One baked file by path relative to the kit dir ("docs/button.mdx",
 * "source/button/index.tsx", "assets/open-props.min.css", "pointer/llms.txt").
 * Returns text, or null when the kit or file is absent.
 */
export function readUikitFile(kit, rel) {
  const slug = uikitSlug(kit);
  if (!slug) return null;
  const clean = String(rel || "").replace(/^\/+/, "");
  return remoteFirst("text", `${slug}/file/${clean}`, () => readTextUnder(join(UIKITS_DIR, slug), clean));
}

/** Resolve an item by slug (or exact title as a fallback) inside a catalog. */
export function findUikitItem(catalog, slugOrTitle) {
  if (!catalog || !slugOrTitle) return null;
  const wanted = uikitSlug(slugOrTitle);
  return (
    catalog.items.find((i) => i.slug === wanted) ||
    catalog.items.find((i) => i.slug === String(slugOrTitle).toLowerCase()) ||
    catalog.items.find((i) => String(i.title).toLowerCase() === String(slugOrTitle).toLowerCase()) ||
    null
  );
}

/**
 * Term search over the kit index and item catalogs. Cheap on purpose:
 * AND-of-terms over name/slug/group/summary per item, catalog scans only.
 * `kit` narrows to one kit; `kind` filters component/guide/topic items.
 * `total` counts every match, so a caller can tell "20 of 240" from "20".
 */
export async function searchUikits({ query = "", kit = "", kind = "", limit = 20 } = {}) {
  const index = await readUikitsIndex();
  const wanted = uikitSlug(kit);
  const kits = wanted ? index.kits.filter((k) => k.kit === wanted) : index.kits;
  const q = String(query || "").trim().toLowerCase();
  const terms = q ? q.split(/\s+/) : [];
  const cap = Math.min(Number(limit) || 20, 100);
  const results = [];
  let total = 0;
  const loaded = await Promise.all(
    kits.map(async (row) => ({ row, catalog: await readUikitCatalog(row.kit) })),
  );
  for (const { row, catalog } of loaded) {
    if (!catalog) continue;
    for (const item of catalog.items) {
      if (kind && item.kind !== kind) continue;
      if (terms.length) {
        const hay = `${item.title} ${item.slug} ${item.group} ${item.kind} ${item.summary}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) continue;
      }
      total += 1;
      if (results.length >= cap) continue;
      results.push({
        kit: row.kit,
        kitName: row.name,
        slug: item.slug,
        title: item.title,
        group: item.group,
        kind: item.kind,
        summary: item.summary,
      });
    }
  }
  return { query: q, total, results };
}
