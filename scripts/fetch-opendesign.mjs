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
 * The OpenDesign packages are already self-contained (their preview HTML and
 * tokens.css reference no external fonts or images), so they work offline.
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
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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
} from "./lib/cache.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.indexOf(name);
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
  if (!stack) return null;
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

/** Read one design-systems/<slug> package. */
async function readSystem(dir, slug) {
  const read = async (rel) => {
    const p = join(dir, rel);
    if (!existsSync(p)) return null;
    return readFile(p, "utf8");
  };

  const manifestRaw = await read("manifest.json");
  if (!manifestRaw) return null;
  let manifest;
  try {
    manifest = JSON.parse(manifestRaw);
  } catch {
    return null;
  }

  const designMd = await read("DESIGN.md");
  const tokensCss = await read("tokens.css");
  const usageMd = await read("USAGE.md");
  const tokensJsonRaw = await read("design-tokens.json");
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
  if (tokensJson?.tokens?.length) {
    const typedColors = [];
    const typedFonts = [];
    for (const t of tokensJson.tokens) {
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
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .filter((s) => !onlySlug || s === onlySlug);

  if (!slugs.length) {
    console.error(`no design systems found under ${systemsDir}`);
    process.exit(1);
  }
  console.log(`systems  : ${slugs.length} to import\n`);

  const imported = [];
  for (const slug of slugs) {
    const sys = await readSystem(join(systemsDir, slug), slug);
    if (!sys) {
      console.log(`  MISS ${slug} (no manifest.json)`);
      continue;
    }
    const m = sys.manifest;
    const siteName = m.name || slug;
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
      industry: m.category || "",
      createdAt: m.generatedAt || tokensJsonTime(sys.tokensJson) || "",
      screenshotUrl: "",
      thumbnailUrl: "",
      // The upstream renderer expects this nesting, so the same DESIGN.md
      // template works for both sources.
      fullResult: {
        meta: {
          siteName,
          url,
          category: m.category || "",
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
      manifest: m,
      design: sys.designMd,
      usage: sys.usageMd,
      tokensCss: sys.tokensCss,
      tokens: sys.tokensJson,
      vars: sys.vars,
    });

    imported.push(entry);
    console.log(`  ok ${String(imported.length).padStart(4)}/${slugs.length}  ${siteName} (${slug})`);
  }

  // Merge into the shared catalog, replacing any previous import.
  //
  // Entries with no `source` tag predate the multi-source catalog and are
  // Refero styles — tag them so the two sources stay distinguishable.
  const { designs } = await readCatalog();
  const byId = new Map();
  for (const d of designs) {
    const source = d.source || SOURCE.REFERO;
    if (source === SOURCE.OPENDESIGN) continue;
    byId.set(d.id, { ...d, source });
  }
  for (const d of imported) byId.set(d.id, d);
  const merged = [...byId.values()];
  await writeCatalog(merged);
  const index = await writeIndex();

  console.log(
    `\ndone: ${imported.length} imported, catalog now ${merged.length} designs ` +
      `(${JSON.stringify(index.counts)})`,
  );
  console.log(
    "next: node scripts/fetch-thumbs.mjs   (Refero screenshots only — " +
      "OpenDesign previews are self-contained HTML)",
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
