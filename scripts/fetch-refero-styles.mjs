#!/usr/bin/env node
/**
 * fetch-refero-styles.mjs — bake the Refero Styles layer into the cache
 * (build-time network; the runtime surfaces never run this script).
 *
 * refero.design/styles is Refero's curated "Styles" product: one deep
 * design-system profile per site (named color tokens, surfaces, component
 * recipes with CSS, typography recipes, font substitutes, dos/donts) plus a
 * Refero-authored DESIGN.md the public page lets anyone download. The pages
 * are a client-side React SPA, so the structured data is not embedded in
 * HTML; it is served by the same public, unauthenticated API the page itself
 * calls (Access-Control-Allow-Origin: *):
 *
 *   GET {list}?page=N            -> { pagination, records[] }   (24 per page)
 *   GET {detail}/{uuid}          -> one full record
 *
 * Compliance lives in docs/DATA-SOURCE.md ("The Refero Styles layer"). In
 * short: robots.txt on refero.design, api.refero.design and
 * images.refero.design permits generic agents; the endpoints are the public
 * backing API of a public, indexable page; the DESIGN.md download is a
 * first-class product feature. The blocked styles.refero.design/api/styles
 * endpoint is NOT this surface and stays forbidden. The fetcher checks all
 * three robots.txt files before anything is requested and aborts loudly if
 * the paths become disallowed. Data is cached locally and not redistributed.
 *
 * Cache layout:
 *   <cache>/refero-styles/catalog.json      { updatedAt, totals, styles[] }
 *   <cache>/refero-styles/styles/<uuid>.json  one full record per style
 *   <cache>/refero-styles/assets/<hash16>.<ext>  mirrored svg/webp/jpg, sha256(url)-named
 *   <cache>/refero-styles/assets.json       url -> { file, bytes, mime }
 *   <cache>/refero-styles/provenance.json   robots verdict, counts, checksums, gaps
 *   <cache>/refero-styles/NOTICE.md         attribution
 *
 * Unlike the full-stage-and-swap layers, this fetcher is incremental by
 * design: records and assets are content-addressed and written as they land
 * (atomically), so a re-run fetches only what is missing. catalog.json and
 * provenance.json are rewritten last, so a mid-run crash always leaves a
 * valid, if older, catalog.
 *
 * Usage:
 *   npm run refero-styles                # incremental refresh
 *   node scripts/fetch-refero-styles.mjs --force   # refetch every record
 *   REFERO_FETCH_DELAY_MS / REFERO_FETCH_CONC      # list+detail pacing
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REFERO_STYLES_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "refero-styles", "pin.json");

// An honest UA: the endpoints are public, robots-permitted and CORS-open,
// so this fetcher identifies itself like fetch-baseui does.
const UA = "designer-mcp-docker fetch-refero-styles";
const MAX_PAGES = 200; // safety cap; the list is 33 pages today
const PAGE_SIZE = 24; // the API's fixed per_page
const THUMB_WIDTH = 1000; // same quality bar as scripts/fetch-thumbs.mjs
const THUMB_QUALITY = 86;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hashKey = (url) => createHash("sha256").update(url).digest("hex").slice(0, 16);

async function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** GET with one retry, JSON or bytes. */
async function fetchOnce(url, { accept = "application/json" } = {}) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: accept },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      lastError = e;
      await sleep(500);
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------- robots gate
/** Parse the `User-agent: *` Disallow prefixes out of a robots.txt (fetch-baseui pattern). */
function parseRobots(text) {
  const disallowed = [];
  let star = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (/^user-agent:\s*\*$/i.test(line)) { star = true; continue; }
    if (/^user-agent:/i.test(line)) { star = false; continue; }
    if (star && /^disallow:\s*(\S*)$/i.test(line)) {
      const path = line.slice(line.indexOf(":") + 1).trim();
      if (path) disallowed.push(path);
    }
  }
  return disallowed;
}

function robotsAllows(disallowed, urlPath) {
  return !disallowed.some((prefix) => urlPath.startsWith(prefix));
}

/** The image type of a payload, from its bytes (fetch-mantine pattern). */
function sniffImage(bytes) {
  const text = (start, end) => bytes.subarray(start, end).toString("latin1");
  if (text(1, 4) === "PNG") return ["png", "image/png"];
  if (text(0, 3) === "\xff\xd8\xff") return ["jpg", "image/jpeg"];
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return ["webp", "image/webp"];
  if (text(0, 4) === "GIF8") return ["gif", "image/gif"];
  const head = text(0, 4096).trimStart();
  if (head.startsWith("<") && /<svg[\s>]/.test(head)) return ["svg", "image/svg+xml"];
  return null;
}

let sharpModule;
/** Lazy sharp (fetch-thumbs pattern); null when the optional dependency is absent. */
async function getSharp() {
  if (sharpModule !== undefined) return sharpModule;
  try {
    sharpModule = (await import("sharp")).default;
  } catch {
    sharpModule = null;
  }
  return sharpModule;
}

/** Screenshot keyframes -> WebP at the shared thumbs quality bar. */
async function compressToWebp(bytes) {
  const sharp = await getSharp();
  if (!sharp) return null;
  return sharp(bytes)
    .rotate()
    .resize({ width: THUMB_WIDTH, kernel: "lanczos3", withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY, effort: 4, smartSubsample: true })
    .toBuffer();
}

// ------------------------------------------------------------------- main
async function main() {
  const force = process.argv.includes("--force");
  const pin = await readJsonSafe(PIN_PATH);
  if (!pin?.source?.list || !pin?.source?.detail || !Array.isArray(pin?.source?.robots)) {
    throw new Error(`missing or invalid ${PIN_PATH}`);
  }
  const delayMs = Number(process.env.REFERO_FETCH_DELAY_MS ?? pin.fetch?.delayMs ?? 400);
  const conc = Number(process.env.REFERO_FETCH_CONC ?? pin.fetch?.conc ?? 4);
  const assetDelayMs = Number(pin.fetch?.assetDelayMs ?? 150);
  const assetConc = Number(pin.fetch?.assetConc ?? 4);
  const gaps = [];

  console.log(`Refero Styles layer -> ${REFERO_STYLES_DIR}`);
  console.log(`  pin: ${pin.source.site}`);

  // ------------------------------------------------------------ robots gate
  // Three hosts serve this layer (site, api, images). If any robots.txt is
  // unreachable or disallows our paths, nothing is fetched.
  const robots = {};
  for (const url of pin.source.robots) {
    let disallowed;
    try {
      disallowed = parseRobots((await fetchOnce(url, { accept: "text/plain,*/*" })).toString("utf8"));
    } catch (e) {
      throw new Error(`robots.txt unreachable at ${url}; not fetching anything (${e.message})`);
    }
    robots[url] = disallowed;
    console.log(`  robots: ${url.replace(/^https:\/\//, "")} -> ${disallowed.length || "no"} disallowed prefix(es)`);
  }
  const apiHost = new URL(pin.source.list).host;
  const apiRobots = robots[pin.source.robots.find((u) => new URL(u).host === apiHost)];
  const apiPrefix = pin.source.apiPathPrefix || "/v1/";
  if (!robotsAllows(apiRobots, apiPrefix)) {
    throw new Error(`robots.txt now disallows ${apiPrefix} on ${apiHost}; not fetching anything`);
  }
  const imagesRobots = robots[pin.source.robots.find((u) => new URL(u).host.includes("images."))] || [];

  // -------------------------------------------------------------- list pass
  // The list is the discovery surface: 24 records per page, `next` walks it.
  const records = new Map(); // uuid -> list record
  let page = 1;
  while (page <= MAX_PAGES) {
    let body;
    try {
      body = JSON.parse((await fetchOnce(`${pin.source.list}?page=${page}`)).toString("utf8"));
    } catch (e) {
      throw new Error(`list page ${page} failed (${e.message}); not swapping the catalog`);
    }
    for (const r of body.records || []) records.set(r.uuid, r);
    const total = body.pagination?.count ?? records.size;
    process.stdout.write(`\r  list: page ${page} (${records.size}/${total} records)   `);
    if (!body.pagination?.next) break;
    page = body.pagination?.next;
    await sleep(delayMs);
  }
  if (page > MAX_PAGES) throw new Error(`list exceeded ${MAX_PAGES} pages; refusing to continue`);
  console.log("");
  if (!records.size) throw new Error("the list parsed to zero records; not touching the cache");

  // ------------------------------------------------------- what is missing?
  const stylesDir = join(REFERO_STYLES_DIR, "styles");
  await mkdir(stylesDir, { recursive: true });
  const cached = new Set((await readdir(stylesDir)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)));
  const targets = force ? [...records.keys()] : [...records.keys()].filter((id) => !cached.has(id));
  const dropped = [...cached].filter((id) => !records.has(id));
  if (dropped.length) gaps.push(`catalog: ${dropped.length} cached record(s) no longer in the upstream list (kept on disk)`);
  console.log(`  styles: ${records.size} upstream, ${cached.size} cached, ${targets.length} to fetch${force ? " (--force)" : ""}`);

  // ------------------------------------------------------------ detail pass
  let ok = 0;
  const queue = targets.slice();
  const worker = async () => {
    while (queue.length) {
      const uuid = queue.shift();
      try {
        const buf = await fetchOnce(`${pin.source.detail}/${uuid}`);
        const record = JSON.parse(buf.toString("utf8"));
        if (!record?.uuid || !record?.data) throw new Error("record shape unexpected");
        await writeJsonAtomic(join(stylesDir, `${uuid}.json`), record);
        ok += 1;
        process.stdout.write(`\r  detail: ${ok}/${targets.length} (${record.site?.name || uuid})   `);
      } catch (e) {
        gaps.push(`styles/${uuid}: failed (${e.message})`);
      }
      await sleep(delayMs);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, conc), 8) }, worker));
  console.log("");

  // ------------------------------------------------------------- assets
  // Type-preview SVGs, favicons and screenshot keyframes, mirrored into
  // assets/ under a sha256(url) name so a re-fetch reuses what is on disk.
  // Screenshots are compressed to WebP (originals discarded); everything
  // else is stored verbatim. The video preview mp4 is never fetched.
  const assetsPath = join(REFERO_STYLES_DIR, "assets.json");
  const priorAssets = (await readJsonSafe(assetsPath)) || {};
  const assets = { ...priorAssets };
  const assetUrls = new Set();
  for (const [uuid, list] of records) {
    collectAssetUrls(list, assetUrls);
    if (!force && cached.has(uuid)) continue; // existing records already mapped
    const record = await readJsonSafe(join(stylesDir, `${uuid}.json`));
    if (record) collectAssetUrls(record, assetUrls);
  }
  const needed = [...assetUrls].filter((url) => {
    const prior = priorAssets[url];
    return !(prior && existsSync(join(REFERO_STYLES_DIR, "assets", prior.file)));
  });
  console.log(`  assets: ${assetUrls.size} referenced, ${needed.length} to mirror`);

  const assetDir = join(REFERO_STYLES_DIR, "assets");
  await mkdir(assetDir, { recursive: true });
  const assetQueue = needed.sort();
  let assetOk = 0;
  const assetWorker = async () => {
    while (assetQueue.length) {
      const url = assetQueue.shift();
      const urlPath = new URL(url).pathname;
      if (!robotsAllows(imagesRobots, urlPath)) {
        gaps.push(`assets: ${urlPath} disallowed by robots.txt, skipped`);
        continue;
      }
      try {
        const bytes = await fetchOnce(url, { accept: "image/*,*/*" });
        let file;
        let mime;
        const isScreenshot = url.includes("/keyframes/");
        if (isScreenshot) {
          const webp = await compressToWebp(bytes);
          if (webp) {
            file = `${hashKey(url)}.webp`;
            await writeFile(join(assetDir, file), webp);
            assets[url] = { file, bytes: webp.length, mime: "image/webp", sourceBytes: bytes.length };
            assetOk += 1;
            continue;
          }
        }
        const kind = sniffImage(bytes);
        if (!kind) throw new Error(`not an image (${urlPath})`);
        const [extension, mimeType] = kind;
        file = `${hashKey(url)}.${extension}`;
        await writeFile(join(assetDir, file), bytes);
        mime = mimeType;
        assets[url] = { file, bytes: bytes.length, mime };
        assetOk += 1;
      } catch (e) {
        gaps.push(`assets: ${url.split("?")[0]} failed (${e.message})`);
      }
      await sleep(assetDelayMs);
    }
  };
  await Promise.all(Array.from({ length: Math.min(Math.max(1, assetConc), 8) }, assetWorker));
  console.log(`  assets: ${assetOk} mirrored, ${Object.keys(assets).length} mapped`);
  await writeJsonAtomic(assetsPath, assets);

  // -------------------------------------------------------------- catalog
  // Rows come from the fresh list records (palette card + type previews live
  // there); counts and DESIGN.md size come from the stored detail records.
  const rows = [];
  for (const [uuid, list] of records) {
    const detail = await readJsonSafe(join(stylesDir, `${uuid}.json`));
    const data = detail?.data || {};
    const fonts = Object.entries(data.fonts || {}).map(([slot, f]) => ({
      family: f?.family || slot,
      substitute: f?.substitute || null,
    }));
    const row = {
      uuid,
      name: list.site?.name || "",
      domain: list.site?.domain || "",
      description: list.site?.description || "",
      palette: (list.views?.card?.palette || []).slice(0, 8).map((c) => ({ name: c.name, value: c.value })),
      fonts,
      counts: {
        components: Array.isArray(data.components) ? data.components.length : 0,
        typography: Array.isArray(data.typography) ? data.typography.length : 0,
        surfaces: Array.isArray(data.surfaces) ? data.surfaces.length : 0,
        colors: data.colors ? Object.keys(data.colors).length : 0,
      },
      mdBytes: detail?.views?.design_md ? Buffer.byteLength(detail.views.design_md) : 0,
      preview: assetFileFor(assets, list.type_previews?.card?.display?.url),
      fontsPreview: assetFileFor(assets, Object.values(list.type_previews?.fonts || {})[0]?.url),
      favicon: assetFileFor(assets, list.site?.favicon_url),
      screenshots: (list.screenshots || []).map((u) => assetFileFor(assets, u)).filter(Boolean),
    };
    rows.push(row);
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  const catalog = {
    updatedAt: Date.now(),
    totals: {
      styles: rows.length,
      withDesignMd: rows.filter((r) => r.mdBytes > 0).length,
      withPreviews: rows.filter((r) => r.preview).length,
      withScreenshots: rows.filter((r) => r.screenshots.length).length,
    },
    styles: rows,
  };
  await writeJsonAtomic(join(REFERO_STYLES_DIR, "catalog.json"), catalog);
  console.log(`  catalog: ${catalog.totals.styles} styles (${catalog.totals.withDesignMd} with DESIGN.md, ${catalog.totals.withPreviews} with type previews)`);

  // ---------------------------------------------------------------- NOTICE
  const noticePath = join(REFERO_STYLES_DIR, "NOTICE.md");
  if (!existsSync(noticePath)) {
    await writeFile(
      noticePath,
      `# Refero Styles layer\n\n` +
        `Design-system profiles fetched from Refero's public Styles API (the backing\n` +
        `API of https://refero.design/styles) on a robots-permitted, unauthenticated\n` +
        `read. The analysis, the DESIGN.md exports and the preview images belong to\n` +
        `Refero and to the sites depicted. This layer caches them locally for\n` +
        `personal use and does not redistribute them. See docs/DATA-SOURCE.md.\n`,
    );
  }

  // ------------------------------------------------------------ provenance
  const prior = await readJsonSafe(join(REFERO_STYLES_DIR, "provenance.json"));
  const provenance = {
    fetchedAt: new Date().toISOString(),
    pin,
    robots: {
      checked: true,
      verdicts: Object.fromEntries(Object.entries(robots).map(([url, d]) => [url, { disallowed: d }])),
      statement:
        "Fetched only the public /v1/styles API and images.refero.design assets robots.txt permits for generic agents; the blocked styles.refero.design/api/styles endpoint was never requested.",
    },
    fetch: {
      listPages: page,
      upstream: records.size,
      cachedBefore: cached.size,
      fetchedNow: ok,
      assetsMapped: Object.keys(assets).length,
      assetsMirroredNow: assetOk,
    },
    priorFetchedAt: prior?.fetchedAt || null,
    gaps,
    checksums: await checksumTree(REFERO_STYLES_DIR),
  };
  await writeJsonAtomic(join(REFERO_STYLES_DIR, "provenance.json"), provenance);
  console.log(`  provenance: ${Object.keys(provenance.checksums).length} files checksummed`);
  if (gaps.length) {
    console.warn(`  ${gaps.length} gap(s) recorded:`);
    for (const g of gaps.slice(0, 20)) console.warn(`    - ${g}`);
    if (gaps.length > 20) console.warn(`    ... and ${gaps.length - 20} more`);
  }
  console.log("done");
}

/** Every image url a record references (type previews, favicons, keyframes). */
function collectAssetUrls(node, out) {
  const tp = node?.type_previews || {};
  for (const url of [tp.card?.display?.url, tp.card?.pair?.display?.url]) {
    if (typeof url === "string" && url.startsWith("https://")) out.add(url);
  }
  for (const f of Object.values(tp.fonts || {})) {
    if (typeof f?.url === "string" && f.url.startsWith("https://")) out.add(f.url);
  }
  if (typeof node?.site?.favicon_url === "string" && node.site.favicon_url.startsWith("https://")) {
    out.add(node.site.favicon_url);
  }
  for (const s of Array.isArray(node?.screenshots) ? node.screenshots : []) {
    if (typeof s === "string" && s.startsWith("https://")) out.add(s);
  }
}

/** The local asset file mapped for a url, or null. */
function assetFileFor(assets, url) {
  if (typeof url !== "string") return null;
  return assets[url]?.file || null;
}

/** sha256 for every file under dir, keyed by path relative to dir (fetch-baseui pattern). */
async function checksumTree(rootDir, rel = "") {
  const out = {};
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, await checksumTree(rootDir, child));
    else out[child] = sha256(await readFile(join(rootDir, child)));
  }
  return out;
}

main().catch((e) => {
  console.error("fetch-refero-styles failed:", e.message);
  process.exit(1);
});
