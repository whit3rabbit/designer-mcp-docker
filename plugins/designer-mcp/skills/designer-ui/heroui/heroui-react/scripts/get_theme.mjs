#!/usr/bin/env node
/**
 * Get the HeroUI v3 default theme variables and design tokens, offline.
 *
 * Usage:
 *   node get_theme.mjs
 *
 * Output:
 *   Raw CSS: themes/default/variables.css (oklch tokens per mode), then
 *   themes/shared/theme.css (token -> Tailwind theme variable mapping).
 *
 * Resolution order (no network):
 *   1. The installed `@heroui/styles` package, matching the project's version.
 *   2. The baked designer-mcp layer (<cache>/heroui/theme).
 */
import {createRequire} from "node:module";
import {existsSync, readFileSync} from "node:fs";
import {homedir} from "node:os";
import {dirname, join} from "node:path";

const OFFLINE_NOTE = [
  "# Offline: no HeroUI theme files available.",
  "#   1. npm i @heroui/styles (themes ship in the package: dist/themes/default/variables.css)",
  "#   2. or bake the designer-mcp layer: npm run heroui && npm run bake",
  "#   3. or set DESIGN_CACHE_DIR to a cache containing heroui/theme",
].join("\n");

const THEME_FILES = [
  {rel: ["dist", "themes", "default", "variables.css"], baked: "variables.css"},
  {rel: ["dist", "themes", "shared", "theme.css"], baked: "theme.css"},
  {rel: ["dist", "themes", "default", "index.css"], baked: "default.css"},
];

function resolveFiles(cwd) {
  const files = [];

  try {
    const require = createRequire(join(cwd, "noop.js"));
    const pkgDir = dirname(require.resolve("@heroui/styles/package.json"));

    for (const {rel, baked} of THEME_FILES) {
      const file = join(pkgDir, ...rel);

      if (existsSync(file)) files.push({file, origin: "the installed @heroui/styles", baked});
    }
  } catch {
    // Not installed; fall through to the baked layer.
  }

  if (!files.length) {
    const cacheRoot =
      process.env.DESIGN_CACHE_DIR ||
      process.env.REFERO_CACHE_DIR ||
      (existsSync("/cache") ? "/cache" : join(homedir(), ".design-cache"));
    const themeDir = join(cacheRoot, "heroui", "theme");

    for (const {baked} of THEME_FILES) {
      const file = join(themeDir, baked);

      if (existsSync(file)) files.push({file, origin: "the baked designer-mcp layer", baked});
    }
  }

  return files;
}

function main() {
  const files = resolveFiles(process.cwd());

  if (!files.length) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  const origins = [...new Set(files.map((f) => f.origin))].join(", ");
  console.error(`# Using theme files from ${origins}`);

  for (const {file} of files) {
    console.log(`/* ${file.split("/").slice(-3).join("/")} */`);
    console.log(readFileSync(file, "utf-8"));
    console.log();
  }
}

main();
