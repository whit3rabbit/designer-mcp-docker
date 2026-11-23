#!/usr/bin/env node
/**
 * Get a HeroUI v3 guide (non-component docs), offline.
 *
 * Usage:
 *   node get_docs.mjs theming
 *   node get_docs.mjs theming-for-agents
 *   node get_docs.mjs guides/quick-start.md
 *
 * Output:
 *   Raw markdown of the guide.
 *
 * Reads guides/<name>.md from the installed @heroui/react, or from the baked
 * designer-mcp layer. Never touches the network.
 */
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE, parseLlmsTxt, toKebabCase} from "./_docs_source.mjs";

function main() {
  const arg = (process.argv[2] || "").trim().replace(/^\/+/, "");

  if (!arg || arg.includes("..")) {
    console.error("Usage: node get_docs.mjs <guide-slug | guides/<name>.md>");
    console.error("Example: node get_docs.mjs theming-for-agents");
    process.exit(1);
  }

  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  const rel = arg.endsWith(".md") || arg.includes("/") ? arg : `guides/${toKebabCase(arg)}.md`;
  const file = join(local.docsDir, rel);

  if (!existsSync(file)) {
    const {guides} = parseLlmsTxt(readFileSync(join(local.docsDir, "llms.txt"), "utf-8"));
    console.error(`# No guide at ${rel}. Available guides:`);

    for (const guide of guides) console.error(`#   ${guide.slug} (${guide.group || "guide"})`);

    process.exit(1);
  }

  console.log(readFileSync(file, "utf-8"));
}

main();
