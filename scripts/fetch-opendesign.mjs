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
import { lstat, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  CACHE_DIR,
  SOURCE,
  readCatalog,
  writeCatalog,
  writeDesign,
  writeIndex,
  writeOpenDesignPackage,
} from "./lib/cache.mjs";
import { encodePackageFile, isPackagePath, OPENDESIGN_SCHEMA } from "./lib/opendesign-package.mjs";

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

// ------------------------------------------------------------------ parsing
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Parse `tokens.css` into a flat { name: value } map.
 *
 * Trailing comments are stripped and only the first value token is kept, so
 * `--bg: #08090a;  /* marketing black *\/` yields `#08090a` — not the whole
 * remainder, which would fail any hex comparison.
 */
function parseTokensCss(css) {
  // Remove block comments first so commented-out declarations are ignored.
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const vars = {};
  // Match `--name: value;` including multi-line values.
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(withoutComments))) {
    const raw = m[2].trim();
    // A declaration value can be several tokens (`12px 1.5 #fff`). Keep the
    // whole thing for non-colors, but for a single colour keep just the hex.
    const first = raw.split(/\s+/)[0];
    vars[m[1]] = HEX_RE.test(first) ? first : raw;
  }
  return vars;
}

/** Pull the first quoted family out of a font stack. */
function primaryFont(stack) {
  if (typeof stack !== "string" || !stack) return null;
  const m = stack.match(/["']([^"']+)["']/);
  return m ? m[1] : stack.split(",")[0].trim() || null;
}

/**
 * Convert a tokens.css map into the color/font shape the catalog uses.
 * Colors come from the var map; fonts from `--font-*` vars.
 */
function extractTokens(vars) {
  const colors = [];
  const fonts = [];
  const seen = new Set();

  for (const [name, raw] of Object.entries(vars)) {
    const value = String(raw).trim();
    if (HEX_RE.test(value)) {
      if (seen.has(value.toLowerCase())) continue;
      seen.add(value.toLowerCase());
      colors.push({ hex: value.toLowerCase(), name: name.replace(/^--/, ""), role: "", group: "" });
    }
    if (name.startsWith("--font")) {
      const f = primaryFont(value);
      if (f && !fonts.includes(f)) fonts.push(f);
    }
  }

  return { colors, fonts };
}

/**
 * Decide light vs dark from the background token.
 * Uses relative luminance per WCAG, which is more reliable than a hex guess.
 */
function themeFromTokens(vars, colors) {
  const bg =
    vars["--bg"] ||
    vars["--background"] ||
    vars["--color-bg"] ||
    colors.find((c) => /bg|background|canvas/i.test(c.name))?.hex;
  if (!bg || !HEX_RE.test(bg)) return null;
  const hex = bg.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L < 0.35 ? "dark" : "light";
}

/**
 * The "north star" is the one-line vibe summary. OpenDesign writes it as the
 * opening blockquote of DESIGN.md, after the H1 and the `> Category:` line.
 */
function northStarFrom(md, manifest) {
  const lines = String(md || "").split(/\r?\n/);
  const out = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (line.startsWith("# ")) continue;
      if (line.trim().startsWith(">")) {
        started = true;
        continue;
      }
      if (line.trim() === "") continue;
      continue;
    }
    if (line.startsWith("## ")) break;
    if (line.startsWith(">")) {
      const t = line.replace(/^>\s*/, "").trim();
      if (t) out.push(t);
    } else if (out.length) break;
  }
  if (out.length) return out.join(" ").slice(0, 400);
  return manifest?.description || "";
}

// Reject symlinks in every path segment so a manifest cannot package files
// outside its own directory, including when importing a local checkout.
async function localPath(dir, path, directory = false) {
  if (!isPackagePath(path)) throw new Error("invalid package path");
  const parts = path.split("/");
  let full = dir;
  for (const [i, part] of parts.entries()) {
    full = join(full, part);
    let stat;
    try {
      stat = await lstat(full);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
    const expectDirectory = i < parts.length - 1 || directory;
    if (expectDirectory ? !stat.isDirectory() : !stat.isFile()) {
      throw new Error(`not a regular package ${directory ? "directory" : "path"}: ${path}`);
    }
  }
  return full;
}

async function readPackageFiles(dir, paths, files) {
  for (const path of paths) {
    if (files.has(path)) continue;
    const full = await localPath(dir, path);
    if (full) files.set(path, encodePackageFile(path, await readFile(full)));
  }
}

async function readPackageDirectory(dir, path, files) {
  const full = await localPath(dir, path, true);
  if (!full) return;
  for (const entry of await readdir(full, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) await readPackageDirectory(dir, child, files);
    else if (entry.isFile()) await readPackageFiles(dir, [child], files);
  }
}

/** Read the v1 manifest and its local files, or a legacy DESIGN.md folder. */
async function readSystem(dir, slug) {
  const packageFiles = new Map();
  await readPackageFiles(dir, ["manifest.json", "DESIGN.md", "tokens.css"], packageFiles);
  const readText = (path) => {
    const file = packageFiles.get(path);
    return file?.encoding === "utf8" ? file.content : null;
  };
  const manifest = packageFiles.has("manifest.json") ? JSON.parse(readText("manifest.json")) : null;
  if (packageFiles.has("manifest.json")) {
    if (manifest?.schemaVersion !== OPENDESIGN_SCHEMA || manifest.id !== slug ||
        manifest.files?.design !== "DESIGN.md" || manifest.files?.tokens !== "tokens.css") {
      throw new Error("manifest schema, package id, or required file declarations do not match");
    }
    const paths = [
      ...Object.values(manifest.files), manifest.usage, manifest.componentsManifest,
      ...Object.values(manifest.sourceFiles ?? {}),
      ...(manifest.preview?.pages ?? []).map((page) => page.path),
      ...(manifest.fonts ?? []).map((font) => font.file),
    ].filter((path) => path !== undefined);
    await readPackageFiles(dir, paths, packageFiles);
    for (const path of [manifest.assetsDir, manifest.previewDir, manifest.preview?.dir]) {
      if (path !== undefined) await readPackageDirectory(dir, path, packageFiles);
    }
  }

  const designMd = readText("DESIGN.md");
  const tokensCss = readText("tokens.css");
  if (!designMd?.trim() || (manifest && !tokensCss?.trim())) {
    throw new Error("missing or invalid DESIGN.md or required tokens.css");
  }
  const usageMd = readText(manifest?.usage);
  const tokensJsonRaw = readText(manifest?.files?.designTokens);
  let tokensJson = null;
  if (tokensJsonRaw) {
    try {
      tokensJson = JSON.parse(tokensJsonRaw);
    } catch {
      tokensJson = null;
    }
  }

  const vars = tokensCss ? parseTokensCss(tokensCss) : {};
  let { colors, fonts } = extractTokens(vars);

  // design-tokens.json is richer (typed, layered) — prefer it when present.
  if (Array.isArray(tokensJson?.tokens)) {
    const typedColors = [];
    const typedFonts = [];
    for (const t of tokensJson.tokens) {
      if (!t) continue;
      if (t.type === "color" && HEX_RE.test(String(t.value || ""))) {
        typedColors.push({
          hex: String(t.value).toLowerCase(),
          name: String(t.name || "").replace(/^--/, ""),
          role: t.reason || "",
          group: t.layer || "",
        });
      } else if (t.type === "fontFamily") {
        const f = primaryFont(t.value);
        if (f && !typedFonts.includes(f)) typedFonts.push(f);
      }
    }
    if (typedColors.length) colors = typedColors;
    if (typedFonts.length) fonts = typedFonts;
  }

  const theme = themeFromTokens(vars, colors) || "light";

  return {
    manifest,
    designMd,
    usageMd,
    tokensCss,
    tokensJson,
    packageFiles: [...packageFiles.values()].sort((a, b) => a.path.localeCompare(b.path)),
    vars,
    colors,
    fonts,
    theme,
  };
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

  const slugs = (await readdir(systemsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && /^[a-z0-9-]+$/.test(e.name))
    .map((e) => e.name)
    .filter((s) => !onlySlug || s === onlySlug);

  if (!slugs.length) {
    console.error(`no design systems found under ${systemsDir}`);
    process.exit(1);
  }
  console.log(`systems  : ${slugs.length} to import\n`);

  const imported = [];
  for (const slug of slugs) {
    let sys;
    try {
      sys = await readSystem(join(systemsDir, slug), slug);
    } catch (error) {
      console.warn(`  SKIP ${slug}: ${error.message}`);
      continue;
    }
    const m = sys.manifest ?? {};
    const siteName = m.name || /^#\s+([^\r\n]+)/m.exec(sys.designMd)?.[1].trim() || slug;
    const category = m.category || /^>\s*Category:\s*([^\r\n]+)/im.exec(sys.designMd)?.[1].trim() || "";
    const url =
      m.url || `https://github.com/nexu-io/open-design/tree/main/${SUBTREE}/${slug}`;

    const entry = {
      id: slug,
      source: SOURCE.OPENDESIGN,
      siteName,
      url,
      northStar: northStarFrom(sys.designMd, m),
      colorScheme: sys.theme,
      colors: sys.colors,
      fonts: sys.fonts,
      industry: category,
      createdAt: m.generatedAt || tokensJsonTime(sys.tokensJson) || "",
      screenshotUrl: "",
      thumbnailUrl: "",
      // The upstream renderer expects this nesting, so the same DESIGN.md
      // template works for both sources.
      fullResult: {
        meta: {
          siteName,
          url,
          category,
        },
        designSystem: {
          theme: sys.theme,
          colors: sys.colors,
          fonts: sys.fonts,
          typeScale: typeScaleFrom(sys.vars),
          dos: [],
          donts: [],
        },
        raw: {
          colors: { tokens: sys.colors },
          typography: { fonts: sys.fonts },
        },
      },
    };

    await writeDesign(slug, SOURCE.OPENDESIGN, {
      manifest: sys.manifest,
      design: sys.designMd,
      usage: sys.usageMd,
      tokensCss: sys.tokensCss,
      tokens: sys.tokensJson,
      vars: sys.vars,
    });
    await writeOpenDesignPackage(slug, sys.packageFiles);

    imported.push(entry);
    console.log(`  ok ${String(imported.length).padStart(4)}/${slugs.length}  ${siteName} (${slug})`);
  }

  if (!imported.length) throw new Error("no valid OpenDesign packages imported; catalog unchanged");

  // A refresh replaces only the packages it successfully imported. A single
  // slug refresh or malformed package must not remove other cached systems.
  const { designs } = await readCatalog();
  const byId = new Map();
  for (const d of designs) {
    const source = d.source || SOURCE.REFERO;
    byId.set(`${source}:${d.id}`, { ...d, source });
  }
  for (const d of imported) byId.set(`${d.source}:${d.id}`, d);
  const merged = [...byId.values()];
  await writeCatalog(merged);
  const index = await writeIndex();

  console.log(
    `\ndone: ${imported.length} imported, catalog now ${merged.length} designs ` +
      `(${JSON.stringify(index.counts)})`,
  );
  console.log(
    "next: node scripts/fetch-thumbs.mjs   (Refero screenshots only)",
  );
}

function tokensJsonTime(tokensJson) {
  if (!tokensJson?.generatedAt) return "";
  const d = new Date(tokensJson.generatedAt);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Build a type scale from the --text-* dimension tokens. */
function typeScaleFrom(vars) {
  const rows = [];
  for (const [name, raw] of Object.entries(vars)) {
    if (!name.startsWith("--text-")) continue;
    const m = String(raw).trim().match(/^([\d.]+)px$/);
    if (!m) continue;
    rows.push({ role: name.replace(/^--text-/, ""), size: m[1], lineHeight: "" });
  }
  const order = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];
  rows.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
  return rows;
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
