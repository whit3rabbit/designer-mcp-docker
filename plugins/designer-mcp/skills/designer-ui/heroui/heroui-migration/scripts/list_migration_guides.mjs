#!/usr/bin/env node
/**
 * List all available HeroUI v2 to v3 component migration guides.
 *
 * Usage:
 *   node list_migration_guides.mjs
 *
 * Output:
 *   List of guide slugs, read from the baked designer-mcp layer's
 *   migration/index.json (falling back to the known component set).
 */
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {findMigrationDir, OFFLINE_NOTE} from "./_migration_dir.mjs";

// Fallback list when only the baked guides are missing; keep in sync with the
// upstream migration-mcp component list.
const FALLBACK_COMPONENTS = [
  "accordion", "alert", "autocomplete", "avatar", "breadcrumbs", "button",
  "button-group", "card", "checkbox", "checkbox-group", "chip", "code",
  "divider", "dropdown", "form", "image", "input", "input-otp", "kbd", "link",
  "listbox", "modal", "navbar", "numberinput", "popover", "radio", "radio-group",
  "scroll-shadow", "select", "skeleton", "slider", "snippet", "spacer",
  "spinner", "switch", "tabs", "toast", "tooltip", "user",
];
const FIXED_GUIDES = [
  "agent-guide-full", "agent-guide-incremental", "full-migration",
  "incremental-migration", "styling", "hooks", "index", "agent-index",
];

function main() {
  const dir = findMigrationDir();

  if (!dir) {
    console.error(OFFLINE_NOTE);
    process.exit(1);
  }

  const index = existsSync(join(dir, "index.json"))
    ? JSON.parse(readFileSync(join(dir, "index.json"), "utf-8"))
    : null;

  const slugs = new Set(index ? index.files.map((f) => f.name.replace(/\.mdx$/, "")) : []);
  const componentGuides = index ? [...slugs].filter((s) => !FIXED_GUIDES.includes(s) && s !== "meta" && s !== "index.json").sort() : [...FALLBACK_COMPONENTS];
  const workflows = [...slugs].filter((s) => FIXED_GUIDES.includes(s)).sort();

  console.log(
    JSON.stringify(
      {
        source: "the baked designer-mcp layer",
        total: index ? index.total : componentGuides.length + FIXED_GUIDES.length,
        workflows,
        components: componentGuides,
      },
      null,
      2,
    ),
  );

  console.error(
    `\n# ${componentGuides.length} component guides + ${workflows.length} workflow and topic guides` +
      (index ? "" : " (fallback list; the baked index was missing)"),
  );
  console.error("# Read one with get_component_migration_guides.mjs <slug> or get_migration_guide.mjs full|incremental");
}

main();
