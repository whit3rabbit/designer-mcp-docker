/**
 * heroui-ui.mjs — HeroUI v3 gallery HTML (offline @heroui/react docs browser).
 *
 * Serves two views:
 *   - /heroui                     catalog index: component groups + guides + theme info
 *   - /heroui/component/:slug     one rendered component doc
 *   - /heroui/guide/:slug         one rendered guide
 *
 * Docs are plain markdown shipped inside the @heroui/react package and baked
 * by scripts/fetch-heroui.mjs. Rendering is markdown-it, no remote assets.
 */

import MarkdownIt from "markdown-it";
import { shellHead, shellStyle, nav, mcpButton } from "./ui.mjs";
import { hasHeroUiPreview } from "./heroui-preview.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const markdown = new MarkdownIt({ html: false, linkify: true });
// Local doc links point at the offline routes; everything else stays a plain
// anchor (never fetched by the page itself).
const linkOpen = markdown.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = String(tokens[idx].attrGet("href") || "");
  if (/^(components|guides)\/[\w./-]+\.md$/.test(href)) {
    tokens[idx].attrSet("href", `/heroui/${href.startsWith("components/") ? "component" : "guide"}/${href.split("/")[1].replace(/\.md$/, "")}`);
  }
  tokens[idx].attrSet("rel", "noopener");
  return linkOpen(tokens, idx, options, env, self);
};

const HEROUI_CSS = `
  .heroui-shell { display: flex; min-height: calc(100vh - 46px); }
  .heroui-sidebar {
    width: 248px; flex: none; position: sticky; top: 46px; height: calc(100vh - 46px);
    overflow-y: auto; border-right: 1px solid var(--line); background: var(--bg);
    padding: 12px 10px 24px; scrollbar-width: thin; scrollbar-color: var(--line) transparent;
  }
  .heroui-side-search {
    width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 9px; font: inherit; font-size: 12px; margin-bottom: 10px;
  }
  .heroui-side-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); padding: 6px 8px 4px;
  }
  .heroui-side-link {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--muted);
    font-size: 12.5px; line-height: 1.35;
  }
  .heroui-side-link:hover { color: var(--fg); background: var(--panel); }
  .heroui-side-link.on { color: var(--fg); background: var(--panel2); font-weight: 600; box-shadow: inset 0 0 0 1px var(--line); }
  .heroui-side-group { margin-top: 6px; }
  .heroui-main { flex: 1; min-width: 0; padding: 22px 28px 64px; max-width: 1380px; }
  .heroui-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .heroui-header p { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; max-width: 760px; }
  .heroui-badges { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 16px; }
  .heroui-badge {
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--line);
    background: var(--panel); border-radius: 999px; padding: 3px 10px;
  }
  .heroui-badge b { color: var(--fg); font-weight: 600; }
  .heroui-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 18px;
  }
  .heroui-toolbar input {
    flex: 1 1 220px; min-width: 160px; background: var(--panel2); color: var(--fg);
    border: 1px solid var(--line); border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 13px;
  }
  .heroui-count { font-size: 12px; color: var(--muted); margin-left: auto; font-variant-numeric: tabular-nums; }
  .heroui-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .heroui-card {
    display: flex; flex-direction: column; gap: 5px; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 13px 15px; transition: border-color .15s ease, transform .15s ease;
  }
  .heroui-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .heroui-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .heroui-card-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .heroui-card-top span { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .heroui-card-desc {
    font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .heroui-section-h {
    font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); margin: 26px 0 12px;
  }
  .heroui-mcp {
    margin-top: 22px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; font-size: 12px; color: var(--muted);
  }
  .heroui-mcp code { color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; font-size: 11.5px; }
  .heroui-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .heroui-crumb a { color: var(--muted); text-decoration: none; }
  .heroui-crumb a:hover { color: var(--fg); }
  .heroui-doc { max-width: 860px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 26px 30px 34px; }
  .heroui-doc h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -.02em; }
  .heroui-doc-sub { color: var(--muted); font-size: 13.5px; margin: 0 0 18px; }
  .heroui-doc-body { font-size: 13.5px; line-height: 1.6; }
  .heroui-doc-body h2 { font-size: 17px; margin: 26px 0 8px; letter-spacing: -.01em; }
  .heroui-doc-body h3 { font-size: 14.5px; margin: 20px 0 6px; }
  .heroui-doc-body p, .heroui-doc-body li { color: var(--text); }
  .heroui-doc-body code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 5px;
  }
  .heroui-doc-body pre {
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 9px;
    padding: 13px 15px; overflow-x: auto; font-size: 12.5px; line-height: 1.55;
  }
  .heroui-doc-body pre code { border: 0; padding: 0; background: transparent; font-size: inherit; }
  .heroui-doc-body table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12.5px; }
  .heroui-doc-body th, .heroui-doc-body td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
  .heroui-doc-body th { background: var(--panel2); font-weight: 600; }
  .heroui-doc-body blockquote { margin: 12px 0; padding: 4px 14px; border-left: 3px solid var(--line); color: var(--muted); }
  @media (max-width: 960px) {
    .heroui-sidebar { display: none; }
    .heroui-main { padding: 16px; }
  }
`;

function renderSidebar(catalog, activePath) {
  const groups = [...new Set(catalog.components.map((c) => c.group || "Other"))].sort((a, b) => a.localeCompare(b));
  const groupHtml = groups
    .map((g) => {
      const links = catalog.components
        .filter((c) => (c.group || "Other") === g)
        .map(
          (c) => `<a class="heroui-side-link${`components/${c.slug}.md` === activePath ? " on" : ""}" href="/heroui/component/${esc(c.slug)}" data-filter="${esc(`${c.name} ${c.slug}`.toLowerCase())}">
            <span>${esc(c.name)}</span>
          </a>`,
        )
        .join("");
      return `<div class="heroui-side-group"><div class="heroui-side-label">${esc(g)}</div>${links}</div>`;
    })
    .join("");
  const guideLinks = catalog.guides
    .map(
      (g) => `<a class="heroui-side-link${g.path === activePath ? " on" : ""}" href="/heroui/guide/${esc(g.slug)}" data-filter="${esc(`${g.name} ${g.slug}`.toLowerCase())}">
        <span>${esc(g.name)}</span>
      </a>`,
    )
    .join("");
  return `<aside class="heroui-sidebar" aria-label="HeroUI docs">
    <input class="heroui-side-search" id="heroui-side-search" type="search" placeholder="Filter sidebar…" aria-label="Filter sidebar">
    <div class="heroui-side-label">Components (${catalog.components.length})</div>
    ${groupHtml}
    <div class="heroui-side-group"><div class="heroui-side-label">Guides (${catalog.guides.length})</div>${guideLinks}</div>
  </aside>`;
}

const SIDEBAR_SCRIPT = `
const sideSearch = document.getElementById('heroui-side-search');
if (sideSearch) {
  const links = [...document.querySelectorAll('.heroui-side-link')];
  sideSearch.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    for (const el of links) {
      el.style.display = !q || (el.dataset.filter || '').includes(q) ? '' : 'none';
    }
  });
}
`;

const HEROUI_STYLE_LINK = shellStyle("heroui", HEROUI_CSS);

function page(title, catalog, activePath, mainHtml, script = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(HEROUI_STYLE_LINK)}
<title>${esc(title)} · Designer</title>
</head><body>
${nav("heroui")}
<div class="heroui-shell">
  ${renderSidebar(catalog, activePath)}
  <main class="heroui-main">${mainHtml}</main>
</div>
<script>${SIDEBAR_SCRIPT}
${script}</script>
</body></html>`;
}

function badges(catalog) {
  const v = catalog.version || {};
  return [
    `<span class="heroui-badge">@heroui/react <b>${esc(v.react || "?")}</b></span>`,
    v.styles ? `<span class="heroui-badge">@heroui/styles <b>${esc(v.styles)}</b></span>` : "",
    v.source ? `<span class="heroui-badge">source tag <b>${esc(v.source)}</b></span>` : "",
    catalog.hasSource ? `<span class="heroui-badge">TSX source <b>baked</b></span>` : "",
    catalog.hasMigration ? `<span class="heroui-badge">migration guides <b>baked</b></span>` : "",
  ].filter(Boolean).join("");
}

/** /heroui — the full offline catalog. */
export function herouiCatalogHtml(catalog) {
  const components = catalog.components || [];
  const guides = catalog.guides || [];
  const cards = components
    .map(
      (c) => `<a class="heroui-card" href="/heroui/component/${esc(c.slug)}" data-search="${esc(`${c.name} ${c.slug} ${c.group} ${c.description}`.toLowerCase())}">
        <div class="heroui-card-top"><strong>${esc(c.name)}</strong><span>${esc(c.slug)}</span></div>
        <div class="heroui-card-desc">${esc(c.description || "")}</div>
      </a>`,
    )
    .join("");
  const guideCards = guides
    .map(
      (g) => `<a class="heroui-card" href="/heroui/guide/${esc(g.slug)}" data-search="${esc(`guide ${g.name} ${g.slug} ${g.group} ${g.description}`.toLowerCase())}">
        <div class="heroui-card-top"><strong>${esc(g.name)}</strong><span>${esc(g.group || "guide")}</span></div>
        <div class="heroui-card-desc">${esc(g.description || "")}</div>
      </a>`,
    )
    .join("");
  const main = `
    <div class="heroui-header">
      <h1>HeroUI v3</h1>
      <p>The @heroui/react component library docs, baked offline from the npm package: ${components.length} components and ${guides.length} guides, version-matched to the baked source and styles.</p>
    </div>
    <div class="heroui-badges">${badges(catalog)}</div>
    <div class="heroui-toolbar">
      <input id="heroui-search" type="search" placeholder="Search ${components.length} components and ${guides.length} guides…" aria-label="Search HeroUI docs">
      <span class="heroui-count" id="heroui-count">${components.length + guides.length} pages</span>
    </div>
    <div class="heroui-grid" id="heroui-grid">${cards}${guideCards}</div>
    <div class="heroui-mcp">Pick these programmatically with the <code>design_kit_*</code> MCP tools (<code>design_kit_list</code>, <code>design_kit_search</code>, <code>design_kit_docs</code>, <code>design_kit_code</code> with <code>"kit": "heroui"</code>) or the JSON at <code>/api/heroui</code>.</div>`;
  const script = `
const grid = document.getElementById('heroui-grid');
const search = document.getElementById('heroui-search');
const count = document.getElementById('heroui-count');
const cards = [...grid.querySelectorAll('.heroui-card')];
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const match = !q || card.dataset.search.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  }
  count.textContent = visible + ' pages';
});`;
  return page("HeroUI v3", catalog, null, main, script);
}

/** /heroui/component/:slug and /heroui/guide/:slug — one rendered markdown doc (+ live CSS preview when available). */
export function herouiDocHtml(catalog, entry, kind, content) {
  const title = kind === "guide" ? `${entry.name} (guide)` : entry.name;
  const hasPreview = kind === "component" && hasHeroUiPreview(entry.slug);
  const previewSrc = hasPreview ? `/heroui/preview/${encodeURIComponent(entry.slug)}` : "";
  const previewBlock = hasPreview ? `
    <section class="heroui-preview" style="max-width:860px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted);">
        <span>Live offline preview · <code>@heroui/styles</code></span>
        <div style="display:flex;gap:6px;align-items:center;">
          <button type="button" class="hp-theme" data-t="light" aria-pressed="true" style="background:var(--accent-bg);color:var(--strong);border:1px solid var(--accent-line);border-radius:6px;padding:3px 9px;font:inherit;cursor:pointer;">Light</button>
          <button type="button" class="hp-theme" data-t="dark" aria-pressed="false" style="background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:3px 9px;font:inherit;cursor:pointer;">Dark</button>
          <a href="${previewSrc}" style="color:var(--fg);text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:3px 9px;">Open frame</a>
        </div>
      </div>
      <iframe id="heroui-frame" src="${previewSrc}" title="${esc(entry.name)} HeroUI preview" sandbox="allow-scripts" style="width:100%;height:140px;border:0;display:block;background:#fff;"></iframe>
    </section>` : "";
  const previewScript = hasPreview ? `
    const frame = document.getElementById('heroui-frame');
    const base = ${JSON.stringify(previewSrc)};
    document.querySelectorAll('.hp-theme').forEach((btn) => btn.addEventListener('click', () => {
      const t = btn.dataset.t;
      document.querySelectorAll('.hp-theme').forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-pressed', String(on));
        b.style.background = on ? 'var(--accent-bg)' : 'var(--panel2)';
        b.style.borderColor = on ? 'var(--accent-line)' : 'var(--line)';
      });
      frame.src = base + '?theme=' + t;
      frame.style.background = t === 'dark' ? '#0d0f12' : '#ffffff';
    }));
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.source !== 'design-preview' || d.type !== 'height') return;
      if (frame && frame.contentWindow === e.source) {
        frame.style.height = Math.max(96, Math.min(540, Math.ceil(d.height))) + 'px';
      }
    });` : "";
  const main = `
    <div class="heroui-crumb"><a href="/components">Components</a> / <a href="/heroui">HeroUI v3</a> / ${kind === "guide" ? "Guides" : esc(entry.group || "Components")}</div>
    ${previewBlock}
    <article class="heroui-doc">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px">
        <h1>${esc(entry.name)}</h1>
        ${kind === "component" ? mcpButton(`designer:heroui:${entry.slug}`, `HeroUI v3 — ${entry.name}`) : ""}
      </div>
      <p class="heroui-doc-sub">${esc(entry.description || "")}</p>
      <div class="heroui-doc-body">${markdown.render(String(content || ""))}</div>
    </article>
    <div class="heroui-mcp">${
      kind === "guide"
        ? `Read this guide programmatically with <code>design_kit_docs {"kit": "heroui", "kind": "guide", "item": "${esc(entry.slug)}"}</code>.`
        : `Read this component programmatically with <code>design_kit_docs {"kit": "heroui", "item": "${esc(entry.slug)}"}</code>; styles with <code>design_kit_code {"kit": "heroui", "kind": "styles", "item": "${esc(entry.slug)}"}</code>, source with <code>design_kit_code {"kit": "heroui", "item": "${esc(entry.slug)}"}</code>.`
    }</div>`;
  return page(title, catalog, entry.path, main, previewScript);
}
