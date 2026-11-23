#!/usr/bin/env node
/**
 * List all available HeroUI Native components, offline.
 *
 * Usage:
 *   node list_components.mjs
 *
 * Output:
 *   JSON with components[], guides[], count, and the docs version.
 *
 * Reads llms.txt from the installed heroui-native package (docs ship inside
 * it). Never touches the network (see _native_docs.mjs).
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE} from "./_native_docs.mjs";

function main() {
  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  const text = readFileSync(join(local.docsDir, "llms.txt"), "utf-8");
  const entries = [];
  let section = null;
  let group = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === "## Components") {
      section = "components";
      group = null;
      continue;
    }
    if (line === "## Guides") {
      section = "guides";
      group = null;
      continue;
    }
    if (line.startsWith("## ") && line !== "## Components" && line !== "## Guides") {
      section = null;
      continue;
    }
    if (line.startsWith("### ")) {
      group = line.slice(4).trim();
      continue;
    }

    const match = /^- \[(.+?)\]\(([^)]+?)\)(?::\s*(.*))?$/.exec(line);
    if (!match || !section) continue;

    entries.push({
      kind: section,
      name: match[1],
      group: group || "",
      description: (match[3] || "").trim(),
      path: match[2],
    });
  }

  const components = entries.filter((e) => e.kind === "components");
  const guides = entries.filter((e) => e.kind === "guides");

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
