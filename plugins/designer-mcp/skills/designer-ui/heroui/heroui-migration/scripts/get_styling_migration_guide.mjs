#!/usr/bin/env node
/**
 * Get the HeroUI v2 to v3 styling migration guide.
 *
 * Usage:
 *   node get_styling_migration_guide.mjs
 *
 * Output:
 *   MDX styling migration guide content, read from the baked designer-mcp layer.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {findMigrationDir, OFFLINE_NOTE} from "./_migration_dir.mjs";

function main() {
  const dir = findMigrationDir();

  if (!dir) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error("# Reading the styling migration guide from the baked layer...");

  console.log(readFileSync(join(dir, "styling.mdx"), "utf-8"));
}

main();
