#!/usr/bin/env node
/**
 * Get the TSX source of HeroUI v3 components from the baked layer, offline.
 *
 * Usage:
 *   node get_source.mjs Button
 *   node get_source.mjs Button Accordion Card
 *
 * Output:
 *   Single component: the component's primary .tsx file.
 *   Multiple components: JSON with a results array.
 *
 * Component TSX lives only in the upstream GitHub repo, so the npm package
 * cannot satisfy this script: it reads the baked designer-mcp layer
 * (<cache>/heroui/source/react, pinned to the tag recorded in
 * provenance.json). The npm docs it does ship remain available through
 * get_component_docs.mjs. Never touches the network.
 */
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {homedir} from "node:os";
import {join} from "node:path";

import {toKebabCase} from "./_docs_source.mjs";

const OFFLINE_NOTE = [
  "# Offline: no baked HeroUI source available.",
  "#   Component TSX comes from the designer-mcp layer only (the npm package",
  "#   ships compiled output, not source). Bake it in a designer-mcp checkout:",
  "#     npm run heroui && npm run bake",
  "#   or set DESIGN_CACHE_DIR to a cache containing heroui/source/react.",
  "#   Component docs and types stay available: get_component_docs.mjs,",
  "#   or the design_heroui_get_source MCP tool when registered.",
].join("\n");

const sourceRoot = () => {
  const cacheRoot =
    process.env.DESIGN_CACHE_DIR ||
    process.env.REFERO_CACHE_DIR ||
    (existsSync("/cache") ? "/cache" : join(homedir(), ".design-cache"));

  return join(cacheRoot, "heroui", "source", "react", "components");
};

function readComponent(root, name) {
  const slug = toKebabCase(name);
  const dir = join(root, slug);

  if (!existsSync(dir)) return {component: name, error: `no source at source/react/components/${slug}; run list_components.mjs for exact names`};

  const entries = readdirSync(dir, {withFileTypes: true}).filter((e) => e.isFile() && /\.(tsx?|css)$/.test(e.name));
  const primary = entries.find((e) => e.name === `${slug}.tsx`) ?? entries[0];

  if (!primary) return {component: slug, error: `no .tsx/.ts file inside source/react/components/${slug}`};

  const siblings = entries.filter((e) => e.name !== primary.name).map((e) => `${slug}/${e.name}`);

  return {
    component: slug,
    path: `${slug}/${primary.name}`,
    files: [{path: `${slug}/${primary.name}`, content: readFileSync(join(dir, primary.name), "utf-8")}],
    siblings,
  };
}

function main() {
  const args = process.argv.slice(2).map((name) => name.trim()).filter(Boolean);

  if (args.length === 0) {
    console.error("Usage: node get_source.mjs <Component1> [Component2] ...");
    console.error("Example: node get_source.mjs Button Accordion");
    process.exit(1);
  }

  const root = sourceRoot();

  if (!existsSync(root)) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  const results = args.map((name) => readComponent(root, name));
  const failed = results.some((r) => r.error);

  if (results.length === 1 && !failed) {
    const result = results[0];
    console.log(`// File: source/react/components/${result.path}`);
    console.log();
    console.log(result.files[0].content);

    if (result.siblings?.length) {
      console.error(`# Sibling files also baked: ${result.siblings.join(", ")}`);
    }
    return;
  }

  console.log(JSON.stringify({results}, null, 2));

  if (failed) process.exit(1);
}

main();
