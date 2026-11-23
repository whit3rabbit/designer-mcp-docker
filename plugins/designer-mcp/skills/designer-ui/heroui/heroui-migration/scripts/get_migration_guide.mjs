#!/usr/bin/env node
/**
 * Get the main migration workflow guide (full or incremental) for HeroUI v2 to v3.
 *
 * Usage:
 *   node get_migration_guide.mjs [full|incremental]
 *
 * Default: full
 *
 * Output:
 *   MDX migration guide content, read from the baked designer-mcp layer.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {findMigrationDir, OFFLINE_NOTE} from "./_migration_dir.mjs";

function main() {
  const arg = (process.argv[2] || "full").toLowerCase();
  const migrationType = arg === "incremental" ? "incremental" : "full";
  const filename =
    migrationType === "incremental" ? "agent-guide-incremental.mdx" : "agent-guide-full.mdx";

  const dir = findMigrationDir();

  if (!dir) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Reading the ${migrationType} migration guide from the baked layer...`);

  console.log(readFileSync(join(dir, filename), "utf-8"));
}

main();
