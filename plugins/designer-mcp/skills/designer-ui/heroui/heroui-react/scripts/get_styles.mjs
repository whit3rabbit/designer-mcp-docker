#!/usr/bin/env node
/**
 * Get the @heroui/styles CSS for HeroUI v3 components, offline.
 *
 * Usage:
 *   node get_styles.mjs Button
 *   node get_styles.mjs Button Card Chip
 *
 * Output:
 *   Single component: the component's CSS (BEM blocks, variants, states).
 *   Multiple components: JSON with a results array.
 *
 * Resolution order (no network):
 *   1. The installed `@heroui/styles` package (dist/components/<slug>.css),
 *      matching the version the project runs.
 *   2. The baked designer-mcp layer (<cache>/heroui/styles/components).
 */
import {createRequire} from "node:module";
import {existsSync, readFileSync} from "node:fs";
import {homedir} from "node:os";
import {dirname, join} from "node:path";

import {toKebabCase} from "./_docs_source.mjs";

const OFFLINE_NOTE = [
  "# Offline: no HeroUI styles available.",
  "#   1. npm i @heroui/styles (the per-component CSS ships in the package)",
  "#   2. or bake the designer-mcp layer: npm run heroui && npm run bake",
  "#   3. or set DESIGN_CACHE_DIR to a cache containing heroui/styles",
].join("\n");

const fromInstalledPackage = (slug, cwd) => {
  try {
    const require = createRequire(join(cwd, "noop.js"));
    const pkgDir = dirname(require.resolve("@heroui/styles/package.json"));

    for (const candidate of [join(pkgDir, "dist", "components", `${slug}.css`), join(pkgDir, "components", `${slug}.css`)]) {
      if (existsSync(candidate)) return {file: candidate, origin: "the installed @heroui/styles"};
    }
  } catch {
    // Not installed in this project; fall through to the baked layer.
  }

  return null;
};

const fromBakedLayer = (slug) => {
  const cacheRoot =
    process.env.DESIGN_CACHE_DIR ||
    process.env.REFERO_CACHE_DIR ||
    (existsSync("/cache") ? "/cache" : join(homedir(), ".design-cache"));
  const file = join(cacheRoot, "heroui", "styles", "components", `${slug}.css`);

  return existsSync(file) ? {file, origin: "the baked designer-mcp layer"} : null;
};

function main() {
  const args = process.argv.slice(2).map((name) => name.trim()).filter(Boolean);

  if (args.length === 0) {
    console.error("Usage: node get_styles.mjs <Component1> [Component2] ...");
    console.error("Example: node get_styles.mjs Button Card");
    process.exit(1);
  }

  const results = [];
  let failed = false;

  for (const name of args) {
    const slug = toKebabCase(name);
    const resolved = fromInstalledPackage(slug, process.cwd()) ?? fromBakedLayer(slug);

    if (!resolved) {
      failed = true;
      results.push({component: slug, error: `no CSS found for ${slug}`});
      continue;
    }

    console.error(`# Using styles from ${resolved.origin}`);

    results.push({component: slug, file: resolved.file, content: readFileSync(resolved.file, "utf-8")});
  }

  if (results.length === 1 && !failed) {
    const result = results[0];
    console.log(`/* File: @heroui/styles components/${result.component}.css */`);
    console.log();
    console.log(result.content);
    return;
  }

  console.log(JSON.stringify({results}, null, 2));

  if (failed) process.exit(1);
}

main();
