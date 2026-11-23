#!/usr/bin/env node
/**
 * Get HeroUI Native theme guidance, offline.
 *
 * Usage:
 *   node get_theme.mjs
 *
 * Output:
 *   The theming guide from the installed heroui-native package's docs, which
 *   documents its token format and dark/light switching. Native theming is
 *   CSS variables in the project (no npm theme file ships as CSS), so the
 *   guide is the source of truth.
 *
 * Never touches the network.
 */
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {findLocalDocs, OFFLINE_NOTE} from "./_native_docs.mjs";

function main() {
  const local = findLocalDocs();

  if (!local) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  console.error(`# Using docs from ${local.source} (${local.version})`);

  for (const rel of ["guides/theming.md", "guides/dark-mode.md"]) {
    const file = join(local.docsDir, rel);

    if (existsSync(file)) {
      console.log(readFileSync(file, "utf-8"));
      console.log();
    }
  }
}

main();
