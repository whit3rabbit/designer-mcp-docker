#!/usr/bin/env node
/**
 * compress-thumbs.mjs — shrink the cached thumbnail set.
 *
 * The cached Refero screenshots are 1440×900 JPEGs, ~115 KB each, 150.6 MB
 * for the full 1,342-design catalog. That is more than the JSON catalog
 * itself, and the gallery loads them straight off disk.
 *
 * This script re-encodes them to WebP at the size the UI actually renders:
 *
 *   grid card     349 CSS px wide  (x2 for retina = 698)
 *   detail page   716 CSS px wide  (x2 for retina = 1432)
 *
 * At 1000px q86 the files are ~43% of the original bytes and measure a mean
 * SSIM of 0.984 against a Lanczos reference — visually indistinguishable at
 * either display size.
 *
 * Usage:
 *   node scripts/compress-thumbs.mjs                 # convert to .webp, keep originals
 *   node scripts/compress-thumbs.mjs --replace       # convert and delete the originals
 *   node scripts/compress-thumbs.mjs --full          # also emit a 1440px @full tier
 *   node scripts/compress-thumbs.mjs --width 720 --quality 80
 *   node scripts/compress-thumbs.mjs --dry-run
 *
 * Flags:
 *   --width N     max width of the standard tier (default 1000)
 *   --quality N   WebP quality 0-100 (default 86)
 *   --full        additionally write <id>@full.webp at the source width
 *   --replace     delete the original .jpg after a successful conversion
 *   --format FMT  webp (default) or jpeg
 *   --limit N     convert at most N files (for a spot check)
 *   --dry-run     report what would change, write nothing
 *   --conc N      parallel workers (default 8)
 *
 * Idempotent: a thumbnail that already has a .webp is skipped unless
 * --force is given.
 *
 * Requires `sharp` (npm). It ships prebuilt binaries for linux-x64,
 * linux-arm64 and darwin, so the same script runs on the host and in the
 * multi-arch container.
 */

import { existsSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR, THUMBS_DIR } from "./lib/cache.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  // Last occurrence wins, so a compose `entrypoint` default can be
  // overridden by a trailing argument: `run --rm compress --width 720`.
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const WIDTH = Number(argVal("--width") ?? 1000);
const QUALITY = Number(argVal("--quality") ?? 86);
const FORMAT = (argVal("--format") ?? "webp").toLowerCase();
const LIMIT = Number(argVal("--limit") ?? 0);
const CONC = Math.max(1, Number(argVal("--conc") ?? 8));
const REPLACE = has("--replace");
const WANT_FULL = has("--full");
const DRY = has("--dry-run");
const FORCE = has("--force");

if (!Number.isFinite(WIDTH) || WIDTH < 1) {
  console.error("--width must be a positive number");
  process.exit(1);
}
if (!Number.isFinite(QUALITY) || QUALITY < 0 || QUALITY > 100) {
  console.error("--quality must be 0-100");
  process.exit(1);
}
if (!["webp", "jpeg"].includes(FORMAT)) {
  console.error("--format must be webp or jpeg");
  process.exit(1);
}

// ------------------------------------------------------------------ sharp
let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error(
    "sharp is not installed.\n" +
      "  npm install sharp\n" +
      "  (it ships prebuilt binaries for linux-x64, linux-arm64 and darwin)",
  );
  process.exit(1);
}

// ------------------------------------------------------------------ helpers
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

/**
 * Re-encode one source image.
 *
 * The resize is done by sharp with a Lanczos3 kernel rather than by the
 * encoder's own scaler. That matters: a fast box filter costs ~3.8 dB of
 * PSNR on a 1440->1000 downscale, which is visible on text-heavy screenshots.
 */
async function convert(src, dest, width, quality) {
  const pipeline = sharp(src, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const targetWidth = meta.width > width ? width : meta.width;

  let out = pipeline.resize({ width: targetWidth, kernel: "lanczos3" });
  if (FORMAT === "webp") {
    out = out.webp({ quality, effort: 4, smartSubsample: true });
  } else {
    out = out.jpeg({ quality, mozjpeg: true, progressive: true });
  }
  const buf = await out.toBuffer();
  return { buf, width: targetWidth, height: meta.height ? Math.round(meta.height * (targetWidth / meta.width)) : 0 };
}

// ------------------------------------------------------------------ main
async function main() {
  if (!existsSync(THUMBS_DIR)) {
    console.error(`no thumbnails directory at ${THUMBS_DIR}`);
    console.error("run: node scripts/fetch-thumbs.mjs");
    process.exit(1);
  }

  const all = readdirSync(THUMBS_DIR);
  const sources = all.filter((f) => /\.jpe?g$/i.test(f));
  const outExt = FORMAT === "webp" ? ".webp" : ".jpg";

  const todo = [];
  for (const f of sources) {
    const id = f.replace(/\.jpe?g$/i, "");
    const out = join(THUMBS_DIR, `${id}${outExt}`);
    const full = join(THUMBS_DIR, `${id}@full${outExt}`);
    if (!FORCE && existsSync(out) && (!WANT_FULL || existsSync(full))) continue;
    todo.push({
      id,
      src: join(THUMBS_DIR, f),
      out,
      full,
      srcBytes: statSync(join(THUMBS_DIR, f)).size,
    });
  }

  const batch = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;

  let origBytes = 0;
  let outBytes = 0;
  let converted = 0;
  let failed = 0;
  let fullBytes = 0;

  console.log(`cache dir : ${CACHE_DIR}`);
  console.log(`thumbs    : ${THUMBS_DIR}`);
  console.log(
    `format    : ${FORMAT}  width ${WIDTH}  quality ${QUALITY}${WANT_FULL ? "  (+ full tier)" : ""}`,
  );
  console.log(
    `source    : ${sources.length} jpg, ${todo.length} to convert${LIMIT ? ` (batch ${batch.length})` : ""}`,
  );
  if (DRY) console.log("dry run   : nothing will be written");

  const queue = batch.slice();
  const worker = async () => {
    while (queue.length) {
      const t = queue.shift();
      try {
        const { buf } = await convert(t.src, t.out, WIDTH, QUALITY);

        if (!DRY) {
          // Write to a temp name first so a crash never leaves a half-written
          // image that the server would happily serve.
          const tmp = `${t.out}.tmp`;
          writeFileSync(tmp, buf);
          renameSync(tmp, t.out);
        }

        origBytes += t.srcBytes;
        outBytes += buf.length;
        converted++;

        if (WANT_FULL && !DRY) {
          try {
            const { buf: fbuf } = await convert(t.src, t.full, 1440, QUALITY);
            const tmp = `${t.full}.tmp`;
            writeFileSync(tmp, fbuf);
            renameSync(tmp, t.full);
            fullBytes += fbuf.length;
          } catch {
            // A missing full tier is not fatal — the standard tier still works.
          }
        }

        if (REPLACE && !DRY) {
          rmSync(t.src, { force: true });
        }

        process.stdout.write(
          `  ok ${String(converted).padStart(4)}/${batch.length}  ${kb(t.srcBytes)} -> ${kb(buf.length)}  ${t.id.slice(0, 8)}\n`,
        );
      } catch (e) {
        failed++;
        console.log(`  ERR ${t.id}: ${e.message.split("\n")[0]}`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONC, batch.length) }, worker));

  console.log("");
  if (converted) {
    const pct = ((outBytes / origBytes) * 100).toFixed(1);
    console.log(
      `converted : ${converted} files, ${mb(origBytes)} -> ${mb(outBytes)} (${pct}% of original)`,
    );
    if (fullBytes) console.log(`full tier : ${mb(fullBytes)}`);
    if (!REPLACE) {
      console.log(
        `note      : originals kept. Re-run with --replace to delete them, ` +
          `or --full for a retina detail tier.`,
      );
    }
  }
  if (failed) {
    console.log(`failed    : ${failed}`);
    process.exitCode = 1;
  }
  if (LIMIT > 0 && todo.length > batch.length) {
    console.log(`pending   : ${todo.length - batch.length} more — re-run without --limit`);
  }
}

main().catch((e) => {
  console.error("compress-thumbs failed:", e);
  process.exit(1);
});
