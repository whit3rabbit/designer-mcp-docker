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
 * It also builds dist/designer-mcp-marketplace.zip: the same plugin laid out
 * as a local marketplace (marketplace manifests at the root, the plugin under
 * plugins/designer-mcp/ with its harness manifests and .mcp.json). That is
 * the offline install path: `claude plugin marketplace add <unzipped dir>`
 * needs no GitHub access.
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
const MARKETPLACE_ZIP_NAME = "designer-mcp-marketplace.zip";
// Marketplace manifests per harness. Each one's plugin source is
// ./plugins/designer-mcp, which resolves inside the marketplace zip.
const MARKETPLACE_MANIFESTS = [
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
];
const PLUGIN_MANIFESTS = [
  ".claude-plugin/plugin.json",
  ".zcode-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  ".mcp.json",
];

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
  // The four HeroUI sub-skills nest one level deeper (under heroui/), so
  // they are listed by hand instead of through the BUNDLED map above.
  "skills/designer-ui/heroui/heroui-react/SKILL.md",
  "skills/designer-ui/heroui/heroui-react/LICENSE.txt",
  "skills/designer-ui/heroui/heroui-theming/SKILL.md",
  "skills/designer-ui/heroui/heroui-theming/LICENSE.txt",
  "skills/designer-ui/heroui/heroui-theming/references/any-framework.md",
  "skills/designer-ui/heroui/heroui-theming/references/components.md",
  "skills/designer-ui/heroui/heroui-theming/references/theme-recipe.md",
  "skills/designer-ui/heroui/heroui-theming/references/tokens.md",
  "skills/designer-ui/heroui/heroui-native/SKILL.md",
  "skills/designer-ui/heroui/heroui-native/LICENSE.txt",
  "skills/designer-ui/heroui/heroui-migration/SKILL.md",
  "skills/designer-ui/heroui/heroui-migration/LICENSE.txt",
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

// ---------------------------------------------------- marketplace zip
const marketplaceZip = join(OUT_DIR, MARKETPLACE_ZIP_NAME);
rmSync(marketplaceZip, { force: true });
const absentManifests = [
  ...MARKETPLACE_MANIFESTS.filter((m) => !existsSync(join(ROOT, m))),
  ...PLUGIN_MANIFESTS.filter((m) => !existsSync(join(PLUGIN_ROOT, m))),
];
if (absentManifests.length) {
  console.error(`marketplace zip: missing manifests: ${absentManifests.join(", ")}`);
  process.exit(1);
}
const mres = spawnSync(
  "zip",
  [
    "-r", "-q", "-X", marketplaceZip,
    ...MARKETPLACE_MANIFESTS, "plugins/designer-mcp",
    // The built zips may sit inside the plugin root (the Dockerfile copies
    // the skill zip there); never nest an archive in the archive.
    "-x", "*.DS_Store", "*__pycache__*", "*.pyc", "plugins/designer-mcp/skills/tmp/*", "plugins/designer-mcp/*.zip",
  ],
  { cwd: ROOT, stdio: "inherit" },
);
if (mres.status !== 0) {
  console.error(`marketplace zip failed`);
  process.exit(1);
}
const mentries = spawnSync("unzip", ["-Z1", marketplaceZip], { encoding: "utf8" }).stdout.trim().split("\n").filter(Boolean);
const mrequired = [
  ...MARKETPLACE_MANIFESTS,
  ...PLUGIN_MANIFESTS.map((m) => `plugins/designer-mcp/${m}`),
  ...required.map((r) => `plugins/designer-mcp/${r}`),
];
const mmissing = mrequired.filter((r) => !mentries.includes(r));
if (mmissing.length) {
  console.error(`  marketplace archive is missing: ${mmissing.join(", ")}`);
  process.exit(1);
}
console.log(`built ${marketplaceZip} (${(statSync(marketplaceZip).size / 1024).toFixed(1)} KB, ${mentries.length} entries)`);

// Print the install commands the user will need.
console.log(`
Install the plugin (four skills in one archive, sub-skills bundled inside):

  # any client that takes a zip: the archive keeps a skills/ prefix, so
  # extract it aside and copy the four skill folders into your skills root
  unzip -o designer-mcp-skill.zip -d /tmp/designer-mcp-skill
  cp -R /tmp/designer-mcp-skill/skills/. ~/.claude/skills/

  # Claude Code plugin, offline (no GitHub needed): a local marketplace
  unzip -o designer-mcp-marketplace.zip -d ~/designer-mcp-marketplace
  claude plugin marketplace add ~/designer-mcp-marketplace
  claude plugin install designer-mcp@designer-mcp-docker

  # skills CLI: discovers the four skills
  npx -y skills add whit3rabbit/designer-mcp-docker

  # Claude Code plugin, online (from GitHub)
  claude plugin marketplace add whit3rabbit/designer-mcp-docker
  claude plugin install designer-mcp@designer-mcp-docker

The document sub-skill scripts need their Python and npm dependencies at run
time: see the requirements.txt and package.json at the zip root (and in the
repo at plugins/designer-mcp/).
`);
