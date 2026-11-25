#!/usr/bin/env node
/**
 * fetch-uikits.mjs — bake the UI kits layer into the cache (build-time network).
 *
 * One fetcher for the whole <cache>/uikits/ layer, driven by data/uikits/pins.json.
 * Three kit shapes:
 *
 *   - github kits:  codeload.github.com repo tarball at a pinned commit sha
 *     (no API call); the pinned subtrees ("picks") are copied out after
 *     pruning test files, and the LICENSE file is read from the archive
 *     itself and must match the pinned SPDX or the kit is skipped and its
 *     previous bake removed.
 *   - npm kits:     registry.npmjs.org tarball, sha512 integrity verified
 *     (open-props; the css files in the tarball ARE the assets).
 *   - pointer kits: the site's first-party llms.txt index only, fetched under
 *     the same robots.txt gate as fetch-baseui.mjs, because the licence
 *     restricts component redistribution (React Bits, Aceternity) or the
 *     registry is key-gated user content (21st.dev). No component code.
 *
 * Per kit this stages into a scratch dir and swaps into <cache>/uikits/<kit>/
 * at the end, so a failing kit leaves the previous bake intact and only
 * records a gap. The exception is a licence failure: a kit whose licence no
 * longer matches its pin is removed, never left serving. Scratch dirs are
 * removed in a finally. The runtime surfaces never run this script.
 *
 * Cache layout:
 *   <cache>/uikits/index.json         one summary row per kit
 *   <cache>/uikits/<kit>/catalog.json items for the kit (docs/source paths)
 *   <cache>/uikits/<kit>/docs/        doc markdown, pruned + re-rooted
 *   <cache>/uikits/<kit>/source/      component/example source, pruned
 *   <cache>/uikits/<kit>/registry/    shadcn-style registry JSONs, verbatim
 *   <cache>/uikits/<kit>/assets/      css token files (open-props)
 *   <cache>/uikits/<kit>/files.json   { files: { relpath: bytes } } manifest
 *   <cache>/uikits/<kit>/provenance.json
 *
 * Usage:
 *   node scripts/fetch-uikits.mjs            # every kit
 *   node scripts/fetch-uikits.mjs antd coss  # named kits only
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "uikits", "pins.json");
const UIKITS_DIR = join(CACHE_DIR, "uikits");

const UA = "designer-mcp-docker fetch-uikits";
// Repo tarballs (mui/material-ui in particular) can be large; give them room.
const REPO_TIMEOUT_MS = 300000;
const FETCH_DELAY_MS = 150;
const MAX_FILES_PER_KIT = 20000;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchBuffer(url, timeoutMs = 60000) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

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

function extractTarball(tgzPath, destDir) {
  const res = spawnSync("tar", ["-xzf", tgzPath, "-C", destDir], { stdio: "pipe" });
  if (res.status !== 0) {
    throw new Error(`tar extraction failed for ${tgzPath}: ${res.stderr?.toString().slice(0, 300)}`);
  }
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

// ------------------------------------------------------------- licence check

/**
 * A licence the pin does not cover (file missing, or text that no longer
 * matches). Unlike a network failure, this must remove the previous bake:
 * the pin no longer has the right to serve what is on disk.
 */
class LicenceError extends Error {}

/** True when the licence text plausibly carries the pinned SPDX. */
function licenseMatches(text, spdx) {
  if (!text || !spdx) return false;
  const t = text.slice(0, 20000);
  // "MIT WITH Commons-Clause" grants MIT and then takes the redistribution
  // right back, so it must not satisfy a plain MIT pin.
  if (!spdx.includes("Commons-Clause") && /Commons Clause/i.test(t)) return false;
  if (spdx.startsWith("MIT")) return /\bMIT\b|Permission is hereby granted/i.test(t);
  if (spdx.startsWith("Apache")) return /Apache License/i.test(t);
  return t.includes(spdx);
}

// ------------------------------------------------------------------ fetching

/**
 * A scratch dir for one download. On success the caller owns `dir` and
 * removes it when the kit is done; on a throw it is removed here, so a
 * failed kit never leaves its tarball behind in the temp folder.
 */
async function withScratchDir(prefix, fn) {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  try {
    return await fn(dir);
  } catch (e) {
    await rm(dir, { recursive: true, force: true });
    throw e;
  }
}

async function fetchNpmPackage(name, version) {
  const metaUrl = `https://registry.npmjs.org/${name}/${version}`;
  const meta = JSON.parse((await fetchBuffer(metaUrl)).toString("utf8"));
  const tarballUrl = meta.dist?.tarball;
  const integrity = meta.dist?.integrity;
  if (!tarballUrl) throw new Error(`registry metadata for ${name}@${version} has no tarball`);
  const buf = await fetchBuffer(tarballUrl);
  if (integrity && !integrityOk(buf, integrity)) {
    throw new Error(`integrity mismatch for ${name}@${version}`);
  }
  return withScratchDir("uikits-pkg-", async (dir) => {
    const tgz = join(dir, "pkg.tgz");
    await writeFile(tgz, buf);
    extractTarball(tgz, dir);
    return { dir, pkgDir: join(dir, "package"), version: meta.version, integrity: integrity || "", tarballUrl };
  });
}

async function fetchRepoTree(repo, ref) {
  // A branch name moves under a bake and needs an API call to resolve. A
  // full sha is immutable, so the pin alone reproduces the bake.
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    throw new Error(`${repo}: ref '${ref}' is not a full commit sha; pin one in data/uikits/pins.json`);
  }
  const tarballUrl = `https://codeload.github.com/${repo}/tar.gz/${ref}`;
  const buf = await fetchBuffer(tarballUrl, REPO_TIMEOUT_MS);
  return withScratchDir("uikits-repo-", async (dir) => {
    const tgz = join(dir, "repo.tgz");
    await writeFile(tgz, buf);
    extractTarball(tgz, dir);
    // The GitHub tarball unpacks to <repo>-<ref>. Find it rather than guess.
    const entries = await readdir(dir, { withFileTypes: true });
    const root = entries.find((e) => e.isDirectory() && e.name.startsWith(repo.split("/")[1]))?.name;
    if (!root) throw new Error("unexpected GitHub tarball layout");
    return { dir, repoDir: join(dir, root), tarballUrl };
  });
}

/** robots.txt gate for pointer llms.txt fetches, same policy as fetch-baseui.mjs. */
async function robotsAllows(robotsUrl, path) {
  const text = (await fetchBuffer(robotsUrl)).toString("utf8");
  let appliesToUs = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const k = key.toLowerCase();
    if (k === "user-agent") appliesToUs = value === "*";
    else if (appliesToUs && k === "disallow" && value) {
      if (path.startsWith(value)) return { ok: false, why: `robots.txt disallows ${value}` };
    }
  }
  return { ok: true, why: "" };
}

async function fetchPointerLlms(pointer, gaps) {
  const path = new URL(pointer.llms).pathname;
  let gate = { ok: true, why: "" };
  try {
    gate = await robotsAllows(pointer.robots, path);
  } catch (e) {
    throw new Error(`robots.txt unreachable at ${pointer.robots}: ${e.message}`);
  }
  if (!gate.ok) throw new Error(`pointer fetch refused: ${gate.why}`);
  await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  return fetchBuffer(pointer.llms);
}

// ------------------------------------------------------------------- picking

const globCache = new Map();

/** Regex for a glob over one file name: `*` matches within the name, never a separator. */
function globToRegExp(pattern) {
  let re = globCache.get(pattern);
  if (!re) {
    re = new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`);
    globCache.set(pattern, re);
  }
  return re;
}

/** True when a file name matches any of the pin's globs (`*.test.*`, `index.$*`) or exact names. */
function matchesGlob(name, patterns) {
  return patterns.some((p) => (p.includes("*") ? globToRegExp(p).test(name) : name === p));
}

/**
 * Copy one pick ({from, to, keep}) from the archive root into the staged kit
 * dir, applying the global excludes, the kit's own file excludes, and the
 * pick's keep whitelist. `to: "drop"` removes a carved-out path instead.
 */
async function applyPick(stagedKit, archiveRoot, pick, pin, count) {
  const to = join(stagedKit, pick.to);
  if (pick.to === "drop") {
    await rm(join(stagedKit, pick.from), { recursive: true, force: true });
    return;
  }
  const src = join(archiveRoot, pick.from);
  if (!existsSync(src)) throw new Error(`pick source missing in the archive: ${pick.from}`);
  const files = pins.excludes.files.concat(pin.pickExcludeFiles || []);
  const dirs = pins.excludes.dirs;
  let n = count.n;
  if (pick.root) {
    // Shallow pick: direct children only (npm css packages carry nested
    // build trees that would otherwise leak in as noise).
    await mkdir(to, { recursive: true });
    for (const entry of await readdir(src, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (files.some((f) => matchesGlob(entry.name, [f]))) continue;
      if (pick.keep && !matchesGlob(entry.name, pick.keep)) continue;
      await cp(join(src, entry.name), join(to, entry.name));
      n += 1;
    }
    count.n = n;
    return;
  }
  const walk = async (fromDir, toDir) => {
    await mkdir(toDir, { recursive: true });
    for (const entry of await readdir(fromDir, { withFileTypes: true })) {
      if (n >= MAX_FILES_PER_KIT) throw new Error(`more than ${MAX_FILES_PER_KIT} files; check the pins`);
      if (entry.isDirectory()) {
        if (dirs.includes(entry.name)) continue;
        // Next.js route groups ("(root)/") are conventions, not paths:
        // flatten them so baked paths stay plain (the traversal guard and
        // the MCP callers only accept [\w./-]).
        if (entry.name.startsWith("(")) {
          await walk(join(fromDir, entry.name), toDir);
        } else {
          await walk(join(fromDir, entry.name), join(toDir, entry.name));
        }
      } else if (entry.isFile()) {
        if (files.some((f) => matchesGlob(entry.name, [f]))) continue;
        if (pick.keep && !matchesGlob(entry.name, pick.keep)) continue;
        const dest = join(toDir, entry.name);
        if (existsSync(dest)) {
          // A flattened group collided with an existing file: keep both.
          const flat = entry.name.replace(/(\.[^./]+)$/, "-flat$1");
          await cp(join(fromDir, entry.name), join(toDir, flat));
        } else {
          await cp(join(fromDir, entry.name), dest);
        }
        n += 1;
      }
    }
  };
  await walk(src, to);
  count.n = n;
}

/** Copy extra named files from the archive (magicui's root registry.json),
 *  or fetch them from a pinned first-party URL (open-props' repo README,
 *  which npm strips from the tarball). A URL extra is pinned to a commit and
 *  carries the sha256 its bytes must match. */
async function applyExtraFiles(stagedKit, archiveRoot, extras, provenance) {
  for (const extra of extras || []) {
    const to = join(stagedKit, extra.to);
    await mkdir(dirname(to), { recursive: true });
    if (extra.url) {
      if (!/^[0-9a-f]{64}$/.test(extra.sha256 || "")) {
        throw new Error(`url extra ${extra.url} has no sha256 pin in data/uikits/pins.json`);
      }
      const buf = await fetchBuffer(extra.url);
      if (sha256(buf) !== extra.sha256) throw new Error(`sha256 mismatch for ${extra.url}`);
      await writeFile(to, buf);
      provenance.urlExtras ??= [];
      provenance.urlExtras.push({ url: extra.url, to: extra.to, bytes: buf.length, sha256: sha256(buf) });
    } else {
      const src = join(archiveRoot, extra.from);
      if (!existsSync(src)) throw new Error(`extra file missing in the archive: ${extra.from}`);
      await cp(src, to);
    }
  }
}

/** { relpath: bytes } for every file under dir. */
async function fileManifest(rootDir, rel = "") {
  const out = {};
  if (!existsSync(rootDir)) return out;
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, await fileManifest(rootDir, child));
    else out[child] = (await stat(join(rootDir, child))).size;
  }
  return out;
}

// ------------------------------------------------------------ item builders

const DOC_EXT = /\.(md|mdx)$/;
const CODE_EXT = /\.(ts|tsx|js|jsx|css)$/;

function kebab(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** First markdown frontmatter title, else the first # heading, else the filename. */
async function docTitle(path) {
  try {
    const head = (await readFile(path, "utf8")).slice(0, 2000);
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(head);
    if (fm) {
      const t = /^title:\s*["']?(.+?)["']?\s*$/m.exec(fm[1]);
      if (t) return t[1].trim();
    }
    const h = /^#\s+(.+)$/m.exec(head);
    if (h) return h[1].trim();
  } catch { /* unreadable file: fall through */ }
  return "";
}

async function walkFiles(rootDir, rel = "", out = []) {
  if (!existsSync(rootDir)) return out;
  for (const entry of await readdir(join(rootDir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await walkFiles(rootDir, child, out);
    else out.push(child);
  }
  return out;
}

/** List files under `dir` matching an extension whitelist, as relative paths. */
async function filesUnder(rootDir, dir, test) {
  const all = await walkFiles(join(rootDir, dir), "");
  const prefix = dir.endsWith("/") ? dir : dir ? `${dir}/` : "";
  return all.filter((f) => test(f)).map((f) => prefix + f);
}

/**
 * docs-tree model: one item per markdown page under the docs root. Slugs and
 * groups come from the path relative to that root ("components/accordion.mdx"
 * -> slug "accordion", group "components"), not from the baked prefix, which
 * is just where the tree was re-rooted. Kits with a component source dir
 * (chakra) attach the matching source/<dir>/ files to each component item.
 */
async function buildDocsTreeItems(stagedKit, spec) {
  const root = spec.docsRoot;
  const docsFiles = (await walkFiles(join(stagedKit, root), "")).filter((f) => DOC_EXT.test(f)).sort();
  const bySlugSource = {};
  if (spec.sourceDir) {
    const sourceFiles = await filesUnder(stagedKit, spec.sourceDir, () => true);
    const prefix = spec.sourceDir.endsWith("/") ? spec.sourceDir : `${spec.sourceDir}/`;
    for (const f of sourceFiles) {
      const rest = f.startsWith(prefix) ? f.slice(prefix.length) : f;
      const top = rest.split("/")[0];
      if (top) (bySlugSource[kebab(top.replace(/\.[jt]sx?$/, ""))] ??= []).push(f);
    }
  }
  const items = [];
  for (const f of docsFiles) {
    const noExt = f.replace(DOC_EXT, "");
    const segs = noExt.split("/");
    const isComponent = segs[0] === "components";
    const slug = kebab(isComponent && segs.length > 1 ? segs.slice(1).join("-") : segs.join("-"));
    const title = (await docTitle(join(stagedKit, root, f))) || segs[segs.length - 1];
    items.push({
      slug,
      title,
      group: segs[0] || "docs",
      kind: isComponent ? "component" : "guide",
      summary: "",
      docs: [`${root}/${f}`],
      source: (bySlugSource[slug] || []).sort(),
    });
  }
  return items;
}

/** mui model: component pages under components/<page>/<page>.md + demos/; other trees are guides. */
async function buildMuiItems(stagedKit, spec) {
  const root = join(stagedKit, spec.docsRoot);
  const componentsDir = join(root, "components");
  const items = [];
  if (existsSync(componentsDir)) {
    for (const entry of (await readdir(componentsDir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue;
      const pageDir = join(componentsDir, entry.name);
      const pageFiles = await walkFiles(pageDir);
      const docs = pageFiles.filter((f) => DOC_EXT.test(f) && !f.startsWith("demos/")).sort();
      const demo = pageFiles.filter((f) => f.startsWith("demos/") && /\.(tsx|ts|jsx|js)$/.test(f)).sort();
      if (!docs.length && !demo.length) continue;
      const md = docs.find((f) => f === `${entry.name}.md`) || docs[0];
      items.push({
        slug: kebab(entry.name),
        title: entry.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "components",
        kind: "component",
        summary: "",
        docs: docs.map((f) => `${spec.docsRoot}/components/${entry.name}/${f}`),
        source: demo.map((f) => `${spec.docsRoot}/components/${entry.name}/${f}`),
        primaryDoc: md ? `${spec.docsRoot}/components/${entry.name}/${md}` : undefined,
      });
    }
  }
  const guides = await filesUnder(stagedKit, spec.docsRoot, (f) => DOC_EXT.test(f));
  const stripRoot = (p) => p.replace(new RegExp(`^${spec.docsRoot}/`), "");
  for (const p of guides) {
    const f = stripRoot(p);
    if (f.startsWith("components/")) continue;
    const noExt = f.replace(DOC_EXT, "");
    const segs = noExt.split("/");
    const slug = kebab(segs.join("-"));
    const title = (await docTitle(join(stagedKit, p))) || segs[segs.length - 1];
    items.push({ slug, title, group: segs[0] || "guides", kind: "guide", summary: "", docs: [p], source: [] });
  }
  return items;
}

/** antd model: one item per components/<name>/ dir with en-US docs, demos and source. */
async function buildAntdItems(stagedKit, spec) {
  const root = join(stagedKit, spec.componentsRoot);
  const items = [];
  const entries = (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(spec.componentsRoot, entry.name);
    const all = await walkFiles(join(stagedKit, dir));
    const docs = all.filter((f) => f === "index.en-US.md" || /^index\.[a-z-]+\.md$/.test(f)).sort();
    const demo = all.filter((f) => f.startsWith("demo/") && /\.(tsx|ts|md)$/.test(f)).sort();
    const source = all.filter((f) => !f.startsWith("demo/") && /\.(tsx|ts)$/.test(f) && !f.startsWith("style/")).sort();
    const style = all.filter((f) => f.startsWith("style/")).sort();
    if (!docs.length && !source.length && !demo.length) continue;
    items.push({
      slug: kebab(entry.name),
      title: entry.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      group: "components",
      kind: "component",
      summary: "",
      docs: docs.map((f) => `${dir}/${f}`),
      demo: demo.map((f) => `${dir}/${f}`),
      source: source.concat(style).map((f) => `${dir}/${f}`),
    });
  }
  return items;
}

/** primereact model: docs/<name>/*.js doc modules + matching source/<name>/ trees. */
async function buildPrimereactItems(stagedKit, spec) {
  const docsDir = join(stagedKit, spec.docsRoot);
  const items = [];
  if (existsSync(docsDir)) {
    const entries = (await readdir(docsDir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const docs = (await filesUnder(stagedKit, `${spec.docsRoot}/${entry.name}`, () => true)).sort();
      const source = await filesUnder(stagedKit, `${spec.sourceRoot}/${entry.name}`, (f) => CODE_EXT.test(f));
      if (!docs.length && !source.length) continue;
      items.push({
        slug: kebab(entry.name),
        title: entry.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "components",
        kind: "component",
        summary: "",
        docs,
        source: source.sort(),
      });
    }
  }
  return items;
}

/** shadcn model: items from the docs tree, source + registry matched by slug. */
async function buildShadcnItems(stagedKit, spec) {
  const items = [];
  // shadcn registry "files" entries are strings in some registries and
  // { path } objects in others; accept both.
  const regFilePath = (rf) => (typeof rf === "string" ? rf : rf?.path || "");
  if (spec.docsRoot) {
    const docsFiles = (await walkFiles(join(stagedKit, spec.docsRoot), "")).filter((f) => DOC_EXT.test(f)).sort();
    const sourceFiles = await filesUnder(stagedKit, spec.sourceRoot, () => true);
    const registryFiles = spec.registryRoot ? await filesUnder(stagedKit, spec.registryRoot, () => true) : [];
    for (const f of docsFiles) {
      const noExt = f.replace(DOC_EXT, "");
      const segs = noExt.split("/");
      const slug = kebab(segs[segs.length - 1]);
      const source = sourceFiles.filter((s) => {
        const parts = s.split("/");
        return parts.some((p) => kebab(p.replace(/\.[jt]sx?$/, "")) === slug);
      });
      const registry = registryFiles.filter((r) => kebab(r.replace(/\.json$/, "").split("/").pop()) === slug);
      const title = (await docTitle(join(stagedKit, spec.docsRoot, f))) || segs[segs.length - 1];
      items.push({
        slug,
        title,
        group: segs[0] || "components",
        kind: segs.length > 1 && segs[0] !== "components" ? "guide" : "component",
        summary: "",
        docs: [`${spec.docsRoot}/${f}`],
        source: source.sort(),
        registry,
      });
    }
    if (spec.registryFile && existsSync(join(stagedKit, spec.registryFile))) {
      // Registry entries without a docs page (magicui): itemize from the
      // upstream registry manifest so every component is reachable.
      const reg = await readJsonSafe(join(stagedKit, spec.registryFile));
      const seen = new Set(items.map((i) => i.slug));
      const sourceFiles = await filesUnder(stagedKit, spec.sourceRoot, () => true);
      for (const entry of reg?.items || []) {
        const slug = kebab(entry.name);
        if (!slug || seen.has(slug)) continue;
        const source = sourceFiles.filter((s) => (entry.files || []).some((rf) => s.endsWith(regFilePath(rf).split("/").pop())));
        items.push({
          slug,
          title: entry.name,
          group: Array.isArray(entry.categories) && entry.categories[0] ? kebab(entry.categories[0]) : "components",
          kind: "component",
          summary: entry.description || "",
          docs: [],
          source: source.sort(),
          registry: [],
        });
      }
    }
  } else {
    // motion primitives: no docs tree; itemize from registry JSONs then
    // sweep remaining source files.
    const registryFiles = spec.registryRoot ? await filesUnder(stagedKit, spec.registryRoot, () => true) : [];
    const sourceFiles = (await filesUnder(stagedKit, spec.sourceRoot, (f) => /\.(tsx|ts)$/.test(f))).sort();
    const seen = new Set();
    for (const r of registryFiles) {
      const reg = await readJsonSafe(join(stagedKit, r));
      const slug = kebab(reg?.name || r.replace(/\.json$/, "").split("/").pop());
      seen.add(slug);
      items.push({
        slug,
        title: reg?.name || slug,
        group: Array.isArray(reg?.categories) && reg.categories[0] ? kebab(reg.categories[0]) : "components",
        kind: "component",
        summary: reg?.description || "",
        docs: [],
        source: sourceFiles.filter((s) => kebab(s.split("/").pop().replace(/\.[jt]sx?$/, "")) === slug),
        registry: [r],
      });
    }
    for (const s of sourceFiles) {
      const slug = kebab(s.split("/").pop().replace(/\.[jt]sx?$/, ""));
      if (seen.has(slug)) continue;
      seen.add(slug);
      items.push({
        slug,
        title: slug,
        group: kebab(s.split("/").slice(0, -1).join("-")) || "components",
        kind: "component",
        summary: "",
        docs: [],
        source: [s],
        registry: [],
      });
    }
  }
  return items;
}

/** openprops model: one item per css token file; the README is the guide. */
async function buildOpenpropsItems(stagedKit, spec) {
  const items = [];
  const css = (await filesUnder(stagedKit, spec.assetsRoot, (f) => f.endsWith(".css"))).sort();
  const readme = join(stagedKit, spec.docsRoot, "README.md");
  for (const f of css) {
    const base = f.split("/").pop();
    const stem = base.replace(/\.min\.css$/, "").replace(/\.css$/, "");
    const slug = kebab(stem) || kebab(base);
    const main = /^open-props(\.min)?\.css$/.test(base);
    items.push({
      slug,
      title: stem || base,
      group: main ? "tokens" : "topics",
      kind: main ? "tokens" : "topic",
      summary: main ? "The full token sheet: colors, sizes, easing, shadows and more as CSS custom properties." : "",
      docs: main && existsSync(readme) ? [`${spec.docsRoot}/README.md`] : [],
      source: [f],
      previewable: true,
    });
  }
  return items;
}

const ITEM_BUILDERS = {
  "docs-tree": buildDocsTreeItems,
  mui: buildMuiItems,
  antd: buildAntdItems,
  primereact: buildPrimereactItems,
  shadcn: buildShadcnItems,
  openprops: buildOpenpropsItems,
};

function summarizeText(text, max = 160) {
  // Skip frontmatter, headings, code fences and html/embeds; the first plain
  // paragraph line is the summary.
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("```") || line.startsWith("<") || line.startsWith("import ")) continue;
    return line.replace(/^[-*>`[]+/, "").replace(/[:*]+$/, "").trim().slice(0, max);
  }
  return "";
}

// ---------------------------------------------------------------------- main

let pins = null;

/** Docs crawl: llms.txt index -> per-page markdown twins, robots-gated
 *  (the fetch-baseui pattern, generalized). Ark UI ships its docs this way. */
async function fetchDocsCrawl(stagedKit, crawl, pin, provenance, gaps) {
  const path = new URL(crawl.index).pathname;
  let gate = { ok: true, why: "" };
  try {
    gate = await robotsAllows(crawl.robots, path);
  } catch (e) {
    throw new Error(`robots.txt unreachable at ${crawl.robots}: ${e.message}`);
  }
  if (!gate.ok) throw new Error(`docs crawl refused: ${gate.why}`);

  if (crawl.licenseUrl) {
    let lic;
    try {
      lic = (await fetchBuffer(crawl.licenseUrl)).toString("utf8");
    } catch (e) {
      throw new LicenceError(`licence text unreachable at ${crawl.licenseUrl} (${e.message})`);
    }
    if (!licenseMatches(lic, pin.license.spdx)) throw new LicenceError(`licence no longer matches ${pin.license.spdx}; kit skipped`);
    provenance.license = { url: crawl.licenseUrl, spdx: pin.license.spdx, sha256: sha256(Buffer.from(lic)) };
  }

  await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  const index = (await fetchBuffer(crawl.index)).toString("utf8");
  const frame = crawl.framework || "react";
  const pages = [];
  for (const rawLine of index.split(/\r?\n/)) {
    const m = /^- \[(.+?)\]\((https?:\/\/[^)]+?)\)(?::\s*(.*))?$/.exec(rawLine.trim());
    if (!m) continue;
    const [, label, url] = m;
    const u = new URL(url);
    const mm = new RegExp(`^/${frame}/docs/(.+)$`).exec(u.pathname);
    if (mm) pages.push({ label, path: mm[1] });
  }
  if (!pages.length) throw new Error("llms.txt index yielded no doc pages");
  const cap = 200;
  const docsDir = join(stagedKit, "docs");
  await mkdir(docsDir, { recursive: true });
  let done = 0;
  for (const page of pages.slice(0, cap)) {
    await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
    const clean = page.path.replace(/[^\w./-]/g, "");
    try {
      const text = await fetchBuffer(crawl.pageBase + clean);
      const dest = join(docsDir, `${clean}.md`);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, text);
      done += 1;
    } catch (e) {
      gaps.push(`docs crawl: ${page.path} failed (${e.message})`);
    }
  }
  provenance.docsCrawl = { index: crawl.index, framework: frame, pages: pages.length, baked: done, cap };
  return done;
}

async function bakeKit(pin) {
  const { kit } = pin;
  const kitDir = join(UIKITS_DIR, kit);
  // Every scratch dir this kit creates is removed in the finally: one leaked
  // repo tarball per kit per run once filled the temp folder.
  const scratch = [];
  const staged = await mkdtemp(join(tmpdir(), `uikits-${kit}-`));
  scratch.push(staged);
  try {
    const { catalog, provenance } = await stageKit(pin, join(staged, kit), scratch);

    // Swap into the cache: only now touch <cache>/uikits/<kit>/. The incoming
    // dir is a sibling, so each rename is atomic and the kit is never
    // half-copied the way a delete-then-copy swap leaves it.
    await mkdir(dirname(kitDir), { recursive: true });
    const incoming = `${kitDir}.incoming`;
    const outgoing = `${kitDir}.outgoing`;
    await rm(incoming, { recursive: true, force: true });
    await cp(join(staged, kit), incoming, { recursive: true });
    await writeJsonAtomic(join(incoming, "provenance.json"), provenance);
    await rm(outgoing, { recursive: true, force: true });
    let replaced = false;
    try {
      await rename(kitDir, outgoing);
      replaced = true;
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await rename(incoming, kitDir);
    if (replaced) await rm(outgoing, { recursive: true, force: true });
    return catalog;
  } finally {
    for (const dir of scratch) await rm(dir, { recursive: true, force: true });
  }
}

/** Fetch, pick and catalog one kit into `stagedKit`. The caller swaps it in. */
async function stageKit(pin, stagedKit, scratch) {
  const { kit } = pin;
  await mkdir(stagedKit, { recursive: true });
  const gaps = [];
  const provenance = { fetchedAt: new Date().toISOString(), pin, gaps };

  if (pin.docsCrawl) {
    const baked = await fetchDocsCrawl(stagedKit, pin.docsCrawl, pin, provenance, gaps);
    if (!baked) throw new Error("the docs crawl is the core of this kit; fix the fetch and re-run");
  } else if (pin.kind === "pointer") {
    const buf = await fetchPointerLlms(pin.pointer, gaps);
    await mkdir(join(stagedKit, "pointer"), { recursive: true });
    await writeFile(join(stagedKit, "pointer", "llms.txt"), buf);
    provenance.pointer = {
      url: pin.pointer.llms,
      bytes: buf.length,
      sha256: sha256(buf),
      licenseNote: pin.pointer.license.note,
    };
  } else if (pin.source?.type === "npm") {
    const pkg = await fetchNpmPackage(pin.source.package, pin.source.version);
    scratch.push(pkg.dir);
    provenance.npm = { package: pin.source.package, version: pkg.version, integrity: pkg.integrity, tarballUrl: pkg.tarballUrl };
    const licPath = join(pkg.pkgDir, pin.license.file);
    if (!existsSync(licPath)) throw new LicenceError(`licence file ${pin.license.file} missing from the tarball`);
    const lic = await readFile(licPath, "utf8");
    if (!licenseMatches(lic, pin.license.spdx)) throw new LicenceError(`licence no longer matches ${pin.license.spdx}; kit skipped`);
    provenance.license = { file: pin.license.file, spdx: pin.license.spdx, sha256: sha256(Buffer.from(lic)) };
    const count = { n: 0 };
    for (const pick of pin.picks) await applyPick(stagedKit, pkg.pkgDir, pick, pin, count);
    await applyExtraFiles(stagedKit, pkg.pkgDir, pin.extraFiles, provenance);
  } else if (pin.source?.type === "github") {
    const tree = await fetchRepoTree(pin.source.repo, pin.source.ref);
    scratch.push(tree.dir);
    provenance.github = {
      repo: pin.source.repo,
      ref: pin.source.ref,
      sha: pin.source.ref,
      ...(pin.source.branch ? { branch: pin.source.branch } : {}),
      tarballUrl: tree.tarballUrl,
    };
    const licPath = join(tree.repoDir, pin.license.file);
    if (!existsSync(licPath)) throw new LicenceError(`licence file ${pin.license.file} missing from the repo tarball`);
    const lic = await readFile(licPath, "utf8");
    if (!licenseMatches(lic, pin.license.spdx)) throw new LicenceError(`licence no longer matches ${pin.license.spdx}; kit skipped`);
    provenance.license = { file: pin.license.file, spdx: pin.license.spdx, sha256: sha256(Buffer.from(lic)) };
    const count = { n: 0 };
    for (const pick of pin.picks) await applyPick(stagedKit, tree.repoDir, pick, pin, count);
    await applyExtraFiles(stagedKit, tree.repoDir, pin.extraFiles, provenance);
  } else {
    throw new Error(`unknown source type for ${kit}`);
  }

  // ------------------------------------------------------------ catalog
  const builder = ITEM_BUILDERS[pin.items?.model];
  let items = builder && pin.kind !== "pointer"
    ? await builder(stagedKit, pin.items || {})
    : [];
  if (pin.kind === "pointer") {
    // Pointer kits cache the first-party llms.txt index only, no code.
    items.push({
      slug: "catalog",
      title: `${pin.name} index (llms.txt)`,
      group: "index",
      kind: "index",
      summary: pin.pointer.license.note,
      docs: ["pointer/llms.txt"],
      source: [],
    });
  }
  // An item with nothing baked answers "no docs, no files" to every call, so
  // it is not listed: drop it and record how many went.
  const before = items.length;
  items = items.filter((i) => i.docs.length || i.source.length || i.demo?.length || i.registry?.length);
  if (items.length !== before) {
    gaps.push(`catalog: dropped ${before - items.length} item(s) with no baked doc, source or registry file`);
  }
  // Dedupe slugs (docs-tree pages can collide after kebab), keeping the first.
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.slug)) item.slug = `${item.slug}-${seen.size}`;
    seen.add(item.slug);
  }
  const catalog = {
    updatedAt: Date.now(),
    kit,
    name: pin.name,
    category: pin.category,
    kind: pin.kind,
    homepage: pin.homepage,
    usesTailwind: !!pin.usesTailwind,
    license: pin.kind === "pointer" ? pin.pointer.license : { spdx: pin.license.spdx, note: pin.note || "" },
    note: pin.note || "",
    itemsModel: pin.items?.model || null,
    totals: {
      items: items.length,
      docs: items.reduce((n, i) => n + i.docs.length, 0),
      source: items.reduce((n, i) => n + i.source.length, 0),
    },
    items: await Promise.all(items.map(async (i) => ({
      ...i,
      summary: i.summary || (i.docs.length ? summarizeText(await readFile(join(stagedKit, i.docs[0]), "utf8")) : ""),
    }))),
  };
  if (pin.kind === "pointer") {
    catalog.pointer = { install: pin.pointer.install, homepage: pin.homepage };
    catalog.totals.docs = 1;
  }
  await writeJsonAtomic(join(stagedKit, "catalog.json"), catalog);
  await writeJsonAtomic(join(stagedKit, "files.json"), { files: await fileManifest(stagedKit) });

  provenance.checksums = await checksumTree(stagedKit);
  return { catalog, provenance };
}

async function main() {
  pins = await readJsonSafe(PIN_PATH);
  if (!pins?.kits?.length) throw new Error(`missing or invalid ${PIN_PATH}`);
  const force = process.argv.includes("--force");
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const kits = pins.kits.filter((k) => !only.length || only.includes(k.kit));

  console.log(`UI kits layer -> ${UIKITS_DIR} (${kits.length} kit${kits.length === 1 ? "" : "s"}${force ? ", --force" : ""})`);
  await mkdir(UIKITS_DIR, { recursive: true });

  const rows = [];
  for (const pin of kits) {
    process.stdout.write(`  ${pin.kit} (${pin.kind}) ... `);
    try {
      const kitDir = join(UIKITS_DIR, pin.kit);
      const cachedCatalog = !force ? await readJsonSafe(join(kitDir, "catalog.json")) : null;
      const cachedProv = cachedCatalog ? await readJsonSafe(join(kitDir, "provenance.json")) : null;
      if (
        cachedCatalog &&
        cachedProv &&
        existsSync(join(kitDir, "files.json")) &&
        JSON.stringify(cachedProv.pin) === JSON.stringify(pin)
      ) {
        rows.push({
          kit: cachedCatalog.kit,
          name: cachedCatalog.name,
          category: cachedCatalog.category,
          kind: cachedCatalog.kind,
          homepage: cachedCatalog.homepage,
          usesTailwind: cachedCatalog.usesTailwind,
          license: cachedCatalog.license,
          note: cachedCatalog.note,
          totals: cachedCatalog.totals,
          version: null,
        });
        console.log(`up to date (${cachedCatalog.totals.items} items, matches pin)`);
        continue;
      }
      const catalog = await bakeKit(pin);
      rows.push({
        kit: catalog.kit,
        name: catalog.name,
        category: catalog.category,
        kind: catalog.kind,
        homepage: catalog.homepage,
        usesTailwind: catalog.usesTailwind,
        license: catalog.license,
        note: catalog.note,
        totals: catalog.totals,
        version: null,
      });
      console.log(`${catalog.totals.items} items, ${catalog.totals.docs} docs, ${catalog.totals.source} source files`);
    } catch (e) {
      if (e instanceof LicenceError) {
        // The pin no longer covers what is on disk, so stop serving it too.
        await rm(join(UIKITS_DIR, pin.kit), { recursive: true, force: true });
      }
      console.warn(`FAILED (recorded as a gap): ${e.message}`);
      rows.push({
        kit: pin.kit,
        name: pin.name,
        category: pin.category,
        kind: pin.kind,
        homepage: pin.homepage,
        usesTailwind: !!pin.usesTailwind,
        license: pin.kind === "pointer" ? pin.pointer.license : { spdx: pin.license?.spdx || "", note: "" },
        note: pin.note || "",
        totals: { items: 0, docs: 0, source: 0 },
        version: null,
        error: e.message,
      });
    }
  }

  const index = {
    updatedAt: Date.now(),
    totals: {
      kits: rows.length,
      baked: rows.filter((r) => !r.error && r.kind !== "pointer").length,
      items: rows.reduce((n, r) => n + r.totals.items, 0),
    },
    kits: rows,
  };
  // Partial runs (node scripts/fetch-uikits.mjs antd) merge into the existing
  // index instead of replacing it, so the other kits stay listed.
  const prev = await readJsonSafe(join(UIKITS_DIR, "index.json"));
  if (prev?.kits?.length) {
    const byKit = new Map(rows.map((r) => [r.kit, r]));
    for (const old of prev.kits) {
      if (!byKit.has(old.kit)) byKit.set(old.kit, old);
    }
    index.kits = [...byKit.values()];
    index.totals.kits = index.kits.length;
    index.totals.baked = index.kits.filter((r) => !r.error && r.kind !== "pointer").length;
    index.totals.items = index.kits.reduce((n, r) => n + (r.totals?.items || 0), 0);
  }
  await writeJsonAtomic(join(UIKITS_DIR, "index.json"), index);
  console.log(`index: ${index.totals.baked}/${index.totals.kits} kits baked, ${index.totals.items} items`);
  const failed = rows.filter((r) => r.error);
  if (failed.length) {
    console.warn(`${failed.length} kit(s) failed:`);
    for (const f of failed) console.warn(`  - ${f.kit}: ${f.error}`);
    process.exitCode = 1;
  }
  console.log("done");
}

main().catch((e) => {
  console.error("fetch-uikits failed:", e.message);
  process.exit(1);
});
