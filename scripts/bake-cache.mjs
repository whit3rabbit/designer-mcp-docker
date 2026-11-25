#!/usr/bin/env node
/**
 * bake-cache.mjs — assemble the offline catalog that ships inside the image.
 *
 * Incremental by default: syncs directories in parallel, skips unchanged files
 * (matching size & mtimeMs), prunes removed files, and uses copy-on-write
 * (COPYFILE_FICLONE) when supported by the filesystem (APFS, btrfs, XFS).
 * Pass `--clean` to wipe `--out` before copying.
 *
 * Usage
 *   node scripts/bake-cache.mjs
 *   node scripts/bake-cache.mjs --out bake --no-thumbs
 *   node scripts/bake-cache.mjs --clean
 *
 * Env
 *   DESIGN_CACHE_DIR   source cache (default ~/.design-cache)
 */

import { constants } from "node:fs";
import { mkdir, writeFile, readFile, readdir, rm, copyFile, stat, utimes } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { installDesignSystems } from "./lib/ds-manifest.mjs";
import { readSlopstrapRecord, slopstrapIndexEntry } from "./lib/slopstrap.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const SRC = argVal("--cache") || process.env.DESIGN_CACHE_DIR || join(homedir(), ".design-cache");
const OUT = argVal("--out") || join(ROOT, "bake");
const WITH_THUMBS = !has("--no-thumbs");
const WITH_STYLES = !has("--no-styles");
const CLEAN = has("--clean");

/** Bytes of a value, serialised the same way it will be written. */
const sizeOf = (v) => Buffer.byteLength(JSON.stringify(v));

function slimEntry(entry) {
  const source = entry.source || "refero";
  if (source === "opendesign") return entry;
  const { fullResult, ...rest } = entry;
  return rest;
}

let ficloneSupported = true;
async function fastCopyFile(from, to, srcStat) {
  if (ficloneSupported) {
    try {
      await copyFile(from, to, constants.COPYFILE_FICLONE);
    } catch {
      ficloneSupported = false;
      await copyFile(from, to);
    }
  } else {
    await copyFile(from, to);
  }
  if (srcStat) {
    try {
      await utimes(to, srcStat.atime, srcStat.mtime);
    } catch {}
  }
}

/**
 * Incrementally sync a directory tree from `from` to `to`, skipping files
 * whose size and mtimeMs already match, pruning stale entries, and returning
 * `{ bytes, copied, skipped }` without a second traversal.
 */
async function syncTree(from, to, stats = { bytes: 0, copied: 0, skipped: 0 }) {
  await mkdir(to, { recursive: true });
  const [srcEntries, dstEntries] = await Promise.all([
    readdir(from, { withFileTypes: true }),
    readdir(to, { withFileTypes: true }).catch(() => []),
  ]);
  const srcNames = new Set(srcEntries.map((e) => e.name));
  // Prune files/dirs removed from source
  for (const d of dstEntries) {
    if (!srcNames.has(d.name)) {
      await rm(join(to, d.name), { recursive: true, force: true });
    }
  }
  const dstByName = new Map(dstEntries.map((e) => [e.name, e]));

  const files = [];
  const dirs = [];
  for (const e of srcEntries) {
    if (e.isDirectory()) dirs.push(e.name);
    else if (e.isFile()) files.push(e.name);
  }

  // Sync files in bounded parallel batches
  const CONC = 32;
  for (let i = 0; i < files.length; i += CONC) {
    await Promise.all(
      files.slice(i, i + CONC).map(async (name) => {
        const sPath = join(from, name);
        const dPath = join(to, name);
        const sInfo = await stat(sPath);
        stats.bytes += sInfo.size;
        const prevEntry = dstByName.get(name);
        if (prevEntry && prevEntry.isFile()) {
          const dInfo = await stat(dPath).catch(() => null);
          if (dInfo && dInfo.size === sInfo.size && Math.abs(dInfo.mtimeMs - sInfo.mtimeMs) < 2) {
            stats.skipped++;
            return;
          }
        } else if (prevEntry && prevEntry.isDirectory()) {
          await rm(dPath, { recursive: true, force: true });
        }
        await fastCopyFile(sPath, dPath, sInfo);
        stats.copied++;
      }),
    );
  }

  for (const name of dirs) {
    const prevEntry = dstByName.get(name);
    if (prevEntry && !prevEntry.isDirectory()) {
      await rm(join(to, name), { recursive: true, force: true });
    }
    await syncTree(join(from, name), join(to, name), stats);
  }
  return stats;
}

/** Sync a directory, reporting what it cost. */
async function copyDir(name) {
  const from = join(SRC, name);
  const to = join(OUT, name);
  if (!existsSync(from)) {
    return { name, bytes: 0, msg: `  ${name.padEnd(14)} missing — skipped` };
  }
  const st = await syncTree(from, to);
  const detail = st.skipped ? ` (${st.copied} copied, ${st.skipped} cached)` : "";
  return { name, bytes: st.bytes, msg: `  ${name.padEnd(14)} ${fmt(st.bytes)}${detail}` };
}

/** Sync a single file, reporting what it cost. */
async function syncFile(name, { required = false } = {}) {
  const from = join(SRC, name);
  const to = join(OUT, name);
  if (!existsSync(from)) {
    if (required) throw new Error(`missing required source file: ${from}`);
    return { name, bytes: 0, msg: `  ${name.padEnd(14)} missing — skipped` };
  }
  await mkdir(dirname(to), { recursive: true });
  const sInfo = await stat(from);
  const dInfo = await stat(to).catch(() => null);
  let cached = false;
  if (dInfo && dInfo.size === sInfo.size && Math.abs(dInfo.mtimeMs - sInfo.mtimeMs) < 2) {
    cached = true;
  } else {
    await fastCopyFile(from, to, sInfo);
  }
  return { name, bytes: sInfo.size, msg: `  ${name.padEnd(14)} ${fmt(sInfo.size)}${cached ? " (cached)" : ""}` };
}

const fmt = (b) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(2)}GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${(b / 1e3).toFixed(0)}KB`;

async function main() {
  const t0 = Date.now();
  console.log(`source cache : ${SRC}`);
  console.log(`output       : ${OUT}`);
  console.log(`thumbs       : ${WITH_THUMBS ? "yes" : "no"}`);
  console.log(`mode         : ${CLEAN ? "clean" : "incremental"}`);
  console.log("");

  const catalogPath = join(SRC, "catalog.json");
  if (!existsSync(catalogPath)) {
    throw new Error(
      `no catalog at ${catalogPath}\n` +
        `populate the cache first: node scripts/refero-public-fetch.js --limit 0`,
    );
  }

  if (CLEAN) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // ------------------------------------------------------------- catalog
  const raw = JSON.parse(await readFile(catalogPath, "utf8"));
  const list = raw.designs || raw.styles || [];
  if (!list.length) throw new Error("catalog has no designs");

  const before = sizeOf(raw);
  const slim = list.map(slimEntry);
  const payload = {
    updatedAt: Date.now(),
    styles: slim,
  };
  const catalogJson = JSON.stringify(payload);
  const after = Buffer.byteLength(catalogJson);
  await writeFile(join(OUT, "catalog.json"), catalogJson);
  console.log(`  catalog.json     ${fmt(before)} -> ${fmt(after)}  (${list.length} designs)`);

  // -------------------------------------------------------------- counts
  const counts = {};
  for (const d of list) {
    const s = d.source || "refero";
    counts[s] = (counts[s] || 0) + 1;
  }
  const indexJson = JSON.stringify(
    { updatedAt: Date.now(), total: list.length, counts, sources: Object.keys(counts) },
    null,
    2,
  );
  await writeFile(join(OUT, "index.json"), indexJson);

  let totalBytes = after + Buffer.byteLength(indexJson);

  // ------------------------------------------------------- parallel layer sync
  const tasks = [];
  if (WITH_STYLES) {
    tasks.push(() => copyDir("styles"), () => copyDir("systems"));
  } else {
    console.log("  styles          skipped (--no-styles)");
    console.log("  systems         skipped (--no-styles)");
  }
  if (WITH_THUMBS) {
    tasks.push(() => copyDir("thumbs"));
  } else {
    console.log("  thumbs          skipped (--no-thumbs)");
  }
  tasks.push(
    () => syncFile("descriptors.json"),
    () => copyDir("claude"),
    () => copyDir("gallery"),
    () => syncFile("components.json"),
    () => copyDir("components"),
    () => copyDir("reui"),
    () => copyDir("dashboards"),
    () => copyDir("heroui"),
    () => copyDir("mantine"),
    () => copyDir("daisyui"),
    () => copyDir("baseui"),
    () => copyDir("uikits"),
    () => copyDir("refero-styles"),
    () => syncFile("presets.json"),
    () => copyDir("presets"),
  );

  // Run layer syncs concurrently (4 at a time so disk I/O stays saturated without fd exhaustion)
  const results = new Array(tasks.length);
  let idx = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (idx < tasks.length) {
        const i = idx++;
        results[i] = await tasks[i]();
      }
    }),
  );
  for (const r of results) {
    console.log(r.msg);
    totalBytes += r.bytes;
  }

  // ---------------------------------------------------- vendored slopstrap
  const slopRoot = join(ROOT, "data", "slopstrap");
  if (existsSync(join(slopRoot, "component.json"))) {
    const slopStats = await syncTree(slopRoot, join(OUT, "slopstrap"));
    totalBytes += slopStats.bytes;
    const record = await readSlopstrapRecord(slopRoot);
    const componentsPath = join(OUT, "components.json");
    if (existsSync(componentsPath)) {
      const index = JSON.parse(await readFile(componentsPath, "utf8"));
      const prior = (index.components || []).find((c) => c.slug === record.slug);
      index.components = (index.components || []).filter((c) => c.slug !== record.slug);
      index.components.push(slopstrapIndexEntry(record));
      index.total = index.components.length;
      index.variants = (index.variants || 0) - (prior ? prior.variants.length : 0) + record.variants.length;
      await writeFile(componentsPath, JSON.stringify(index));
      await writeFile(join(OUT, "components", `${record.slug}.json`), JSON.stringify(record));
      console.log(`  slopstrap       1 component  ${fmt(slopStats.bytes)}`);
    } else {
      console.log("  slopstrap       files copied, no components.json to merge");
    }
  } else {
    console.log("  slopstrap       skipped (no data/slopstrap/component.json)");
  }

  // ------------------------------------------------- vendored library catalog
  const libsIndex = join(ROOT, "data", "libraries", "index.json");
  if (existsSync(libsIndex)) {
    const index = JSON.parse(await readFile(libsIndex, "utf8"));
    const indexStr = JSON.stringify(index);
    await writeFile(join(OUT, "libraries.json"), indexStr);
    await mkdir(join(OUT, "libraries"), { recursive: true });
    let libBytes = Buffer.byteLength(indexStr);
    await Promise.all(
      (index.libraries || []).map(async (lib) => {
        const src = join(ROOT, "data", "libraries", "entries", `${lib.id}.json`);
        const content = await readFile(src, "utf8");
        libBytes += Buffer.byteLength(content);
        await writeFile(join(OUT, "libraries", `${lib.id}.json`), content);
      }),
    );
    totalBytes += libBytes;
    console.log(`  libraries       ${index.total} entries  ${fmt(libBytes)}`);
  } else {
    console.log("  libraries       skipped (no data/libraries/index.json)");
  }

  // ------------------------------------- vendored design-system templates
  const ds = await installDesignSystems(OUT);
  totalBytes += ds.bytes;
  console.log(`  design-systems  ${ds.total} systems  ${fmt(ds.bytes)}`);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log("");
  console.log(`  baked: ${fmt(totalBytes)} in ${OUT} (${elapsed}s)`);
}

main().catch((e) => {
  console.error("bake-cache failed:", e.message);
  process.exit(1);
});
