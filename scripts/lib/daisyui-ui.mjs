/**
 * daisyui-ui.mjs — daisyUI gallery HTML (offline component browser).
 *
 * Serves two views:
 *   - /daisyui                      catalog index: component cards with
 *                                   thumbnails, search, group filter, themes
 *   - /daisyui/component/:slug      one component: live preview iframe, class
 *                                   list, the example HTML in a copyable
 *                                   block, theme picker, MCP tool hint
 *
 * The live previews are the frontend build's self-contained documents framed
 * in an iframe; the vendored compiled css carries every theme, so the picker
 * just re-points the frame at ?theme=. Zero remote URLs.
 */

import { BASE_CSS, NAV_CSS, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const DAISYUI_CSS = `
  .dai-shell { display: flex; min-height: calc(100vh - 46px); }
  .dai-sidebar {
    width: 248px; flex: none; position: sticky; top: 46px; height: calc(100vh - 46px);
    overflow-y: auto; border-right: 1px solid var(--line); background: var(--bg);
    padding: 12px 10px 24px; scrollbar-width: thin; scrollbar-color: var(--line) transparent;
  }
  .dai-side-search {
    width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 9px; font: inherit; font-size: 12px; margin-bottom: 10px;
  }
  .dai-side-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); padding: 6px 8px 4px;
  }
  .dai-side-link {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--muted);
    font-size: 12.5px; line-height: 1.35;
  }
  .dai-side-link:hover { color: var(--fg); background: var(--panel); }
  .dai-side-link.on { color: var(--fg); background: var(--panel2); font-weight: 600; box-shadow: inset 0 0 0 1px var(--line); }
  .dai-side-link .cnt { font-size: 11px; opacity: .7; font-variant-numeric: tabular-nums; }
  .dai-main { flex: 1; min-width: 0; padding: 22px 28px 64px; max-width: 1380px; }
  .dai-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .dai-header p { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; max-width: 760px; }
  .dai-badges { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 16px; }
  .dai-badge {
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--line);
    background: var(--panel); border-radius: 999px; padding: 3px 10px;
  }
  .dai-badge b { color: var(--fg); font-weight: 600; }
  .dai-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 18px;
  }
  .dai-toolbar input, .dai-toolbar select {
    background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 13px;
  }
  .dai-toolbar input { flex: 1 1 220px; min-width: 160px; }
  .dai-count { font-size: 12px; color: var(--muted); margin-left: auto; font-variant-numeric: tabular-nums; }
  .dai-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .dai-card {
    display: flex; flex-direction: column; gap: 5px; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; transition: border-color .15s ease, transform .15s ease;
  }
  .dai-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .dai-card-art { aspect-ratio: 3 / 2; background: var(--panel2); border-bottom: 1px solid var(--line); overflow: hidden; }
  .dai-card-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dai-card-meta { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 3px; }
  .dai-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .dai-card-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .dai-card-top span { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .dai-card-desc {
    font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .dai-section-h {
    font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); margin: 26px 0 12px;
  }
  .dai-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .dai-crumb a { color: var(--muted); text-decoration: none; }
  .dai-crumb a:hover { color: var(--fg); }
  .dai-preview {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; margin-bottom: 18px;
  }
  .dai-preview-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--muted);
  }
  .dai-preview-bar a { color: var(--fg); text-decoration: none; font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 3px 9px; margin-left: auto; }
  .dai-preview-bar a:hover { border-color: var(--accent); }
  .dai-preview-bar select {
    background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 6px; padding: 3px 8px; font: inherit; font-size: 12px;
  }
  .dai-preview iframe { width: 100%; border: 0; display: block; background: #fff; height: 240px; }
  .dai-classes { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; margin-bottom: 18px; }
  .dai-classes h2 { margin: 0 0 10px; font-size: 13px; letter-spacing: -.01em; }
  .dai-class-row { display: flex; align-items: baseline; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
  .dai-class-row:last-child { border-bottom: 0; }
  .dai-class-kind { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; flex: none; width: 84px; }
  .dai-class-names { display: flex; gap: 5px; flex-wrap: wrap; }
  .dai-class-names code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px;
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; color: var(--fg);
  }
  .dai-code { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .dai-code-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--muted); }
  .dai-copy {
    background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 6px; padding: 4px 10px; font: inherit; font-size: 11.5px; cursor: pointer;
  }
  .dai-copy:hover { border-color: var(--accent); }
  .dai-code pre {
    margin: 0; max-height: 420px; overflow: auto; background: var(--code-bg);
    padding: 14px 16px; font-size: 12.5px; line-height: 1.55;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .dai-code pre code { white-space: pre; }
  .dai-docs { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; margin-bottom: 18px; font-size: 13px; line-height: 1.55; color: var(--text); }
  .dai-docs h4 { margin: 14px 0 6px; font-size: 13.5px; color: var(--fg); }
  .dai-docs pre {
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 9px;
    padding: 13px 15px; overflow-x: auto; font-size: 12.5px; line-height: 1.55;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .dai-docs code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 5px;
  }
  .dai-mcp {
    margin-top: 18px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; font-size: 12px; color: var(--muted);
  }
  .dai-mcp code { color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; font-size: 11.5px; }
  @media (max-width: 960px) {
    .dai-sidebar { display: none; }
    .dai-main { padding: 16px; }
  }
`;

function page(title, catalog, activePath, mainHtml, script = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Designer</title>
<style>${BASE_CSS}${NAV_CSS}${DAISYUI_CSS}</style>
</head><body>
${nav("daisyui")}
<div class="dai-shell">
  ${renderSidebar(catalog, activePath)}
  <main class="dai-main">${mainHtml}</main>
</div>
<script>${SIDEBAR_SCRIPT}
${script}</script>
</body></html>`;
}

function renderSidebar(catalog, activePath) {
  const groups = [...new Set(catalog.components.map((c) => c.group || "Other"))].sort((a, b) => a.localeCompare(b));
  const groupHtml = groups
    .map((g) => {
      const links = catalog.components
        .filter((c) => (c.group || "Other") === g)
        .map(
          (c) => `<a class="dai-side-link${c.slug === activePath ? " on" : ""}" href="/daisyui/component/${esc(c.slug)}" data-filter="${esc(`${c.name} ${c.slug}`.toLowerCase())}">
            <span>${esc(c.name)}</span>
          </a>`,
        )
        .join("");
      return `<div class="dai-side-group"><div class="dai-side-label">${esc(g)}</div>${links}</div>`;
    })
    .join("");
  return `<aside class="dai-sidebar" aria-label="daisyUI components">
    <input class="dai-side-search" id="dai-side-search" type="search" placeholder="Filter sidebar…" aria-label="Filter sidebar">
    <div class="dai-side-label">Components (${catalog.components.length})</div>
    ${groupHtml}
  </aside>`;
}

const SIDEBAR_SCRIPT = `
const sideSearch = document.getElementById('dai-side-search');
if (sideSearch) {
  const links = [...document.querySelectorAll('.dai-side-link')];
  sideSearch.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    for (const el of links) {
      el.style.display = !q || (el.dataset.filter || '').includes(q) ? '' : 'none';
    }
  });
}
`;

function badges(catalog, provenance) {
  const v = catalog.version || {};
  return [
    `<span class="dai-badge">daisyUI <b>${esc(v.css || "?")}</b></span>`,
    `<span class="dai-badge">themes <b>${catalog.themes?.length || 0}</b></span>`,
    `<span class="dai-badge">live previews <b>${catalog.totals?.previewable ?? 0}</b></span>`,
    provenance?.source?.sha ? `<span class="dai-badge">docs tag <b>${esc(provenance.source.tag || "")}</b></span>` : "",
    `<span class="dai-badge"><b>MIT</b> (daisyui)</span>`,
  ].filter(Boolean).join("");
}

function componentCard(c, previewPath, thumbnailPath) {
  const thumb = thumbnailPath ? `<img src="${esc(thumbnailPath)}" alt="" loading="lazy">` : "";
  return `<a class="dai-card" href="/daisyui/component/${esc(c.slug)}" data-search="${esc(`${c.name} ${c.slug} ${c.group} ${c.description}`.toLowerCase())}" data-group="${esc(c.group || "Other")}">
    ${thumb ? `<div class="dai-card-art">${thumb}</div>` : `<div class="dai-card-art"></div>`}
    <div class="dai-card-meta">
      <div class="dai-card-top"><strong>${esc(c.name)}</strong><span>${esc(c.slug)}</span></div>
      <div class="dai-card-desc">${esc(c.description || "")}</div>
    </div>
  </a>`;
}

/** /daisyui — every component as a thumbnail card, grouped and searchable. */
export function daisyuiCatalogHtml(catalog, { previewPath, thumbnailPath, provenance } = {}) {
  const components = catalog.components || [];
  const groups = [...new Set(components.map((c) => c.group || "Other"))].sort((a, b) => a.localeCompare(b));
  const themeOptions = (catalog.themes || []).map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
  const sections = groups
    .map((group) => {
      const cards = components
        .filter((c) => (c.group || "Other") === group)
        .map((c) => componentCard(c, previewPath?.(c.slug), thumbnailPath?.(c.slug)))
        .join("");
      return `<div data-group-section="${esc(group.toLowerCase())}"><div class="dai-section-h">${esc(group)}</div><div class="dai-grid">${cards}</div></div>`;
    })
    .join("");
  const main = `
    <div class="dai-header">
      <h1>daisyUI</h1>
      <p>The daisyUI 5 component library, baked offline: ${components.length} components rendered by the vendored compiled CSS with all ${catalog.themes?.length || 0} themes — plain HTML class names, no React and no Tailwind install needed.</p>
    </div>
    <div class="dai-badges">${badges(catalog, provenance)}</div>
    <div class="dai-toolbar">
      <input id="dai-search" type="search" placeholder="Search ${components.length} components (name, class, description)…" aria-label="Search daisyUI components">
      <select id="dai-group" aria-label="Filter by group"><option value="">All groups</option>${groups.map((g) => `<option value="${esc(g.toLowerCase())}">${esc(g)}</option>`).join("")}</select>
      <span class="dai-count" id="dai-count">${components.length} components</span>
    </div>
    ${sections}
    <div class="dai-mcp">Pick these programmatically with the <code>design_daisyui_*</code> MCP tools (<code>design_daisyui_list_components</code>, <code>design_daisyui_search</code>, <code>design_daisyui_get_component</code>) or the JSON at <code>/api/daisyui</code>.</div>`;
  const script = `
const search = document.getElementById('dai-search');
const groupSel = document.getElementById('dai-group');
const count = document.getElementById('dai-count');
const cards = [...document.querySelectorAll('.dai-card')];
const sections = [...document.querySelectorAll('[data-group-section]')];
function apply() {
  const q = search.value.trim().toLowerCase();
  const g = groupSel.value;
  let visible = 0;
  for (const card of cards) {
    const match = (!q || card.dataset.search.includes(q)) && (!g || card.dataset.group === g);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  }
  for (const section of sections) {
    const any = [...section.querySelectorAll('.dai-card')].some((card) => card.style.display !== 'none');
    section.style.display = any ? '' : 'none';
  }
  count.textContent = visible + ' components';
}
search.addEventListener('input', apply);
groupSel.addEventListener('change', apply);`;
  return page("daisyUI", catalog, null, main, script + `\n// theme select is only rendered on component pages\n`);
}

/** The theme picker: every baked theme, applied by re-pointing the iframe. */
function themePicker(catalog) {
  const themes = catalog.themes || [];
  if (themes.length < 2) return "";
  const options = themes.map((t) => `<option value="${esc(t)}"${t === "light" ? " selected" : ""}>${esc(t)}</option>`).join("");
  return `<label>theme <select id="dai-theme" aria-label="Preview theme">${options}</select></label>`;
}

/** /daisyui/component/:slug — live preview, class list, copyable example. */
export function daisyuiComponentHtml(catalog, detail, { previewPath, thumbnailPath } = {}) {
  const preview = previewPath?.(detail.slug);
  const classRows = (detail.classes || [])
    .map(
      (row) => `<div class="dai-class-row"><span class="dai-class-kind">${esc(row.kind)}</span><span class="dai-class-names">${(row.classes || [])
        .map((name) => `<code>${esc(name)}</code>`)
        .join("")}</span></div>`,
    )
    .join("");
  const exampleHtml = preview
    ? detail.example
    : detail.example || detail.syntax || "";
  const syntaxHtml = detail.syntax || "";
  const blocks = [];
  if (exampleHtml) {
    blocks.push(`<div class="dai-code">
      <div class="dai-code-bar"><span>Example — rendered in the preview above, offline-safe</span><button type="button" class="dai-copy" data-copy="example">Copy</button></div>
      <pre><code>${esc(exampleHtml)}</code></pre>
    </div>`);
  }
  if (syntaxHtml && syntaxHtml !== exampleHtml) {
    blocks.push(`<div class="dai-code">
      <div class="dai-code-bar"><span>Upstream syntax template (verbatim, with its placeholders)</span><button type="button" class="dai-copy" data-copy="syntax">Copy</button></div>
      <pre><code>${esc(syntaxHtml)}</code></pre>
    </div>`);
  }
  const main = `
    <div class="dai-crumb"><a href="/daisyui">daisyUI</a> / ${esc(detail.group || "Components")}</div>
    <div class="dai-header">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px">
        <h1>${esc(detail.name)}</h1>
        ${mcpButton(`designer:daisyui:${detail.slug}`, `daisyUI 5 — ${detail.name}`)}
      </div>
      <p>${esc(detail.description || "")}</p>
    </div>
    <div class="dai-badges">
      <span class="dai-badge">slug <b>${esc(detail.slug)}</b></span>
      <span class="dai-badge">group <b>${esc(detail.group || "Other")}</b></span>
      <span class="dai-badge">themes <b>all ${catalog.themes?.length || 0}</b></span>
      <span class="dai-badge"><b>plain HTML</b> — no React</span>
    </div>
    ${
      preview
        ? `<div class="dai-preview">
      <div class="dai-preview-bar">
        <span>Live preview — rendered by the vendored daisyui.css</span>
        ${themePicker(catalog)}
        <a href="${esc(preview)}" target="_blank" rel="noopener">Open preview</a>
      </div>
      <iframe src="${esc(preview)}" title="${esc(detail.name)} live preview" loading="lazy"></iframe>
    </div>`
        : `<div class="dai-docs">No live preview for this component — its example needs more than the vendored CSS (see the upstream syntax below).</div>`
    }
    ${classRows ? `<div class="dai-classes"><h2>Class names</h2>${classRows}</div>` : ""}
    ${blocks.join("\n")}
    <div class="dai-docs"><h4>Upstream rules</h4>${esc(rulesText(detail.docs))}</div>
    <div class="dai-mcp">Pull this component's classes, syntax and example HTML with <code>design_daisyui_get_component {"slug": "${esc(detail.slug)}"}</code>; the catalog is on <code>design_daisyui_list_components</code> and <code>design_daisyui_search</code>. Full docs: <a href="${esc(detail.docUrl || `https://daisyui.com/components/${detail.slug}/`)}" rel="noopener">${esc(detail.docUrl || `https://daisyui.com/components/${detail.slug}/`)}</a></div>`;
  const script = `
for (const copy of [...document.querySelectorAll('.dai-copy')]) {
  copy.addEventListener('click', async () => {
    const code = copy.closest('.dai-code').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(code); copy.textContent = 'Copied'; }
    catch { copy.textContent = 'Select + copy'; }
    setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
  });
}
// Frames start compact and grow to the preview's reported height.
const frame = document.querySelector('.dai-preview iframe');
if (frame) {
  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.source === 'design-preview' && data.type === 'height' && data.height) {
      frame.style.height = Math.min(Math.ceil(data.height) + 16, 560) + 'px';
    }
  });
}
const theme = document.getElementById('dai-theme');
if (theme && frame) {
  theme.addEventListener('change', () => {
    const url = new URL(frame.src);
    url.searchParams.set('theme', theme.value);
    frame.src = url.toString();
  });
}
`;
  return page(detail.name, catalog, detail.slug, main, script);
}

/** The "#### Rules" prose of an upstream doc, flattened for the detail page. */
function rulesText(docs) {
  const match = /####\s+Rules\n([\s\S]*?)(?=\n####|\n*$)/.exec(String(docs || ""));
  if (!match) return "";
  return match[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter(Boolean)
    .map((line) => `• ${line}`)
    .join("\n");
}
