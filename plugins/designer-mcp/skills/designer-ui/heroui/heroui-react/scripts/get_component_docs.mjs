#!/usr/bin/env node
/**
 * Get complete component documentation for HeroUI v3 components, offline.
 *
 * Usage:
 *   node get_component_docs.mjs Button
 *   node get_component_docs.mjs Button Card TextField
 *
 * Output:
 *   Single component: raw markdown documentation (usage, variants, props, examples).
 *   Multiple components: JSON with a results array.
 *
 * Reads docs/components/<kebab>.md from the installed @heroui/react, or from
 * the baked designer-mcp layer. Never touches the network.
 */
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE, toKebabCase} from "./_docs_source.mjs";

function main() {
  const args = process.argv.slice(2).map((name) => name.trim()).filter(Boolean);

  if (args.length === 0) {
    console.error("Usage: node get_component_docs.mjs <Component1> [Component2] ...");
    console.error("Example: node get_component_docs.mjs Button Accordion");
    process.exit(1);
  }

  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  const results = [];
  let failed = false;

  for (const name of args) {
    const slug = toKebabCase(name);
    const file = join(local.docsDir, "components", `${slug}.md`);

    if (!existsSync(file)) {
      failed = true;
      results.push({
        component: name,
        error: `no doc at components/${slug}.md; run list_components.mjs for exact names`,
      });
      continue;
    }

    results.push({component: slug, path: `components/${slug}.md`, content: readFileSync(file, "utf-8")});
  }

  if (results.length === 1 && !failed) {
    console.log(results[0].content);
    return;
  }

  console.log(JSON.stringify({results}, null, 2));

  if (failed) process.exit(1);
}

main();
