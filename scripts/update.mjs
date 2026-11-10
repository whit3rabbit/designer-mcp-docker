#!/usr/bin/env node
/**
 * update.mjs — refresh the cache, rebuild the image, and optionally publish.
 *
 * Usage:
 *   node scripts/update.mjs                 # fetch + build
 *   node scripts/update.mjs --fetch-only    # refresh the style cache only
 *   node scripts/update.mjs --build-only    # rebuild the image only
 *   node scripts/update.mjs --publish       # also push to the registry
 *   node scripts/update.mjs --tag v1.2.0    # tag the image (implies --publish)
 *   node scripts/update.mjs --yes           # skip confirmation prompts
 *   node scripts/update.mjs --dry-run       # print what would run
 *
 * The cache is NEVER baked into the image. `--fetch` refreshes it on disk;
 * the image mounts it at runtime.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};

const DRY_RUN = has("--dry-run");
const ASSUME_YES = has("--yes");
const FETCH_ONLY = has("--fetch-only");
const BUILD_ONLY = has("--build-only");
const TAG = val("--tag");
const PUBLISH = has("--publish") || Boolean(TAG);

const REGISTRY = val("--registry") || "ghcr.io";
const OWNER = val("--owner") || "whit3rabbit";
const IMAGE_NAME = val("--name") || "designer-mcp";
const CACHE_DIR = resolve(
  val("--cache") || process.env.REFERO_CACHE_DIR || join(homedir(), ".refero-cache"),
);

const PLATFORM = val("--platform") || "linux/amd64,linux/arm64";

// ---------------------------------------------------------------------------

const steps = [];

if (!BUILD_ONLY) {
  steps.push({
    name: "fetch",
    desc: `refresh the style cache in ${CACHE_DIR}`,
    cmd: process.execPath,
    args: [join(ROOT, "scripts", "refero-public-fetch.js"), "--limit", "0", "--force"],
    env: { REFERO_CACHE_DIR: CACHE_DIR },
  });
  steps.push({
    name: "components",
    desc: "refresh the AI component catalog",
    cmd: process.execPath,
    args: [join(ROOT, "scripts", "fetch-gradientdeck.mjs")],
    env: { DESIGN_CACHE_DIR: CACHE_DIR },
  });
  steps.push({
    name: "presets",
    desc: "refresh the gradient / pattern preset catalogs",
    cmd: process.execPath,
    args: [join(ROOT, "scripts", "fetch-presets.mjs")],
    env: { DESIGN_CACHE_DIR: CACHE_DIR },
  });
}

// The image ships a baked catalog, so the build needs one. Baking is cheap
// (a file copy) compared to the fetch above, and it guarantees the image
// never ships an empty gallery.
if (!FETCH_ONLY) {
  steps.push({
    name: "bake",
    desc: `assemble the baked catalog in ${ROOT}/bake`,
    cmd: process.execPath,
    args: [join(ROOT, "scripts", "bake-cache.mjs"), "--cache", CACHE_DIR, "--out", join(ROOT, "bake")],
    env: { DESIGN_CACHE_DIR: CACHE_DIR },
  });
}

if (!FETCH_ONLY) {
  // `--load` can only load a single platform into the local docker store, so
  // a local build targets the host arch and a publishing build goes
  // multi-arch straight to the registry.
  const buildPlatforms = PUBLISH ? PLATFORM : (val("--local-platform") || "linux/arm64");
  steps.push({
    name: "build",
    desc: `build the image (${buildPlatforms})`,
    cmd: "docker",
    args: [
      "buildx",
      "build",
      "--platform",
      buildPlatforms,
      "-t",
      `${IMAGE_NAME}:latest`,
      // Publishing pushes both the version tag and `:latest`, so the
      // floating tag never points at an older release.
      ...(TAG
        ? [
            "-t",
            `${REGISTRY}/${OWNER}/${IMAGE_NAME}:${TAG}`,
            "-t",
            `${REGISTRY}/${OWNER}/${IMAGE_NAME}:latest`,
          ]
        : PUBLISH
          ? ["-t", `${REGISTRY}/${OWNER}/${IMAGE_NAME}:latest`]
          : []),
      ...(PUBLISH ? ["--push"] : ["--load"]),
      ROOT,
    ],
  });
}

console.log("");
console.log("  designer-mcp update");
console.log("  ─────────────────────────────────────────────");
for (const s of steps) console.log(`  → ${s.name}: ${s.desc}`);
if (PUBLISH) {
  console.log(`  → publish: ${REGISTRY}/${OWNER}/${IMAGE_NAME}${TAG ? `:${TAG}` : ":latest"}`);
} else {
  console.log("  → publish: no (pass --publish or --tag <version>)");
}
console.log("  ─────────────────────────────────────────────");
console.log(`  cache dir : ${CACHE_DIR}`);
console.log(`  platform  : ${PLATFORM}`);
console.log("");

if (DRY_RUN) {
  for (const s of steps) {
    console.log(`$ ${s.cmd} ${s.args.join(" ")}`);
  }
  console.log("\n(dry run — nothing executed)");
  process.exit(0);
}

if (!ASSUME_YES && !process.stdin.isTTY) {
  console.error("Refusing to run without confirmation. Re-run with --yes.");
  process.exit(1);
}

// ---------------------------------------------------------------------------

function run(step) {
  console.log(`\n▶ ${step.name}: ${step.desc}`);
  const res = spawnSync(step.cmd, step.args, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ...(step.env || {}) },
  });
  if (res.status !== 0) {
    console.error(`\n✗ ${step.name} failed (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
  console.log(`✓ ${step.name}`);
}

for (const s of steps) run(s);

// ---------------------------------------------------------------------------
// Post-build: record what was published so the README and the repo stay honest.

if (PUBLISH) {
  const full = `${REGISTRY}/${OWNER}/${IMAGE_NAME}`;
  const refs = TAG ? [`${full}:${TAG}`, `${full}:latest`] : [`${full}:latest`];
  console.log(`\n▶ published ${refs.join(", ")}`);

  if (TAG) {
    const changelog = join(ROOT, "CHANGELOG.md");
    const entry = `\n## ${TAG} — ${new Date().toISOString().slice(0, 10)}\n\n- Image: \`${full}:${TAG}\`\n`;
    if (existsSync(changelog)) {
      const cur = readFileSync(changelog, "utf8");
      if (!cur.includes(TAG)) writeFileSync(changelog, cur.replace(/^(# Changelog\s*)/, `$1${entry}`));
    } else {
      writeFileSync(changelog, `# Changelog\n${entry}`);
    }
    console.log(`  → recorded ${TAG} in CHANGELOG.md`);
  }
}

console.log("\nDone. Start the gallery with:");
console.log("  REFERO_CACHE_DIR=" + CACHE_DIR + " docker compose up -d gallery");
console.log("");
