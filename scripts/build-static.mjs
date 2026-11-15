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
import { loadFrontend, previewHtml } from "./lib/frontend.mjs";
import {
  KIT_CSS,
  KIT_NAV_CSS,
  designDetailHtml,
  esc as kitEsc,
  filePanel,
  kitNav,
  promptPanel,
} from "./lib/kit-ui.mjs";
import {
  assetsHtml,
  componentDetailHtml,
  componentsHtml,
  nav,
  presetDetailHtml,
  presetsHtml,
  tailwindCatalogHtml,
  tailwindExampleHtml,
  templateDetailHtml,
  templatesHtml,
  uiSdkDocsHtml,
} from "./lib/ui.mjs";
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
const SKILL_DIR = resolve(arg("--skill", process.env.SKILL_DIR || join(ROOT, "skills", "designer-mcp")));
const OUT_DIR = resolve(arg("--out", join(ROOT, "dist", "static")));

// Ensure cache.mjs reads from CACHE_DIR if not set in env
process.env.DESIGN_CACHE_DIR = CACHE_DIR;

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

async function writeOut(rel, content) {
  const target = join(OUT_DIR, rel);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function writeJson(rel, data) {
  await writeOut(rel, JSON.stringify(data));
}

function prefixFor(depth) {
  return depth === 0 ? "./" : "../".repeat(depth);
}

/**
 * Rewrite root-relative URLs in HTML produced by ui.mjs / kit-ui.mjs so they
 * work from any static subdirectory depth (e.g. GitLab Pages subpaths).
 */
function relativizeHtml(html, depth, { assetBase, thumbMap, templateThumbMap } = {}) {
  const p = prefixFor(depth);
  let out = html;

  // Rewrite nav and top-level route links
  const routePairs = [
    ['href="/"', `href="${p}index.html"`],
    ['href="/components"', `href="${p}components/index.html"`],
    ['href="/reui"', `href="${p}reui/index.html"`],
    ['href="/tailwind"', `href="${p}tailwind/index.html"`],
    ['href="/tailwind/shadcn"', `href="${p}tailwind/shadcn/index.html"`],
    ['href="/presets"', `href="${p}presets/index.html"`],
    ['href="/templates"', `href="${p}templates/index.html"`],
    ['href="/dashboards"', `href="${p}dashboards/index.html"`],
    ['href="/docs"', `href="${p}docs/index.html"`],
    ['href="/assets"', `href="${p}assets/index.html"`],
    ['href="/skill"', `href="${p}skill/designer-mcp-skill.zip"`],
    ['href="/assets/manifest.json"', `href="${p}assets/manifest.json"`],
    ['href="/assets/starter.zip"', `href="${p}assets/starter.zip"`],
  ];
  for (const [from, to] of routePairs) {
    out = out.replaceAll(from, to);
  }

  // Rewrite dynamic route prefixes
  out = out.replace(/(href|src)="\/design\/([^"?#]+)"/g, (_, attr, id) => `${attr}="${p}design/${id}/index.html"`);
  out = out.replace(/(href|src)="\/component\/([^"/?#]+)"/g, (_, attr, slug) => `${attr}="${p}component/${slug}/index.html"`);
  out = out.replace(/href="\/reui\/([a-z0-9-]+)"/g, (_, slug) => `href="${p}reui/${slug}/index.html"`);
  out = out.replace(/src="\/reui\/screenshot\/([^"]+)"/g, (_, file) => `src="${p}reui/screenshot/${file}"`);
  out = out.replaceAll("'/reui/screenshot/' +", `'${p}reui/screenshot/' +`);
  out = out.replace(
    /(data-base-src|src)="\/reui\/preview\/([a-z0-9-]+)\/([a-z0-9-]+)(\?[^"]*)?"/g,
    (_, attr, cat, name, q) => `${attr}="${p}reui/preview/${cat}/${name}.html${q || ""}"`,
  );
  out = out.replace(/(href|src)="\/presets\/([^"/?#]+)"/g, (_, attr, kind) => `${attr}="${p}presets/${kind}/index.html"`);
  out = out.replace(/(href|src)="\/template\/([^"/?#]+)"/g, (_, attr, slug) => `${attr}="${p}template/${slug}/index.html"`);
  out = out.replace(/href="\/dashboard\/([a-z0-9-]+)"/g, (_, slug) => `href="${p}dashboard/${slug}/index.html"`);
  out = out.replace(/src="\/dashboard\/([a-z0-9-]+)\/cover"/g, (_, slug) => `src="${p}dashboard/${slug}/cover.png"`);
  out = out.replace(/href="\/dashboard\/([a-z0-9-]+)\/download"/g, (_, slug) => `href="${p}dashboard/${slug}/${slug}-offline.zip"`);
  out = out.replace(/href="\/dashboard\/([a-z0-9-]+)\/fonts\.zip"/g, (_, slug) => `href="${p}dashboard/${slug}/fonts.zip"`);
  out = out.replace(/href="\/tailwind\/(hyperui|shadcn)\/([^"?#]+)"/g, (_, src, slug) => `href="${p}tailwind/${src}/${slug}/index.html"`);

  // Rewrite template thumbs
  if (templateThumbMap) {
    out = out.replace(/src="\/template\/([^"/]+)\/thumb"/g, (_, slug) => {
      const file = templateThumbMap.get(decodeURIComponent(slug));
      return `src="${p}${file || `template/${slug}/thumb.webp`}"`;
    });
  }

  // Rewrite design thumbs
  if (thumbMap) {
    out = out.replace(/src="\/thumb\/([^"?#]+)"/g, (_, id) => {
      const decoded = decodeURIComponent(id);
      const file = thumbMap.get(decoded) || `thumb/${decoded}.svg`;
      return `src="${p}${file}"`;
    });
  }

  // Rewrite component thumbnails: /component/<slug>/thumbnail/<id>?v=... -> assets/<ver>/thumbnails/components/<slug>/<id>.jpg
  if (assetBase) {
    out = out.replace(
      /src="\/component\/([a-z0-9-]+)\/thumbnail\/([a-z0-9-]+)(?:\?[^"]*)?"/g,
      (_, slug, id) => `src="${p}${assetBase}/thumbnails/components/${slug}/${id}.jpg"`,
    );
  }

  // Rewrite component preview paths: /component/<slug>/preview/<id> -> ../../component/<slug>/preview/<id>.html
  out = out.replace(
    /"\/component\/([a-z0-9-]+)\/preview\/([a-z0-9-]+)"/g,
    (_, slug, id) => `"${p}component/${slug}/preview/${id}.html"`,
  );

  // Rewrite /assets/<ver>/... and /api/designs/...
  out = out.replace(/(href|src|data-preview)="\/assets\/([^"]+)"/g, (_, attr, rest) => `${attr}="${p}assets/${rest}"`);
  out = out.replace(/href="\/api\/designs\/([^"/]+)\/design\.md"/g, (_, id) => `href="${p}api/designs/${id}/design.md"`);
  out = out.replace(/href="\/api\/designs\/([^"/]+)\/file\/([^"]+)"/g, (_, id, rel) => `href="${p}api/designs/${id}/file/${rel}"`);
  out = out.replace(/href="\/preview\/([^"/]+)\/claude\/file\/([^"]+)"/g, (_, id, rel) => `href="${p}preview/${id}/claude/file/${rel}"`);
  out = out.replace(/data-src="\/preview\/([^"/]+)\/open-design"/g, (_, id) => `data-src="${p}preview/${id}/open-design.html"`);
  out = out.replace(/src="\/preview\/([^"/]+)\/open-design"/g, (_, id) => `src="${p}preview/${id}/open-design.html"`);
  out = out.replace(/data-src="\/preview\/([^"/]+)\/claude"/g, (_, id) => `data-src="${p}preview/${id}/claude/view.html"`);
  out = out.replace(/src="\/preview\/([^"/]+)\/claude"/g, (_, id) => `src="${p}preview/${id}/claude/view.html"`);

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

function staticGalleryHtml({ total, tags, sources, themes }) {
  const chips = tags
    .map((t) => `<button type="button" class="chip" data-tag="${kitEsc(t.value)}" aria-pressed="false">${kitEsc(t.value)} <span class="n">${t.count}</span></button>`)
    .join("");
  const sourceBtns = [
    `<button type="button" class="chip" data-source="" aria-pressed="true">All sources <span class="n">${total}</span></button>`,
    ...sources.map((s) => `<button type="button" class="chip" data-source="${kitEsc(s.value)}" aria-pressed="false">${kitEsc(s.value)} <span class="n">${s.count}</span></button>`),
  ].join("");
  const themeBtns = [
    `<button type="button" class="chip" data-theme="" aria-pressed="true">All themes</button>`,
    ...themes.map((t) => `<button type="button" class="chip" data-theme="${kitEsc(t.value)}" aria-pressed="false">${kitEsc(t.value)} <span class="n">${t.count}</span></button>`),
  ].join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design Systems — ${total} designs</title>
<style>${KIT_CSS}${KIT_NAV_CSS}
  .filter-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 10px; }
  .filter-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-right: 4px; }
  .pager { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 28px; }
  .badge { font-size: 11px; padding: 2px 7px; border-radius: 999px; background: var(--chip); color: var(--muted); }
  .card-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
</style>
</head>
<body>
${kitNav("designs")}
<div class="wrap">
<header class="site">
  <h1>Design systems</h1>
  <p class="lede">Each one sets colors, type and spacing as tokens. Open one to inspect its preview, tokens, and DESIGN.md — 100% offline static gallery.</p>
</header>
<div class="filters" role="search">
  <input id="q" type="search" placeholder="Search ${total} designs (name, font, industry, mood)..." aria-label="Search design systems" autocomplete="off">
</div>
<div class="filter-row" aria-label="Filter by source"><span class="filter-label">Source</span>${sourceBtns}</div>
<div class="filter-row" aria-label="Filter by theme"><span class="filter-label">Theme</span>${themeBtns}</div>
<div class="filters" aria-label="Filter by tag">${chips}</div>
<p class="count" id="count" role="status">Loading ${total} designs…</p>
<ul class="grid" id="grid"></ul>
<div class="pager" id="pager" hidden>
  <button type="button" class="btn secondary" id="load-more">Show more</button>
  <button type="button" class="btn secondary" id="show-all">Show all</button>
</div>
<p class="empty" id="empty" hidden>No design system matches that.</p>
<footer>Design systems are cached locally. Zero external network requests.</footer>
</div>
<script>
const q = document.getElementById('q');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const pager = document.getElementById('pager');
const loadMoreBtn = document.getElementById('load-more');
const showAllBtn = document.getElementById('show-all');
const tagChips = [...document.querySelectorAll('[data-tag]')];
const srcChips = [...document.querySelectorAll('[data-source]')];
const themeChips = [...document.querySelectorAll('[data-theme]')];

let allDesigns = [];
let filtered = [];
let pageLimit = 60;
let activeTag = '';
let activeSource = '';
let activeTheme = '';

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderCard(d) {
  const sw = (d.colors || []).slice(0, 6).map(c => '<span style="background:' + esc(c.hex || c.value || '#888') + '"></span>').join('');
  const tags = (d.tags || []).slice(0, 4).map(t => '<li>' + esc(t) + '</li>').join('');
  return '<li class="card">' +
    '<a href="./design/' + encodeURIComponent(d.id) + '/index.html">' +
      '<img class="thumb" src="./' + esc(d.thumb) + '" alt="" loading="lazy" decoding="async">' +
      (sw ? '<span class="swatches" aria-hidden="true">' + sw + '</span>' : '') +
      '<span class="card-meta"><span class="title">' + esc(d.siteName) + '</span><span class="badge">' + esc(d.source) + '</span></span>' +
    '</a>' +
    (tags ? '<ul class="tags">' + tags + '</ul>' : '') +
  '</li>';
}

function render() {
  const slice = filtered.slice(0, pageLimit);
  grid.innerHTML = slice.map(renderCard).join('');
  count.textContent = filtered.length === allDesigns.length
    ? 'Showing ' + slice.length + ' of ' + allDesigns.length + ' designs'
    : 'Showing ' + slice.length + ' of ' + filtered.length + ' matching designs (' + allDesigns.length + ' total)';
  empty.hidden = filtered.length > 0;
  pager.hidden = slice.length >= filtered.length;
}

function apply() {
  const s = q.value.trim().toLowerCase();
  const terms = s ? s.split(/\\s+/) : [];
  filtered = allDesigns.filter(d => {
    if (activeSource && d.source !== activeSource) return false;
    if (activeTheme && d.colorScheme !== activeTheme) return false;
    if (activeTag && !d.tags.includes(activeTag)) return false;
    if (terms.length && !terms.every(t => d.search.includes(t))) return false;
    return true;
  });
  pageLimit = 60;
  render();
}

q.addEventListener('input', apply);
for (const c of tagChips) c.addEventListener('click', () => {
  activeTag = activeTag === c.dataset.tag ? '' : c.dataset.tag;
  tagChips.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tag === activeTag)));
  apply();
});
for (const c of srcChips) c.addEventListener('click', () => {
  activeSource = c.dataset.source;
  srcChips.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.source === activeSource)));
  apply();
});
for (const c of themeChips) c.addEventListener('click', () => {
  activeTheme = c.dataset.theme;
  themeChips.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.theme === activeTheme)));
  apply();
});
loadMoreBtn.addEventListener('click', () => { pageLimit += 60; render(); });
showAllBtn.addEventListener('click', () => { pageLimit = filtered.length; render(); });

fetch('./api/gallery-index.json').then(r => r.json()).then(data => {
  allDesigns = data.designs || [];
  apply();
});
</script>
</body>
</html>`;
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
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const frontend = await loadFrontend(FRONTEND_DIR);
  const manifest = frontend.publicManifest ? JSON.parse(await readFile(join(FRONTEND_DIR, "manifest.json"), "utf8")) : null;
  const assetBase = manifest ? `assets/${manifest.version}` : null;

  // 1. Copy frontend public assets -> out/assets/<version>/ + starter.zip + manifest.json
  if (manifest) {
    const pubSrc = join(FRONTEND_DIR, "public");
    const verDest = join(OUT_DIR, "assets", manifest.version);
    await mkdir(verDest, { recursive: true });
    for (const entry of await readdir(pubSrc)) {
      if (entry === "starter.zip") {
        await cp(join(pubSrc, entry), join(OUT_DIR, "assets", "starter.zip"));
      } else {
        await cp(join(pubSrc, entry), join(verDest, entry), { recursive: true });
      }
    }
    await writeJson("assets/manifest.json", frontend.publicManifest);
  }
  await writeOut("assets/index.html", relativizeHtml(assetsHtml(frontend.publicManifest), 1, { assetBase }));

  // 2. Copy skill zip & SKILL.md
  if (existsSync(SKILL_DIR)) {
    const zipCandidates = [
      join(SKILL_DIR, "designer-mcp-skill.zip"),
      join(dirname(SKILL_DIR), "designer-mcp-skill.zip"),
      join(ROOT, "dist", "designer-mcp-skill.zip"),
    ];
    for (const z of zipCandidates) {
      if (existsSync(z)) {
        await mkdir(join(OUT_DIR, "skill"), { recursive: true });
        await cp(z, join(OUT_DIR, "skill", "designer-mcp-skill.zip"));
        break;
      }
    }
    if (existsSync(join(SKILL_DIR, "SKILL.md"))) {
      await mkdir(join(OUT_DIR, "skill"), { recursive: true });
      await cp(join(SKILL_DIR, "SKILL.md"), join(OUT_DIR, "skill", "SKILL.md"));
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
  await writeJson("api/catalog.json", { updatedAt: facets.updatedAt, styles: catalog, designs: catalog });
  await writeJson("api/facets.json", facets);
  await writeJson("api/descriptors.json", { systems: descriptors });

  // 4. Copy / build thumbnails for every design
  const thumbMap = new Map();
  await mkdir(join(OUT_DIR, "thumb"), { recursive: true });
  for (const entry of catalog) {
    let copied = false;
    for (const ext of [".webp", ".jpg", ".jpeg", ".png"]) {
      const src = join(CACHE_DIR, "thumbs", `${entry.id}${ext}`);
      if (existsSync(src)) {
        const rel = `thumb/${entry.id}${ext}`;
        await cp(src, join(OUT_DIR, rel));
        thumbMap.set(entry.id, rel);
        copied = true;
        break;
      }
    }
    if (!copied) {
      const cover = await readGalleryThumb(entry.id);
      if (cover) {
        const rel = `thumb/${entry.id}.webp`;
        await writeOut(rel, cover);
        thumbMap.set(entry.id, rel);
        copied = true;
      }
    }
    if (!copied) {
      const rel = `thumb/${entry.id}.svg`;
      await writeOut(rel, swatchSvg(entry));
      thumbMap.set(entry.id, rel);
    }
  }

  // 5. Build gallery-index.json & root index.html
  const galleryItems = catalog.map((entry) => {
    const tags = tagsFor(entry, descriptors);
    const search = [entry.siteName, entry.northStar, entry.industry, ...(entry.fonts || []), ...tags]
      .filter(Boolean).join(" ").toLowerCase();
    return {
      id: entry.id,
      siteName: entry.siteName,
      source: entry.source || "refero",
      colorScheme: entry.colorScheme || "",
      tags,
      search,
      colors: (entry.colors || []).slice(0, 6),
      thumb: thumbMap.get(entry.id),
    };
  });
  await writeJson("api/gallery-index.json", { total: galleryItems.length, designs: galleryItems });

  const tagCounts = new Map();
  for (const item of galleryItems) for (const t of item.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  const chipList = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 32)
    .map(([value, count]) => ({ value, count }));

  const indexHtml = relativizeHtml(
    staticGalleryHtml({ total: galleryItems.length, tags: chipList, sources: facets.sources, themes: facets.themes }),
    0,
    { assetBase, thumbMap },
  );
  await writeOut("index.html", indexHtml);

  // 6. Build design detail pages & JSON APIs (batched for speed)
  const batchSize = 32;
  for (let i = 0; i < catalog.length; i += batchSize) {
    await Promise.all(catalog.slice(i, i + batchSize).map(async (entry) => {
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
  <a href="/api/designs/${encodeURIComponent(full.id)}/design.md">Open DESIGN.md</a>
  <span id="theme-status" role="status"></span>
</div>
<pre>${kitEsc(md)}</pre>`;

      let pageHtml;
      if (!views.length) {
        pageHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kitEsc(full.siteName)} — Design Systems</title>
<style>
${KIT_CSS}${KIT_NAV_CSS}
  .wrap{max-width:1040px;margin:0 auto;padding:22px 20px 70px}
  .shot-card{margin:18px 0 6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .shot-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}
  .shot-bar button{font:inherit;color:var(--strong);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 9px;cursor:pointer}
  .shot-wrap{max-height:540px;overflow:auto;background:var(--panel2)}
  .shot-wrap.full{max-height:none}
  .shot-wrap img{display:block;width:100%;height:auto}
  .toks{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
  .tok{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12px}
  .chip{width:20px;height:20px;border-radius:5px;border:1px solid rgba(255,255,255,.14);flex:none}
  .tn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tv{color:var(--muted);font-family:var(--mono);font-size:11px}
  .tsr{display:flex;justify-content:space-between;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 11px;margin-bottom:5px;font-size:13px}
  .tsrole{color:var(--muted)}
  ul{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 12px 12px 30px}
  pre{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
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
        aside.push(`<section><h2>Theme reference</h2><pre class="prompt" id="p-reference">${kitEsc(reference)}</pre><div><button type="button" class="btn" data-copy="p-reference">Copy reference</button></div></section>`);
        pageHtml = designDetailHtml({
          design: { siteName: full.siteName, northStar: full.northStar || "" },
          views,
          main: mainHtml,
          aside: aside.join("\n"),
          tags,
        });
      }

      await writeOut(`design/${full.id}/index.html`, relativizeHtml(pageHtml, 2, { assetBase, thumbMap }));
    }));
  }

  // 7. Components
  const compIndex = await readComponentsIndex();
  await writeJson("api/components.json", compIndex);
  await writeOut("components/index.html", relativizeHtml(componentsHtml(compIndex, frontend.thumbnailPath), 1, { assetBase }));
  for (const { slug } of compIndex.components || []) {
    const comp = await readComponent(slug);
    if (!comp) continue;
    await writeJson(`api/component/${slug}.json`, comp);
    const previewPaths = (comp.variants || []).map((item) => frontend.previewPath(slug, item));
    for (const item of comp.variants || []) {
      const entry = manifest?.previews?.[slug]?.[item.id];
      if (!entry) continue;
      // Preview sits at component/<slug>/preview/<id>.html (depth 3)
      const p3 = prefixFor(3);
      const doc = previewHtml(`${p3}assets/${manifest.version}/${entry.module}`, `${p3}assets/${manifest.version}/previews/preview.css`);
      await writeOut(`component/${slug}/preview/${item.id}.html`, doc);
    }
    await writeOut(`component/${slug}/index.html`, relativizeHtml(componentDetailHtml(comp, previewPaths), 2, { assetBase }));
  }

  // 7b. ReUI Components
  const reuiIndex = await readReuiIndex();
  if (reuiIndex.categories?.length) {
    await writeJson("api/reui.json", reuiIndex);
    await writeOut("reui/index.html", relativizeHtml(reuiCatalogHtml(reuiIndex), 1, { assetBase }));
    for (const { slug } of reuiIndex.categories) {
      for (const theme of ["light", "dark"]) {
        const file = `${slug}-${theme}.png`;
        const buf = await readReuiScreenshot(file);
        if (buf) await writeOut(`reui/screenshot/${file}`, buf);
      }
      const cat = await readReuiCategory(slug);
      if (!cat) continue;
      await writeJson(`api/reui/${slug}.json`, cat);
      for (const item of cat.items || []) {
        const entry = manifest?.reuiPreviews?.[slug]?.[item.name];
        if (!entry) continue;
        const p3 = prefixFor(3);
        const doc = previewHtml(`${p3}assets/${manifest.version}/${entry.module}`, `${p3}assets/${manifest.version}/previews/reui.css`);
        await writeOut(`reui/preview/${slug}/${item.name}.html`, doc);
      }
      await writeOut(`reui/${slug}/index.html`, relativizeHtml(reuiCategoryHtml(reuiIndex, cat, frontend.reuiPreviewPath), 2, { assetBase }));
    }
  }

  // 7c. Dashboards
  const dashIndex = await readDashboardsIndex();
  if (dashIndex.dashboards?.length) {
    await writeJson("api/dashboards.json", dashIndex);
    await writeOut("dashboards/index.html", relativizeHtml(dashboardsHtml(dashIndex), 1, { assetBase }));
    for (const { slug } of dashIndex.dashboards) {
      const rec = await readDashboard(slug);
      if (!rec) continue;
      await writeJson(`api/dashboard/${slug}.json`, rec);
      const cover = await readDashboardCover(slug);
      if (cover) await writeOut(`dashboard/${slug}/cover.png`, cover);
      const tplZip = await readDashboardArchive(slug, "template");
      if (tplZip) await writeOut(`dashboard/${slug}/${slug}-offline.zip`, tplZip);
      const fontsZip = await readDashboardArchive(slug, "fonts");
      if (fontsZip) await writeOut(`dashboard/${slug}/fonts.zip`, fontsZip);
      await writeOut(`dashboard/${slug}/index.html`, relativizeHtml(dashboardDetailHtml(rec), 2, { assetBase }));
    }
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

  // 10. System templates
  const dsIndex = await readDesignSystemsIndex();
  await writeJson("api/templates.json", dsIndex);
  const templateThumbMap = new Map();
  for (const sys of dsIndex.systems || []) {
    const rec = await readDesignSystem(sys.slug);
    if (!rec) continue;
    await writeJson(`api/template/${sys.slug}.json`, rec);
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
  const uiSdkIndex = await listUiSdkDocs(join(SKILL_DIR, "ui-sdk"));
  await writeJson("api/ui-sdk-docs.json", uiSdkIndex);
  for (const doc of uiSdkIndex.docs || []) {
    const content = await readUiSdkDoc(doc.path, join(SKILL_DIR, "ui-sdk"));
    if (content !== null) await writeOut(`api/ui-sdk-docs/${doc.path}`, content);
  }
  const docsHtml = relativizeHtml(uiSdkDocsHtml(uiSdkIndex.docs || []), 1, { assetBase })
    .replaceAll("'/api/ui-sdk-docs/'", "'../api/ui-sdk-docs/'");
  await writeOut("docs/index.html", docsHtml);

  console.log(`Static site built at ${OUT_DIR} (${catalog.length} designs, ${compIndex.components?.length || 0} components, ${dsIndex.systems?.length || 0} templates).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
