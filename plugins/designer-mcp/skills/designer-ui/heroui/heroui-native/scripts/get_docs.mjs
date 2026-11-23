#!/usr/bin/env node
/**
 * Get a HeroUI Native guide (non-component docs), offline.
 *
 * Usage:
 *   node get_docs.mjs theming
 *   node get_docs.mjs guides/quick-start.md
 *
 * Output:
 *   Raw markdown of the guide.
 *
 * Reads guides/<name>.md from the installed heroui-native package. Never
 * touches the network.
 */
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE} from "./_native_docs.mjs";

function main() {
  const arg = (process.argv[2] || "").trim().replace(/^\/+/, "");

  if (!arg || arg.includes("..")) {
    console.error("Usage: node get_docs.mjs <guide-slug | guides/<name>.md>");
    console.error("Example: node get_docs.mjs theming");
    process.exit(1);
  }

  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  const rel = arg.endsWith(".md") || arg.includes("/") ? arg : `guides/${arg}.md`;
  const file = join(local.docsDir, rel);

  if (!existsSync(file)) {
    console.error(`# No guide at ${rel}. Run node scripts/list_components.mjs for the guide index.`);
    process.exit(1);
  }

  console.log(readFileSync(file, "utf-8"));
}

main();
