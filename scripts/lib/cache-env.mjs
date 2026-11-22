/**
 * cache-env.mjs — export the resolved cache dir as env before cache.mjs loads.
 *
 * scripts/lib/cache.mjs reads DESIGN_CACHE_DIR / REFERO_CACHE_DIR at import
 * time, and ESM hoists imports, so an env assignment in the importing
 * module's body runs too late. build-static.mjs imports this module FIRST:
 * it mirrors build-static's own --cache / env / bake resolution so both
 * agree on the cache directory, whatever the invocation.
 */

import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const argvIdx = process.argv.indexOf("--cache");
const fromArg =
  argvIdx >= 0 && process.argv[argvIdx + 1] ? resolve(process.argv[argvIdx + 1]) : null;

if (fromArg) {
  process.env.DESIGN_CACHE_DIR = fromArg;
  process.env.REFERO_CACHE_DIR = fromArg;
} else if (!process.env.DESIGN_CACHE_DIR && !process.env.REFERO_CACHE_DIR) {
  process.env.DESIGN_CACHE_DIR = join(ROOT, "bake");
}
