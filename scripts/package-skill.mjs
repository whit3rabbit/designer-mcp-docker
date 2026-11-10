#!/usr/bin/env node
/**
 * Package the skill as a distributable zip.
 *
 * The zip contains skills/designer-mcp/ with SKILL.md, references/, and
 * agents/ — enough for `npx skills add`, a manual copy into a skills
 * directory, or a Hermes skill install.
 *
 * Usage: node scripts/package-skill.mjs [--out <dir>]
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SKILL_DIR = join(ROOT, "skills", "designer-mcp");

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--out");
const OUT_DIR = outIdx >= 0 && argv[outIdx + 1] ? resolve(argv[outIdx + 1]) : join(ROOT, "dist");

if (!existsSync(SKILL_DIR)) {
  console.error(`no skill at ${SKILL_DIR}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const zipName = "designer-mcp-skill.zip";
const zipPath = join(OUT_DIR, zipName);

// Zip from the repo root so the archive preserves the skills/<name>/ layout
// that skill installers expect.
const res = spawnSync(
  "zip",
  ["-r", "-q", "-X", zipPath, "skills/designer-mcp", "-x", "*.DS_Store"],
  { cwd: ROOT, stdio: "inherit" },
);

if (res.status !== 0) {
  console.error("zip failed — is `zip` installed?");
  process.exit(res.status ?? 1);
}

const size = statSync(zipPath).size;
console.log(`built ${zipPath} (${(size / 1024).toFixed(1)} KB)`);

// Verify the archive contains what an installer needs.
const list = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
const entries = list.stdout.trim().split("\n");
const required = ["skills/designer-mcp/SKILL.md"];
const missing = required.filter((r) => !entries.includes(r));
if (missing.length) {
  console.error(`archive is missing: ${missing.join(", ")}`);
  process.exit(1);
}
const refs = entries.filter((e) => e.startsWith("skills/designer-mcp/references/"));
console.log(`  ${entries.length} entries, ${refs.length} reference files`);

// Print the install commands the user will need.
console.log(`
Install this skill:

  # Hermes — copy the skill directory
  cp -r skills/designer-mcp ~/.hermes/skills/

  # or any client that takes a git URL
  unzip ${zipName} -d ~/.hermes/skills-src/ && cp -r ~/.hermes/skills-src/skills/designer-mcp ~/.hermes/skills/

  # npx skills add (from an unzipped checkout)
  npx -y skills add ./skills/designer-mcp --skill designer-mcp
`);
