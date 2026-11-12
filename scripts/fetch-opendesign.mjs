#!/usr/bin/env node
/**
 * design-opendesign — import OpenDesign design systems into the cache.
 *
 * Source: https://github.com/nexu-io/open-design (Apache-2.0)
 *
 * The repo is ~3.6 GB on disk, but that is git history: the working tree is
 * only ~323 MB, and the `design-systems/` subtree we actually need is 38 MB.
 * We therefore take the sparse-clone path rather than vendoring the repo.
 *
 * Each `design-systems/<slug>/` becomes one catalog entry, shaped like a
 * Refero entry so the same gallery and MCP tools serve both:
 *
 *   {
 *     id, source: "opendesign", siteName, url, northStar, colorScheme,
 *     colors[], fonts[], industry, createdAt, screenshotUrl, thumbnailUrl,
 *     system: { manifest, design, tokens, ... }
 *   }
 *
 * The parsing lives in scripts/lib/opendesign-import.mjs, which the Agent
 * Kit fetcher shares — a package is read the same way whichever tree it
 * came from.
 *
 * Keep the original package files for offline MCP reads. Imported markup is
 * stored as source, never executed by this fetcher or the MCP server.
 *
 * Usage
 *   node scripts/fetch-opendesign.mjs                    # import all
 *   node scripts/fetch-opendesign.mjs --slug linear-app # one system
 *   node scripts/fetch-opendesign.mjs --source <path>    # use a local checkout
 *   node scripts/fetch-opendesign.mjs --no-clone          # require --source
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   OPENDESIGN_REPO    git URL (default https://github.com/nexu-io/open-design.git)
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { importSystems } from "./lib/opendesign-import.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  // Last occurrence wins, so a compose `entrypoint` default can be
  // overridden by a trailing argument: `run --rm opendesign --slug linear-app`.
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const REPO = process.env.OPENDESIGN_REPO || "https://github.com/nexu-io/open-design.git";
const SUBTREE = "design-systems";

// ------------------------------------------------------------------ git
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
    let out = "";
    let err = "";
    child.stdout?.on("data", (d) => (out += d.toString()));
    child.stderr?.on("data", (d) => (err += d.toString()));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${cmd} ${args.join(" ")}\n${err.trim()}`)),
    );
  });
}

/**
 * Sparse-clone just the design-systems subtree.
 *
 * `--filter=blob:none` keeps the pack tiny: git fetches the tree metadata
 * for the whole repo but only downloads the blobs for the paths we check out.
 */
async function sparseClone(dest) {
  console.log(`cloning  : ${REPO} (sparse: ${SUBTREE}/ only)`);
  await run("git", [
    "clone",
    "--filter=blob:none",
    "--no-checkout",
    "--depth",
    "1",
    REPO,
    dest,
  ]);
  await run("git", ["sparse-checkout", "set", SUBTREE], { cwd: dest });
  await run("git", ["checkout"], { cwd: dest });
  console.log(`cloned   : ${join(dest, SUBTREE)}`);
  return join(dest, SUBTREE);
}

// ------------------------------------------------------------------ main
async function main() {
  const onlySlug = argVal("--slug");
  const localSource = argVal("--source");

  let systemsDir;
  if (localSource) {
    systemsDir = join(localSource, SUBTREE);
    if (!existsSync(systemsDir)) systemsDir = localSource;
    console.log(`source   : ${systemsDir} (local)`);
  } else if (has("--no-clone")) {
    console.error("--no-clone requires --source <path>");
    process.exit(1);
  } else {
    const dest = join(tmpdir(), `opendesign-sparse-${Date.now()}`);
    systemsDir = await sparseClone(dest);
  }

  // A single-slug refresh imports just that one package.
  const dir = onlySlug ? join(systemsDir, onlySlug) : systemsDir;
  if (onlySlug && !existsSync(dir)) {
    console.error(`no design system "${onlySlug}" under ${systemsDir}`);
    process.exit(1);
  }
  console.log(`systems  : ${onlySlug ? 1 : "all"} to import\n`);

  const { imported, catalog, index } = await importSystems(dir, {
    // A manifest carrying neither `url` nor `source.url` falls back to this
    // repository's tree path.
    fallbackUrl: (slug) => `https://github.com/nexu-io/open-design/tree/main/${SUBTREE}/${slug}`,
    onSkip: (slug, message) => console.warn(`  SKIP ${slug}: ${message}`),
    onImport: (entry, done, total) =>
      console.log(`  ok ${String(done).padStart(4)}/${total}  ${entry.siteName} (${entry.id})`),
  });

  console.log(
    `\ndone: ${imported.length} imported, catalog now ${catalog.length} designs ` +
      `(${JSON.stringify(index.counts)})`,
  );
  console.log(
    "next: node scripts/fetch-thumbs.mjs   (Refero screenshots only)",
  );
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
