#!/usr/bin/env node
/**
 * stage-slopstrap.mjs — install the vendored Slopstrap record into the LIVE
 * cache, the way the fetchers populate their layers.
 *
 * `npm run bake` merges this layer into `bake/` for the image; local dev
 * (and `npm test`) needs it in the cache the servers actually read. This
 * script is additive and idempotent: it touches only
 *   <cache>/components.json     (record appended or replaced)
 *   <cache>/components/slopstrap.json
 *
 * Usage
 *   node scripts/stage-slopstrap.mjs [--cache <dir>]
 *
 * Env
 *   DESIGN_CACHE_DIR   target cache (default ~/.design-cache)
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { argv } from "node:process";
import { readSlopstrapRecord, slopstrapIndexEntry } from "./lib/slopstrap.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "data", "slopstrap");

const cacheArg = argv.indexOf("--cache");
const CACHE_DIR =
  cacheArg >= 0 && argv[cacheArg + 1]
    ? resolve(argv[cacheArg + 1])
    : process.env.DESIGN_CACHE_DIR ||
      process.env.REFERO_CACHE_DIR ||
      join(homedir(), ".design-cache");

const metaPath = join(SRC, "component.json");
if (!existsSync(metaPath)) {
  console.error(`no vendored slopstrap record at ${metaPath}`);
  process.exit(1);
}

const record = await readSlopstrapRecord(SRC);
const indexPath = join(CACHE_DIR, "components.json");
if (!existsSync(indexPath)) {
  console.error(`no components.json at ${indexPath}; run the components fetch first`);
  process.exit(1);
}

const index = JSON.parse(await readFile(indexPath, "utf8"));
const prior = (index.components || []).find((c) => c.slug === record.slug);
index.components = (index.components || []).filter((c) => c.slug !== record.slug);
index.components.push(slopstrapIndexEntry(record));
index.total = index.components.length;
index.variants = (index.variants || 0) - (prior ? prior.variants.length : 0) + record.variants.length;
await writeFile(indexPath, JSON.stringify(index));
await writeFile(join(CACHE_DIR, "components", `${record.slug}.json`), JSON.stringify(record));

console.log(
  `staged slopstrap into ${CACHE_DIR} ` +
    `(components: ${index.total}, variants: ${index.variants}${prior ? ", replaced" : ""})`,
);
