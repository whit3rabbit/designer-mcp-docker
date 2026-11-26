#!/usr/bin/env node
/**
 * build-static.mjs — generate a 100% self-contained static site for GitLab Pages / offline hosting.
 *
 * Emits HTML, CSS, JS, JSON APIs, thumbnails, previews, templates, and skill
 * archives into an output directory (default: dist/static) using relative URLs
 * so the site works at `/` or any subpath (e.g. `https://user.gitlab.io/repo/`).
 *
 * Usage:
 *   node scripts/build-static.mjs [--out dist/static] [--cache bake] [--frontend dist/frontend]
 */

import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Must stay the first import: cache.mjs resolves its cache dir at import
// time, and ESM hoisting would make a later env assignment run too late.
import "./lib/cache-env.mjs";

import {
  mergeDesign,
  readCatalog,
  readClaudePackage,
  readComponent,
  readComponentsIndex,
  readDescriptors,
  readDesign,
  readDesignSystem,
  readDesignSystemsIndex,
  readGalleryArtifact,
  readGalleryThumb,
  readOpenDesignPackage,
  readPresetCatalog,
  readPresetsIndex,
  readLibrariesIndex,
  readLibraryEntry,
  readReuiIndex,
  readReuiCategory,
  readReuiScreenshot,
  readDashboardsIndex,
  readDashboard,
  readDashboardCover,
  readDashboardArchive,
} from "./lib/cache.mjs";
import { reuiCatalogHtml, reuiCategoryHtml } from "./lib/reui-ui.mjs";
import { dashboardsHtml, dashboardDetailHtml } from "./lib/dashboards-ui.mjs";
import {
  readHeroUiCatalog,
  readHeroUiDoc,
  readHeroUiMigrationDoc,
  readHeroUiMigrationIndex,
  readHeroUiSource,
  readHeroUiStyles,
  readHeroUiTheme,
} from "./lib/heroui-docs.mjs";
import { herouiCatalogHtml, herouiDocHtml } from "./lib/heroui-ui.mjs";
import { readBaseUiCatalog, readBaseUiDoc } from "./lib/baseui-docs.mjs";
import { baseUiCatalogHtml, baseUiDocHtml } from "./lib/baseui-ui.mjs";
import { readUikitCatalog, readUikitFile, readUikitFiles, readUikitsIndex } from "./lib/uikit-docs.mjs";
import { uikitItemHtml, uikitKitHtml, uikitsIndexHtml, uikitPreviewHtml } from "./lib/uikit-ui.mjs";
import {
  readMantineCatalog,
  readMantineComponent,
  readMantineProvenance,
  readMantineAsset,
  readMantineLicence,
} from "./lib/mantine-docs.mjs";
import { mantineCatalogHtml, mantineCategoryHtml, mantineComponentHtml } from "./lib/mantine-ui.mjs";
import {
  readDaisyuiCatalog,
  readDaisyuiComponent,
  readDaisyuiCss,
  readDaisyuiProvenance,
} from "./lib/daisyui-docs.mjs";
import { daisyuiCatalogHtml, daisyuiComponentHtml } from "./lib/daisyui-ui.mjs";
import {
  readReferoStyle,
  readReferoStylesAsset,
  readReferoStylesCatalog,
  readReferoStylesProvenance,
} from "./lib/refero-styles-docs.mjs";
import { referoStyleHtml, referoStylesCatalogHtml } from "./lib/refero-styles-ui.mjs";
import { loadFrontend, previewHtml } from "./lib/frontend.mjs";
import {
  KIT_STYLE_LINK,
  designDetailHtml,
  esc as kitEsc,
  filePanel,
  kitNav,
  promptPanel,
} from "./lib/kit-ui.mjs";
import {
  SHELL_ASSETS,
  assetsHtml,
  componentDetailHtml,
  presetDetailHtml,
  presetsHtml,
  shellHead,
  slopstrapHtml,
  startersHtml,
  tailwindCatalogHtml,
  tailwindExampleHtml,
  templateDetailHtml,
  templatesHtml,
  uiSdkDocsHtml,
  mcpButton,
} from "./lib/ui.mjs";
import { buildUnifiedDesignsIndex } from "./lib/designs-index.mjs";
import { unifiedDesignsHtml } from "./lib/designs-ui.mjs";
import { buildUnifiedComponentsHub } from "./lib/components-index.mjs";
import { unifiedComponentsHtml, compareIndexHtml, compareConceptHtml } from "./lib/components-ui.mjs";
import { iconsBrowserHtml, chartsBrowserHtml, fontsBrowserHtml } from "./lib/cdn-ui.mjs";
import { heroUiPreviewDocument, listHeroUiPreviewSlugs } from "./lib/heroui-preview.mjs";
import { listUiSdkDocs, readUiSdkDoc } from "./lib/ui-sdk-docs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

function arg(name, fallback) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const CACHE_DIR = resolve(
  arg("--cache", process.env.DESIGN_CACHE_DIR || process.env.REFERO_CACHE_DIR || join(ROOT, "bake")),
);
const FRONTEND_DIR = resolve(
  arg("--frontend", process.env.DESIGN_FRONTEND_DIR || join(ROOT, "dist", "frontend")),
);
const SKILLS_ROOT = resolve(
  arg(
    "--skills-root",
    process.env.SKILLS_ROOT ||
      process.env.SKILL_DIR || // legacy name for the old single-skill dir
      join(ROOT, "plugins", "designer-mcp", "skills"),
  ),
);
const OUT_DIR = resolve(arg("--out", join(ROOT, "dist", "static")));

async function loadRenderer() {
  const candidates = [];
  let dir = HERE;
  for (let i = 0; i < 5; i++) {
    candidates.push(join(dir, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(c)) return import(`file://${c}`);
  }
  const require = createRequire(join(process.cwd(), "index.js"));
  return import(`file://${require.resolve("fidgetcoding-refero-mcp/dist/design-md.js")}`);
}

const { renderDesignMd } = await loadRenderer();

function designMarkdown(full) {
  if (full.designMd) return full.designMd;
  return renderDesignMd(full);
}

const createdDirs = new Set();
async function ensureDir(dir) {
  if (createdDirs.has(dir)) return;
  await mkdir(dir, { recursive: true });
  createdDirs.add(dir);
}

async function writeOut(rel, content) {
  const target = join(OUT_DIR, rel);
  await ensureDir(dirname(target));
  await writeFile(target, content);
}

async function copyOut(src, rel) {
  const target = join(OUT_DIR, rel);
  await ensureDir(dirname(target));
  await cp(src, target);
}

async function writeJson(rel, data) {
  await writeOut(rel, JSON.stringify(data));
}

async function mapLimit(items, limit, fn) {
  const list = items || [];
  if (!list.length) return [];
  const results = new Array(list.length);
  let next = 0;
  const workers = Math.min(limit, list.length);
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (next < list.length) {
        const idx = next++;
        results[idx] = await fn(list[idx], idx);
      }
    }),
  );
  return results;
}

function prefixFor(depth) {
  return depth === 0 ? "./" : "../".repeat(depth);
}

const STATIC_EXACT_ROUTES = new Map([
  ["/", "index.html"],
  ["/components", "components/index.html"],
  ["/components/compare", "components/compare/index.html"],
  ["/components/icons", "components/icons/index.html"],
  ["/components/charts", "components/charts/index.html"],
  ["/components/fonts", "components/fonts/index.html"],
  ["/starters", "starters/index.html"],
  ["/reui", "reui/index.html"],
  ["/heroui", "heroui/index.html"],
  ["/tailwind", "tailwind/index.html"],
  ["/tailwind/shadcn", "tailwind/shadcn/index.html"],
  ["/presets", "presets/index.html"],
  ["/templates", "templates/index.html"],
  ["/dashboards", "dashboards/index.html"],
  ["/mantine", "mantine/index.html"],
  ["/daisyui", "daisyui/index.html"],
  ["/baseui", "baseui/index.html"],
  ["/uikits", "uikits/index.html"],
  ["/refero-styles", "refero-styles/index.html"],
  ["/slopstrap", "slopstrap/index.html"],
  ["/docs", "docs/index.html"],
  ["/assets", "assets/index.html"],
  ["/skill", "skill/designer-mcp-skill.zip"],
  ["/skill/marketplace.zip", "skill/designer-mcp-marketplace.zip"],
  ["/assets/manifest.json", "assets/manifest.json"],
  ["/assets/importmap.json", "assets/importmap.json"],
  ["/assets/starter.zip", "assets/starter.zip"],
]);

/**
 * Rewrite root-relative URLs in HTML produced by ui.mjs / kit-ui.mjs so they
 * work from any static subdirectory depth (e.g. GitHub/GitLab Pages subpaths).
 */
function relativizeHtml(html, depth, { assetBase, thumbMap, templateThumbMap } = {}) {
  const p = prefixFor(depth);
  let out = html
    .replaceAll('data-picks-api="/api/picks"', 'data-picks-api=""')
    .replaceAll('data-site-root="/"', `data-site-root="${p}"`);

  // Single-pass rewrite for href/src/data-src/data-base-src/data-preview root-relative attributes.
  out = out.replace(
    /\b(href|src|data-src|data-base-src|data-preview)="(\/[^"]*)"/g,
    (full, attr, raw) => {
      const exact = STATIC_EXACT_ROUTES.get(raw);
      if (exact) return `${attr}="${p}${exact}"`;
      if (raw.startsWith("/shell/")) return `${attr}="${p}${raw.slice(1)}"`;
      if (raw.startsWith("/assets/")) return `${attr}="${p}${raw.slice(1)}"`;
      if (raw.startsWith("/design/")) {
        const id = raw.slice("/design/".length);
        if (id && !/[?#]/.test(id)) return `${attr}="${p}design/${id}/index.html"`;
      }
      if (raw.startsWith("/components/compare/")) {
        const slug = raw.slice("/components/compare/".length);
        if (/^[a-z0-9-]+$/.test(slug)) return `${attr}="${p}components/compare/${slug}/index.html"`;
      }
      if (raw.startsWith("/component/")) {
        let m;
        if (assetBase && (m = raw.match(/^\/component\/([a-z0-9-]+)\/thumbnail\/([a-z0-9-]+)(?:\?.*)?$/))) {
          return `${attr}="${p}${assetBase}/thumbnails/components/${m[1]}.jpg"`;
        }
        if ((m = raw.match(/^\/component\/([a-z0-9-]+)\/preview\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}component/${m[1]}/preview/${m[2]}.html"`;
        }
        if ((m = raw.match(/^\/component\/([^/?#]+)$/))) {
          return `${attr}="${p}component/${m[1]}/index.html"`;
        }
      }
      if (raw.startsWith("/reui/")) {
        let m;
        if (raw.startsWith("/reui/screenshot/")) return `${attr}="${p}${raw.slice(1)}"`;
        if ((m = raw.match(/^\/reui\/preview\/([a-z0-9-]+)\/([a-z0-9-]+)(\?.*)?$/))) {
          return `${attr}="${p}reui/preview/${m[1]}/${m[2]}.html${m[3] || ""}"`;
        }
        if ((m = raw.match(/^\/reui\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}reui/${m[1]}/index.html"`;
        }
      }
      if (raw.startsWith("/heroui/")) {
        let m;
        if (raw === "/heroui/css/heroui.min.css") return `${attr}="${p}heroui/css/heroui.min.css"`;
        if ((m = raw.match(/^\/heroui\/(component|guide)\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}heroui/${m[1]}/${m[2]}/index.html"`;
        }
        if ((m = raw.match(/^\/heroui\/preview\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}heroui/preview/${m[1]}.html"`;
        }
      }
      if (raw.startsWith("/api/")) {
        let m;
        if ((m = raw.match(/^\/api\/library\/([^/]+)$/))) return `${attr}="${p}api/library/${m[1]}.json"`;
        if ((m = raw.match(/^\/api\/designs\/([^/]+)\/design\.md$/))) return `${attr}="${p}api/designs/${m[1]}/design.md"`;
        if ((m = raw.match(/^\/api\/designs\/([^/]+)\/file\/(.+)$/))) return `${attr}="${p}api/designs/${m[1]}/file/${m[2]}"`;
      }
      if (raw.startsWith("/presets/")) {
        const kind = raw.slice("/presets/".length);
        if (kind && !/[/?#]/.test(kind)) return `${attr}="${p}presets/${kind}/index.html"`;
      }
      if (raw.startsWith("/template/")) {
        let m;
        if (templateThumbMap && (m = raw.match(/^\/template\/([^/]+)\/thumb$/))) {
          const file = templateThumbMap.get(decodeURIComponent(m[1]));
          return `${attr}="${p}${file || `template/${m[1]}/thumb.webp`}"`;
        }
        const slug = raw.slice("/template/".length);
        if (slug && !/[/?#]/.test(slug)) return `${attr}="${p}template/${slug}/index.html"`;
      }
      if (raw.startsWith("/dashboard/")) {
        let m;
        if ((m = raw.match(/^\/dashboard\/([a-z0-9-]+)$/))) return `${attr}="${p}dashboard/${m[1]}/index.html"`;
        if ((m = raw.match(/^\/dashboard\/([a-z0-9-]+)\/cover$/))) return `${attr}="${p}dashboard/${m[1]}/cover.png"`;
        if ((m = raw.match(/^\/dashboard\/([a-z0-9-]+)\/download$/))) return `${attr}="${p}dashboard/${m[1]}/${m[1]}-offline.zip"`;
        if ((m = raw.match(/^\/dashboard\/([a-z0-9-]+)\/fonts\.zip$/))) return `${attr}="${p}dashboard/${m[1]}/fonts.zip"`;
      }
      if (raw.startsWith("/tailwind/")) {
        const m = raw.match(/^\/tailwind\/(hyperui|shadcn)\/([^?#]+)$/);
        if (m) return `${attr}="${p}tailwind/${m[1]}/${m[2]}/index.html"`;
      }
      if (raw.startsWith("/mantine/")) {
        let m;
        if ((m = raw.match(/^\/mantine\/(category|component)\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}mantine/${m[1]}/${m[2]}/index.html"`;
        }
        if ((m = raw.match(/^\/mantine\/asset\/([\w.-]+)$/))) {
          return `${attr}="${p}mantine/images/${m[1]}"`;
        }
        if ((m = raw.match(/^\/mantine\/preview\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}mantine/preview/${m[1]}.html"`;
        }
      }
      if (raw.startsWith("/daisyui/")) {
        let m;
        if ((m = raw.match(/^\/daisyui\/component\/([a-z0-9-]+)$/))) return `${attr}="${p}daisyui/component/${m[1]}/index.html"`;
        if ((m = raw.match(/^\/daisyui\/preview\/([a-z0-9-]+)$/))) return `${attr}="${p}daisyui/preview/${m[1]}.html"`;
        if ((m = raw.match(/^\/daisyui\/css\/([a-z0-9-]+)\.css$/))) return `${attr}="${p}daisyui/preview/${m[1]}.css"`;
      }
      if (raw.startsWith("/baseui/doc/")) {
        const m = raw.match(/^\/baseui\/doc\/(components|overview|handbook|utils)\/([a-z0-9-]+)$/);
        if (m) return `${attr}="${p}baseui/doc/${m[1]}/${m[2]}/index.html"`;
      }
      if (raw.startsWith("/uikits/")) {
        let m;
        if ((m = raw.match(/^\/uikits\/([a-z0-9-]+)\/(item|preview)\/([a-z0-9-]+)$/))) {
          return `${attr}="${p}uikits/${m[1]}/${m[2]}/${m[3]}/index.html"`;
        }
        if ((m = raw.match(/^\/uikits\/([a-z0-9-]+)\/raw\/([\w./-]+)$/))) {
          return `${attr}="${p}uikits/${m[1]}/raw/${m[2]}"`;
        }
        if ((m = raw.match(/^\/uikits\/([a-z0-9-]+)\/file\/([\w./-]+)$/))) {
          return `${attr}="${p}api/uikits/${m[1]}/file/${m[2]}"`;
        }
        if ((m = raw.match(/^\/uikits\/([a-z0-9-]+)\/?$/))) {
          return `${attr}="${p}uikits/${m[1]}/index.html"`;
        }
      }
      if (raw.startsWith("/refero-styles/")) {
        let m;
        if ((m = raw.match(/^\/refero-styles\/style\/([0-9a-fA-F][0-9a-fA-F-]{35})$/))) {
          return `${attr}="${p}refero-styles/style/${m[1]}/index.html"`;
        }
        if ((m = raw.match(/^\/refero-styles\/asset\/([\w.-]+)$/))) {
          return `${attr}="${p}refero-styles/asset/${m[1]}"`;
        }
      }
      if (thumbMap && raw.startsWith("/thumb/")) {
        const id = raw.slice("/thumb/".length);
        if (id && !/[?#]/.test(id)) {
          const decoded = decodeURIComponent(id);
          const file = thumbMap.get(decoded) || `thumb/${decoded}.svg`;
          return `${attr}="${p}${file}"`;
        }
      }
      if (raw.startsWith("/preview/")) {
        let m;
        if ((m = raw.match(/^\/preview\/([^/]+)\/claude\/file\/(.+)$/))) return `${attr}="${p}preview/${m[1]}/claude/file/${m[2]}"`;
        if ((m = raw.match(/^\/preview\/([^/]+)\/open-design$/))) return `${attr}="${p}preview/${m[1]}/open-design.html"`;
        if ((m = raw.match(/^\/preview\/([^/]+)\/claude$/))) return `${attr}="${p}preview/${m[1]}/claude/view.html"`;
      }
      return full;
    },
  );

  // Script string-literal prefixes (cheap `.includes` guards avoid unnecessary scans)
  if (out.includes("'/components/compare/' +")) {
    out = out.replaceAll("'/components/compare/' +", `'${p}components/compare/' +`);
  }
  if (out.includes("'/reui/screenshot/' +")) {
    out = out.replaceAll("'/reui/screenshot/' +", `'${p}reui/screenshot/' +`);
  }
  if (out.includes('"/api/reui/')) {
    out = out.replace(/"\/api\/reui\/([a-z0-9-]+)"/g, (_, slug) => `"${p}api/reui/${slug}.json"`);
  }
  if (out.includes('"/heroui/preview/')) {
    out = out.replace(/"\/heroui\/preview\/([a-z0-9-]+)"/g, (_, slug) => `"${p}heroui/preview/${slug}.html"`);
  }
  if (out.includes('"/component/')) {
    out = out.replace(/"\/component\/([a-z0-9-]+)\/preview\/([a-z0-9-]+)"/g, (_, slug, id) => `"${p}component/${slug}/preview/${id}.html"`);
  }

  return out;
}

function swatchSvg(d) {
  const colors = (d.colors || []).slice(0, 7);
  const sw = colors.length > 0
    ? colors.map((c, i) => `<rect x="${i * 90}" y="0" width="90" height="150" fill="${kitEsc(c.hex || "#333")}"/>`).join("")
    : `<rect x="0" y="0" width="630" height="150" fill="#22262c"/>`;
  const label = kitEsc(d.siteName || d.id);
  const bg = d.colorScheme === "dark" ? "#0d0f12" : "#f4f5f7";
  const fg = d.colorScheme === "dark" ? "#e6e9ee" : "#12151a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="630" height="150" viewBox="0 0 630 150">
<rect width="630" height="150" fill="${bg}"/>
<g transform="translate(0,0)">${sw}</g>
<text x="16" y="132" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16" fill="${fg}">${label}</text>
</svg>`;
}

function tagsFor(entry, descriptors) {
  const descriptor = descriptors[entry.id];
  const tags = [];
  if (descriptor) {
    tags.push(...(descriptor.moods || []), ...(descriptor.industries || []));
  } else if (entry.industry) {
    tags.push(entry.industry);
  }
  return [...new Set(tags.map((t) => String(t).toLowerCase()))];
}

function patchTailwindStaticDetail(html, source, group, variantsData) {
  // Embed variants data and add client-side variant switching so static pages need no query server
  const payload = JSON.stringify(variantsData).replace(/</g, "\\u003c");
  const script = `<script id="variants-json" type="application/json">${payload}</script>
<script>
(() => {
  const variants = JSON.parse(document.getElementById('variants-json').textContent);
  const frame = document.querySelector('.example iframe');
  const codeEl = document.getElementById('example-code');
  const dlLink = document.querySelector('.source-actions a[download]');
  const tabs = [...document.querySelectorAll('.source-tabs a')];
  function select(id) {
    const v = variants.find(x => x.id === id) || variants[0];
    if (!v) return;
    frame.src = v.preview;
    codeEl.textContent = v.code;
    if (dlLink) dlLink.href = v.download;
    tabs.forEach(a => {
      const vid = new URL(a.href, location.href).searchParams.get('variant');
      if (vid === v.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  tabs.forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    const vid = new URL(a.href, location.href).searchParams.get('variant');
    history.replaceState(null, '', '?variant=' + encodeURIComponent(vid));
    select(vid);
  }));
  const initial = new URLSearchParams(location.search).get('variant');
  if (initial) select(initial);
})();
</script>`;
  return html.replace("</body>", `${script}</body>`);
}

async function main() {
  console.log(`Building static site:\n  cache:    ${CACHE_DIR}\n  frontend: ${FRONTEND_DIR}\n  out:      ${OUT_DIR}`);
  // Clear the output contents without removing the directory itself. /out is
  // often a bind-mount target in CI (`docker run -v "$PWD/public:/out"`), and
  // removing a mount point fails with EBUSY on Linux.
  await mkdir(OUT_DIR, { recursive: true });
  for (const entry of await readdir(OUT_DIR)) {
    await rm(join(OUT_DIR, entry), { recursive: true, force: true });
  }

  const frontend = await loadFrontend(FRONTEND_DIR);
  const manifest = frontend.publicManifest ? JSON.parse(await readFile(join(FRONTEND_DIR, "manifest.json"), "utf8")) : null;
  const assetBase = manifest ? `assets/${manifest.version}` : null;

  // 1. Copy frontend public assets -> out/assets/<version>/ + starter.zip + manifest.json
  if (manifest) {
    const pubSrc = join(FRONTEND_DIR, "public");
    const verDest = join(OUT_DIR, "assets", manifest.version);
    await ensureDir(verDest);
    const pubEntries = await readdir(pubSrc);
    await mapLimit(pubEntries, 8, async (entry) => {
      if (entry === "starter.zip") {
        await cp(join(pubSrc, entry), join(OUT_DIR, "assets", "starter.zip"));
      } else {
        await cp(join(pubSrc, entry), join(verDest, entry), { recursive: true });
      }
    });
    await writeJson("assets/manifest.json", frontend.publicManifest);
    const map = frontend.importMap();
    if (map) await writeJson("assets/importmap.json", map);
  }
  // The Slopstrap examples page: same builder as the gallery, with the
  // /assets hrefs rewritten to the depth-relative form by relativizeHtml.
  await writeOut("slopstrap/index.html", relativizeHtml(slopstrapHtml(frontend.publicManifest), 1, { assetBase }));

  // 2. Copy the skill zip, the marketplace zip & the primary SKILL.md
  if (existsSync(SKILLS_ROOT)) {
    for (const name of ["designer-mcp-skill.zip", "designer-mcp-marketplace.zip"]) {
      const zipCandidates = [
        join(SKILLS_ROOT, name),
        join(dirname(SKILLS_ROOT), name),
        join(ROOT, "dist", name),
      ];
      for (const z of zipCandidates) {
        if (existsSync(z)) {
          await mkdir(join(OUT_DIR, "skill"), { recursive: true });
          await cp(z, join(OUT_DIR, "skill", name));
          break;
        }
      }
    }
    const primarySkillMd = join(SKILLS_ROOT, "design-system", "SKILL.md");
    if (existsSync(primarySkillMd)) {
      await mkdir(join(OUT_DIR, "skill"), { recursive: true });
      await cp(primarySkillMd, join(OUT_DIR, "skill", "SKILL.md"));
    }
  }

  // 3. Load catalog & descriptors
  const { designs: catalog } = await readCatalog();
  const descriptors = await readDescriptors();
  const countBy = (fn) => {
    const m = new Map();
    for (const s of catalog) {
      const v = fn(s);
      if (!v) continue;
      for (const x of Array.isArray(v) ? v : [v]) m.set(x, (m.get(x) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
  };
  const facets = {
    total: catalog.length,
    themes: countBy((s) => s.colorScheme),
    industries: countBy((s) => s.industry),
    fonts: countBy((s) => s.fonts),
    sources: countBy((s) => s.source || "refero"),
    updatedAt: Date.now(),
  };

  await writeJson("healthz.json", { ok: true, styles: catalog.length, updatedAt: facets.updatedAt });
  // Only write `styles` (matching bake-cache.mjs slimming); readCatalog() reads `designs || styles`.
  await writeJson("api/catalog.json", { updatedAt: facets.updatedAt, styles: catalog });
  await writeJson("api/facets.json", facets);
  await writeJson("api/descriptors.json", { systems: descriptors });

  // 4. Copy / build thumbnails for every design (single readdir + parallel copy)
  const thumbMap = new Map();
  await ensureDir(join(OUT_DIR, "thumb"));
  const thumbsDir = join(CACHE_DIR, "thumbs");
  const diskThumbs = new Map();
  if (existsSync(thumbsDir)) {
    const extPri = { ".webp": 0, ".jpg": 1, ".jpeg": 2, ".png": 3 };
    for (const file of await readdir(thumbsDir)) {
      const ext = extname(file).toLowerCase();
      if (!(ext in extPri)) continue;
      const id = file.slice(0, -ext.length);
      const prev = diskThumbs.get(id);
      if (!prev || extPri[ext] < extPri[prev.ext]) diskThumbs.set(id, { file, ext });
    }
  }
  await mapLimit(catalog, 48, async (entry) => {
    const hit = diskThumbs.get(entry.id);
    if (hit) {
      const rel = `thumb/${hit.file}`;
      await cp(join(thumbsDir, hit.file), join(OUT_DIR, rel));
      thumbMap.set(entry.id, rel);
      return;
    }
    const cover = await readGalleryThumb(entry.id);
    if (cover) {
      const rel = `thumb/${entry.id}.webp`;
      await writeOut(rel, cover);
      thumbMap.set(entry.id, rel);
      return;
    }
    const rel = `thumb/${entry.id}.svg`;
    await writeOut(rel, swatchSvg(entry));
    thumbMap.set(entry.id, rel);
  });

  // Load Refero Styles catalog early so design detail pages can cross-link Deep Style Profiles
  const rsCatalog = await readReferoStylesCatalog();
  const rsByDomain = new Map();
  for (const r of rsCatalog?.styles || []) {
    const dom = String(r.domain || "").replace(/^www\./, "").toLowerCase();
    if (dom && !rsByDomain.has(dom)) rsByDomain.set(dom, r);
  }

  // 6. Build design detail pages & JSON APIs (batched for speed)
  await mapLimit(catalog, 32, async (entry) => {
      const src = entry.source || "refero";
      const raw = await readDesign(entry.id, src);
      const full = mergeDesign(entry, raw);
      const md = designMarkdown(full);

      await writeJson(`api/designs/${entry.id}.json`, full);
      await writeOut(`api/designs/${entry.id}/design.md`, md);

      const tags = tagsFor(full, descriptors);
      const views = [];
      if (src === "opendesign") {
        const openBytes = await readGalleryArtifact(full.id, "preview.html");
        if (openBytes) {
          await writeOut(`preview/${full.id}/open-design.html`, openBytes);
          views.push({ label: "Open Design", src: `/preview/${full.id}/open-design`, hash: "" });
        }
        const claudeView = await readGalleryArtifact(full.id, "claude/view.html");
        const claudeCover = await readGalleryArtifact(full.id, "claude/cover.html");
        if (claudeCover) await writeOut(`preview/${full.id}/claude/cover.html`, claudeCover);
        if (claudeView) {
          await writeOut(`preview/${full.id}/claude/view.html`, claudeView);
          views.push({ label: "Claude Design", src: `/preview/${full.id}/claude`, hash: "claude" });
        }
        const pkg = await readOpenDesignPackage(full.id);
        if (pkg) {
          await writeJson(`api/packages/${full.id}.json`, pkg);
          for (const f of pkg.files || []) {
            const bytes = f.encoding === "base64" ? Buffer.from(f.content, "base64") : Buffer.from(f.content, "utf8");
            await writeOut(`api/designs/${full.id}/file/${f.path}`, bytes);
          }
        }
        const claude = await readClaudePackage(full.id);
        if (claude) {
          await writeJson(`api/claude/${full.id}.json`, claude);
          for (const f of claude.files || []) {
            const bytes = f.encoding === "base64" ? Buffer.from(f.content, "base64") : Buffer.from(f.content, "utf8");
            await writeOut(`preview/${full.id}/claude/file/${f.path}`, bytes);
          }
        }
      }

      const tokens = full.fullResult?.raw?.colors?.tokens || full.tokens?.tokens?.filter((t) => t.type === "color") || [];
      const sw = tokens.slice(0, 60).map((t) => {
        const hex = t.value || t.hex || t.color || "";
        return '<div class="tok"><span class="chip" style="background:' + kitEsc(hex) + '"></span>' +
          '<span class="tn">' + kitEsc(t.name || t.context || "") + '</span>' +
          '<span class="tv">' + kitEsc(hex) + '</span></div>';
      }).join("");
      const typeScale = full.fullResult?.designSystem?.typeScale || [];
      const ts = typeScale.map((t) =>
        '<div class="tsr"><span class="tsrole">' + kitEsc(t.role) + '</span>' +
        '<span class="tssize">' + kitEsc(t.size) + 'px / ' + kitEsc(t.lineHeight) + '</span></div>'
      ).join("");
      const dos = (full.fullResult?.designSystem?.dos || []).map((d) => '<li>' + kitEsc(d) + '</li>').join("");
      const donts = (full.fullResult?.designSystem?.donts || []).map((d) => '<li>' + kitEsc(d) + '</li>').join("");
      const reference = `designer:${src}:${full.id}`;

      const mainHtml = `
<h2>Color tokens (${tokens.length})</h2><div class="toks">${sw}</div>
${typeScale.length ? `<h2>Type scale</h2><div>${ts}</div>` : ""}
${dos ? `<h2>Do</h2><ul>${dos}</ul>` : ""}
${donts ? `<h2>Don't</h2><ul>${donts}</ul>` : ""}
<h2>DESIGN.md</h2>
<div class="theme-actions">
  <input id="theme-reference" aria-label="Theme reference" value="${kitEsc(reference)}" readonly spellcheck="false">
  <button type="button" id="copy-theme">Copy theme reference</button>
  ${mcpButton(reference, full.siteName || full.id)}
  <a href="/api/designs/${encodeURIComponent(full.id)}/design.md">Open DESIGN.md</a>
  <span id="theme-status" role="status"></span>
</div>
<pre>${kitEsc(md)}</pre>`;

      let pageHtml;
      if (!views.length) {
        let rsMatch = null;
        try {
          const host = new URL(full.url || "").hostname.replace(/^www\./, "").toLowerCase();
          if (host) rsMatch = rsByDomain.get(host) || null;
        } catch {}
        const deepBanner = rsMatch
          ? `<div class="deep-banner">
              <div>
                <strong>Deep Style Profile Available</strong>
                <span>${rsMatch.counts?.components ?? 0} component CSS recipes · ${rsMatch.counts?.surfaces ?? 0} surfaces · ${rsMatch.counts?.typography ?? 0} type recipes · font substitutes &amp; dos/don'ts</span>
              </div>
              <a class="btn" href="/refero-styles/style/${encodeURIComponent(rsMatch.uuid)}">Open Deep Style Profile →</a>
            </div>`
          : "";
        pageHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(KIT_STYLE_LINK)}
<title>${kitEsc(full.siteName)} — Design Systems</title>
<style>
  .wrap{max-width:1040px;margin:0 auto;padding:22px 20px 70px}
  .deep-banner{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:14px 0;padding:12px 15px;border-radius:10px;background:var(--accent-bg);border:1px solid var(--accent-line)}
  .deep-banner strong{display:block;color:var(--strong);font-size:14px}
  .deep-banner span{font-size:12.5px;color:var(--muted)}
  .shot-card{margin:18px 0 6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .shot-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}
  .shot-bar button{font:inherit;color:var(--strong);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 9px;cursor:pointer}
  .shot-wrap{max-height:540px;overflow:auto;background:var(--panel2)}
  .shot-wrap.full{max-height:none}
  .shot-wrap img{display:block;width:100%;height:auto}
  .toks{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
  .tok{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12px}
  .chip{width:20px;height:20px;border-radius:5px;border:1px solid var(--line);flex:none}
  .tn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tv{color:var(--muted);font-family:var(--mono);font-size:11px}
  .tsr{display:flex;justify-content:space-between;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 11px;margin-bottom:5px;font-size:13px}
  .tsrole{color:var(--muted)}
  ul{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 12px 12px 30px}
  pre{background:var(--code-bg);color:var(--code-fg);border:1px solid var(--line);border-radius:8px;padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
  .theme-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px}
  .theme-actions input,.theme-actions button{font:inherit;color:inherit;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:5px 9px}
  .theme-actions input{width:54ch;max-width:100%;font-family:var(--mono);font-size:12px}
  .theme-actions button{cursor:pointer}
  .theme-actions [role=status]{color:var(--muted);font-size:12px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:26px 0 10px}
</style></head><body>
${kitNav("designs")}
<div class="wrap">
<a href="/">&larr; All design systems</a>
<h1>${kitEsc(full.siteName)}</h1>
<p class="lede">${kitEsc(full.northStar || "")}</p>
${full.url ? `<p class="lede">Source <code>${kitEsc(full.url)}</code></p>` : ""}
${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${kitEsc(t)}</li>`).join("")}</ul>` : ""}
${deepBanner}
<div class="shot-card">
  <div class="shot-bar"><span>Cached screenshot preview</span><button type="button" id="toggle-shot">Expand full height</button></div>
  <div class="shot-wrap" id="shot-wrap"><img src="/thumb/${encodeURIComponent(full.id)}" alt="${kitEsc(full.siteName)} preview"></div>
</div>
${mainHtml}
</div>
<script>
const shotWrap = document.getElementById('shot-wrap');
const toggleShot = document.getElementById('toggle-shot');
toggleShot.addEventListener('click', () => {
  const full = shotWrap.classList.toggle('full');
  toggleShot.textContent = full ? 'Collapse height' : 'Expand full height';
});
const reference = document.getElementById('theme-reference');
const status = document.getElementById('theme-status');
document.getElementById('copy-theme').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(reference.value);
    status.textContent = 'Theme reference copied.';
  } catch {
    reference.focus();
    reference.select();
    status.textContent = 'Theme reference selected. Copy it with your keyboard.';
  }
});
</script>
</body></html>`;
      } else {
        const aside = [];
        const claude = await readClaudePackage(full.id);
        const claudeFiles = claude?.files ?? [];
        if (views.length > 1) {
          aside.push(promptPanel("p-open", `Use the Open Design design system "${full.id}" for my designs.`, "Use it with Open Design"));
        }
        if (claudeFiles.length) {
          aside.push(promptPanel("p-claude", `Add the "${full.siteName}" design system to my Claude design systems.`, "Add it to Claude Design"));
        }
        aside.push(filePanel("Open Design files", [
          { label: "DESIGN.md", href: `/api/designs/${encodeURIComponent(full.id)}/design.md` },
          { label: "tokens.css", href: `/api/designs/${encodeURIComponent(full.id)}/file/tokens.css` },
        ]));
        if (claudeFiles.length) {
          aside.push(filePanel("Claude Design files", claudeFiles.map((f) => ({
            label: f.path,
            href: `/preview/${encodeURIComponent(full.id)}/claude/file/${f.path.split("/").map(encodeURIComponent).join("/")}`,
          }))));
        }
        aside.push(`<section><h2>Theme reference</h2><pre class="prompt" id="p-reference">${kitEsc(reference)}</pre><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><button type="button" class="btn" data-copy="p-reference">Copy reference</button>${mcpButton(reference, full.siteName || full.id)}</div></section>`);
        pageHtml = designDetailHtml({
          design: { siteName: full.siteName, northStar: full.northStar || "" },
          views,
          main: mainHtml,
          aside: aside.join("\n"),
          tags,
        });
      }

      await writeOut(`design/${full.id}/index.html`, relativizeHtml(pageHtml, 2, { assetBase, thumbMap }));
  });

  // 7. Components (unified components/index.html is emitted once in step 12b)
  const compIndex = await readComponentsIndex();
  await writeJson("api/components.json", compIndex);
  await mapLimit(compIndex.components || [], 32, async ({ slug }) => {
    const comp = await readComponent(slug);
    if (!comp) return;
    await writeJson(`api/component/${slug}.json`, comp);
    const previewPaths = (comp.variants || []).map((item) => frontend.previewPath(slug, item));
    for (const item of comp.variants || []) {
      const entry = manifest?.previews?.[slug]?.[item.id];
      if (!entry) continue;
      const p3 = prefixFor(3);
      const doc = entry.native
        ? frontend.previewDocument(slug, item)
        : previewHtml(`${p3}assets/${manifest.version}/${entry.module}`, `${p3}assets/${manifest.version}/previews/preview.css`);
      if (doc) await writeOut(`component/${slug}/preview/${item.id}.html`, doc);
    }
    await writeOut(`component/${slug}/index.html`, relativizeHtml(componentDetailHtml(comp, previewPaths), 2, { assetBase }));
  });

  // 7b. ReUI Components
  const reuiIndex = await readReuiIndex();
  if (reuiIndex.categories?.length) {
    await writeJson("api/reui.json", reuiIndex);
    await writeOut("reui/index.html", relativizeHtml(reuiCatalogHtml(reuiIndex), 1, { assetBase }));
    await mapLimit(reuiIndex.categories, 16, async ({ slug }) => {
      for (const theme of ["light", "dark"]) {
        const file = `${slug}-${theme}.png`;
        const src = join(CACHE_DIR, "reui", "screenshots", file);
        if (existsSync(src)) await copyOut(src, `reui/screenshot/${file}`);
      }
      const cat = await readReuiCategory(slug);
      if (!cat) return;
      await writeJson(`api/reui/${slug}.json`, cat);
      const p3 = prefixFor(3);
      await mapLimit(cat.items || [], 24, async (item) => {
        const entry = manifest?.reuiPreviews?.[slug]?.[item.name];
        if (!entry) return;
        const doc = previewHtml(`${p3}assets/${manifest.version}/${entry.module}`, `${p3}assets/${manifest.version}/previews/reui.css`, "style-nova");
        await writeOut(`reui/preview/${slug}/${item.name}.html`, doc);
      });
      await writeOut(`reui/${slug}/index.html`, relativizeHtml(reuiCategoryHtml(reuiIndex, cat, frontend.reuiPreviewPath), 2, { assetBase }));
    });
  }

  // 7c. HeroUI v3 docs (catalog, rendered pages, live CSS previews, and remote endpoints)
  const heroUiCatalog = await readHeroUiCatalog();
  if (heroUiCatalog.components?.length) {
    await writeJson("api/heroui.json", heroUiCatalog);
    await writeOut("heroui/index.html", relativizeHtml(herouiCatalogHtml(heroUiCatalog), 1, { assetBase }));
    const heroMinCssPath = join(CACHE_DIR, "heroui", "styles", "heroui.min.css");
    if (existsSync(heroMinCssPath)) {
      await copyOut(heroMinCssPath, "heroui/css/heroui.min.css");
      await mapLimit(listHeroUiPreviewSlugs(), 24, async (slug) => {
        const doc = heroUiPreviewDocument(slug, { cssHref: "../css/heroui.min.css" });
        if (doc) await writeOut(`heroui/preview/${slug}.html`, doc);
      });
    }
    await mapLimit(heroUiCatalog.components, 24, async (entry) => {
      const content = await readHeroUiDoc(entry.path);
      if (content === null) return;
      await writeOut(`api/heroui/doc/${entry.path}`, content);
      await writeOut(
        `heroui/component/${entry.slug}/index.html`,
        relativizeHtml(herouiDocHtml(heroUiCatalog, entry, "component", content), 3, { assetBase }),
      );
      if (heroUiCatalog.hasSource) {
        const src = await readHeroUiSource(entry.name);
        if (src) await writeJson(`api/heroui/source/${entry.slug}.json`, src);
      }
      if (heroUiCatalog.hasStyles) {
        const css = await readHeroUiStyles(entry.name);
        if (css !== null) await writeOut(`api/heroui/styles/${entry.slug}.css`, css);
      }
    });
    await mapLimit(heroUiCatalog.guides, 24, async (guide) => {
      const content = await readHeroUiDoc(guide.path);
      if (content === null) return;
      await writeOut(`api/heroui/doc/${guide.path}`, content);
      await writeOut(
        `heroui/guide/${guide.slug}/index.html`,
        relativizeHtml(herouiDocHtml(heroUiCatalog, guide, "guide", content), 3, { assetBase }),
      );
    });
    const theme = await readHeroUiTheme();
    if (theme) await writeJson("api/heroui/theme.json", theme);
    const migIndex = await readHeroUiMigrationIndex();
    if (migIndex) {
      await writeJson("api/heroui/migration/index.json", migIndex);
      await mapLimit(migIndex.files || [], 24, async (file) => {
        const content = await readHeroUiMigrationDoc(file.name);
        if (content !== null) await writeOut(`api/heroui/migration/${file.name}`, content);
      });
    }
  }

  // 7d. Base UI docs
  const baseUiCatalog = await readBaseUiCatalog();
  if (baseUiCatalog.components?.length) {
    const baseUiReuiSlugs = new Set((reuiIndex.categories || []).map((c) => c.slug));
    await writeJson("api/baseui.json", baseUiCatalog);
    await writeOut("baseui/index.html", relativizeHtml(baseUiCatalogHtml(baseUiCatalog, { reuiSlugs: baseUiReuiSlugs }), 1, { assetBase }));
    const baseUiEntries = [...baseUiCatalog.components, ...(baseUiCatalog.guides || [])];
    await mapLimit(baseUiEntries, 24, async (entry) => {
      const content = await readBaseUiDoc(entry.path);
      if (content === null) return;
      await writeOut(`api/baseui/doc/${entry.path}`, content);
      await writeOut(
        `baseui/doc/${entry.path.replace(/\.md$/, "")}/index.html`,
        relativizeHtml(baseUiDocHtml(baseUiCatalog, entry, content, { reuiSlugs: baseUiReuiSlugs }), 4, { assetBase }),
      );
    });
  }

  // 7e. Dashboards
  const dashIndex = await readDashboardsIndex();
  if (dashIndex.dashboards?.length) {
    await writeJson("api/dashboards.json", dashIndex);
    await writeOut("dashboards/index.html", relativizeHtml(dashboardsHtml(dashIndex), 1, { assetBase }));
    await mapLimit(dashIndex.dashboards, 8, async ({ slug }) => {
      const rec = await readDashboard(slug);
      if (!rec) return;
      await writeJson(`api/dashboard/${slug}.json`, rec);
      const cover = await readDashboardCover(slug);
      if (cover) await writeOut(`dashboard/${slug}/cover.png`, cover);
      const tplZip = await readDashboardArchive(slug, "template");
      if (tplZip) await writeOut(`dashboard/${slug}/${slug}-offline.zip`, tplZip);
      const fontsZip = await readDashboardArchive(slug, "fonts");
      if (fontsZip) await writeOut(`dashboard/${slug}/fonts.zip`, fontsZip);
      await writeOut(`dashboard/${slug}/index.html`, relativizeHtml(dashboardDetailHtml(rec), 2, { assetBase }));
    });
  }

  // 7f. Mantine UI catalog
  const mantineCatalog = await readMantineCatalog();
  if (mantineCatalog.components?.length) {
    const mantineHelpers = {
      previewPath: (slug) => frontend.mantinePreviewPath(slug),
      thumbnailPath: (slug) => frontend.mantineThumbnailPath(slug),
    };
    const provenance = await readMantineProvenance();
    if (provenance) await writeJson("api/mantine/provenance.json", provenance);
    const licence = await readMantineLicence();
    if (licence) await writeOut("api/mantine/LICENCE", licence);
    await writeJson("api/mantine.json", {
      ...mantineCatalog,
      vendor: provenance?.packages
        ? Object.fromEntries(Object.entries(provenance.packages).map(([name, rec]) => [name, rec.version]))
        : {},
    });
    await writeOut("mantine/index.html", relativizeHtml(mantineCatalogHtml(mantineCatalog, mantineHelpers), 1, { assetBase }));
    const categories = (mantineCatalog.groups || []).flatMap((g) =>
      g.categories.map((c) => ({ ...c, group: g.name })));
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
    await mapLimit(categories, 24, async (category) => {
      await writeOut(
        `mantine/category/${category.slug}/index.html`,
        relativizeHtml(mantineCategoryHtml(mantineCatalog, category, mantineHelpers), 3, { assetBase }),
      );
      // Emit once under mantine/images/<file>; relativizeHtml maps /mantine/asset/ -> mantine/images/.
      for (const theme of ["light", "dark"]) {
        const file = category.image?.[theme];
        if (!file) continue;
        const src = join(CACHE_DIR, "mantine", file);
        if (existsSync(src)) await copyOut(src, `mantine/${file}`);
      }
    });
    const layer = manifest?.mantinePreviews;
    if (layer) {
      const p3 = prefixFor(3);
      const imports = {};
      for (const specifier of ["react", "react-dom", "react-dom/client", "react/jsx-runtime"]) {
        const file = manifest.importMap?.[specifier];
        if (file) imports[specifier] = `${p3}${assetBase}/${file}`;
      }
      for (const [specifier, file] of Object.entries(layer.vendor)) {
        imports[specifier] = `${p3}${assetBase}/${file}`;
      }
      const mantineImportMap = { imports };
      await mapLimit(Object.entries(layer.previews || {}), 32, async ([slug, entry]) => {
        await writeOut(
          `mantine/preview/${slug}.html`,
          previewHtml(`${p3}${assetBase}/${entry.module}`, `${p3}${assetBase}/${layer.css}`, "", mantineImportMap),
        );
      });
    }
    await mapLimit(mantineCatalog.components, 24, async ({ slug }) => {
      const detail = await readMantineComponent(slug);
      if (!detail) return;
      await writeJson(`api/mantine/component/${slug}.json`, detail);
      const category = categoryBySlug.get(detail.category);
      await writeOut(
        `mantine/component/${slug}/index.html`,
        relativizeHtml(mantineComponentHtml(mantineCatalog, detail, { ...mantineHelpers, category }), 3, { assetBase }),
      );
    });
  }

  // 7g. daisyUI catalog
  const daisyuiCatalog = await readDaisyuiCatalog();
  if (daisyuiCatalog.components?.length) {
    const daisyuiHelpers = {
      previewPath: (slug) => frontend.daisyuiPreviewPath(slug),
      thumbnailPath: (slug) => frontend.daisyuiThumbnailPath(slug),
    };
    const daisyuiProvenance = await readDaisyuiProvenance();
    if (daisyuiProvenance) await writeJson("api/daisyui/provenance.json", daisyuiProvenance);
    await writeJson("api/daisyui/themes.json", { total: daisyuiCatalog.themes?.length || 0, themes: daisyuiCatalog.themes || [] });
    await writeJson("api/daisyui.json", daisyuiCatalog);
    await writeOut("daisyui/index.html", relativizeHtml(daisyuiCatalogHtml(daisyuiCatalog, daisyuiHelpers), 1, { assetBase }));
    for (const name of ["daisyui", "themes", "compat"]) {
      const css = await readDaisyuiCss(name);
      if (css !== null) {
        if (name === "daisyui" || name === "compat") await writeOut(`daisyui/preview/${name}.css`, css);
        await writeOut(`api/daisyui/css/${name}.css`, css);
      }
    }
    const daisyuiLayer = manifest?.daisyuiPreviews;
    if (daisyuiLayer) {
      await mapLimit(Object.entries(daisyuiLayer.previews || {}), 32, async ([slug, entry]) => {
        if (!Object.hasOwn(manifest.files, entry.file)) return;
        try {
          await copyOut(join(FRONTEND_DIR, "public", entry.file), `daisyui/preview/${slug}.html`);
        } catch { /* a missing preview document just loses one iframe */ }
      });
    }
    await mapLimit(daisyuiCatalog.components, 24, async ({ slug }) => {
      const detail = await readDaisyuiComponent(slug);
      if (!detail) return;
      await writeJson(`api/daisyui/component/${slug}.json`, detail);
      await writeOut(
        `daisyui/component/${slug}/index.html`,
        relativizeHtml(daisyuiComponentHtml(daisyuiCatalog, detail, daisyuiHelpers), 3, { assetBase }),
      );
    });
  }

  // 7h. UI kits (parallelized, O(1) file-map lookup, direct disk copy for remote mirror)
  const uikitsIndex = await readUikitsIndex();
  const uikitCatalogMap = new Map();
  if (uikitsIndex.kits?.length) {
    await writeJson("api/uikits.json", uikitsIndex);
    await writeOut("uikits/index.html", relativizeHtml(uikitsIndexHtml(uikitsIndex), 1, { assetBase }));
    for (const row of uikitsIndex.kits) {
      const kitCatalog = await readUikitCatalog(row.kit);
      if (!kitCatalog) continue;
      if (!row.error) uikitCatalogMap.set(row.kit, kitCatalog);
      await writeJson(`api/uikits/${row.kit}/catalog.json`, kitCatalog);
      await writeOut(`uikits/${row.kit}/index.html`, relativizeHtml(uikitKitHtml(kitCatalog), 2, { assetBase }));
      const kitManifest = await readUikitFiles(row.kit);
      if (kitManifest) await writeJson(`api/uikits/${row.kit}/files.json`, kitManifest);
      const bakedFileMap = new Map(Object.entries(kitManifest?.files || {}));
      const kitDir = join(CACHE_DIR, "uikits", row.kit);

      await mapLimit(kitCatalog.items, 32, async (item) => {
        const wanted = [
          ...(item.docs || []),
          ...(item.source || []),
          ...(item.demo || []),
          ...(item.registry || []),
        ];
        const itemFiles = [];
        for (const path of wanted) {
          if (bakedFileMap.has(path)) itemFiles.push({ path, bytes: bakedFileMap.get(path) });
        }
        let docsContent = "";
        if (item.docs?.length) {
          const primary = item.primaryDoc && item.docs.includes(item.primaryDoc) ? item.primaryDoc : item.docs[0];
          const docSrc = join(kitDir, primary);
          if (existsSync(docSrc)) docsContent = await readFile(docSrc, "utf8");
        }
        await writeOut(
          `uikits/${row.kit}/item/${item.slug}/index.html`,
          relativizeHtml(uikitItemHtml(kitCatalog, item, docsContent, itemFiles), 4, { assetBase }),
        );
        if (item.previewable) {
          const cssRel = (item.source || []).find((f) => f.startsWith("assets/") && f.endsWith(".css"));
          const cssSrc = cssRel ? join(kitDir, cssRel) : null;
          const cssText = cssSrc && existsSync(cssSrc) ? await readFile(cssSrc, "utf8") : null;
          if (cssRel && cssText !== null) {
            await writeOut(`uikits/${row.kit}/raw/${cssRel}`, cssText);
            await writeOut(
              `uikits/${row.kit}/preview/${item.slug}/index.html`,
              relativizeHtml(uikitPreviewHtml(kitCatalog, { ...item, _cssText: cssText }, cssRel), 4, { assetBase }),
            );
          }
        }
      });

      // Remote-mode mirror: batch direct file copies instead of thrashing readUikitFile LRU.
      const manifestPaths = Object.keys(kitManifest?.files || {});
      await mapLimit(manifestPaths, 48, async (path) => {
        const src = join(kitDir, path);
        if (existsSync(src)) await copyOut(src, `api/uikits/${row.kit}/file/${path}`);
      });
    }
  }

  // 7i. Refero Styles (only copy catalog-referenced assets + parallelized rendering)
  if (rsCatalog.styles?.length) {
    const rsAssetPath = (file) => `/refero-styles/asset/${file}`;
    const designByDom = new Map();
    for (const row of catalog) {
      try {
        const host = new URL(row.url || "").hostname.replace(/^www\./, "").toLowerCase();
        if (host && !designByDom.has(host)) designByDom.set(host, row.id);
      } catch {}
    }
    const rsRowByUuid = new Map(rsCatalog.styles.map((r) => [r.uuid, r]));
    await writeJson("api/refero-styles.json", rsCatalog);
    const rsProv = await readReferoStylesProvenance();
    if (rsProv) await writeJson("api/refero-styles/provenance.json", rsProv);
    await writeOut(
      "refero-styles/index.html",
      relativizeHtml(referoStylesCatalogHtml(rsCatalog, { assetPath: rsAssetPath }), 1, { assetBase }),
    );

    // Copy only assets referenced by the catalog (skips unreferenced extra previews).
    const assetsDir = join(CACHE_DIR, "refero-styles", "assets");
    if (existsSync(assetsDir)) {
      const referencedAssets = new Set();
      for (const row of rsCatalog.styles) {
        if (row.preview) referencedAssets.add(row.preview);
        if (row.fontsPreview) referencedAssets.add(row.fontsPreview);
        if (row.favicon) referencedAssets.add(row.favicon);
        for (const f of row.screenshots || []) if (f) referencedAssets.add(f);
      }
      await mapLimit([...referencedAssets], 48, async (file) => {
        const src = join(assetsDir, file);
        if (existsSync(src)) await copyOut(src, `refero-styles/asset/${file}`);
      });
    }

    await mapLimit(rsCatalog.styles, 32, async (row) => {
      const record = await readReferoStyle(row.uuid);
      if (!record) return;
      await writeJson(`api/refero-styles/style/${row.uuid}.json`, record);
      await writeOut(
        `refero-styles/style/${row.uuid}/index.html`,
        relativizeHtml(
          referoStyleHtml(rsCatalog, record, {
            assetPath: rsAssetPath,
            designLink: (domain) => designByDom.get(String(domain || "").replace(/^www\./, "").toLowerCase()) || null,
            rowOverride: rsRowByUuid.get(row.uuid),
          }),
          3,
          { assetBase },
        ),
      );
    });
  }

  // 8. Tailwind (HyperUI & shadcn/ui)
  await writeOut("tailwind/index.html", relativizeHtml(tailwindCatalogHtml("hyperui", frontend.tailwindGroups("hyperui")), 1, { assetBase }));
  await writeOut("tailwind/shadcn/index.html", relativizeHtml(tailwindCatalogHtml("shadcn", frontend.tailwindGroups("shadcn")), 2, { assetBase }));
  for (const source of ["hyperui", "shadcn"]) {
    for (const group of frontend.tailwindGroups(source)) {
      const variantsData = [];
      for (const item of group.variants) {
        const ex = await frontend.tailwindExample(item);
        if (!ex) continue;
        const p3 = prefixFor(3);
        variantsData.push({
          id: item.id,
          preview: `${p3}assets/${manifest.version}/${item.preview}`,
          download: `${p3}assets/${manifest.version}/${item.source}`,
          code: ex.code,
        });
      }
      if (!variantsData.length) continue;
      const firstEx = await frontend.tailwindExample(group.variants[0]);
      const rawHtml = tailwindExampleHtml(source, group, group.variants[0].id, firstEx);
      const patched = patchTailwindStaticDetail(relativizeHtml(rawHtml, 3, { assetBase }), source, group, variantsData);
      await writeOut(`tailwind/${source}/${group.slug}/index.html`, patched);
    }
  }

  // 9. Presets
  const presetsIndex = await readPresetsIndex();
  await writeJson("api/presets.json", presetsIndex);
  await writeOut("presets/index.html", relativizeHtml(presetsHtml(presetsIndex), 1, { assetBase }));
  for (const { kind } of presetsIndex.catalogs || []) {
    const pCat = await readPresetCatalog(kind);
    if (!pCat) continue;
    await writeJson(`api/presets/${kind}.json`, pCat);
    await writeOut(`presets/${kind}/index.html`, relativizeHtml(presetDetailHtml(pCat), 2, { assetBase }));
  }

  // 10. Library catalog (JSON only, no HTML: agents pick install manifests here)
  const libsIndex = await readLibrariesIndex();
  await writeJson("api/libraries.json", libsIndex);
  for (const lib of libsIndex.libraries || []) {
    const entry = await readLibraryEntry(lib.id);
    if (!entry) continue;
    await writeJson(`api/library/${lib.id}.json`, entry);
  }

  // 11. System templates
  const dsIndex = await readDesignSystemsIndex();
  await writeJson("api/templates.json", dsIndex);
  const templateThumbMap = new Map();
  for (const sys of dsIndex.systems || []) {
    const rec = await readDesignSystem(sys.slug);
    if (!rec) continue;
    await writeJson(`api/template/${sys.slug}.json`, rec);
    for (const file of rec.files || []) {
      if (file.binary || !file.path || file.path.includes("..") || file.path.includes("\\")) continue;
      const srcPath = join(CACHE_DIR, "design-systems", sys.slug, file.path);
      if (existsSync(srcPath)) {
        await writeOut(`api/template/${sys.slug}/${file.path}`, await readFile(srcPath, "utf8"));
      }
    }
    if (rec.thumbnailImage && !rec.thumbnailImage.includes("..")) {
      const imgPath = join(CACHE_DIR, "design-systems", rec.thumbnailImage);
      if (existsSync(imgPath)) {
        const ext = extname(rec.thumbnailImage) || ".webp";
        const rel = `template/${sys.slug}/thumb${ext}`;
        await cp(imgPath, join(OUT_DIR, rel));
        templateThumbMap.set(sys.slug, rel);
      }
    }
    await writeOut(
      `template/${sys.slug}/index.html`,
      relativizeHtml(templateDetailHtml(rec, frontend.templateLinks(sys.slug)), 2, { assetBase, templateThumbMap }),
    );
  }
  await writeOut("templates/index.html", relativizeHtml(templatesHtml(dsIndex), 1, { assetBase, templateThumbMap }));

  // 11. Offline UI SDK docs
  const uiSdkDir = join(SKILLS_ROOT, "designer-ui", "ui-sdk");
  const uiSdkIndex = await listUiSdkDocs(uiSdkDir);
  await writeJson("api/ui-sdk-docs.json", uiSdkIndex);
  for (const doc of uiSdkIndex.docs || []) {
    const content = await readUiSdkDoc(doc.path, uiSdkDir);
    if (content !== null) await writeOut(`api/ui-sdk-docs/${doc.path}`, content);
  }
  const docsHtml = relativizeHtml(uiSdkDocsHtml(uiSdkIndex.docs || []), 1, { assetBase })
    .replaceAll("'/api/ui-sdk-docs/'", "'../api/ui-sdk-docs/'");
  await writeOut("docs/index.html", docsHtml);

  // 12. Unified Hubs (Design Systems index, Components Hub + Comparator, CDN Browsers, Starters, Assets with Libraries)
  function staticHref(raw, depth) {
    if (!raw || !raw.startsWith("/")) return raw;
    const p = prefixFor(depth);
    if (raw === "/") return `${p}index.html`;
    if (raw.startsWith("/assets/")) return `${p}${raw.slice(1)}`;
    if (raw.startsWith("/reui/screenshot/")) return `${p}${raw.slice(1)}`;
    if (raw.startsWith("/refero-styles/asset/")) return `${p}${raw.slice(1)}`;
    if (/^\/reui\/preview\/([a-z0-9-]+)\/([a-z0-9-]+)$/.test(raw)) return `${p}${raw.slice(1)}.html`;
    if (/^\/mantine\/preview\/([a-z0-9-]+)$/.test(raw)) return `${p}${raw.slice(1)}.html`;
    if (/^\/daisyui\/preview\/([a-z0-9-]+)$/.test(raw)) return `${p}${raw.slice(1)}.html`;
    if (/^\/heroui\/preview\/([a-z0-9-]+)$/.test(raw)) return `${p}${raw.slice(1)}.html`;
    if (/^\/component\/([a-z0-9-]+)\/preview\/([a-z0-9-]+)$/.test(raw)) return `${p}${raw.slice(1)}.html`;
    if (/^\/component\/([a-z0-9-]+)\/thumbnail\/([a-z0-9-]+)$/.test(raw)) {
      const slug = raw.split("/")[2];
      return assetBase ? `${p}${assetBase}/thumbnails/components/${slug}.jpg` : raw;
    }
    const [pathOnly, qs] = raw.split("?");
    const clean = pathOnly.replace(/^\/|\/$/g, "");
    return `${p}${clean}/index.html${qs ? `?${qs}` : ""}`;
  }

  // 12a. Unified Design Systems index & root index.html
  const galleryIds = new Set();
  const claudeIds = new Set();
  for (const d of catalog) {
    if ((d.source || "refero") === "opendesign") {
      if (existsSync(join(CACHE_DIR, "gallery", d.id, "preview.html"))) galleryIds.add(d.id);
      if (existsSync(join(CACHE_DIR, "claude", `${d.id}.json`))) claudeIds.add(d.id);
    }
  }
  const unifiedDesigns = buildUnifiedDesignsIndex({
    catalog,
    descriptors,
    referoStyles: rsCatalog?.styles || [],
    templates: dsIndex.systems || [],
    galleryIds,
    claudeIds,
    thumbFor: (id) => `./${thumbMap.get(id) || `thumb/${id}.svg`}`,
    rsAssetFor: (file) => `./refero-styles/asset/${file}`,
    templateThumbFor: (slug) => `./${templateThumbMap.get(slug) || `template/${slug}/thumb.webp`}`,
  });
  const staticDesignsPayload = {
    ...unifiedDesigns,
    designs: unifiedDesigns.designs.map((d) => ({
      ...d,
      href: staticHref(d.href, 0),
      deepHref: d.deepHref ? staticHref(d.deepHref, 0) : null,
    })),
  };
  await writeJson("api/designs-index.json", staticDesignsPayload);
  await writeOut(
    "index.html",
    relativizeHtml(
      unifiedDesignsHtml({
        total: unifiedDesigns.total,
        facets: unifiedDesigns.facets,
        indexUrl: "./api/designs-index.json",
        initialDesigns: staticDesignsPayload.designs.slice(0, 24),
      }),
      0,
      { assetBase, thumbMap, templateThumbMap },
    ),
  );

  // 12b. Unified Components Hub, Cross-Library Comparator, and Offline CDN Browsers (reusing uikitCatalogMap)
  const componentsHub = buildUnifiedComponentsHub({
    componentsIndex: compIndex,
    reuiIndex,
    herouiCatalog: heroUiCatalog,
    mantineCatalog,
    daisyuiCatalog,
    baseuiCatalog: baseUiCatalog,
    uikitsIndex,
    uikitCatalogs: uikitCatalogMap,
    tailwindShadcn: frontend.tailwindGroups("shadcn"),
    tailwindHyperui: frontend.tailwindGroups("hyperui"),
    frontend,
  });
  const rewriteHubItem = (it, depth) => ({
    ...it,
    href: staticHref(it.href, depth),
    previewUrl: it.previewUrl ? staticHref(it.previewUrl, depth) : null,
    thumb: it.thumb ? staticHref(it.thumb, depth) : null,
  });
  const staticHubDepth1 = {
    totals: componentsHub.totals,
    libraries: componentsHub.libraries.map((l) => ({ ...l, href: staticHref(l.href, 1) })),
    concepts: componentsHub.concepts.map((c) => ({
      ...c,
      implementations: c.implementations.map((im) => rewriteHubItem(im, 1)),
    })),
    items: componentsHub.items.map((it) => rewriteHubItem(it, 1)),
  };
  await writeJson("api/components-hub.json", staticHubDepth1);
  await writeOut(
    "components/index.html",
    relativizeHtml(
      unifiedComponentsHtml({
        componentsCatalog: compIndex,
        hub: componentsHub,
        thumbnailPath: frontend.thumbnailPath,
        hubUrl: "../api/components-hub.json",
      }),
      1,
      { assetBase },
    ),
  );
  await writeOut(
    "components/compare/index.html",
    relativizeHtml(compareIndexHtml(componentsHub), 2, { assetBase }),
  );
  for (const concept of componentsHub.concepts || []) {
    const staticConcept = {
      ...concept,
      implementations: concept.implementations.map((im) => rewriteHubItem(im, 3)),
    };
    await writeOut(
      `components/compare/${concept.slug}/index.html`,
      relativizeHtml(compareConceptHtml(staticConcept, componentsHub), 3, { assetBase }),
    );
  }
  const cdnCounts = { concepts: componentsHub.concepts.length };
  await writeOut(
    "components/icons/index.html",
    relativizeHtml(iconsBrowserHtml({ manifest: frontend.publicManifest, counts: cdnCounts }), 2, { assetBase }),
  );
  await writeOut(
    "components/charts/index.html",
    relativizeHtml(chartsBrowserHtml({ manifest: frontend.publicManifest, counts: cdnCounts }), 2, { assetBase }),
  );
  await writeOut(
    "components/fonts/index.html",
    relativizeHtml(fontsBrowserHtml({ manifest: frontend.publicManifest, counts: cdnCounts }), 2, { assetBase }),
  );

  // 12c. Starters hub & Assets page with library manifests
  await writeOut(
    "starters/index.html",
    relativizeHtml(
      startersHtml({
        dashboards: dashIndex?.dashboards || [],
        templates: dsIndex?.systems || [],
        slopstrap: frontend.publicManifest?.slopstrap || null,
      }),
      1,
      { assetBase, templateThumbMap },
    ),
  );
  const fullLibraries = await Promise.all(
    (libsIndex?.libraries || []).map(async (row) => (await readLibraryEntry(row.id)) || row),
  );
  await writeOut(
    "assets/index.html",
    relativizeHtml(assetsHtml(frontend.publicManifest, frontend.importMap(), "", fullLibraries), 1, { assetBase }),
  );

  // 13. Emit shared content-hashed shell CSS/JS bundles
  await ensureDir(join(OUT_DIR, "shell"));
  for (const asset of SHELL_ASSETS.values()) {
    await writeOut(`shell/${asset.filename}`, asset.content);
  }

  console.log(`Static site built at ${OUT_DIR} (${unifiedDesigns.total} unified designs, ${componentsHub.totals.items} components across ${componentsHub.totals.libraries} libraries, ${componentsHub.concepts.length} cross-library comparisons, ${SHELL_ASSETS.size} shared shell assets).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
