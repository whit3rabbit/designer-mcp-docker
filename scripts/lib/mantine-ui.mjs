/**
 * mantine-ui.mjs — Mantine UI gallery HTML (the ui.mantine.dev catalog).
 *
 * Serves three views:
 *   - /mantine                     catalog index: category cards + component grid + search
 *   - /mantine/category/:slug      one category: thumbnail cards per component
 *   - /mantine/component/:slug     one component: live preview + per-file source tabs
 *
 * Illustrations and demo images come straight from the baked cache through
 * the /mantine/asset/:file route; live previews are the frontend build's
 * module documents framed in an iframe. Zero remote URLs.
 */

import { shellHead, shellStyle, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const MANTINE_CSS = `
  .mant-shell { display: flex; min-height: calc(100vh - 46px); }
  .mant-sidebar {
    width: 248px; flex: none; position: sticky; top: 46px; height: calc(100vh - 46px);
    overflow-y: auto; border-right: 1px solid var(--line); background: var(--bg);
    padding: 12px 10px 24px; scrollbar-width: thin; scrollbar-color: var(--line) transparent;
  }
  .mant-side-search {
    width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 9px; font: inherit; font-size: 12px; margin-bottom: 10px;
  }
  .mant-side-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); padding: 6px 8px 4px;
  }
  .mant-side-link {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--muted);
    font-size: 12.5px; line-height: 1.35;
  }
  .mant-side-link:hover { color: var(--fg); background: var(--panel); }
  .mant-side-link.on { color: var(--fg); background: var(--panel2); font-weight: 600; box-shadow: inset 0 0 0 1px var(--line); }
  .mant-side-link .cnt { font-size: 11px; opacity: .7; font-variant-numeric: tabular-nums; }
  .mant-main { flex: 1; min-width: 0; padding: 22px 28px 64px; max-width: 1380px; }
  .mant-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .mant-header p { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; max-width: 760px; }
  .mant-badges { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 16px; }
  .mant-badge {
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--line);
    background: var(--panel); border-radius: 999px; padding: 3px 10px;
  }
  .mant-badge b { color: var(--fg); font-weight: 600; }
  .mant-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 18px;
  }
  .mant-toolbar input {
    flex: 1 1 220px; min-width: 160px; background: var(--panel2); color: var(--fg);
    border: 1px solid var(--line); border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 13px;
  }
  .mant-count { font-size: 12px; color: var(--muted); margin-left: auto; font-variant-numeric: tabular-nums; }
  .mant-cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; margin-bottom: 26px; }
  .mant-cat-card {
    display: flex; flex-direction: column; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; transition: border-color .15s ease, transform .15s ease;
  }
  .mant-cat-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .mant-cat-art { aspect-ratio: 3 / 2; background: var(--panel2); border-bottom: 1px solid var(--line); overflow: hidden; }
  .mant-cat-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .mant-cat-meta { padding: 10px 14px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .mant-cat-meta strong { font-size: 13.5px; font-weight: 600; }
  .mant-cat-meta span { font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .mant-section-h {
    font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); margin: 26px 0 12px;
  }
  .mant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .mant-card {
    display: flex; flex-direction: column; gap: 5px; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 13px 15px; transition: border-color .15s ease, transform .15s ease;
  }
  .mant-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .mant-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .mant-card-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .mant-card-top span { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .mant-card-title { font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mant-card-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 3px; }
  .mant-tag {
    font-size: 10.5px; color: var(--muted); border: 1px solid var(--line);
    border-radius: 999px; padding: 1px 7px;
  }
  .mant-tag.live { color: #2e9e5b; border-color: color-mix(in srgb, #2e9e5b 40%, transparent); }
  .mant-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .mant-crumb a { color: var(--muted); text-decoration: none; }
  .mant-crumb a:hover { color: var(--fg); }
  .mant-preview {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; margin-bottom: 18px;
  }
  .mant-preview-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 8px 12px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--muted);
  }
  .mant-preview-bar a { color: var(--fg); text-decoration: none; font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 3px 9px; }
  .mant-preview-bar a:hover { border-color: var(--accent); }
  .mant-preview iframe { width: 100%; border: 0; display: block; background: #fff; height: 72px; }
  .mant-note {
    padding: 13px 15px; font-size: 12.5px; color: var(--muted);
  }
  .mant-code { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .mant-tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 9px 10px 0; border-bottom: 1px solid var(--line); }
  .mant-tabs button {
    background: transparent; color: var(--muted); border: 1px solid transparent; border-bottom: 0;
    border-radius: 7px 7px 0 0; padding: 6px 11px; font: inherit; font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; cursor: pointer;
  }
  .mant-tabs button[aria-selected="true"] {
    color: var(--fg); background: var(--panel2); border-color: var(--line);
    font-weight: 600;
  }
  .mant-panel { position: relative; }
  .mant-copy {
    position: absolute; top: 10px; right: 10px; background: var(--panel2); color: var(--fg);
    border: 1px solid var(--line); border-radius: 6px; padding: 4px 10px; font: inherit;
    font-size: 11.5px; cursor: pointer; opacity: 0; transition: opacity .12s ease;
  }
  .mant-panel:hover .mant-copy, .mant-copy:focus { opacity: 1; }
  .mant-panel pre {
    margin: 0; max-height: 480px; overflow: auto; background: var(--code-bg);
    padding: 14px 16px; font-size: 12.5px; line-height: 1.55;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .mant-panel pre code { white-space: pre; }
  .mant-mcp {
    margin-top: 18px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; font-size: 12px; color: var(--muted);
  }
  .mant-mcp code { color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; font-size: 11.5px; }
  @media (max-width: 960px) {
    .mant-sidebar { display: none; }
    .mant-main { padding: 16px; }
  }
`;

const MANTINE_STYLE_LINK = shellStyle("mantine", MANTINE_CSS);

function page(title, catalog, activePath, mainHtml, script = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(MANTINE_STYLE_LINK)}
<title>${esc(title)} · Designer</title>
</head><body>
${nav("mantine")}
<div class="mant-shell">
  ${renderSidebar(catalog, activePath)}
  <main class="mant-main">${mainHtml}</main>
</div>
<script>${SIDEBAR_SCRIPT}
${script}</script>
</body></html>`;
}

function renderSidebar(catalog, activePath) {
  const byCategory = new Map();
  for (const c of catalog.components || []) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }
  const groups = catalog.groups || [];
  const groupHtml = groups
    .map((group) => {
      const links = group.categories
        .map((cat) => {
          const count = (byCategory.get(cat.slug) || []).length;
          return `<a class="mant-side-link${cat.slug === activePath ? " on" : ""}" href="/mantine/category/${esc(cat.slug)}" data-filter="${esc(cat.name.toLowerCase())}">
            <span>${esc(cat.name)}</span><span class="cnt">${count}</span>
          </a>`;
        })
        .join("");
      return `<div class="mant-side-group"><div class="mant-side-label">${esc(group.name)}</div>${links}</div>`;
    })
    .join("");
  return `<aside class="mant-sidebar" aria-label="Mantine catalog">
    <input class="mant-side-search" id="mant-side-search" type="search" placeholder="Filter categories…" aria-label="Filter categories">
    <div class="mant-side-label">Categories (${groups.reduce((n, g) => n + g.categories.length, 0)})</div>
    ${groupHtml}
  </aside>`;
}

const SIDEBAR_SCRIPT = `
const sideSearch = document.getElementById('mant-side-search');
if (sideSearch) {
  const links = [...document.querySelectorAll('.mant-side-link')];
  sideSearch.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    for (const el of links) {
      el.style.display = !q || (el.dataset.filter || '').includes(q) ? '' : 'none';
    }
  });
}
`;

function badges(catalog, provenance) {
  const source = catalog.source || {};
  const vendored = Object.keys(provenance?.packages || {}).length;
  return [
    `<span class="mant-badge">components <b>${esc(catalog.total ?? (catalog.components || []).length)}</b></span>`,
    source.mantine ? `<span class="mant-badge">@mantine/core <b>${esc(source.mantine)}</b></span>` : "",
    source.license ? `<span class="mant-badge"><b>${esc(source.license)}</b> (ui.mantine.dev)</span>` : "",
    vendored ? `<span class="mant-badge">vendored packages <b>${vendored}</b></span>` : "",
    `<span class="mant-badge">live previews <b>offline</b></span>`,
  ].filter(Boolean).join("");
}

function componentCard(c, previewPath, thumbnailPath) {
  const thumb = thumbnailPath ? `<img src="${esc(thumbnailPath)}" alt="" loading="lazy">` : "";
  return `<a class="mant-card" href="/mantine/component/${esc(c.slug)}" data-search="${esc(`${c.name} ${c.slug} ${c.title} ${c.category} ${(c.packages || []).join(" ")}`.toLowerCase())}" data-cat="${esc(c.category)}">
    ${thumb ? `<div class="mant-cat-art">${thumb}</div>` : ""}
    <div class="mant-card-top"><strong>${esc(c.name)}</strong><span>${esc(c.slug)}</span></div>
    <div class="mant-card-title">${esc(c.title)}</div>
    <div class="mant-card-tags">
      ${previewPath ? `<span class="mant-tag live">live preview</span>` : `<span class="mant-tag">source only</span>`}
      ${(c.packages || []).slice(0, 3).map((p) => `<span class="mant-tag">${esc(p)}</span>`).join("")}
      ${c.responsive ? `<span class="mant-tag">responsive</span>` : ""}
    </div>
  </a>`;
}

/** /mantine — categories with their light/dark illustrations, then every component. */
export function mantineCatalogHtml(catalog, { previewPath, thumbnailPath, provenance } = {}) {
  const components = catalog.components || [];
  const byCategory = new Map();
  for (const c of components) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }
  const categoryCards = (catalog.groups || [])
    .flatMap((group) => group.categories)
    .map((cat) => {
      const file = cat.image?.light ? cat.image.light.split("/").pop() : null;
      const image = file ? `/mantine/asset/${file}` : null;
      const count = (byCategory.get(cat.slug) || []).length;
      return `<a class="mant-cat-card" href="/mantine/category/${esc(cat.slug)}" data-search="${esc(`category ${cat.name} ${cat.slug}`.toLowerCase())}" data-cat="${esc(cat.slug)}">
        <div class="mant-cat-art">${image ? `<img src="${esc(image)}" alt="" loading="lazy">` : ""}</div>
        <div class="mant-cat-meta"><strong>${esc(cat.name)}</strong><span>${count} components</span></div>
      </a>`;
    })
    .join("");
  const sections = (catalog.groups || [])
    .map((group) => {
      const cards = group.categories
        .flatMap((cat) => byCategory.get(cat.slug) || [])
        .map((c) => componentCard(c, previewPath?.(c.slug), thumbnailPath?.(c.slug)))
        .join("");
      return cards
        ? `<div data-cat-group="${esc(group.name.toLowerCase())}"><div class="mant-section-h">${esc(group.name)}</div><div class="mant-grid">${cards}</div></div>`
        : "";
    })
    .join("");
  const main = `
    <div class="mant-header">
      <h1>Mantine UI</h1>
      <p>The ui.mantine.dev catalog, baked offline: ${components.length} ready-made components across ${(catalog.groups || []).reduce((n, g) => n + g.categories.length, 0)} categories, each with its TSX and CSS module source and a live preview rendered from the vendored @mantine packages.</p>
    </div>
    <div class="mant-badges">${badges(catalog, provenance)}</div>
    <div class="mant-toolbar">
      <input id="mant-search" type="search" placeholder="Search ${components.length} components (name, category, package)…" aria-label="Search Mantine components">
      <span class="mant-count" id="mant-count">${components.length} components</span>
    </div>
    <div class="mant-cat-grid" id="mant-cats">${categoryCards}</div>
    ${sections}
    <div class="mant-mcp">Pick these programmatically with the <code>design_kit_*</code> MCP tools (<code>design_kit_list</code>, <code>design_kit_search</code>, <code>design_kit_code</code> with <code>"kit": "mantine"</code>) or the JSON at <code>/api/mantine</code>.</div>`;
  const script = `
const search = document.getElementById('mant-search');
const count = document.getElementById('mant-count');
const cards = [...document.querySelectorAll('.mant-card')];
const cats = [...document.querySelectorAll('.mant-cat-card')];
const groups = [...document.querySelectorAll('[data-cat-group]')];
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  const liveCats = new Set();
  for (const card of cards) {
    const match = !q || card.dataset.search.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) { visible++; liveCats.add(card.dataset.cat); }
  }
  for (const cat of cats) {
    const any = !q || cat.dataset.search.includes(q) || liveCats.has(cat.dataset.cat);
    cat.style.display = any ? '' : 'none';
  }
  for (const group of groups) {
    const any = [...group.querySelectorAll('.mant-card')].some((card) => card.style.display !== 'none');
    group.style.display = any ? '' : 'none';
  }
  count.textContent = visible + ' components';
});`;
  return page("Mantine UI", catalog, null, main, script);
}

/** /mantine/category/:slug — one category's components as thumbnail cards. */
export function mantineCategoryHtml(catalog, category, { previewPath, thumbnailPath } = {}) {
  const components = (catalog.components || []).filter((c) => c.category === category.slug);
  const cards = components
    .map((c) => componentCard(c, previewPath?.(c.slug), thumbnailPath?.(c.slug)))
    .join("");
  const main = `
    <div class="mant-crumb"><a href="/mantine">Mantine</a> / ${esc(category.group || "Categories")}</div>
    <div class="mant-header">
      <h1>${esc(category.name)}</h1>
      <p>${components.length} component${components.length === 1 ? "" : "s"} in this category${category.image?.dark ? `, illustrated for light and dark surfaces` : ""}.</p>
    </div>
    <div class="mant-grid" style="margin-top:18px">${cards}</div>`;
  return page(category.name, catalog, category.slug, main);
}

/** /mantine/component/:slug — live preview plus the full per-file source. */
export function mantineComponentHtml(catalog, detail, { previewPath, category } = {}) {
  const files = detail.files || [];
  const preview = previewPath?.(detail.slug);
  const tabs = files
    .map((f, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(f.name)}</button>`)
    .join("");
  const panels = files
    .map((f, i) => `<div class="mant-panel" data-panel="${i}" ${i === 0 ? "" : "hidden"}>
      <button type="button" class="mant-copy" data-copy="${i}">Copy</button>
      <pre><code>${esc(f.code)}</code></pre>
    </div>`)
    .join("");
  const main = `
    <div class="mant-crumb"><a href="/mantine">Mantine</a> / <a href="/mantine/category/${esc(detail.category)}">${esc(category?.name || detail.category)}</a></div>
    <div class="mant-header">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px">
        <h1>${esc(detail.name)}</h1>
        ${mcpButton(`designer:mantine:${detail.slug}`, `Mantine — ${detail.name}`)}
      </div>
      <p>${esc(detail.title || "")}</p>
    </div>
    <div class="mant-badges">
      <span class="mant-badge">slug <b>${esc(detail.slug)}</b></span>
      ${detail.responsive ? `<span class="mant-badge"><b>responsive</b></span>` : ""}
      ${(detail.packages || []).map((p) => `<span class="mant-tag">${esc(p)}</span>`).join("")}
    </div>
    ${
      preview
        ? `<div class="mant-preview">
      <div class="mant-preview-bar"><span>Live preview — bundled offline from the vendored @mantine packages</span><a href="${esc(preview)}" target="_blank" rel="noopener">Open preview</a></div>
      <iframe src="${esc(preview)}" title="${esc(detail.name)} live preview" loading="lazy"></iframe>
    </div>`
        : `<div class="mant-note">No live preview was built for this demo — its source below is the complete reference.</div>`
    }
    <div class="mant-code">
      <div class="mant-tabs" role="tablist">${tabs}</div>
      ${panels}
    </div>
    <div class="mant-mcp">Pull this component's full source with <code>design_kit_code {"kit": "mantine", "item": "${esc(detail.slug)}"}</code>; the catalog is on <code>design_kit_list</code> and <code>design_kit_search</code> (<code>"kit": "mantine"</code>).</div>`;
  const script = `
const tabs = [...document.querySelectorAll('.mant-tabs button')];
const panels = [...document.querySelectorAll('.mant-panel')];
for (const tab of tabs) {
  tab.addEventListener('click', () => {
    for (const t of tabs) t.setAttribute('aria-selected', String(t === tab));
    for (const panel of panels) panel.hidden = panel.dataset.panel !== tab.dataset.tab;
  });
}
for (const copy of [...document.querySelectorAll('.mant-copy')]) {
  copy.addEventListener('click', async () => {
    const code = copy.closest('.mant-panel').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(code); copy.textContent = 'Copied'; }
    catch { copy.textContent = 'Select + copy'; }
    setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
  });
}
// Frames start compact and grow to the demo's reported height.
const frame = document.querySelector('.mant-preview iframe');
if (frame) {
  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.source === 'design-preview' && data.type === 'height' && data.height) {
      frame.style.height = Math.min(Math.ceil(data.height) + 16, 720) + 'px';
    }
  });
}
`;
  return page(detail.name, catalog, null, main, script);
}
