#!/usr/bin/env node
/**
 * Get component migration guides for HeroUI v2 to v3.
 *
 * Usage:
 *   node get_component_migration_guides.mjs button
 *   node get_component_migration_guides.mjs button card modal
 *
 * Output:
 *   One guide's raw MDX per component (or JSON with a results array when
 *   several are requested). Read from the baked designer-mcp layer; use
 *   list_migration_guides.mjs for the available slugs.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {findMigrationDir, OFFLINE_NOTE} from "./_migration_dir.mjs";

function main() {
  const args = process.argv.slice(2).map((name) => name.trim().toLowerCase()).filter(Boolean);

  if (args.length === 0) {
    console.error("Usage: node get_component_migration_guides.mjs <component1> [component2] ...");
    console.error("Example: node get_component_migration_guides.mjs button card");
    process.exit(1);
  }

  const dir = findMigrationDir();

  if (!dir) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error("# Reading component migration guides from the baked layer...");

  const results = [];
  let failed = false;

  for (const component of args) {
    const file = `${component}.mdx`;
    const path = join(dir, file);

    try {
      results.push({component, file, content: readFileSync(path, "utf-8")});
    } catch {
      failed = true;
      results.push({component, error: `no guide at ${file}; run list_migration_guides.mjs for available slugs`});
    }
  }

  if (results.length === 1 && !failed) {
    console.log(results[0].content);
    return;
  }

  console.log(JSON.stringify({results}, null, 2));

  if (failed) process.exit(1);
}

main();
