#!/usr/bin/env node
/**
 * fetch-heroui.mjs — bake the HeroUI layer into the cache (build-time network).
 *
 * HeroUI (formerly NextUI) publishes everything this layer needs through
 * first-party, permissively licensed channels:
 *
 *   - @heroui/react npm tarball  -> docs/ (73 component pages, 16 guides,
 *     llms.txt), written for agents and shipped inside the package itself
 *   - @heroui/styles npm tarball -> per-component CSS, the oklch theme
 *     variables and the shared theme css
 *   - heroui-inc/heroui GitHub tarball (pinned tag) -> component TSX source
 *     plus the v2-to-v3 migration guides (apps/docs/content/docs/en/react/migration)
 *
 * The runtime surfaces (preview, MCP, static site) never run this script and
 * never repeat any of these requests: they read <cache>/heroui/ from disk.
 *
 * Cache layout (per data/heroui/pin.json):
 *   <cache>/heroui/catalog.json      component + guide index, parsed from llms.txt
 *   <cache>/heroui/docs/             the @heroui/react docs tree, verbatim
 *   <cache>/heroui/theme/            variables.css, theme.css, default.css
 *   <cache>/heroui/styles/           components/*.css, index.css, variants.css, base/
 *   <cache>/heroui/source/           react/ + styles/ TS and TSX from the repo tag
 *   <cache>/heroui/migration/        v2 -> v3 migration guides (.mdx, flattened)
 *   <cache>/heroui/provenance.json   versions, urls, commit sha, sha256 checksums
 *
 * Every stage is fail-soft except the react docs: a failed stage is recorded
 * in provenance.gaps and previously baked content is left untouched.
 *
 * Usage:
 *   node scripts/fetch-heroui.mjs
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";
import { heroUiSlug } from "./lib/heroui-docs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "heroui", "pin.json");
const HEROUI_DIR = join(CACHE_DIR, "heroui");

// Where the v2 -> v3 migration guides live inside the repo tarball, and the
// directory that groups agent workflow guides ("(components)", "(workflows)",
// "(migration-for-agents)") which is flattened away when baking.
const MIGRATION_REPO_DIR = join("apps", "docs", "content", "docs", "en", "react", "migration");

const UA = "designer-mcp-docker fetch-heroui";
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Verify an npm registry `dist.integrity` string ("sha512-<base64>"). */
function integrityOk(buf, integrity) {
  const [algo, digest] = String(integrity || "").split("-");
  if (algo !== "sha512" || !digest) return false;
  return createHash("sha512").update(buf).digest("base64") === digest;
}

async function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** Extract a .tgz into destDir with the system tar (spawnSync, like fetch-reui's git). */
function extractTarball(tgzPath, destDir) {
  const res = spawnSync("tar", ["-xzf", tgzPath, "-C", destDir], { stdio: "pipe" });
  if (res.status !== 0) {
    throw new Error(`tar extraction failed for ${tgzPath}: ${res.stderr?.toString().slice(0, 300)}`);
  }
}

/**
 * Parse llms.txt into the catalog: component groups and guide groups.
 * Format: `### <Group>` under `## Components` / `## Guides`, then one
 * `- [Name](components/x.md): description` bullet per entry.
 */
function parseLlmsTxt(text) {
  const components = [];
  const guides = [];
  let section = null;
  let group = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "## Components") { section = "components"; group = null; continue; }
    if (line === "## Guides") { section = "guides"; group = null; continue; }
    if (/^## /.test(line) && line !== "## Components" && line !== "## Guides") { section = null; continue; }
    if (/^### /.test(line)) { group = line.slice(4).trim(); continue; }
    const m = /^- \[(.+?)\]\(([^)]+?)\)(?::\s*(.*))?$/.exec(line);
    if (!m || !section) continue;
    const [, name, link, description = ""] = m;
    const entry = {
      name,
      slug: heroUiSlug(name),
      group: group || "",
      description: description.trim(),
      path: link,
    };
    if (section === "components" && link.startsWith("components/")) components.push(entry);
    if (section === "guides" && link.startsWith("guides/")) guides.push(entry);
  }
  return { components, guides };
}

async function fetchNpmPackage(name, version, gaps) {
  const metaUrl = `https://registry.npmjs.org/${name}/${version}`;
  const meta = JSON.parse((await fetchBuffer(metaUrl)).toString("utf8"));
  const tarballUrl = meta.dist?.tarball;
  const integrity = meta.dist?.integrity;
  if (!tarballUrl) throw new Error(`registry metadata for ${name}@${version} has no tarball`);
  const buf = await fetchBuffer(tarballUrl);
  if (integrity && !integrityOk(buf, integrity)) {
    throw new Error(`integrity mismatch for ${name}@${version}`);
  }
  const dir = await mkdtemp(join(tmpdir(), "heroui-pkg-"));
  const tgz = join(dir, "pkg.tgz");
  await writeFile(tgz, buf);
  extractTarball(tgz, dir);
  return { dir, pkgDir: join(dir, "package"), version: meta.version, integrity: integrity || "", tarballUrl, buf };
}

async function fetchSourceTree(pin, gaps) {
  const { repo, tag } = pin.source || {};
  if (!repo || !tag) throw new Error("pin.json source.repo/source.tag missing");
  const tarballUrl = `https://codeload.github.com/${repo}/tar.gz/${tag}`;
  const buf = await fetchBuffer(tarballUrl);
  const dir = await mkdtemp(join(tmpdir(), "heroui-src-"));
  const tgz = join(dir, "repo.tgz");
  await writeFile(tgz, buf);
  extractTarball(tgz, dir);
  // The GitHub tarball unpacks to <repo>-<tag without v>. Find it rather than guess.
  const entries = await readdir(dir, { withFileTypes: true });
  const root = entries.find((e) => e.isDirectory() && e.name.startsWith(repo.split("/")[1]))?.name;
  if (!root) throw new Error("unexpected GitHub tarball layout");
  const repoDir = join(dir, root);
  // Resolve the tag to a commit sha via the API when possible (best effort).
  let sha = "";
  try {
    const commit = JSON.parse((await fetchBuffer(`https://api.github.com/repos/${repo}/commits/${tag}`)).toString("utf8"));
    sha = commit.sha || "";
  } catch (e) {
    gaps.push(`source: could not resolve ${tag} to a commit sha (${e.message})`);
  }
  return { repoDir, sha, tarballUrl };
}

/**
 * Copy the migration guides out of the repo checkout, flattening the
 * `(group)/` route-group directories. Basenames are unique across groups, so
 * the flat names match what the upstream migration skill scripts fetch.
 */
async function bakeMigrationGuides(repoDir, gaps) {
  const src = join(repoDir, MIGRATION_REPO_DIR);
  if (!existsSync(src)) {
    gaps.push(`migration: ${MIGRATION_REPO_DIR} missing from the repo tarball (upstream moved the docs?)`);
    return 0;
  }
  const migDir = join(HEROUI_DIR, "migration");
  await rm(migDir, { recursive: true, force: true });
  await mkdir(migDir, { recursive: true });
  const files = [];
  const walk = async (dir, group) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await walk(join(dir, entry.name), entry.name.startsWith("(") ? "" : entry.name);
      } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".json")) {
        if (files.some((f) => f.name === entry.name)) {
          gaps.push(`migration: duplicate name ${entry.name}, skipped`);
          continue;
        }
        await cp(join(dir, entry.name), join(migDir, entry.name));
        files.push({ name: entry.name, bytes: (await stat(join(migDir, entry.name))).size });
      }
    }
  };
  await walk(src, "");
  await writeJsonAtomic(join(migDir, "index.json"), { tag: MIGRATION_REPO_DIR, total: files.length, files });
  return files.length;
}

/** sha256 for every file under dir, keyed by path relative to rootDir. */
async function checksumTree(rootDir, rel = "") {
  const out = {};
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, await checksumTree(rootDir, child));
    else out[child] = sha256(await readFile(join(rootDir, child)));
  }
  return out;
}

async function main() {
  const pin = await readJsonSafe(PIN_PATH);
  if (!pin?.reactVersion) throw new Error(`missing or invalid ${PIN_PATH}`);
  const gaps = [];
  const stage = async (label, fn) => {
    try {
      return await fn();
    } catch (e) {
      gaps.push(`${label}: ${e.message}`);
      console.warn(`  ${label} failed (recorded as a gap): ${e.message}`);
      return null;
    }
  };

  console.log(`HeroUI layer -> ${HEROUI_DIR}`);
  console.log(`  pin: react ${pin.reactVersion}, styles ${pin.stylesVersion}, source ${pin.source?.tag}`);

  // ---------------------------------------------------------- npm packages
  const react = await stage("react tarball", () => fetchNpmPackage("@heroui/react", pin.reactVersion, gaps));
  if (!react?.pkgDir || !existsSync(join(react.pkgDir, "docs", "llms.txt"))) {
    throw new Error("the @heroui/react docs tree is the core of this layer; fix the fetch and re-run");
  }
  const styles = await stage("styles tarball", () => fetchNpmPackage("@heroui/styles", pin.stylesVersion, gaps));

  // ---------------------------------------------------------- repo source
  const source = await stage("repo source", () => fetchSourceTree(pin, gaps));
  let migrationCount = 0;
  if (source?.repoDir) {
    migrationCount = await bakeMigrationGuides(source.repoDir, gaps);
    if (migrationCount) console.log(`  migration: ${migrationCount} guides from ${pin.source.tag}`);
  }

  // ------------------------------------------------------------ swap into the cache
  // Only now touch the cache: a failure above leaves the previous bake intact.
  const swap = async (rel, from) => {
    if (!from) return 0;
    const to = join(HEROUI_DIR, rel);
    await rm(to, { recursive: true, force: true });
    await mkdir(dirname(to), { recursive: true });
    await cp(from, to, { recursive: true });
    return 1;
  };

  await mkdir(HEROUI_DIR, { recursive: true });
  await swap("docs", join(react.pkgDir, "docs"));

  if (styles?.pkgDir) {
    await rm(join(HEROUI_DIR, "theme"), { recursive: true, force: true });
    await mkdir(join(HEROUI_DIR, "theme"), { recursive: true });
    const dist = join(styles.pkgDir, "dist");
    const themePairs = [
      ["themes/default/variables.css", "variables.css"],
      ["themes/shared/theme.css", "theme.css"],
      ["themes/default/index.css", "default.css"],
    ];
    for (const [from, to] of themePairs) {
      const src = join(dist, from);
      if (existsSync(src)) await cp(src, join(HEROUI_DIR, "theme", to));
    }
    await swap("styles/components", join(dist, "components"));
    for (const [from, to] of [["index.css", "index.css"], ["variants/index.css", "variants.css"]]) {
      const src = join(dist, from);
      if (existsSync(src)) await cp(src, join(HEROUI_DIR, "styles", to));
    }
    if (existsSync(join(dist, "base"))) await swap("styles/base", join(dist, "base"));
    // The prebuilt bundle for plain-HTML use (the theming skill points at it).
    const minCss = join(dist, "heroui.min.css");
    if (existsSync(minCss)) await cp(minCss, join(HEROUI_DIR, "styles", "heroui.min.css"));
    // Mirror the upstream @heroui/styles layout (themes/ beside components/)
    // so the heroui-theming skill scripts can treat styles/ as the package
    // CSS root. theme/ above stays the flat copy the MCP reader serves.
    if (existsSync(join(dist, "themes"))) await swap("styles/themes", join(dist, "themes"));
  }

  if (source?.repoDir) {
    const reactSrc = join(source.repoDir, "packages", "react", "src");
    const stylesSrc = join(source.repoDir, "packages", "styles", "src");
    if (!existsSync(reactSrc)) {
      gaps.push("source: packages/react/src missing from the repo tarball (upstream layout changed?)");
    } else {
      await swap("source/react", reactSrc);
      if (existsSync(stylesSrc)) await swap("source/styles", stylesSrc);
    }
  }

  // ------------------------------------------------------------- catalog
  const llms = await readFile(join(HEROUI_DIR, "docs", "llms.txt"), "utf8");
  const { components, guides } = parseLlmsTxt(llms);
  const catalog = {
    updatedAt: Date.now(),
    version: { react: react.version, styles: styles?.version || null, source: pin.source?.tag || null },
    totals: { components: components.length, guides: guides.length },
    components,
    guides,
    hasSource: existsSync(join(HEROUI_DIR, "source", "react")),
    hasStyles: existsSync(join(HEROUI_DIR, "styles", "components")),
    hasMigration: existsSync(join(HEROUI_DIR, "migration", "agent-guide-full.mdx")),
  };
  await writeJsonAtomic(join(HEROUI_DIR, "catalog.json"), catalog);
  console.log(`  catalog: ${components.length} components, ${guides.length} guides`);

  // ---------------------------------------------------------- provenance
  const provenance = {
    fetchedAt: new Date().toISOString(),
    pin,
    react: { version: react.version, integrity: react.integrity, tarballUrl: react.tarballUrl, docsBytes: Buffer.byteLength(llms) },
    styles: styles
      ? { version: styles.version, integrity: styles.integrity, tarballUrl: styles.tarballUrl }
      : null,
    source: source ? { repo: pin.source.repo, tag: pin.source.tag, sha: source.sha, tarballUrl: source.tarballUrl } : null,
    migration: { total: migrationCount },
    gaps,
    checksums: await checksumTree(HEROUI_DIR),
  };
  await writeJsonAtomic(join(HEROUI_DIR, "provenance.json"), provenance);

  console.log(`  provenance: ${Object.keys(provenance.checksums).length} files checksummed`);
  if (gaps.length) {
    console.warn(`  ${gaps.length} gap(s) recorded:`);
    for (const g of gaps) console.warn(`    - ${g}`);
  }
  console.log("done");
}

main().catch((e) => {
  console.error("fetch-heroui failed:", e.message);
  process.exit(1);
});
