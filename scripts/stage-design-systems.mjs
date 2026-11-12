#!/usr/bin/env node
/**
 * stage-design-systems.mjs — install the vendored design-system templates
 * into the LIVE cache, the way the fetchers populate their layers.
 *
 * `npm run bake` copies this layer into `bake/` for the image; local dev
 * (and `npm test`) needs it in the cache the servers actually read. This
 * script is additive and idempotent: it touches only
 *   <cache>/design-systems.json
 *   <cache>/design-systems/
 *
 * Usage
 *   node scripts/stage-design-systems.mjs [--cache <dir>]
 *
 * Env
 *   DESIGN_CACHE_DIR   target cache (default ~/.design-cache)
 */

import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { argv } from "node:process";
import { installDesignSystems, DESIGN_SYSTEMS_SRC } from "./lib/ds-manifest.mjs";

const cacheArg = argv.indexOf("--cache");
const CACHE_DIR =
  cacheArg >= 0 && argv[cacheArg + 1]
    ? resolve(argv[cacheArg + 1])
    : process.env.DESIGN_CACHE_DIR ||
      process.env.REFERO_CACHE_DIR ||
      join(homedir(), ".design-cache");

const { total, bytes } = await installDesignSystems(CACHE_DIR, DESIGN_SYSTEMS_SRC);
console.log(
  `staged ${total} design-system templates into ${CACHE_DIR} ` +
    `(${(bytes / 1048576).toFixed(1)} MB)`,
);
