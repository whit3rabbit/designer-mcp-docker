#!/usr/bin/env node
/**
 * Package every skill under skills/ as a distributable zip.
 *
 * Each skill directory (skills/<name>/) is zipped into dist/<name>-skill.zip,
 * preserving the skills/<name>/ layout that skill installers expect. The
 * designer-mcp zip keeps its historical name (designer-mcp-skill.zip) — the
 * gallery's /skill route and the Dockerfile depend on it.
 *
 * Usage: node scripts/package-skill.mjs [--out <dir>] [--only <name>]
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SKILLS_ROOT = join(ROOT, "skills");

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--out");
const OUT_DIR = outIdx >= 0 && argv[outIdx + 1] ? resolve(argv[outIdx + 1]) : join(ROOT, "dist");
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx >= 0 && argv[onlyIdx + 1] ? argv[onlyIdx + 1] : null;

// Scratch (skills/tmp/) is dockerignored and never distributable.
const EXCLUDED = new Set(["tmp"]);

// Sub-skills bundled inside designer-mcp. The merged zip must carry each one's
// SKILL.md and LICENSE.txt, plus the shared dependency manifests.
const BUNDLED = [
  "docx",
  "frontend-design",
  "pdf",
  "pdf-reading",
  "pptx",
  "xlsx",
];

const skillDirs = readdirSync(SKILLS_ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("."))
  .map((e) => e.name)
  .filter((name) => !EXCLUDED.has(name))
  .sort();

if (ONLY && !skillDirs.includes(ONLY)) {
  console.error(`no skill named ${ONLY} under ${SKILLS_ROOT}`);
  process.exit(1);
}

if (!skillDirs.includes("designer-mcp")) {
  console.error("expected skills/designer-mcp to exist - it anchors the /skill route");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

let failures = 0;

for (const name of skillDirs) {
  if (ONLY && name !== ONLY) continue;

  const zipName = name === "designer-mcp" ? "designer-mcp-skill.zip" : `${name}-skill.zip`;
  const zipPath = join(OUT_DIR, zipName);
  const skillPath = `skills/${name}`;

  // Zip from the repo root so the archive preserves the skills/<name>/ layout
  // that skill installers expect. Bytecode and macOS metadata never ship.
  const res = spawnSync(
    "zip",
    ["-r", "-q", "-X", zipPath, skillPath, "-x", "*.DS_Store", "*__pycache__*", "*.pyc"],
    { cwd: ROOT, stdio: "inherit" },
  );

  if (res.status !== 0) {
    console.error(`zip failed for ${name} - is \`zip\` installed?`);
    failures++;
    continue;
  }

  const size = statSync(zipPath).size;
  console.log(`built ${zipPath} (${(size / 1024).toFixed(1)} KB)`);

  // Verify the archive contains what an installer needs.
  const list = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
  const entries = list.stdout.trim().split("\n").filter(Boolean);
  const required = [`${skillPath}/SKILL.md`];
  if (name === "designer-mcp") {
    required.push(
      `${skillPath}/requirements.txt`,
      `${skillPath}/package.json`,
      `${skillPath}/references/design-md-workflow.md`,
      `${skillPath}/scripts/build-design-system.mjs`,
      `${skillPath}/scripts/sample-document-styles.py`,
      `${skillPath}/scripts/sample-web-styles.mjs`,
      ...BUNDLED.flatMap((b) => [
        `${skillPath}/${b}/SKILL.md`,
        `${skillPath}/${b}/LICENSE.txt`,
      ]),
    );
  }
  const missing = required.filter((r) => !entries.includes(r));
  if (missing.length) {
    console.error(`  ${name}: archive is missing: ${missing.join(", ")}`);
    failures++;
    continue;
  }
  const refs = entries.filter((e) => e.startsWith(`${skillPath}/references/`));
  console.log(`  ${entries.length} entries, ${refs.length} reference files`);
}

if (failures > 0) {
  process.exit(1);
}

// Print the install commands the user will need.
console.log(`
Install the skill (one directory, everything bundled):

  # Hermes - copy the skill directory
  cp -r skills/designer-mcp ~/.hermes/skills/

  # or any client that takes a zip
  unzip designer-mcp-skill.zip -d ~/.hermes/skills-src/ && cp -r ~/.hermes/skills-src/skills/designer-mcp ~/.hermes/skills/

  # npx skills add (from an unzipped checkout)
  npx -y skills add ./skills/designer-mcp --skill designer-mcp

The document sub-skill scripts need their Python and npm dependencies at run
time: see skills/designer-mcp/requirements.txt and package.json.
`);
