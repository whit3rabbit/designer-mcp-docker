#!/usr/bin/env node
/**
 * List all available HeroUI v3 components and guides, offline.
 *
 * Usage:
 *   node list_components.mjs
 *
 * Output:
 *   JSON with components[], guides[], count, and the docs version.
 *
 * Reads llms.txt from the installed @heroui/react, or from the baked
 * designer-mcp layer when the project has no install. Never touches the
 * network (see _docs_source.mjs).
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE, parseLlmsTxt} from "./_docs_source.mjs";

function main() {
  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  const text = readFileSync(join(local.docsDir, "llms.txt"), "utf-8");
  const {components, guides} = parseLlmsTxt(text);

  console.log(
    JSON.stringify(
      {
        source: local.source,
        version: local.version,
        count: components.length,
        components,
        guideCount: guides.length,
        guides,
      },
      null,
      2,
    ),
  );

  console.error(`\n# Found ${components.length} components and ${guides.length} guides (${local.version})`);
}

main();
