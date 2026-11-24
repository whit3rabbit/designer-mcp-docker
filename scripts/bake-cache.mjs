#!/usr/bin/env node
/**
 * bake-cache.mjs — assemble the offline catalog that ships inside the image.
 *
 * The image used to ship with no data: every deployment had to populate a
 * mounted cache first. That made `docker run <image>` show an empty gallery
 * and the MCP servers exit with "no catalog". This script builds the
 * catalog ONCE, on a machine with network access, and the result is copied
 * into the image by the Dockerfile.
 *
 * Two things make the baked catalog much smaller than the live cache:
 *
 *  1. The live `catalog.json` carries BOTH a `styles` and a `designs` key
 *     pointing at the same array — 42MB written twice. The upstream package
 *     reads `styles`; ours reads `designs || styles`. Only one is needed.
 *
 *  2. Every Refero entry inlines its `fullResult` (41MB total), and the very
 *     same payload is already on disk in `styles/<id>.json`. Only OpenDesign
 *     needs it inline, because `systems/<slug>.json` does not carry it.
 *
 * Net effect: 84MB of catalog.json becomes ~8MB, with no loss of function.
 *
 * Layout produced (into the --out directory):
 *
 *   catalog.json     merged, slimmed
 *   index.json       counts per source
 *   styles/          Refero detail files
 *   systems/         OpenDesign package payloads
 *   thumbs/          compressed WebP thumbnails
 *   components.json  the GradientDeck component index
 *   components/      one file per component, with every variant's source
 *   presets.json     the preset catalog index
 *   presets/         one file per preset catalog
 *   slopstrap/       the vendored Slopstrap framework (zip, css, js, examples)
 *   design-systems.json      the vendored design-system template index
 *   design-systems/          the six systems verbatim + one record per system
 *
 * Usage
 *   node scripts/bake-cache.mjs
 *   node scripts/bake-cache.mjs --out bake --no-thumbs
 *
 * Env
 *   DESIGN_CACHE_DIR   source cache (default ~/.design-cache)
 */

import { mkdir, writeFile, readFile, readdir, rm, cp, stat } from "node:fs/promises";
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

/** Bytes of a value, serialised the same way it will be written. */
const sizeOf = (v) => Buffer.byteLength(JSON.stringify(v));

/**
 * Slim a catalog entry.
 *
 * Refero entries drop `fullResult`: the identical payload lives in
 * `styles/<id>.json`, which is what the detail path reads. OpenDesign keeps
 * it, because `systems/<slug>.json` does not carry it and the renderer
 * reads `fullResult` from the merged record.
 */
function slimEntry(entry) {
  const source = entry.source || "refero";
  if (source === "opendesign") return entry;
  const { fullResult, ...rest } = entry;
  return rest;
}

/** Copy a directory, reporting what it cost. */
async function copyDir(name) {
  const from = join(SRC, name);
  const to = join(OUT, name);
  if (!existsSync(from)) {
    console.log(`  ${name.padEnd(14)} missing — skipped`);
    return 0;
  }
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  const bytes = await dirBytes(to);
  console.log(`  ${name.padEnd(14)} ${fmt(bytes)}`);
  return bytes;
}

/** Copy a single file, reporting what it cost. */
async function copyFile(name, { required = false } = {}) {
  const from = join(SRC, name);
  const to = join(OUT, name);
  if (!existsSync(from)) {
    if (required) {
      throw new Error(`missing required source file: ${from}`);
    }
    console.log(`  ${name.padEnd(14)} missing — skipped`);
    return 0;
  }
  await mkdir(dirname(to), { recursive: true });
  await cp(from, to);
  const bytes = (await stat(to)).size;
  console.log(`  ${name.padEnd(14)} ${fmt(bytes)}`);
  return bytes;
}

/** Total bytes of every file under a directory. */
async function dirBytes(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) total += await dirBytes(p);
    else total += (await stat(p)).size;
  }
  return total;
}

const fmt = (b) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(2)}GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)}MB` : `${(b / 1e3).toFixed(0)}KB`;

async function main() {
  console.log(`source cache : ${SRC}`);
  console.log(`output       : ${OUT}`);
  console.log(`thumbs       : ${WITH_THUMBS ? "yes" : "no"}`);
  console.log("");

  const catalogPath = join(SRC, "catalog.json");
  if (!existsSync(catalogPath)) {
    throw new Error(
      `no catalog at ${catalogPath}\n` +
        `populate the cache first: node scripts/refero-public-fetch.js --limit 0`,
    );
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // ------------------------------------------------------------- catalog
  const raw = JSON.parse(await readFile(catalogPath, "utf8"));
  const list = raw.designs || raw.styles || [];
  if (!list.length) throw new Error("catalog has no designs");

  const before = sizeOf(raw);
  const slim = list.map(slimEntry);
  // Only the `styles` key is written. The upstream package reads
  // `raw.styles`; ours reads `raw.designs || raw.styles`. Writing both
  // would serialise the same array twice (another 8MB for nothing).
  const payload = {
    updatedAt: Date.now(),
    styles: slim,
  };
  const after = sizeOf(payload);

  await writeFile(join(OUT, "catalog.json"), JSON.stringify(payload));
  console.log(`  catalog.json     ${fmt(before)} -> ${fmt(after)}  (${list.length} designs)`);

  // -------------------------------------------------------------- counts
  const counts = {};
  for (const d of list) {
    const s = d.source || "refero";
    counts[s] = (counts[s] || 0) + 1;
  }
  await writeFile(
    join(OUT, "index.json"),
    JSON.stringify(
      { updatedAt: Date.now(), total: list.length, counts, sources: Object.keys(counts) },
      null,
      2,
    ),
  );

  // ------------------------------------------------------- detail + media
  if (WITH_STYLES) {
    await copyDir("styles");
    await copyDir("systems");
  } else {
    console.log("  styles          skipped (--no-styles)");
    console.log("  systems         skipped (--no-styles)");
  }
  if (WITH_THUMBS) {
    await copyDir("thumbs");
  } else {
    console.log("  thumbs          skipped (--no-thumbs)");
  }

  // ------------------------------------------------- the Agent Kit layers
  // The Claude Design packages, the rendered gallery artifacts and the
  // curated mood/industry descriptors. All three are optional: a cache that
  // predates the Agent Kit simply has none, and the gallery falls back.
  await copyFile("descriptors.json");
  await copyDir("claude");
  await copyDir("gallery");

  // --------------------------------------------- components and presets
  await copyFile("components.json");
  await copyDir("components");
  await copyDir("reui");
  await copyDir("dashboards");
  await copyDir("heroui");
  await copyDir("mantine");
  await copyDir("daisyui");
  await copyDir("baseui");
  await copyDir("uikits");
  await copyDir("refero-styles");
  await copyFile("presets.json");
  await copyDir("presets");

  // ---------------------------------------------------- vendored slopstrap
  // Like the libraries, this comes from the repo (data/slopstrap/), not the
  // fetch cache. The tree lands in slopstrap/ for the frontend build, and
  // the catalog record is appended to the component index so the gallery
  // and the MCP server serve it like any other component.
  const slopRoot = join(ROOT, "data", "slopstrap");
  if (existsSync(join(slopRoot, "component.json"))) {
    await rm(join(OUT, "slopstrap"), { recursive: true, force: true });
    await cp(slopRoot, join(OUT, "slopstrap"), { recursive: true });
    const slopBytes = await dirBytes(join(OUT, "slopstrap"));
    const record = await readSlopstrapRecord(slopRoot);
    const componentsPath = join(OUT, "components.json");
    if (existsSync(componentsPath)) {
      const index = JSON.parse(await readFile(componentsPath, "utf8"));
      // A staged live cache may already carry the record; replace it and
      // keep the variant count exact rather than stacking a duplicate.
      const prior = (index.components || []).find((c) => c.slug === record.slug);
      index.components = (index.components || []).filter((c) => c.slug !== record.slug);
      index.components.push(slopstrapIndexEntry(record));
      index.total = index.components.length;
      index.variants = (index.variants || 0) - (prior ? prior.variants.length : 0) + record.variants.length;
      await writeFile(componentsPath, JSON.stringify(index));
      await writeFile(join(OUT, "components", `${record.slug}.json`), JSON.stringify(record));
      console.log(`  slopstrap       1 component  ${fmt(slopBytes)}`);
    } else {
      console.log("  slopstrap       files copied, no components.json to merge");
    }
  } else {
    console.log("  slopstrap       skipped (no data/slopstrap/component.json)");
  }

  // ------------------------------------------------- vendored library catalog
  // Like the design systems, this comes from the repo (data/libraries/), not
  // the fetch cache. The index lands at the cache root as libraries.json and
  // the entries beside it as libraries/<id>.json, matching how the readers
  // in scripts/lib/cache.mjs resolve them.
  const libsIndex = join(ROOT, "data", "libraries", "index.json");
  if (existsSync(libsIndex)) {
    const index = JSON.parse(await readFile(libsIndex, "utf8"));
    await writeFile(join(OUT, "libraries.json"), JSON.stringify(index));
    await rm(join(OUT, "libraries"), { recursive: true, force: true });
    await mkdir(join(OUT, "libraries"), { recursive: true });
    for (const lib of index.libraries || []) {
      const src = join(ROOT, "data", "libraries", "entries", `${lib.id}.json`);
      await writeFile(join(OUT, "libraries", `${lib.id}.json`), await readFile(src, "utf8"));
    }
    const libBytes = await dirBytes(join(OUT, "libraries"));
    console.log(`  libraries       ${index.total} entries  ${fmt(libBytes)}`);
  } else {
    console.log("  libraries       skipped (no data/libraries/index.json)");
  }

  // ------------------------------------- vendored design-system templates
  // These come from the repo (data/design-systems/), not the fetch cache —
  // they are static source assets, so a missing tree is a real error.
  const ds = await installDesignSystems(OUT);
  console.log(`  design-systems  ${ds.total} systems  ${fmt(ds.bytes)}`);

  const total = await dirBytes(OUT);
  console.log("");
  console.log(`  baked: ${fmt(total)} in ${OUT}`);
}

main().catch((e) => {
  console.error("bake-cache failed:", e.message);
  process.exit(1);
});
