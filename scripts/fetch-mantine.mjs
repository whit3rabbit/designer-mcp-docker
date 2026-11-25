#!/usr/bin/env node
/**
 * fetch-mantine.mjs — cache the Mantine UI catalog (https://ui.mantine.dev).
 *
 * Clones mantinedev/ui.mantine.dev (or reads from --source <dir>) and extracts
 * what the site's own data/components.ts serves:
 *   - every component folder under lib/: the TSX, CSS modules and images
 *   - attributes.json per component: title, category, canvas options
 *   - the category tree from data/categories.ts and its illustrations
 *   - the photos and avatars the demos load from remote hosts, downloaded
 *     once so offline previews never leave the origin
 *
 * The catalog is MIT licensed; the LICENCE travels with the cache.
 *
 * Cache layout:
 *   <cache>/mantine/index.json
 *   <cache>/mantine/components/<slug>.json
 *   <cache>/mantine/images/<category>-{light,dark}.svg
 *   <cache>/mantine/assets/<sha256 prefix>.<ext>  + assets.json
 *   <cache>/mantine/source/<Component>/...
 *   <cache>/mantine/vendor/<npm>/<version>/...    runtime packages (pin.json)
 *   <cache>/mantine/provenance.json               versions, urls, checksums
 *   <cache>/mantine/LICENCE
 *
 * The catalog is staged beside the old one and swapped in as a unit, so a
 * failed fetch leaves the previous catalog whole.
 *
 * Usage:
 *   node scripts/fetch-mantine.mjs
 *   node scripts/fetch-mantine.mjs --source /path/to/ui.mantine.dev
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN_PATH = join(HERE, "..", "data", "mantine", "pin.json");

const REPO = "https://github.com/mantinedev/ui.mantine.dev.git";
const SITE = "https://ui.mantine.dev/";
const USER_AGENT = "designer-mcp-fetch/1.0 (+https://github.com/whit3rabbit/designer-mcp-docker)";
const FETCH_USER_AGENT = `${USER_AGENT} vendor`;
const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};

const MANTINE_DIR = join(CACHE_DIR, "mantine");

const IMAGE_EXTENSION = /\.(?:png|jpe?g|gif|webp|avif|svg)$/i;
/** Image hosts whose URLs carry no file extension. */
const IMAGE_HOSTS = new Set(["images.unsplash.com"]);

/** Is this URL something a demo loads as an image, not a link it navigates to? */
function isRemoteImage(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return IMAGE_HOSTS.has(hostname) || IMAGE_EXTENSION.test(pathname);
  } catch {
    return false;
  }
}

/** The site's own slug: ButtonMenu -> button-menu (data/components.ts convertCase). */
const toSlug = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(" ").join("-");

/** A file a reader needs to copy the component. Stories and tests stay behind. */
const isSourceFile = (file) => /\.(?:tsx|ts|css)$/.test(file) && !/\.(?:story|test)\.tsx$/.test(file);
const isBinaryAsset = (file) => IMAGE_EXTENSION.test(file);
const languageOf = (file) => (file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "tsx" : "ts");

async function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** Every regular file under a directory, as POSIX paths relative to it. */
async function listFiles(dir, prefix = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await listFiles(join(dir, entry.name), rel)));
    else if (entry.isFile()) files.push(rel);
  }
  return files.sort();
}

/**
 * The category tree, read out of data/categories.ts without running it.
 * Each category names its illustration through the `images` map, so the
 * illustration key is picked up alongside the slug. Fields are read
 * individually — upstream names like "Drag'n'Drop" mix quote styles inside
 * one object, so a single object-wide regex cannot stay honest.
 */
function parseCategories(text) {
  const groups = [];
  const groupRe = /name:\s*(['"])([^'"]+)\1,\s*categories:\s*\[([\s\S]*?)\n\s*\]/g;
  const slugRe = /slug:\s*(['"])([^'"]+)\1/;
  // A quoted string either way, allowing the other quote inside (and escapes).
  const stringRe = (field) =>
    new RegExp(`${field}:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)')`);
  const imageRe = /images:\s*images(?:\.([\w$-]+)|\[\s*(['"])([^'"]+)\2\s*\])/;
  for (const [, , groupName, body] of text.matchAll(groupRe)) {
    const categories = [];
    for (const { 0: entry } of body.matchAll(/\{[^{}]*\}/g)) {
      const slug = slugRe.exec(entry)?.[2];
      const named = stringRe("name").exec(entry);
      const image = imageRe.exec(entry);
      if (!slug || !named) continue;
      categories.push({
        slug,
        name: (named[1] ?? named[2] ?? "").replace(/\\(['"])/g, "$1"),
        image: image ? (image[3] ?? image[1]) : null,
      });
    }
    if (categories.length) groups.push({ name: groupName, categories });
  }
  return groups;
}

/**
 * What a component's sources depend on: npm packages, sibling components it
 * reaches into (NavbarNested imports UserButton), and the remote images its
 * demos load. Returns sets, in first-seen order.
 */
function scanDependencies(folder, sources) {
  const packages = new Set();
  const siblings = new Set();
  const remote = new Set();
  for (const { rel, code } of sources) {
    const specifiers = [
      ...[...code.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((m) => m[1]),
      ...[...code.matchAll(/\bimport\s+["']([^"']+)["']/g)].map((m) => m[1]),
    ];
    for (const specifier of specifiers) {
      if (!specifier.startsWith(".")) {
        const parts = specifier.split("/");
        packages.add(specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]);
        continue;
      }
      const target = posix.normalize(posix.join(posix.dirname(rel), specifier));
      const targetFolder = target.split("/")[0];
      if (targetFolder !== folder) siblings.add(targetFolder);
    }
    for (const match of code.matchAll(/https?:\/\/[^\s"'`)]+/g)) {
      if (isRemoteImage(match[0])) remote.add(match[0]);
    }
  }
  return { packages, siblings, remote };
}

/** The image type of a payload, from its bytes rather than a host's headers. */
function sniffImage(bytes) {
  const text = (start, end) => bytes.subarray(start, end).toString("latin1");
  if (text(1, 4) === "PNG") return ["png", "image/png"];
  if (text(0, 3) === "\xff\xd8\xff") return ["jpg", "image/jpeg"];
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return ["webp", "image/webp"];
  if (text(0, 4) === "GIF8") return ["gif", "image/gif"];
  if (text(4, 8) === "ftyp" && /avif|avis/.test(text(8, 12))) return ["avif", "image/avif"];
  const head = text(0, 4096).trimStart();
  if (head.startsWith("<") && /<svg[\s>]/.test(head)) return ["svg", "image/svg+xml"];
  return null;
}

/**
 * Download the demos' remote images into the staging directory.
 *
 * Files are named by a hash of their URL, so a re-fetch reuses whatever the
 * previous fetch already cached. A host that fails is reported and skipped:
 * the preview build falls back to a placeholder for that URL.
 */
async function cacheRemoteImages(urls, previous, stage) {
  const assets = {};
  const queue = [...urls].sort();
  const failed = [];

  async function fetchImage(url) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = Buffer.from(await res.arrayBuffer());
        const kind = sniffImage(bytes);
        if (!kind) throw new Error(`not an image (${res.headers.get("content-type")})`);
        return { bytes, kind };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  async function worker() {
    while (queue.length) {
      const url = queue.shift();
      const key = createHash("sha256").update(url).digest("hex").slice(0, 16);
      const cached = previous?.[url];
      const cachedPath = cached && join(MANTINE_DIR, "assets", cached.file);
      if (cachedPath && existsSync(cachedPath)) {
        await copyFile(cachedPath, join(stage, "assets", cached.file));
        assets[url] = cached;
        continue;
      }
      try {
        const { bytes, kind } = await fetchImage(url);
        const [extension, mime] = kind;
        const file = `${key}.${extension}`;
        await writeFile(join(stage, "assets", file), bytes);
        assets[url] = { file, bytes: bytes.length, mime };
      } catch (error) {
        failed.push(`${url.split("?")[0]} (${error.message})`);
      }
    }
  }

  await Promise.all(Array.from({ length: 4 }, worker));
  return { assets, failed };
}

// ------------------------------------------------------------------- vendor
// The demos import real npm packages (@mantine/*, icons, dnd-kit, embla, ...),
// and the frontend build bundles those imports for the live previews without
// any network or registry access. The vendor stage downloads the pinned
// tarballs once so `<cache>/mantine/vendor/<name>/<version>/` carries the ESM
// output the bundler needs. react/react-dom are deliberately absent: the
// frontend build already provides them.

/** Verify an npm registry `dist.integrity` string ("sha512-<base64>"). */
function integrityOk(buf, integrity) {
  const [algo, digest] = String(integrity || "").split("-");
  if (algo !== "sha512" || !digest) return false;
  return createHash("sha512").update(buf).digest("base64") === digest;
}

/** Extract a .tgz into destDir with the system tar (like fetch-heroui). */
function extractTarball(tgzPath, destDir) {
  const res = spawnSync("tar", ["-xzf", tgzPath, "-C", destDir], { stdio: "pipe" });
  if (res.status !== 0) {
    throw new Error(`tar extraction failed for ${tgzPath}: ${res.stderr?.toString().slice(0, 300)}`);
  }
}

/** The @tabler/icons-react named imports across a component's sources. */
function tablerIconNames(codes) {
  const names = new Set();
  for (const code of codes) {
    for (const match of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']@tabler\/icons-react["']/g)) {
      for (const clause of match[1].split(",")) {
        const name = clause.split(/\s+as\s+/)[0].trim();
        // "Icon2fa" and friends: a digit may follow the prefix.
        if (/^Icon\w/.test(name)) names.add(name);
      }
    }
  }
  return names;
}

/**
 * Drop what the bundler never reads: prebuilt CJS trees, TypeScript
 * declarations, dayjs locales beyond English and every tabler icon the demos
 * do not import. The tarball integrity recorded in provenance.json still
 * describes the untouched download, so the prune is re-runnable.
 */
async function pruneVendorPackage(pkgDir, name, usedIcons) {
  const rmTree = (rel) => rm(join(pkgDir, rel), { recursive: true, force: true });
  await rmTree("cjs");
  await rmTree("lib");
  await rmTree("umd");
  if (name === "@tabler/icons-react") {
    // The per-icon ESM modules are the tree-shaking surface: keep the demo
    // icons and the two helpers they import, drop the other 6000. The barrel
    // re-exports every icon by name (and its aliases), so it is rewritten
    // with only the kept icons — the original references ./icons/index.mjs,
    // which imports all of them.
    const esmDir = join(pkgDir, "dist", "esm");
    const iconsDir = join(esmDir, "icons");
    const barrelPath = join(esmDir, "tabler-icons-react.mjs");
    if (existsSync(iconsDir) && existsSync(barrelPath)) {
      const kept = [];
      const keptFiles = new Set();
      for (const line of (await readFile(barrelPath, "utf8")).split("\n")) {
        const m = /from\s+["']\.\/icons\/([\w]+)\.mjs["']/.exec(line);
        // A line exports one icon file under several names (aliases), and
        // the file name is the last alias — keep the line when any name it
        // publishes is one the demos import.
        if (!m) continue;
        const publishes = [...line.matchAll(/default as (\w+)/g)].map((n) => n[1]);
        if (usedIcons.has(m[1]) || publishes.some((n) => usedIcons.has(n))) {
          kept.push(line.trim());
          keptFiles.add(m[1]);
        }
      }
      await writeFile(
        barrelPath,
        `/* @tabler/icons-react, pruned to the icons the baked demos import (MIT, https://tabler.io/icons) */\n${kept.join("\n")}\n`,
      );
      for (const entry of await readdir(esmDir)) {
        if (entry === "icons" || entry === "createReactComponent.mjs" ||
            entry === "defaultAttributes.mjs" || entry === "tabler-icons-react.mjs") continue;
        await rm(join(esmDir, entry), { recursive: true, force: true });
      }
      for (const entry of await readdir(iconsDir)) {
        if (!keptFiles.has(entry.replace(/\.mjs$/, ""))) await rm(join(iconsDir, entry), { force: true });
      }
    }
    await rmTree("dist/cjs");
    await rmTree("dist/types");
  }
  if (name === "dayjs") {
    const localeDir = join(pkgDir, "locale");
    if (existsSync(localeDir)) {
      for (const entry of await readdir(localeDir)) {
        if (entry !== "en.js" && entry !== "en.min.js") await rm(join(localeDir, entry), { force: true });
      }
    }
    await rmTree("locale/types");
    await rmTree("umd");
  }
  // Declarations and maps are dead weight everywhere.
  for (const rel of ["dist/types", "types"]) await rmTree(rel);
  for (const entry of await readdir(pkgDir)) {
    if (/\.(?:d\.ts|d\.mts|d\.cts|tsbuildinfo|map)$/.test(entry)) await rm(join(pkgDir, entry), { force: true });
  }
}

/**
 * Download (or reuse from the previous cache) every pinned package into the
 * staging tree. Fail-soft per package: a failure records a gap and the
 * frontend build later treats demos that need the missing package as
 * source-only.
 */
async function vendorPackages(pin, previousProvenance, stage, usedIcons, gaps) {
  const vendored = {};
  const queue = Object.entries(pin.packages || {});
  const total = queue.length;
  if (!total) throw new Error(`no packages in ${PIN_PATH}`);
  const reused = [];
  async function worker() {
    while (queue.length) {
      const [name, version] = queue.shift();
      const dest = join(stage, "vendor", name, version);
      const previousDir = previousProvenance && join(MANTINE_DIR, "vendor", name, version);
      let record;
      try {
        if (previousDir && existsSync(join(previousDir, "package.json"))) {
          await cp(previousDir, dest, { recursive: true });
          reused.push(`${name}@${version}`);
          record = { ...(previousProvenance?.packages?.[name] || {}), version, reused: true };
        } else {
          const metaUrl = `https://registry.npmjs.org/${name}/${version}`;
          const res = await fetch(metaUrl, { headers: { "user-agent": FETCH_USER_AGENT }, signal: AbortSignal.timeout(60000) });
          if (!res.ok) throw new Error(`HTTP ${res.status} for registry metadata`);
          const meta = await res.json();
          const tarballUrl = meta.dist?.tarball;
          const integrity = meta.dist?.integrity;
          if (!tarballUrl) throw new Error("registry metadata has no tarball");
          const buf = await (await fetch(tarballUrl, {
            headers: { "user-agent": FETCH_USER_AGENT }, signal: AbortSignal.timeout(120000),
          })).arrayBuffer();
          const bytes = Buffer.from(buf);
          if (integrity && !integrityOk(bytes, integrity)) throw new Error("tarball integrity mismatch");
          const work = await mkdtemp(join(tmpdir(), "mantine-vendor-"));
          try {
            const tgz = join(work, "pkg.tgz");
            await writeFile(tgz, bytes);
            // The tarball unpacks to <work>/package/... (npm layout).
            extractTarball(tgz, work);
            const pkgDir = join(work, "package");
            await pruneVendorPackage(pkgDir, name, usedIcons);
            await mkdir(dirname(dest), { recursive: true });
            await cp(pkgDir, dest, { recursive: true });
          } finally {
            await rm(work, { recursive: true, force: true });
          }
          record = { version, integrity: integrity || "", tarballUrl };
        }
        vendored[name] = record;
      } catch (error) {
        gaps.push(`vendor: ${name}@${version} failed (${error.message})`);
        console.warn(`  ! vendor ${name}@${version} failed: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  const count = Object.keys(vendored).length;
  const bytes = count ? (await dirSize(join(stage, "vendor"))) : 0;
  console.log(`  vendor: ${count}/${total} packages${reused.length ? ` (${reused.length} reused)` : ""} (${(bytes / 1e6).toFixed(1)}MB)`);
  return vendored;
}

/** Total bytes of every file under a directory (vendor size reporting). */
async function dirSize(dir) {
  let total = 0;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) total += await dirSize(join(dir, entry.name));
    else total += (await stat(join(dir, entry.name))).size;
  }
  return total;
}

/**
 * Category illustration keys resolve through data/images/index.ts: several
 * categories share one art file (app-cards and article-cards both use the
 * "cards" svgs), so the key is not the file name. The import lines give
 * identifier -> file; the default export gives key -> {light, dark} files.
 * The legacy <key>-<theme>.svg convention stays as the fallback.
 */
function parseIllustrationIndex(text) {
  const imports = new Map();
  for (const match of text.matchAll(/import\s+(\w+)\s+from\s+["']\.\/([\w-]+\.svg)["']/g)) {
    imports.set(match[1], match[2]);
  }
  const index = {};
  for (const match of text.matchAll(/["']([\w-]+)["']:\s*\{\s*light:\s*(\w+)\.src\s*,\s*dark:\s*(\w+)\.src\s*\}/g)) {
    const [, key, light, dark] = match;
    const lightFile = imports.get(light);
    const darkFile = imports.get(dark);
    if (lightFile && darkFile) index[key] = { light: lightFile, dark: darkFile };
  }
  return index;
}

async function run() {
  let sourceDir = argVal("--source");
  let tempDir = null;
  const force = process.argv.includes("--force");

  if (!sourceDir && !force && existsSync(join(MANTINE_DIR, "index.json"))) {
    const pin = await readJsonSafe(PIN_PATH);
    const prior = await readJsonSafe(join(MANTINE_DIR, "provenance.json"));
    if (pin && prior && JSON.stringify(prior.pin) === JSON.stringify(pin)) {
      console.log(`Mantine layer -> ${MANTINE_DIR} (up to date, matches pin; pass --force to refetch)`);
      return;
    }
  }

  if (!sourceDir) {
    tempDir = await mkdtemp(join(tmpdir(), "mantine-fetch-"));
    sourceDir = join(tempDir, "repo");
    console.log(`Cloning ${REPO}...`);
    const clone = spawnSync(
      "git",
      ["clone", "--depth", "1", "--filter=blob:none", "--sparse", REPO, sourceDir],
      { stdio: "inherit" },
    );
    if (clone.status !== 0) throw new Error(`git clone failed with status ${clone.status}`);
    const sparse = spawnSync("git", ["-C", sourceDir, "sparse-checkout", "set", "lib", "data"], {
      stdio: "inherit",
    });
    if (sparse.status !== 0) throw new Error(`git sparse-checkout failed with status ${sparse.status}`);
  }

  const stage = `${MANTINE_DIR}.tmp.${process.pid}`;
  try {
    const libDir = join(sourceDir, "lib");
    if (!existsSync(libDir)) throw new Error(`Missing ${libDir}`);
    for (const dir of ["components", "images", "assets"]) {
      await mkdir(join(stage, dir), { recursive: true });
    }

    // ------------------------------------------------------------ components
    const components = [];
    const allRemote = new Set();
    const allIcons = new Set();
    const folders = (await readdir(libDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const name of folders) {
      const folder = join(libDir, name);
      const attributes = await readJsonSafe(join(folder, "attributes.json"));
      if (!attributes) {
        console.warn(`  ! skipping ${name}: no attributes.json`);
        continue;
      }
      const files = await listFiles(folder);
      const sourceFiles = files.filter(isSourceFile);
      // The site leads with the main file and lists the rest as authored.
      const main = `${name}.tsx`;
      if (!sourceFiles.includes(main)) throw new Error(`${name} has no ${main} to lead with`);
      const ordered = [main, ...sourceFiles.filter((file) => file !== main)];
      const sources = [];
      for (const file of ordered) {
        const code = await readFile(join(folder, file), "utf8");
        sources.push({ rel: `${name}/${file}`, code });
      }
      const { packages, siblings, remote } = scanDependencies(name, sources);
      for (const url of remote) allRemote.add(url);
      for (const icon of tablerIconNames(sources.map(({ code }) => code))) allIcons.add(icon);

      const assets = [];
      for (const file of files.filter(isBinaryAsset)) {
        await mkdir(dirname(join(stage, "source", name, file)), { recursive: true });
        await copyFile(join(folder, file), join(stage, "source", name, file));
        assets.push({ name: file, path: posix.join("source", name, file) });
      }
      for (const { rel, code } of sources) {
        await mkdir(dirname(join(stage, "source", rel)), { recursive: true });
        await writeFile(join(stage, "source", rel), code);
      }

      components.push({
        slug: toSlug(name),
        name,
        title: attributes.title || name,
        category: attributes.category,
        attributes,
        packages: [...packages].sort(),
        siblings: [...siblings].sort(),
        remote: [...remote].sort(),
        files: sources.map(({ rel, code }) => ({ name: rel.slice(name.length + 1), language: languageOf(rel), code })),
        assets,
      });
    }
    if (!components.length) throw new Error("No components with attributes.json under lib/");
    const byFolder = new Map(components.map((c) => [c.name, c]));
    if (new Set(components.map((c) => c.slug)).size !== components.length) {
      throw new Error("Two components share a slug");
    }
    for (const c of components) {
      for (const folder of c.siblings) {
        if (!byFolder.has(folder)) throw new Error(`${c.name} imports "${folder}", which is not a component in lib/`);
      }
    }

    // ------------------------------------------------------------- categories
    const groups = parseCategories(await readFile(join(sourceDir, "data", "categories.ts"), "utf8"));
    if (!groups.length) throw new Error("Could not read any category group out of data/categories.ts");
    const filed = new Map(groups.flatMap((g) => g.categories.map((c) => [c.slug, { ...c, group: g.name }])));
    for (const c of components) {
      if (filed.has(c.category)) continue;
      console.warn(`  ! ${c.name} is filed under unknown category "${c.category}"; filing it under Other`);
      filed.set(c.category, { slug: c.category, name: c.category, image: null, group: "Other" });
    }
    const groupList = [];
    const imagesIndexPath = join(sourceDir, "data", "images", "index.ts");
    const illustrationIndex =
      existsSync(imagesIndexPath) ? parseIllustrationIndex(await readFile(imagesIndexPath, "utf8")) : {};
    for (const category of filed.values()) {
      let group = groupList.find((g) => g.name === category.group);
      if (!group) groupList.push((group = { name: category.group, categories: [] }));
      let image = null;
      if (category.image) {
        image = {};
        for (const theme of ["light", "dark"]) {
          const file = illustrationIndex[category.image]?.[theme] || `${category.image}-${theme}.svg`;
          const from = join(sourceDir, "data", "images", file);
          if (!existsSync(from)) {
            console.warn(`  ! missing category illustration ${file}`);
            image = null;
            break;
          }
          await copyFile(from, join(stage, "images", file));
          image[theme] = `images/${file}`;
        }
      }
      group.categories.push({
        slug: category.slug,
        name: category.name,
        count: components.filter((c) => c.category === category.slug).length,
        ...(image && { image }),
      });
    }

    // ---------------------------------------------------------- remote images
    const previous = await readJsonSafe(join(MANTINE_DIR, "assets.json"));
    const { assets, failed } = await cacheRemoteImages(allRemote, previous, stage);
    await writeJsonAtomic(join(stage, "assets.json"), assets);

    // ---------------------------------------------------------------- vendor
    const pin = await readJsonSafe(PIN_PATH);
    if (!pin?.packages) {
      console.warn(`  ! no pin at ${PIN_PATH}; demos will build source-only`);
    }
    const vendorGaps = [];
    const previousProvenance = await readJsonSafe(join(MANTINE_DIR, "provenance.json"));
    const vendored = pin?.packages
      ? await vendorPackages(pin, previousProvenance, stage, allIcons, vendorGaps)
      : {};
    const fetchedAt = new Date().toISOString();
    await writeJsonAtomic(join(stage, "provenance.json"), {
      fetchedAt,
      pin: pin || null,
      packages: vendored,
      tablerIconsVendored: [...allIcons].sort(),
      gaps: vendorGaps,
    });

    // ------------------------------------------------------------- the records
    for (const c of components) {
      await writeJsonAtomic(join(stage, "components", `${c.slug}.json`), {
        slug: c.slug,
        name: c.name,
        title: c.title,
        category: c.category,
        attributes: c.attributes,
        packages: c.packages,
        requires: c.siblings.map((folder) => ({ slug: byFolder.get(folder).slug, name: folder })),
        files: c.files,
        assets: c.assets,
        remote: c.remote.flatMap((url) => (assets[url] ? [{ url, ...assets[url] }] : [])),
      });
    }

    const pkg = await readJsonSafe(join(sourceDir, "package.json"));
    const commit = existsSync(join(sourceDir, ".git"))
      ? spawnSync("git", ["-C", sourceDir, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim()
      : null;
    await writeJsonAtomic(join(stage, "index.json"), {
      updatedAt: new Date().toISOString(),
      source: {
        repo: "https://github.com/mantinedev/ui.mantine.dev",
        site: SITE,
        commit,
        mantine: pkg?.dependencies?.["@mantine/core"] ?? null,
        license: "MIT",
      },
      total: components.length,
      groups: groupList,
      packages: [...new Set(components.flatMap((c) => c.packages))].sort(),
      components: components.map((c) => ({
        slug: c.slug,
        name: c.name,
        title: c.title,
        category: c.category,
        responsive: Boolean(c.attributes.responsive),
        fileCount: c.files.length,
        packages: c.packages,
        requires: c.siblings.map((folder) => byFolder.get(folder).slug),
      })),
    });
    if (existsSync(join(sourceDir, "LICENCE"))) {
      await copyFile(join(sourceDir, "LICENCE"), join(stage, "LICENCE"));
    }

    await rm(MANTINE_DIR, { recursive: true, force: true });
    await rename(stage, MANTINE_DIR);

    const imageBytes = Object.values(assets).reduce((total, asset) => total + asset.bytes, 0);
    console.log(
      `Cached Mantine: ${components.length} components in ${filed.size} categories, ` +
        `${Object.keys(assets).length} remote images (${(imageBytes / 1e6).toFixed(1)}MB), ` +
        `${Object.keys(vendored).length} vendored packages -> ${MANTINE_DIR}`,
    );
    if (failed.length) {
      console.warn(`  ! ${failed.length} remote image(s) could not be cached; previews will show a placeholder:`);
      for (const line of failed) console.warn(`      ${line}`);
    }
  } finally {
    await rm(stage, { recursive: true, force: true });
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
