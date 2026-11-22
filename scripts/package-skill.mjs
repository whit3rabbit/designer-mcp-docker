#!/usr/bin/env node
/**
 * Package the designer-mcp plugin's skills as a distributable zip.
 *
 * The plugin lives at plugins/designer-mcp/ with four skills under skills/,
 * each bundling its sub-skills in place. This script zips that skills root
 * plus the two dependency manifests into dist/designer-mcp-skill.zip,
 * preserving the skills/ prefix that skill installers expect. The archive
 * lands all four skills in one unzip step. The zip keeps its historical
 * name (designer-mcp-skill.zip): the gallery's /skill route and the
 * Dockerfile depend on it.
 *
 * Usage: node scripts/package-skill.mjs [--out <dir>]
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PLUGIN_ROOT = join(ROOT, "plugins", "designer-mcp");
const SKILLS_ROOT = join(PLUGIN_ROOT, "skills");

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--out");
const OUT_DIR = outIdx >= 0 && argv[outIdx + 1] ? resolve(argv[outIdx + 1]) : join(ROOT, "dist");

const ZIP_NAME = "designer-mcp-skill.zip";

if (!existsSync(join(SKILLS_ROOT, "design-system", "SKILL.md"))) {
  console.error(`expected plugins/designer-mcp/skills/design-system to exist - it anchors the /skill route`);
  process.exit(1);
}
if (!existsSync(join(SKILLS_ROOT, "designer-mcp", "SKILL.md"))) {
  console.error(`expected plugins/designer-mcp/skills/designer-mcp to exist`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const zipPath = join(OUT_DIR, ZIP_NAME);

// `zip -r` updates an existing archive instead of replacing it, which would
// keep stale entries from a previous layout. Start from a clean file.
rmSync(zipPath, { force: true });

// Zip from the plugin root so the archive preserves the skills/ prefix and
// carries the dependency manifests beside it. Bytecode and macOS metadata
// never ship, and skills/tmp scratch is excluded.
const res = spawnSync(
  "zip",
  [
    "-r", "-q", "-X", zipPath,
    "skills", "evals", "requirements.txt", "package.json",
    "-x", "*.DS_Store", "*__pycache__*", "*.pyc", "skills/tmp/*",
  ],
  { cwd: PLUGIN_ROOT, stdio: "inherit" },
);

if (res.status !== 0) {
  console.error(`zip failed - is \`zip\` installed?`);
  process.exit(1);
}

const size = statSync(zipPath).size;
console.log(`built ${zipPath} (${(size / 1024).toFixed(1)} KB)`);

// Verify the archive contains what an installer needs.
const list = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
const entries = list.stdout.trim().split("\n").filter(Boolean);

// The four top-level skills must ship with their SKILL.md, and every
// bundled sub-skill must ship its SKILL.md and Apache-2.0 LICENSE.txt.
const BUNDLED = {
  "design-system": ["design-template-authoring"],
  "designer-documents": ["docx", "pptx", "xlsx", "pdf", "pdf-reading"],
  "designer-ui": ["frontend-design", "ui-sdk"],
};
const required = [
  "requirements.txt",
  "package.json",
  "skills/design-system/SKILL.md",
  "skills/design-system/references/design-md-workflow.md",
  "skills/design-system/references/research-playbook.md",
  "skills/design-system/scripts/build-design-system.mjs",
  "skills/design-system/scripts/sample-document-styles.py",
  "skills/design-system/scripts/sample-web-styles.mjs",
  "skills/designer-mcp/SKILL.md",
  "skills/designer-mcp/install/README.md",
  "skills/designer-mcp/references/mcp-tools.md",
  "skills/designer-mcp/references/catalog-tools.md",
  "skills/designer-mcp/references/library-setup.md",
  "skills/designer-mcp/references/skill-directory.md",
  "skills/designer-documents/SKILL.md",
  "skills/designer-ui/SKILL.md",
  "evals/route-design-capture/prompt.md",
  "evals/route-design-capture/graders/rubric.md",
  "evals/route-doc-deliverable/prompt.md",
  "evals/route-doc-deliverable/graders/rubric.md",
  "evals/concierge-names-and-installs/prompt.md",
  "evals/concierge-names-and-installs/graders/rubric.md",
  "evals/catalog-library-lookup/prompt.md",
  "evals/catalog-library-lookup/graders/rubric.md",
  ...Object.entries(BUNDLED).flatMap(([parent, subs]) =>
    subs.flatMap((s) => [
      `skills/${parent}/${s}/SKILL.md`,
      `skills/${parent}/${s}/LICENSE.txt`,
    ]),
  ),
];

const missing = required.filter((r) => !entries.includes(r));
if (missing.length) {
  console.error(`  archive is missing: ${missing.join(", ")}`);
  process.exit(1);
}
const refs = entries.filter((e) => e.startsWith("skills/design-system/references/") || e.startsWith("skills/designer-mcp/references/"));
console.log(`  ${entries.length} entries, ${refs.length} reference files`);

// Print the install commands the user will need.
console.log(`
Install the plugin (four skills in one archive, sub-skills bundled inside):

  # any client that takes a zip: unzip into your skills root
  unzip designer-mcp-skill.zip -d ~/.claude/skills/

  # skills CLI: discovers the four skills
  npx -y skills add whit3rabbit/designer-mcp-docker

  # Claude Code plugin install
  claude plugin marketplace add whit3rabbit/designer-mcp-docker
  claude plugin install designer-mcp@designer-mcp-docker

The document sub-skill scripts need their Python and npm dependencies at run
time: see the requirements.txt and package.json at the zip root (and in the
repo at plugins/designer-mcp/).
`);
