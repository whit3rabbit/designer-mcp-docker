/**
 * baseui-ui.mjs — Base UI docs gallery HTML (offline @base-ui/react docs browser).
 *
 * Base UI is headless (no visuals of its own), so this layer is a docs
 * browser with cross-links to the ReUI gallery, where the same components
 * are rendered live as Base UI variants:
 *   - /baseui                       catalog index: Overview, Handbook, Components, Utilities
 *   - /baseui/doc/:section/:slug    one rendered markdown doc
 *
 * Docs are plain markdown fetched from base-ui.com/llms.txt by
 * scripts/fetch-baseui.mjs. Rendering is markdown-it, no remote assets.
 */

import MarkdownIt from "markdown-it";
import { BASE_CSS, NAV_CSS, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const markdown = new MarkdownIt({ html: false, linkify: true });
// Local doc links point at the offline routes; everything else stays a plain
// anchor (never fetched by the page itself). Upstream writes absolute
// "/react/<section>/<slug>.md" links between its pages.
const linkOpen = markdown.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = String(tokens[idx].attrGet("href") || "");
  const local = /^\/?react\/(components|overview|handbook|utils)\/([\w./-]+)\.md$/.exec(href);
  if (local) tokens[idx].attrSet("href", `/baseui/doc/${local[1]}/${local[2]}`);
  tokens[idx].attrSet("rel", "noopener");
  return linkOpen(tokens, idx, options, env, self);
};

const SECTION_LABELS = { overview: "Overview", handbook: "Handbook", components: "Components", utils: "Utilities" };

// ReUI categories that host the Base UI variant of a differently named
// Base UI component. Exact slug matches need no entry here.
const REUI_SLUG_OVERRIDES = {
  "checkbox-group": "checkbox",
  "otp-field": "input-otp",
  toast: "sonner",
};

/** The ReUI category that renders this Base UI component live, or null. */
function reuiSlug(entry, reuiSlugs) {
  if (!reuiSlugs || entry.section !== "components") return null;
  const slug = REUI_SLUG_OVERRIDES[entry.slug] || entry.slug;
  return reuiSlugs.has(slug) ? slug : null;
}

function docHref(entry) {
  return `/baseui/doc/${entry.section}/${entry.slug}`;
}

const BASEUI_CSS = `
  .baseui-shell { display: flex; min-height: calc(100vh - 46px); }
  .baseui-sidebar {
    width: 248px; flex: none; position: sticky; top: 46px; height: calc(100vh - 46px);
    overflow-y: auto; border-right: 1px solid var(--line); background: var(--bg);
    padding: 12px 10px 24px; scrollbar-width: thin; scrollbar-color: var(--line) transparent;
  }
  .baseui-side-search {
    width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 9px; font: inherit; font-size: 12px; margin-bottom: 10px;
  }
  .baseui-side-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); padding: 6px 8px 4px;
  }
  .baseui-side-link {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--muted);
    font-size: 12.5px; line-height: 1.35;
  }
  .baseui-side-link:hover { color: var(--fg); background: var(--panel); }
  .baseui-side-link.on { color: var(--fg); background: var(--panel2); font-weight: 600; box-shadow: inset 0 0 0 1px var(--line); }
  .baseui-side-group { margin-top: 6px; }
  .baseui-main { flex: 1; min-width: 0; padding: 22px 28px 64px; max-width: 1380px; }
  .baseui-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .baseui-header p { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; max-width: 760px; }
  .baseui-badges { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 16px; }
  .baseui-badge {
    font-size: 11.5px; color: var(--muted); border: 1px solid var(--line);
    background: var(--panel); border-radius: 999px; padding: 3px 10px;
  }
  .baseui-badge b { color: var(--fg); font-weight: 600; }
  .baseui-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 18px;
  }
  .baseui-toolbar input {
    flex: 1 1 220px; min-width: 160px; background: var(--panel2); color: var(--fg);
    border: 1px solid var(--line); border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 13px;
  }
  .baseui-count { font-size: 12px; color: var(--muted); margin-left: auto; font-variant-numeric: tabular-nums; }
  .baseui-section-h {
    font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); margin: 26px 0 12px;
  }
  .baseui-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .baseui-card {
    display: flex; flex-direction: column; gap: 5px; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 13px 15px; transition: border-color .15s ease, transform .15s ease;
  }
  .baseui-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .baseui-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .baseui-card-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .baseui-card-top span { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .baseui-card-desc {
    font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .baseui-card-reui { font-size: 11.5px; color: var(--accent); }
  .baseui-mcp {
    margin-top: 22px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; font-size: 12px; color: var(--muted);
  }
  .baseui-mcp code { color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; font-size: 11.5px; }
  .baseui-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .baseui-crumb a { color: var(--muted); text-decoration: none; }
  .baseui-crumb a:hover { color: var(--fg); }
  .baseui-doc { max-width: 860px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 26px 30px 34px; }
  .baseui-doc h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -.02em; }
  .baseui-doc-sub { color: var(--muted); font-size: 13.5px; margin: 0 0 18px; }
  .baseui-doc-body { font-size: 13.5px; line-height: 1.6; }
  .baseui-doc-body h2 { font-size: 17px; margin: 26px 0 8px; letter-spacing: -.01em; }
  .baseui-doc-body h3 { font-size: 14.5px; margin: 20px 0 6px; }
  .baseui-doc-body p, .baseui-doc-body li { color: var(--text); }
  .baseui-doc-body code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 5px;
  }
  .baseui-doc-body pre {
    background: var(--code-bg); border: 1px solid var(--line); border-radius: 9px;
    padding: 13px 15px; overflow-x: auto; font-size: 12.5px; line-height: 1.55;
  }
  .baseui-doc-body pre code { border: 0; padding: 0; background: transparent; font-size: inherit; }
  .baseui-doc-body table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12.5px; }
  .baseui-doc-body th, .baseui-doc-body td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
  .baseui-doc-body th { background: var(--panel2); font-weight: 600; }
  .baseui-doc-body blockquote { margin: 12px 0; padding: 4px 14px; border-left: 3px solid var(--line); color: var(--muted); }
  .baseui-reui {
    margin-top: 14px; padding: 10px 14px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; font-size: 12.5px; color: var(--muted);
  }
  @media (max-width: 960px) {
    .baseui-sidebar { display: none; }
    .baseui-main { padding: 16px; }
  }
`;

function renderSidebar(catalog, activePath) {
  // Components first, then the guides grouped by sidebar group (Handbook,
  // Utilities, Overview, Release notes).
  const components = catalog.components || [];
  const guides = catalog.guides || [];
  const groupOrder = ["Handbook", "Utilities", "Overview", "Releases"];
  const groupHtml = groupOrder
    .map((g) => {
      const links = guides
        .filter((e) => (e.group || SECTION_LABELS[e.section] || "Other") === g)
        .map(
          (e) => `<a class="baseui-side-link${e.path === activePath ? " on" : ""}" href="${docHref(e)}" data-filter="${esc(`${e.name} ${e.slug}`.toLowerCase())}">
            <span>${esc(e.name)}</span>
          </a>`,
        )
        .join("");
      if (!links) return "";
      return `<div class="baseui-side-group"><div class="baseui-side-label">${esc(g)} (${guides.filter((e) => (e.group || SECTION_LABELS[e.section]) === g).length})</div>${links}</div>`;
    })
    .join("");
  const compLinks = components
    .map(
      (c) => `<a class="baseui-side-link${c.path === activePath ? " on" : ""}" href="${docHref(c)}" data-filter="${esc(`${c.name} ${c.slug}`.toLowerCase())}">
        <span>${esc(c.name)}</span>
      </a>`,
    )
    .join("");
  return `<aside class="baseui-sidebar" aria-label="Base UI docs">
    <input class="baseui-side-search" id="baseui-side-search" type="search" placeholder="Filter sidebar…" aria-label="Filter sidebar">
    <div class="baseui-side-label">Components (${components.length})</div>
    ${compLinks}
    ${groupHtml}
  </aside>`;
}

const SIDEBAR_SCRIPT = `
const sideSearch = document.getElementById('baseui-side-search');
if (sideSearch) {
  const links = [...document.querySelectorAll('.baseui-side-link')];
  sideSearch.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    for (const el of links) {
      el.style.display = !q || (el.dataset.filter || '').includes(q) ? '' : 'none';
    }
  });
}
`;

function page(title, catalog, activePath, mainHtml, script = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Designer</title>
<style>${BASE_CSS}${NAV_CSS}${BASEUI_CSS}</style>
</head><body>
${nav("baseui")}
<div class="baseui-shell">
  ${renderSidebar(catalog, activePath)}
  <main class="baseui-main">${mainHtml}</main>
</div>
<script>${SIDEBAR_SCRIPT}
${script}</script>
</body></html>`;
}

function badges(catalog) {
  return [
    catalog.version ? `<span class="baseui-badge">latest release <b>v${esc(catalog.version)}</b></span>` : "",
    `<span class="baseui-badge">docs <b>${catalog.totals.pages} pages</b></span>`,
    catalog.license?.spdx ? `<span class="baseui-badge">license <b>${esc(catalog.license.spdx)}</b></span>` : "",
    `<span class="baseui-badge"><b>headless</b> — visuals live in ReUI</span>`,
  ].join("");
}

function cardHtml(entry, reuiSlugs) {
  const reui = reuiSlug(entry, reuiSlugs);
  return `<a class="baseui-card" href="${docHref(entry)}" data-search="${esc(`${entry.name} ${entry.slug} ${entry.group} ${entry.description}`.toLowerCase())}">
        <div class="baseui-card-top"><strong>${esc(entry.name)}</strong><span>${esc(entry.slug)}</span></div>
        <div class="baseui-card-desc">${esc(entry.description || "")}</div>
        ${reui ? `<div class="baseui-card-reui">rendered live in ReUI ↗</div>` : ""}
      </a>`;
}

/** /baseui — the full offline docs catalog. `reuiSlugs` drives the cross-links. */
export function baseUiCatalogHtml(catalog, { reuiSlugs } = {}) {
  const components = catalog.components || [];
  const guides = catalog.guides || [];
  const sections = [
    ["Overview", guides.filter((g) => g.group === "Overview")],
    ["Handbook", guides.filter((g) => g.group === "Handbook")],
    ["Components", components],
    ["Utilities", guides.filter((g) => g.group === "Utilities")],
    ["Release notes", guides.filter((g) => g.group === "Releases")],
  ];
  const sectionHtml = sections
    .map(([label, entries]) => {
      if (!entries.length) return "";
      return `<div class="baseui-section"><div class="baseui-section-h">${esc(label)} (${entries.length})</div>
      <div class="baseui-grid">${entries.map((e) => cardHtml(e, reuiSlugs)).join("")}</div></div>`;
    })
    .join("");
  const main = `
    <div class="baseui-header">
      <h1>Base UI</h1>
      <p>The @base-ui/react documentation, baked offline from base-ui.com/llms.txt: ${components.length} headless components, ${guides.length} guides, overview pages and utilities. Base UI ships no visuals — the gallery's <a href="/reui">ReUI components</a> render many of them live.</p>
    </div>
    <div class="baseui-badges">${badges(catalog)}</div>
    <div class="baseui-toolbar">
      <input id="baseui-search" type="search" placeholder="Search ${components.length + guides.length} pages…" aria-label="Search Base UI docs">
      <span class="baseui-count" id="baseui-count">${components.length + guides.length} pages</span>
    </div>
    <div id="baseui-sections">${sectionHtml}</div>
    <div class="baseui-mcp">Pick these programmatically with the <code>design_kit_*</code> MCP tools (<code>design_kit_list</code>, <code>design_kit_search</code>, <code>design_kit_docs</code> with <code>"kit": "baseui"</code>) or the JSON at <code>/api/baseui</code>.</div>`;
  const script = `
const root = document.getElementById('baseui-sections');
const search = document.getElementById('baseui-search');
const count = document.getElementById('baseui-count');
const cards = [...root.querySelectorAll('.baseui-card')];
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const match = !q || card.dataset.search.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  }
  for (const section of root.querySelectorAll('.baseui-section')) {
    const any = [...section.querySelectorAll('.baseui-card')].some((c) => c.style.display !== 'none');
    section.style.display = any ? '' : 'none';
  }
  count.textContent = visible + ' pages';
});`;
  return page("Base UI", catalog, null, main, script);
}

/** /baseui/doc/:section/:slug — one rendered markdown doc. */
export function baseUiDocHtml(catalog, entry, content, { reuiSlugs } = {}) {
  const isComponent = entry.section === "components";
  const title = isComponent ? entry.name : `${entry.name} (${SECTION_LABELS[entry.section] || entry.section})`;
  const reui = reuiSlug(entry, reuiSlugs);
  const main = `
    <div class="baseui-crumb"><a href="/baseui">Base UI</a> / ${esc(SECTION_LABELS[entry.section] || entry.section)}</div>
    <article class="baseui-doc">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px">
        <h1>${esc(entry.name)}</h1>
        ${entry.section === "components" ? mcpButton(`designer:baseui:${entry.slug}`, `Base UI — ${entry.name}`) : ""}
      </div>
      <p class="baseui-doc-sub">${esc(entry.description || "")}</p>
      <div class="baseui-doc-body">${markdown.render(String(content || ""))}</div>
    </article>
    ${
      reui
        ? `<div class="baseui-reui">Base UI is headless — see this component <b>rendered live</b> as a styled variant in the ReUI gallery: <a href="/reui/${esc(reui)}">/reui/${esc(reui)}</a>.</div>`
        : ""
    }
    <div class="baseui-mcp">${
      isComponent
        ? `Read this component programmatically with <code>design_kit_docs {"kit": "baseui", "item": "${esc(entry.slug)}"}</code>; search with <code>design_kit_search {"kit": "baseui"}</code>.`
        : `Read this guide programmatically with <code>design_kit_docs {"kit": "baseui", "kind": "guide", "item": "${esc(`${entry.section}/${entry.slug}`)}"}</code>.`
    }</div>`;
  return page(title, catalog, entry.path, main);
}
