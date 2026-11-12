#!/usr/bin/env node
/**
 * design-agentkit — import the Open Design Agent Kit into the cache.
 *
 * Source: https://github.com/feimacode/open-design-agent-kit (MIT)
 *
 * The Agent Kit is a THIRD source alongside Refero and nexu-io/open-design.
 * It contributes three layers the other sources do not have:
 *
 *   1. 46 design systems that do not exist upstream at all — 30 iOS app
 *      systems adapted from Meliwat/awesome-ios-design-md (MIT) and 16
 *      aesthetic concepts re-authored from bergside/awesome-design-skills
 *      (MIT). Their manifests point at that upstream through
 *      `manifest.source.url`, which is where the catalog entry must link.
 *
 *   2. A correction layer for the systems we already hold. The kit's
 *      `packages/content/local/` tree audits every bundled system and writes
 *      back what disagrees with the tokens: `DESIGN.sections.md` rewrites the
 *      prose sections, and `tokens.override.css` fixes the token values.
 *      The upstream packages genuinely contradict themselves — agentic's prose
 *      says "Playfair Display" and "#FF5701" while its CSS says "Inter" and
 *      "#60a5fa" — and the audit resolves each conflict, keeping the value
 *      that renders. Applying it makes our cached package byte-identical to
 *      what the kit publishes, so a design system's prose, its tokens and its
 *      rendered preview all agree.
 *
 *   3. A Claude Design package for EVERY system — `claude-design-systems/
 *      <slug>/project/` holds Claude's own file format (tokens.json,
 *      design-system.json, README.md, components/Cover/preview.html).
 *
 * The gallery artifacts (preview.html, claude/view.html, claude/cover.html,
 * thumbs/<slug>.webp) are BUILT by the kit's gallery pipeline and published
 * as static files. They are fetched once into the cache, so the server serves
 * them offline and never reaches the network.
 *
 * The 152 systems upstream also appear in the kit, but with their asset
 * copies STRIPPED (no design-tokens.json, no USAGE.md, no preview/). Those
 * are never re-imported from here: their packages are corrected in place, so
 * the files only nexu-io has survive.
 *
 * Usage
 *   node scripts/fetch-agentkit.mjs                  # everything
 *   node scripts/fetch-agentkit.mjs --systems-only   # skip the gallery fetch
 *   node scripts/fetch-agentkit.mjs --artifacts-only # skip the import
 *   node scripts/fetch-agentkit.mjs --source <path>   # use a local checkout
 *   node scripts/fetch-agentkit.mjs --slug <slug>     # one system
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   AGENTKIT_REPO      git URL (default https://github.com/feimacode/open-design-agent-kit.git)
 *   AGENTKIT_GALLERY   published gallery base URL
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { importSystems, applyDesignSections } from "./lib/opendesign-import.mjs";
import {
  GALLERY_DIR,
  readCatalog,
  readOpenDesignPackage,
  writeClaudePackage,
  writeDescriptors,
} from "./lib/cache.mjs";
import { encodePackageFile } from "./lib/opendesign-package.mjs";

const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const REPO = process.env.AGENTKIT_REPO || "https://github.com/feimacode/open-design-agent-kit.git";
const GALLERY = (
  process.env.AGENTKIT_GALLERY || "https://feimacode.github.io/open-design-agent-kit"
).replace(/\/+$/, "");

// The kit's design systems live in two trees that overlay each other:
//   packages/content/assets/open-design/design-systems/<slug>/  the package
//   packages/content/local/design-systems/<slug>/               the overlay
// Both are checked out; the local overlay wins where it has a file.
const ASSETS = "packages/content/assets/open-design/design-systems";
const LOCAL = "packages/content/local/design-systems";
const CLAUDE = "claude-design-systems";

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

/** Sparse-clone the three trees the kit contributes. */
async function sparseClone(dest) {
  console.log(`cloning  : ${REPO}`);
  await run("git", [
    "clone", "--filter=blob:none", "--no-checkout", "--depth", "1", REPO, dest,
  ]);
  await run("git", ["sparse-checkout", "set", ASSETS, LOCAL, CLAUDE], { cwd: dest });
  await run("git", ["checkout"], { cwd: dest });
  console.log(`cloned   : ${dest}`);
  return dest;
}

// ------------------------------------------------------------------ http
/**
 * Fetch one URL, retrying the transient failures a public static host
 * returns under load. Returns null when the file is genuinely absent.
 */
async function fetchBytes(url, { tries = 4 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "designer-mcp/1.0 (+offline gallery cache)" },
        redirect: "follow",
      });
      if (response.status === 404) return null;
      if (!response.ok) {
        if (attempt < tries) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
          continue;
        }
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt < tries) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
        continue;
      }
      throw error;
    }
  }
  return null;
}

// ------------------------------------------------------------------ overlay
/**
 * The kit's correction layer for one system, or null when it has none.
 *
 * `DESIGN.sections.md` replaces the `## ` sections of DESIGN.md that
 * disagree with the tokens, matching on heading text. `tokens.override.css`
 * wins over the packaged tokens. Both are applied the way the kit's own
 * content index applies them, so the result is what its gallery renders.
 */
async function readOverlay(localDir, slug) {
  const dir = join(localDir, slug);
  if (!existsSync(dir)) return null;
  const files = await readdir(dir, { withFileTypes: true });
  const names = files.filter((f) => f.isFile() && !f.name.startsWith(".")).map((f) => f.name);
  if (!names.includes("DESIGN.sections.md") && !names.includes("tokens.override.css")) {
    return null;
  }
  return {
    sections: names.includes("DESIGN.sections.md")
      ? await readFile(join(dir, "DESIGN.sections.md"), "utf8")
      : null,
    tokens: names.includes("tokens.override.css")
      ? await readFile(join(dir, "tokens.override.css"), "utf8")
      : null,
  };
}

/**
 * Apply an overlay to a staged package.
 *
 * The two corrected files are restored from the kit's own assets tree first.
 * That tree holds the pristine upstream copies, so the overlay always lands
 * on the same input — applying it to an already-corrected file would stack
 * a second copy of the override every time the fetcher runs.
 *
 * The typed token file is patched too: it is the catalog's preferred source
 * for colors and fonts, so leaving it stale would put the old values back
 * into the entry even though the CSS was corrected.
 */
async function applyOverlay(dir, overlay, slug, assetsDir) {
  // Restore the pristine files the overlay will rewrite.
  for (const name of ["DESIGN.md", "tokens.css"]) {
    const pristine = join(assetsDir, slug, name);
    if (existsSync(pristine)) {
      await writeFile(join(dir, name), await readFile(pristine));
    }
  }
  if (overlay.sections) {
    const designMd = await readFile(join(dir, "DESIGN.md"), "utf8");
    try {
      await writeFile(join(dir, "DESIGN.md"), applyDesignSections(designMd, overlay.sections, slug));
    } catch (error) {
      // A hand-copied tree can name a section the document does not have.
      // Keep the vendored text rather than failing the whole refresh.
      console.warn(`  SKIP ${slug}: ${error.message}`);
      overlay.sections = null;
    }
  }
  if (overlay.tokens) {
    const css = await readFile(join(dir, "tokens.css"), "utf8");
    await writeFile(join(dir, "tokens.css"), `${css}\n${overlay.tokens}`);
    await patchTypedTokens(dir, overlay.tokens, slug);
  }
}

/**
 * Copy the overridden token values into the typed token file.
 *
 * `tokens.override.css` declares `--name: value` pairs. Each typed token
 * with that name takes the new value, so the typed layer and the CSS stay in
 * step.
 */
async function patchTypedTokens(dir, overrideCss, slug) {
  const path = join(dir, "design-tokens.json");
  if (!existsSync(path)) return;
  const typed = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(typed.tokens)) return;

  const declared = {};
  for (const match of overrideCss.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
  )) {
    declared[match[1]] = match[2].trim();
  }

  let changed = 0;
  for (const token of typed.tokens) {
    const value = declared[token.name];
    if (value === undefined || token.value === value) continue;
    token.value = value;
    changed++;
  }
  if (!changed) return;
  await writeFile(path, `${JSON.stringify(typed, null, 2)}\n`);
}

// ------------------------------------------------------------------ staging
/** Write a cached package back out to disk so it can be re-imported. */
async function materialise(record, dir) {
  await mkdir(dir, { recursive: true });
  for (const file of record.files ?? []) {
    const path = join(dir, file.path);
    await mkdir(join(path, ".."), { recursive: true });
    if (file.encoding === "utf8") await writeFile(path, file.content);
    else await writeFile(path, Buffer.from(file.content, "base64"));
  }
}

/** Copy a packaged system out of the kit's assets tree. */
async function stageFromKit(assetsDir, slug, dir) {
  await mkdir(dir, { recursive: true });
  const base = await readdir(join(assetsDir, slug), { withFileTypes: true });
  for (const file of base) {
    if (!file.isFile() || file.name.startsWith(".")) continue;
    await writeFile(join(dir, file.name), await readFile(join(assetsDir, slug, file.name)));
  }
}

// ------------------------------------------------------------------ main
async function main() {
  const onlySlug = argVal("--slug");
  const localSource = argVal("--source");
  const wantSystems = !has("--artifacts-only");
  const wantArtifacts = !has("--systems-only");

  let root;
  if (localSource) {
    root = localSource;
    console.log(`source   : ${root} (local)`);
  } else {
    root = await sparseClone(join(tmpdir(), `agentkit-sparse-${Date.now()}`));
  }

  const assetsDir = join(root, ASSETS);
  const localDir = join(root, LOCAL);
  const claudeDir = join(root, CLAUDE);
  if (!existsSync(assetsDir)) {
    throw new Error(`no design systems at ${assetsDir}`);
  }

  const slugs = (await readdir(assetsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && /^[a-z0-9-]+$/.test(e.name))
    .map((e) => e.name)
    .filter((s) => !onlySlug || s === onlySlug);
  if (!slugs.length) throw new Error(`no design systems found under ${assetsDir}`);

  // ------------------------------------------------------- 1. the packages
  if (wantSystems) {
    // Which slugs are already in the catalog? Those keep the nexu-io
    // originals — the kit's copies are stripped — and are only corrected.
    const { designs } = await readCatalog();
    const known = new Set(
      designs.filter((d) => (d.source || "refero") === "opendesign").map((d) => d.id),
    );
    const fresh = slugs.filter((s) => !known.has(s));
    console.log(
      `systems  : ${slugs.length} in the kit, ${known.size} already cached, ` +
        `${fresh.length} new to import`,
    );

    const stage = join(tmpdir(), `agentkit-stage-${Date.now()}`);
    await mkdir(stage, { recursive: true });
    const staged = [];

    for (const slug of fresh) {
      // A system the kit has but we do not: take its package.
      const dir = join(stage, slug);
      await stageFromKit(assetsDir, slug, dir);
      staged.push(slug);
    }

    for (const slug of slugs) {
      if (staged.includes(slug)) continue;
      // A system we already hold: correct it in place, keeping every file
      // only nexu-io has (design-tokens.json, USAGE.md, preview/, source/).
      const overlay = await readOverlay(localDir, slug);
      if (!overlay) continue;
      const record = await readOpenDesignPackage(slug);
      if (!record?.files?.length) continue;
      const dir = join(stage, slug);
      await materialise(record, dir);
      await applyOverlay(dir, overlay, slug, assetsDir);
      staged.push(slug);
    }

    if (staged.length) {
      const { imported, catalog, index } = await importSystems(stage, {
        // The kit's own tree, for a manifest with neither `url` nor
        // `source.url`. A corrected upstream system keeps the nexu-io path
        // its own manifest points at.
        fallbackUrl: (slug) =>
          known.has(slug)
            ? `https://github.com/nexu-io/open-design/tree/main/design-systems/${slug}`
            : `https://github.com/feimacode/open-design-agent-kit/tree/main/${ASSETS}/${slug}`,
        onSkip: (slug, message) => console.warn(`  SKIP ${slug}: ${message}`),
        onImport: (entry, done, total) =>
          console.log(`  ok ${String(done).padStart(4)}/${total}  ${entry.siteName} (${entry.id})`),
      });
      console.log(
        `imported : ${imported.length}, catalog now ${catalog.length} designs ` +
          `(${JSON.stringify(index.counts)})`,
      );
    }
    await rm(stage, { recursive: true, force: true });
  }

  // ------------------------------------------------ 2. the Claude Design layer
  if (existsSync(claudeDir)) {
    let written = 0;
    for (const slug of slugs) {
      const project = join(claudeDir, slug, "project");
      if (!existsSync(project)) continue;
      const files = [];
      const walk = async (dir, prefix) => {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.isDirectory()) await walk(join(dir, entry.name), rel);
          else if (entry.isFile() && !entry.name.startsWith(".")) {
            files.push(encodePackageFile(rel, await readFile(join(dir, entry.name))));
          }
        }
      };
      await walk(project, "");
      if (!files.length) continue;
      await writeClaudePackage(slug, files);
      written++;
    }
    console.log(`claude   : ${written} systems carry a Claude Design package`);
  }

  // ---------------------------------------------- 3. the curated descriptors
  const descriptorsPath = join(root, "packages/content/local/design-system-descriptors.json");
  if (existsSync(descriptorsPath)) {
    const { systems } = JSON.parse(await readFile(descriptorsPath, "utf8"));
    const mine = Object.fromEntries(
      Object.entries(systems).filter(([slug]) => slugs.includes(slug)),
    );
    await writeDescriptors(mine);
    console.log(`moods    : ${Object.keys(mine).length} systems carry mood and industry tags`);
  }

  // ------------------------------------------------ 4. the gallery artifacts
  if (wantArtifacts) {
    let fetched = 0;
    let cached = 0;
    for (const slug of slugs) {
      const dir = join(GALLERY_DIR, slug);
      await mkdir(dir, { recursive: true });

      const artifacts = [
        ["preview.html", `${GALLERY}/design-systems/${slug}/preview.html`],
        ["claude/view.html", `${GALLERY}/design-systems/${slug}/claude/view.html`],
        ["claude/cover.html", `${GALLERY}/design-systems/${slug}/claude/cover.html`],
      ];

      for (const [rel, url] of artifacts) {
        const target = join(dir, rel);
        if (existsSync(target)) {
          cached++;
          continue;
        }
        const bytes = await fetchBytes(url);
        if (!bytes) continue;
        await mkdir(join(dir, rel, ".."), { recursive: true });
        await writeFile(target, bytes);
        fetched++;
      }

      const thumb = join(GALLERY_DIR, "thumbs", `${slug}.webp`);
      if (!existsSync(thumb)) {
        const bytes = await fetchBytes(`${GALLERY}/design-systems/thumbs/${slug}.webp`);
        if (bytes) {
          await mkdir(join(GALLERY_DIR, "thumbs"), { recursive: true });
          await writeFile(thumb, bytes);
          fetched++;
        }
      } else {
        cached++;
      }
    }
    console.log(`gallery  : ${fetched} artifacts fetched, ${cached} already cached`);
  }

  console.log(
    "\nnext: node scripts/bake-cache.mjs   (bake the catalog into the image)",
  );
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
