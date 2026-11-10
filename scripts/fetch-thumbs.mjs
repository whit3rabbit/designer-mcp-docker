#!/usr/bin/env node
/**
 * design-thumbs — cache every design system's screenshot locally.
 *
 * The gallery used to 302 each thumbnail to the upstream CDN, so the browser
 * needed the internet for every image. This fetches the bytes once and stores
 * them under the cache dir, making the gallery fully offline.
 *
 * Storage
 *   <cache>/thumbs/<id>.jpg
 *
 * One image per design: the catalog's `screenshotUrl` and `thumbnailUrl` are
 * the same URL for every Refero entry, so we fetch it once.
 *
 * Usage
 *   node scripts/fetch-thumbs.mjs                 # every design missing a thumb
 *   node scripts/fetch-thumbs.mjs --source refero
 *   node scripts/fetch-thumbs.mjs --id <id>       # one design
 *   node scripts/fetch-thumbs.mjs --force         # re-fetch even if cached
 *   node scripts/fetch-thumbs.mjs --conc 8        # parallel downloads (default 8)
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   THUMB_FETCH_UA     User-Agent header
 */

import { mkdir, writeFile, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  CACHE_DIR,
  THUMBS_DIR,
  SOURCE,
  readCatalog,
  cachedThumbIds,
} from "./lib/cache.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const UA =
  process.env.THUMB_FETCH_UA ||
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const CONC = Math.max(1, Number(argVal("--conc") || 8));
const FORCE = has("--force");

/** Map a content-type to a file extension. */
function extFor(contentType) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("png")) return ".png";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  return ".jpg";
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    signal: AbortSignal.timeout(60_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error("empty response body");
  const ext = extFor(res.headers.get("content-type"));
  const final = dest.replace(/\.(jpg|jpeg|png|webp)$/i, ext);
  const tmp = `${final}.tmp.${process.pid}`;
  await writeFile(tmp, buf);
  await rename(tmp, final);
  return { bytes: buf.length, ext };
}

async function main() {
  const onlyId = argVal("--id");
  const onlySource = argVal("--source");
  const { designs } = await readCatalog();
  if (!designs.length) {
    console.error(
      `no catalog at ${join(CACHE_DIR, "catalog.json")} — fetch the catalog first`,
    );
    process.exit(1);
  }

  await mkdir(THUMBS_DIR, { recursive: true });
  const have = await cachedThumbIds();

  let targets = designs;
  if (onlySource) targets = targets.filter((d) => (d.source || SOURCE.REFERO) === onlySource);
  if (onlyId) targets = targets.filter((d) => d.id === onlyId);

  const limit = argVal("--limit") === null ? 0 : Number(argVal("--limit"));

  const pending = targets.filter((d) => {
    if (FORCE) return true;
    if (have.has(d.id)) return false;
    return Boolean(d.screenshotUrl || d.thumbnailUrl);
  });

  const skippedNoUrl = targets.length - pending.length - targets.filter((d) => have.has(d.id)).length;
  console.log(`cache dir : ${CACHE_DIR}`);
  console.log(`thumbs    : ${THUMBS_DIR}`);
  console.log(`designs   : ${designs.length} total, ${targets.length} selected`);
  console.log(
    `pending   : ${pending.length} to fetch` +
      (skippedNoUrl > 0 ? `, ${skippedNoUrl} without a screenshot URL` : ""),
  );
  if (!pending.length) {
    console.log("\nnothing to fetch.");
    return;
  }

  // --limit caps how many are fetched this run; the rest stay pending for
  // the next run. Useful for a quick spot-check without pulling everything.
  const batch = limit > 0 ? pending.slice(0, limit) : pending;
  if (batch.length < pending.length) {
    console.log(`batch     : ${batch.length} of ${pending.length} (--limit ${limit})`);
  }

  let ok = 0;
  let failed = 0;
  let bytes = 0;
  const queue = batch.slice();

  const worker = async () => {
    while (queue.length) {
      const d = queue.shift();
      const url = d.screenshotUrl || d.thumbnailUrl;
      const dest = join(THUMBS_DIR, `${d.id}.jpg`);
      try {
        const r = await download(url, dest);
        ok += 1;
        bytes += r.bytes;
        process.stdout.write(
          `  ok ${String(ok).padStart(4)}/${batch.length}  ${(r.bytes / 1024).toFixed(0)}KB  ${d.siteName || d.id}\n`,
        );
      } catch (e) {
        failed += 1;
        console.log(`  ERR ${d.id} (${d.siteName || ""}): ${e.message}`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONC, batch.length) }, worker));

  console.log(
    `\ndone: ${ok} fetched, ${failed} failed, ${(bytes / 1048576).toFixed(1)} MB written`,
  );
  if (failed) {
    console.log("tip: re-run to retry only the failures — cached files are skipped.");
    process.exitCode = 1;
  }
  if (ok < pending.length) {
    console.log(
      `tip: ${pending.length - ok} still pending — re-run without --limit to finish.`,
    );
  }
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
