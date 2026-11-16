#!/usr/bin/env node
/**
 * fetch-reui.mjs — cache KeenThemes ReUI component library (https://github.com/keenthemes/reui).
 *
 * Clones keenthemes/reui (or reads from --source <dir>) and extracts:
 *   - All component categories and items from registry-reui/_meta/components/registry.json
 *   - Both Radix UI and Base UI TSX source for every component example
 *   - Category preview screenshots (light & dark PNGs)
 *   - Minimal runtime primitives (registry/bases/radix, registry-reui/bases/radix/{reui,hooks}, svgs)
 *     so frontend/build.mjs can bundle live interactive previews 100% offline.
 *
 * Cache layout:
 *   <cache>/reui/index.json
 *   <cache>/reui/categories/<slug>.json
 *   <cache>/reui/screenshots/<slug>-{light,dark}.png
 *   <cache>/reui/runtime/...
 *
 * Usage:
 *   node scripts/fetch-reui.mjs
 *   node scripts/fetch-reui.mjs --source /path/to/reui
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CACHE_DIR, writeJsonAtomic } from "./lib/cache.mjs";

const REPO = "https://github.com/keenthemes/reui.git";
const argv = process.argv.slice(2);
const argVal = (name) => {
  const i = argv.lastIndexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};

const REUI_DIR = join(CACHE_DIR, "reui");

async function readJsonSafe(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function copyTree(src, dst, filter = () => true) {
  if (!existsSync(src)) return 0;
  let count = 0;
  await mkdir(dst, { recursive: true });
  for (const entry of await readdir(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) {
      count += await copyTree(s, d, filter);
    } else if (filter(entry.name, s)) {
      await copyFile(s, d);
      count++;
    }
  }
  return count;
}

async function run() {
  let sourceDir = argVal("--source");
  let tempDir = null;

  if (!sourceDir) {
    tempDir = await mkdtemp(join(tmpdir(), "reui-fetch-"));
    sourceDir = tempDir;
    console.log(`Cloning ${REPO}...`);
    const res = spawnSync("git", ["clone", "--depth", "1", REPO, sourceDir], {
      stdio: "inherit",
    });
    if (res.status !== 0) {
      await rm(tempDir, { recursive: true, force: true });
      throw new Error(`git clone failed with status ${res.status}`);
    }
  }

  try {
    const metaPath = join(sourceDir, "registry-reui/_meta/components/registry.json");
    const registryMeta = await readJsonSafe(metaPath);
    if (!registryMeta?.categories?.length) {
      throw new Error(`Missing or empty ${metaPath}`);
    }

    const categoriesDir = join(REUI_DIR, "categories");
    const screenshotsDir = join(REUI_DIR, "screenshots");
    const runtimeDir = join(REUI_DIR, "runtime");
    await mkdir(categoriesDir, { recursive: true });
    await mkdir(screenshotsDir, { recursive: true });

    const indexCategories = [];
    let totalItems = 0;

    for (const cat of registryMeta.categories) {
      const slug = cat.name;
      const radixCatDir = join(sourceDir, "registry-reui/bases/radix/components", slug);
      const baseCatDir = join(sourceDir, "registry-reui/bases/base/components", slug);
      if (!existsSync(radixCatDir)) continue;

      const metaList = (await readJsonSafe(join(radixCatDir, "meta.json"))) || [];
      const metaByName = new Map(metaList.map((m) => [m.name, m]));

      const files = (await readdir(radixCatDir))
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => f.replace(/\.tsx$/, ""));

      const orderedNames = [
        ...metaList.map((m) => m.name).filter((n) => files.includes(n)),
        ...files.filter((n) => !metaByName.has(n)).sort(),
      ];

      const items = [];
      for (const name of orderedNames) {
        const meta = metaByName.get(name) || {};
        const radixPath = join(radixCatDir, `${name}.tsx`);
        const basePath = join(baseCatDir, `${name}.tsx`);
        const radixCode = existsSync(radixPath) ? await readFile(radixPath, "utf8") : "";
        const baseCode = existsSync(basePath) ? await readFile(basePath, "utf8") : "";
        items.push({
          name,
          title: meta.title || name,
          label: meta.label || meta.title || name,
          description: meta.description || meta.title || "",
          order: meta.order ?? items.length + 1,
          gridSize: meta.gridSize ?? 2,
          radixCode,
          baseCode,
        });
      }

      if (!items.length) continue;

      const categoryRecord = {
        slug,
        label: cat.label || slug,
        description: cat.description || "",
        count: items.length,
        items,
      };
      await writeJsonAtomic(join(categoriesDir, `${slug}.json`), categoryRecord);

      indexCategories.push({
        slug,
        label: categoryRecord.label,
        description: categoryRecord.description,
        count: items.length,
        items: items.map(({ name, title, label, description, order, gridSize }) => ({
          name,
          title,
          label,
          description,
          order,
          gridSize,
        })),
      });
      totalItems += items.length;
    }

    await writeJsonAtomic(join(REUI_DIR, "index.json"), {
      updatedAt: new Date().toISOString(),
      total: totalItems,
      categories: indexCategories,
    });

    // Copy category screenshots
    const srcScreens = join(sourceDir, "public/screenshots/components");
    const screenCount = await copyTree(srcScreens, screenshotsDir, (name) =>
      name.endsWith(".png"),
    );

    // Copy minimal runtime sources for offline esbuild bundling
    await rm(runtimeDir, { recursive: true, force: true });
    const tsFilter = (name) => /\.(tsx?|css)$/.test(name) && name !== "_registry.ts";
    let runtimeFiles = 0;
    runtimeFiles += await copyTree(
      join(sourceDir, "registry/bases/radix"),
      join(runtimeDir, "registry/bases/radix"),
      tsFilter,
    );
    runtimeFiles += await copyTree(
      join(sourceDir, "registry-reui/bases/radix/reui"),
      join(runtimeDir, "registry-reui/bases/radix/reui"),
      tsFilter,
    );
    runtimeFiles += await copyTree(
      join(sourceDir, "registry-reui/bases/radix/hooks"),
      join(runtimeDir, "registry-reui/bases/radix/hooks"),
      tsFilter,
    );
    runtimeFiles += await copyTree(
      join(sourceDir, "components/ui/svgs"),
      join(runtimeDir, "components/ui/svgs"),
      tsFilter,
    );
    // The demos style themselves through reui's cn-* component classes, which
    // are defined in the upstream style sheets, not in the component sources.
    // Cache the sheet for the style the upstream site ships as its default so
    // the offline previews render styled. Scoped under `.style-nova` upstream;
    // the preview docs carry that class.
    await mkdir(join(runtimeDir, "styles"), { recursive: true });
    await copyFile(
      join(sourceDir, "registry/styles/style-nova.css"),
      join(runtimeDir, "styles/style-nova.css"),
    );
    if (existsSync(join(sourceDir, "LICENSE.md"))) {
      await copyFile(join(sourceDir, "LICENSE.md"), join(REUI_DIR, "LICENSE.md"));
    }

    console.log(
      `Cached ReUI: ${indexCategories.length} categories, ${totalItems} components, ${screenCount} screenshots, ${runtimeFiles} runtime files -> ${REUI_DIR}`,
    );
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
