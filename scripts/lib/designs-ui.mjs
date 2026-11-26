/**
 * designs-ui.mjs — Unified Design Systems gallery HTML (live server + static site).
 *
 * One interface for every DESIGN.md-backed design system:
 *   - Classic Refero (1,342, of which 588 are enriched with Refero Styles deep profiles)
 *   - Standalone Refero Styles (200)
 *   - OpenDesign packages (198, with live previews & Claude Design exports)
 *   - Vendored System Templates (7, with copyable starter kits)
 *
 * Fetches its compact JSON index from `indexUrl` (default `/api/designs-index.json`)
 * so both `preview.mjs` and `build-static.mjs` stay byte-for-byte consistent.
 */

import { shellHead, shellStyle, nav } from "./ui.mjs";
import { HUE_FAMILIES } from "./designs-index.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SOURCE_LABELS = {
  "refero-styles": "Refero Deep Styles",
  refero: "Refero Classic",
  opendesign: "OpenDesign",
  template: "System Templates",
};

const GROUND_LABELS = {
  white: "Pure White",
  warm: "Warm / Cream",
  "cool-gray": "Cool Gray",
  charcoal: "Charcoal",
  black: "Pure Black",
  tinted: "Tinted Ground",
};

const CAP_LABELS = {
  "live-preview": "Live Preview",
  "deep-recipes": "Component CSS Recipes",
  "tokens-css": "tokens.css",
  "claude-design": "Claude Design Pkg",
  "starter-kit": "Starter Kit",
  "dos-donts": "Do / Don't Rules",
};

const FONT_STYLE_LABELS = {
  sans: "Sans-serif",
  serif: "Serif",
  mono: "Monospace",
  display: "Display",
};

const PAIRING_LABELS = {
  "serif+sans": "Serif + Sans",
  "sans+mono": "Sans + Mono",
  "all-sans": "All Sans",
  "all-serif": "All Serif",
  "all-mono": "All Mono",
  "serif+mono": "Serif + Mono",
};

const DESIGNS_CSS = `
  .ds-wrap { max-width: 1520px; margin: 0 auto; padding: 24px clamp(14px, 3vw, 32px) 72px; }
  .ds-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .ds-head h1 { margin: 0; font-size: clamp(24px, 3vw, 32px); font-weight: 700; letter-spacing: -.03em; color: var(--strong); line-height: 1.15; }
  .ds-head p { margin: 5px 0 0; color: var(--muted); font-size: 13.5px; max-width: 72ch; }
  .ds-toolbar {
    display: flex; flex-direction: column; gap: 10px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 14px; margin-bottom: 14px; box-shadow: var(--shadow-sm);
  }
  .ds-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .ds-search-wrap { position: relative; flex: 1 1 280px; min-width: 200px; display: flex; align-items: center; }
  .ds-search-ico { position: absolute; left: 11px; color: var(--muted); pointer-events: none; }
  .ds-search {
    width: 100%; padding: 8px 36px 8px 34px; border-radius: 8px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--fg); font: inherit; font-size: 13.5px;
    transition: border-color .12s ease, background-color .12s ease;
  }
  .ds-search:focus { border-color: var(--accent); background: var(--panel); }
  .ds-search-kbd {
    position: absolute; right: 9px; font: 600 10.5px var(--mono); padding: 1px 5px;
    border-radius: 4px; border: 1px solid var(--line); background: var(--panel); color: var(--muted);
    pointer-events: none;
  }
  .ds-search-wrap:focus-within .ds-search-kbd { opacity: 0; }
  .ds-select {
    padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg); font: inherit; font-size: 12.5px; cursor: pointer;
  }
  .ds-group { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; }
  .ds-label { font-size: 12px; font-weight: 600; color: var(--muted); margin-right: 4px; }
  .ds-label-gap { margin-left: 8px; }
  .pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg); font: inherit; font-size: 12px; cursor: pointer;
    transition: border-color .12s ease, background-color .12s ease;
  }
  .pill:hover { border-color: var(--accent); }
  .pill[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); font-weight: 600; }
  .pill .n { color: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  .hue-strip { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  .hue-dot {
    width: 22px; height: 22px; border-radius: 999px; border: 2px solid var(--line);
    padding: 0; cursor: pointer; position: relative; transition: transform .12s ease, border-color .12s ease;
  }
  .hue-dot:hover { transform: scale(1.12); border-color: var(--strong); }
  .hue-dot[aria-pressed="true"] { border-color: var(--strong); box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); transform: scale(1.1); }
  .ds-more-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border-radius: 8px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--strong); font: inherit; font-size: 12.5px; font-weight: 550; cursor: pointer;
  }
  .ds-more-btn:hover { border-color: var(--accent); }
  .ds-more-btn[aria-expanded="true"] { background: var(--accent-bg); border-color: var(--accent-line); }
  .ds-mob-toggle { display: none; }
  .ds-badge-cnt {
    display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px;
    padding: 0 5px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 11px; font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .ds-drawer {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px;
    padding-top: 12px; border-top: 1px solid var(--line); margin-top: 2px;
  }
  .ds-facet { display: flex; flex-direction: column; gap: 6px; }
  .ds-facet-h { font-size: 12px; font-weight: 600; color: var(--strong); }
  .ds-facet-pills { display: flex; flex-wrap: wrap; gap: 5px; }
  .hex-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .hex-row input[type="color"] { width: 32px; height: 30px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel2); padding: 2px; cursor: pointer; }
  .hex-row input[type="text"] { width: 92px; padding: 5px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel2); color: var(--fg); font: 12px var(--mono); }
  .hex-row input[type="range"] { width: 100px; accent-color: var(--accent); }
  .hex-clear { padding: 4px 8px; font-size: 11.5px; border-radius: 6px; border: 1px solid var(--line); background: var(--panel2); color: var(--muted); cursor: pointer; }
  .ds-active { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 12px; }
  .active-chip {
    display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px;
    background: var(--accent-bg); border: 1px solid var(--accent-line); color: var(--strong); font-size: 12px; cursor: pointer;
  }
  .active-chip span { opacity: .7; }
  .clear-all { background: transparent; border: 0; color: var(--accent); font: inherit; font-size: 12px; font-weight: 550; cursor: pointer; padding: 3px 6px; }
  .clear-all:hover { text-decoration: underline; }
  .ds-meta-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 12px; font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .ds-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 268px), 1fr)); gap: 16px; list-style: none; padding: 0; margin: 0; }
  .ds-card {
    display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 12px;
    background: var(--panel); overflow: hidden; box-shadow: var(--shadow-sm);
    transition: border-color .14s ease, box-shadow .14s ease;
    content-visibility: auto; contain-intrinsic-size: auto 340px;
  }
  .ds-card:hover, .ds-card:focus-within { border-color: var(--accent); }
  .ds-card-link { display: flex; flex-direction: column; text-decoration: none; color: inherit; flex: 1; }
  .ds-visual {
    position: relative; aspect-ratio: 16 / 10; background: var(--panel2);
    border-bottom: 1px solid var(--line); overflow: hidden;
  }
  .ds-swatch-fallback { position: absolute; inset: 0; z-index: 0; display: flex; }
  .ds-swatch-fallback span { flex: 1; }
  .ds-visual img {
    position: relative; z-index: 1; width: 100%; height: 100%;
    object-fit: cover; object-position: top; display: block;
  }
  .ds-visual.svg-fit img { object-fit: contain; padding: 10px; background: var(--panel2); }
  .ds-palette { display: flex; height: 7px; border-bottom: 1px solid var(--line); }
  .ds-palette span { flex: 1; }
  .ds-body { padding: 11px 13px 12px; display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .ds-title-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .ds-title { font-weight: 650; font-size: 14px; color: var(--strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -.01em; }
  .ds-src {
    flex: none; font-size: 10.5px; padding: 1px 7px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--muted); white-space: nowrap;
  }
  .ds-src.deep { color: var(--accent); border-color: var(--accent-line); background: var(--accent-bg); }
  .ds-src.open { color: var(--ok-fg); border-color: color-mix(in srgb, var(--ok-fg) 35%, var(--line)); }
  .ds-desc { font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45; }
  .ds-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; padding-top: 4px; }
  .ds-tag { font-size: 11px; padding: 2px 7px; border-radius: 999px; background: var(--chip); color: var(--muted); }
  .ds-card-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 7px 13px; border-top: 1px solid var(--line); background: var(--panel2); font-size: 11.5px; color: var(--muted);
  }
  .ds-card-foot a { text-decoration: none; font-weight: 550; }
  .ds-card-foot a:hover { text-decoration: underline; }
  .ds-pager { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }
  .ds-btn {
    padding: 8px 16px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel); color: var(--strong); font: inherit; font-size: 13px; font-weight: 550; cursor: pointer;
  }
  .ds-btn:hover { border-color: var(--accent); }
  .ds-empty { text-align: center; color: var(--muted); padding: 48px 16px; }
  @media (max-width: 680px) {
    .ds-wrap { padding-top: 16px; }
    .ds-mob-toggle { display: inline-flex; }
    .ds-select { flex: 1 1 140px; min-width: 0; }
    .ds-toolbar:not(.mob-open) .ds-quick-facets { display: none; }
    .ds-toolbar:not(.mob-open) .ds-theme-group { display: none; }
    .ds-label-gap { margin-left: 0; }
    .ds-search-kbd { display: none; }
  }
`;

const DESIGNS_STYLE_LINK = shellStyle("designs", DESIGNS_CSS);

function refForDesignSsr(d) {
  if (d.source === "template") return `designer:template:${String(d.id).replace(/^template:/, "")}`;
  if (d.id && String(d.id).startsWith("rs:")) return `designer:style:${String(d.id).slice(3)}`;
  if (d.source === "opendesign") return `designer:opendesign:${d.id}`;
  return `designer:refero:${d.id}`;
}

function ssrDesignCard(d, idx) {
  const swatches = (d.colors || [])
    .map((c) => `<span style="background:${esc(c)}" title="${esc(c)}"></span>`)
    .join("");
  const srcLabel = d.source === "refero-styles"
    ? (d.recipeCount ? `Deep Style · ${d.recipeCount} recipes` : "Deep Style")
    : d.source === "opendesign"
      ? "OpenDesign"
      : d.source === "template"
        ? "Template"
        : "Refero";
  const srcCls = d.source === "refero-styles" ? "ds-src deep" : d.source === "opendesign" || d.source === "template" ? "ds-src open" : "ds-src";
  const isSvg = d.thumb && d.thumb.endsWith(".svg");
  const tags = [];
  if (d.theme) tags.push(d.theme);
  if (d.industry && d.industry !== "template") tags.push(d.industry);
  if (d.fonts && d.fonts[0]) tags.push(d.fonts[0]);
  if (d.caps && d.caps.includes("live-preview")) tags.push("live preview");
  if (d.caps && d.caps.includes("starter-kit")) tags.push("starter kit");
  const mcpRef = refForDesignSsr(d);
  const mcpBtn = `<button type="button" class="mcp-send-btn compact" data-mcp-ref="${esc(mcpRef)}" data-mcp-label="${esc(d.name)}" aria-pressed="false" title="Send ${esc(mcpRef)} to MCP">+ MCP</button>`;
  const footLeft = d.deepHref
    ? `<a href="${esc(d.deepHref)}">Deep Style Recipes →</a>`
    : `<span>${esc(d.domain || srcLabel)}</span>`;
  const imgAttrs = idx < 2
    ? 'fetchpriority="high" decoding="async"'
    : idx < 6
      ? 'decoding="async"'
      : 'loading="lazy" decoding="async"';
  return `<li class="ds-card">` +
    `<a class="ds-card-link" href="${esc(d.href)}">` +
      `<div class="ds-visual${isSvg ? " svg-fit" : ""}">` +
        `<div class="ds-swatch-fallback" aria-hidden="true">${swatches}</div>` +
        (d.thumb ? `<img src="${esc(d.thumb)}" alt="" ${imgAttrs} onerror="this.remove()">` : "") +
      `</div>` +
      (swatches ? `<div class="ds-palette" aria-hidden="true">${swatches}</div>` : "") +
      `<div class="ds-body">` +
        `<div class="ds-title-row"><span class="ds-title">${esc(d.name)}</span><span class="${srcCls}">${esc(srcLabel)}</span></div>` +
        (d.desc ? `<span class="ds-desc">${esc(d.desc)}</span>` : "") +
        `<div class="ds-tags">${tags.slice(0, 4).map((t) => `<span class="ds-tag">${esc(t)}</span>`).join("")}</div>` +
      `</div>` +
    `</a>` +
    `<div class="ds-card-foot">${footLeft}${mcpBtn}</div>` +
  `</li>`;
}

export function unifiedDesignsHtml({ total, facets = {}, indexUrl = "/api/designs-index.json", pageSize = 60, initialDesigns = [] }) {
  const countMap = (list) => new Map((list || []).map((x) => [x.value, x.count]));
  const srcCounts = countMap(facets.sources);
  const themeCounts = countMap(facets.themes);
  const hueCounts = countMap(facets.hues);
  const groundCounts = countMap(facets.groundTones);
  const tempCounts = countMap(facets.temperatures);
  const contrastCounts = countMap(facets.contrasts);
  const capCounts = countMap(facets.capabilities);
  const fontStyleCounts = countMap(facets.fontStyles);
  const pairingCounts = countMap(facets.fontPairings);
  const surfaceCounts = countMap(facets.surfaces);

  const themePills = [
    ["", "All", total],
    ["light", "☀ Light", themeCounts.get("light") || 0],
    ["dark", "☾ Dark", themeCounts.get("dark") || 0],
    ["mixed", "◐ Mixed", themeCounts.get("mixed") || 0],
  ]
    .map(([v, label, n]) => `<button type="button" class="pill" data-theme="${v}" aria-pressed="${v === ""}">${label} <span class="n">${n}</span></button>`)
    .join("");

  const hueDots = HUE_FAMILIES.map(({ id, label, swatch }) => {
    const n = hueCounts.get(id) || 0;
    return `<button type="button" class="hue-dot" data-hue="${id}" aria-pressed="false" style="background:${swatch}" title="${esc(label)} (${n})" aria-label="Filter by ${esc(label)} accent (${n})"></button>`;
  }).join("");

  const sourcePills = [
    ["", "All sources", total],
    ["refero-styles", "Refero Deep Styles", srcCounts.get("refero-styles") || 0],
    ["refero", "Refero Classic", srcCounts.get("refero") || 0],
    ["opendesign", "OpenDesign", srcCounts.get("opendesign") || 0],
    ["template", "System Templates", srcCounts.get("template") || 0],
  ]
    .map(([v, label, n]) => `<button type="button" class="pill" data-source="${v}" aria-pressed="${v === ""}">${esc(label)} <span class="n">${n}</span></button>`)
    .join("");

  const groundPills = Object.entries(GROUND_LABELS)
    .map(([v, label]) => `<button type="button" class="pill" data-ground="${v}" aria-pressed="false">${esc(label)} <span class="n">${groundCounts.get(v) || 0}</span></button>`)
    .join("");

  const tempPills = [
    ["warm", "Warm"],
    ["cool", "Cool"],
    ["neutral", "Neutral"],
  ]
    .map(([v, label]) => `<button type="button" class="pill" data-temp="${v}" aria-pressed="false">${label} <span class="n">${tempCounts.get(v) || 0}</span></button>`)
    .join("");

  const contrastPills = [
    ["high", "High Contrast"],
    ["vibrant", "Vibrant"],
    ["soft", "Soft / Muted"],
  ]
    .map(([v, label]) => `<button type="button" class="pill" data-contrast="${v}" aria-pressed="false">${label} <span class="n">${contrastCounts.get(v) || 0}</span></button>`)
    .join("");

  const fontStylePills = Object.entries(FONT_STYLE_LABELS)
    .map(([v, label]) => `<button type="button" class="pill" data-font-style="${v}" aria-pressed="false">${label} <span class="n">${fontStyleCounts.get(v) || 0}</span></button>`)
    .join("");

  const pairingPills = Object.entries(PAIRING_LABELS)
    .filter(([v]) => (pairingCounts.get(v) || 0) > 0)
    .map(([v, label]) => `<button type="button" class="pill" data-pairing="${v}" aria-pressed="false">${label} <span class="n">${pairingCounts.get(v) || 0}</span></button>`)
    .join("");

  const capPills = Object.entries(CAP_LABELS)
    .filter(([v]) => (capCounts.get(v) || 0) > 0)
    .map(([v, label]) => `<button type="button" class="pill" data-cap="${v}" aria-pressed="false">${esc(label)} <span class="n">${capCounts.get(v) || 0}</span></button>`)
    .join("");

  const surfacePills = (facets.surfaces || [])
    .map(({ value, count }) => `<button type="button" class="pill" data-surface="${esc(value)}" aria-pressed="false">${esc(value)} <span class="n">${count}</span></button>`)
    .join("");

  const moodPills = (facets.moods || [])
    .slice(0, 14)
    .map(({ value, count }) => `<button type="button" class="pill" data-mood="${esc(value)}" aria-pressed="false">${esc(value)} <span class="n">${count}</span></button>`)
    .join("");

  const industryOptions = [
    '<option value="">All industries</option>',
    ...(facets.industries || []).map(({ value, count }) => `<option value="${esc(value)}">${esc(value)} (${count})</option>`),
  ].join("");

  const fontOptions = [
    '<option value="">Any font family</option>',
    ...(facets.topFonts || []).map(({ value, count }) => `<option value="${esc(value)}">${esc(value)} (${count})</option>`),
  ].join("");

  const initialCardsHtml = (initialDesigns || []).map(ssrDesignCard).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(DESIGNS_STYLE_LINK)}
<link rel="preload" href="${esc(indexUrl)}" as="fetch" crossorigin>
<title>Design Systems — ${total} unified DESIGN.md systems</title>
</head>
<body>
${nav("designs")}
<main class="ds-wrap">
  <header class="ds-head">
    <div>
      <h1>Design Systems</h1>
      <p>Every <code>DESIGN.md</code> system in one searchable gallery — Refero Deep Styles, Refero Classic, OpenDesign packages, and copyable System Templates, 100% offline.</p>
    </div>
  </header>

  <section id="ds-toolbar" class="ds-toolbar" aria-label="Filter design systems">
    <div class="ds-row">
      <div class="ds-search-wrap">
        <svg class="ds-search-ico" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.8 10.8 14 14"/></svg>
        <input id="ds-q" class="ds-search" type="search" placeholder="Search ${total} design systems (name, domain, font, mood, industry, #hex)..." aria-label="Search design systems" autocomplete="off">
        <kbd class="ds-search-kbd" aria-hidden="true">/</kbd>
      </div>
      <div class="ds-group ds-theme-group" role="group" aria-label="Theme">${themePills}</div>
      <select id="ds-sort" class="ds-select" aria-label="Sort design systems">
        <option value="richness">Sort: Most complete</option>
        <option value="name">Sort: A – Z</option>
        <option value="light">Sort: Lightest first</option>
        <option value="dark">Sort: Darkest first</option>
        <option value="color" id="sort-color-opt" hidden>Sort: Closest color match</option>
      </select>
      <button type="button" id="ds-mob-toggle" class="ds-more-btn ds-mob-toggle" aria-expanded="false">Filters</button>
      <button type="button" id="ds-more-btn" class="ds-more-btn" aria-expanded="false" aria-controls="ds-drawer">
        More filters <span id="ds-more-cnt" class="ds-badge-cnt" hidden>0</span>
      </button>
    </div>

    <div class="ds-row ds-quick-facets">
      <span class="ds-label">Accent</span>
      <div class="hue-strip" role="group" aria-label="Filter by accent color">${hueDots}</div>
      <span class="ds-label ds-label-gap">Source</span>
      <div class="ds-group" role="group" aria-label="Filter by source">${sourcePills}</div>
    </div>

    <div id="ds-drawer" class="ds-drawer" hidden>
      <div class="ds-facet">
        <span class="ds-facet-h">Match Brand Hex</span>
        <div class="hex-row">
          <input id="ds-hex-pick" type="color" value="#4f5de8" aria-label="Pick brand color">
          <input id="ds-hex-text" type="text" placeholder="#4f5de8" maxlength="7" aria-label="Brand hex code">
          <input id="ds-hex-tol" type="range" min="15" max="120" value="55" title="Color match tolerance" aria-label="Color match tolerance">
          <button type="button" id="ds-hex-clear" class="hex-clear" hidden>Clear</button>
        </div>
        <span class="ds-facet-h" style="margin-top:6px">Ground / Canvas Tone</span>
        <div class="ds-facet-pills">${groundPills}</div>
      </div>

      <div class="ds-facet">
        <span class="ds-facet-h">Palette Feel</span>
        <div class="ds-facet-pills">${tempPills}${contrastPills}</div>
        <span class="ds-facet-h" style="margin-top:6px">Deliverables</span>
        <div class="ds-facet-pills">${capPills}</div>
      </div>

      <div class="ds-facet">
        <span class="ds-facet-h">Typography</span>
        <div class="ds-facet-pills">${fontStylePills}</div>
        <div class="ds-facet-pills">${pairingPills}</div>
        <select id="ds-font" class="ds-select" aria-label="Filter by font family">${fontOptions}</select>
      </div>

      <div class="ds-facet">
        <span class="ds-facet-h">Industry &amp; Surface</span>
        <select id="ds-industry" class="ds-select" aria-label="Filter by industry">${industryOptions}</select>
        <div class="ds-facet-pills">${surfacePills}</div>
        <span class="ds-facet-h" style="margin-top:6px">Mood</span>
        <div class="ds-facet-pills">${moodPills}</div>
      </div>
    </div>
  </section>

  <div id="ds-active" class="ds-active" hidden></div>
  <div class="ds-meta-bar">
    <span id="ds-count" role="status">${initialCardsHtml ? `${total} design systems` : `Loading ${total} design systems…`}</span>
    <span id="ds-summary"></span>
  </div>

  <ul id="ds-grid" class="ds-grid">${initialCardsHtml}</ul>
  <p id="ds-empty" class="ds-empty" hidden>No design systems match your current filters. Try clearing one or broadening your color tolerance.</p>
  <div id="ds-pager" class="ds-pager" hidden>
    <button type="button" id="ds-more" class="ds-btn">Show more</button>
    <button type="button" id="ds-all" class="ds-btn">Show all</button>
  </div>
</main>
<script>
(function(){
  var INDEX_URL = ${JSON.stringify(indexUrl)};
  var PAGE_SIZE = ${Number(pageSize) || 60};
  var SOURCE_LABELS = ${JSON.stringify(SOURCE_LABELS)};
  var GROUND_LABELS = ${JSON.stringify(GROUND_LABELS)};
  var CAP_LABELS = ${JSON.stringify(CAP_LABELS)};

  var qEl = document.getElementById('ds-q');
  var sortEl = document.getElementById('ds-sort');
  var sortColorOpt = document.getElementById('sort-color-opt');
  var moreBtn = document.getElementById('ds-more-btn');
  var moreCnt = document.getElementById('ds-more-cnt');
  var drawer = document.getElementById('ds-drawer');
  var hexPick = document.getElementById('ds-hex-pick');
  var hexText = document.getElementById('ds-hex-text');
  var hexTol = document.getElementById('ds-hex-tol');
  var hexClear = document.getElementById('ds-hex-clear');
  var fontEl = document.getElementById('ds-font');
  var indEl = document.getElementById('ds-industry');
  var activeEl = document.getElementById('ds-active');
  var countEl = document.getElementById('ds-count');
  var summaryEl = document.getElementById('ds-summary');
  var toolbarEl = document.getElementById('ds-toolbar');
  var mobToggle = document.getElementById('ds-mob-toggle');
  var gridEl = document.getElementById('ds-grid');
  var emptyEl = document.getElementById('ds-empty');
  var pagerEl = document.getElementById('ds-pager');
  var loadMoreBtn = document.getElementById('ds-more');
  var showAllBtn = document.getElementById('ds-all');

  var state = {
    q: '',
    theme: '',
    source: '',
    hues: new Set(),
    ground: '',
    temp: '',
    contrast: '',
    fontStyle: '',
    pairing: '',
    font: '',
    industry: '',
    moods: new Set(),
    surface: '',
    caps: new Set(),
    hex: '',
    tol: 55,
    sort: 'richness'
  };

  var allDesigns = [];
  var filtered = [];
  var shown = PAGE_SIZE;
  var renderedCount = ${initialDesigns.length};
  var ssrInitialCount = ${initialDesigns.length};

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function hexRgb(h) {
    if (!/^#[0-9a-f]{6}$/i.test(h || '')) return null;
    return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  }
  // Weighted redmean perceptual color distance (0..765 scale, normalized to 0..255)
  function colorDist(a, b) {
    var rm = (a[0] + b[0]) / 2;
    var dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    return Math.sqrt((((512 + rm) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rm) * db * db) >> 8)) / 3;
  }
  function minPaletteDist(item, targetRgb) {
    var best = 999;
    var list = item._rgb || [];
    for (var i = 0; i < list.length; i++) {
      var d = colorDist(list[i], targetRgb);
      if (d < best) best = d;
    }
    return best;
  }

  function hydrateFromUrl() {
    var sp = new URLSearchParams(location.search);
    state.q = sp.get('q') || '';
    state.theme = sp.get('theme') || '';
    state.source = sp.get('source') || '';
    state.ground = sp.get('ground') || '';
    state.temp = sp.get('temp') || '';
    state.contrast = sp.get('contrast') || '';
    state.fontStyle = sp.get('fontStyle') || '';
    state.pairing = sp.get('pairing') || '';
    state.font = sp.get('font') || '';
    state.industry = sp.get('industry') || '';
    state.surface = sp.get('surface') || '';
    state.hex = /^#[0-9a-f]{6}$/i.test(sp.get('hex') || '') ? sp.get('hex').toLowerCase() : '';
    state.tol = Number(sp.get('tol')) || 55;
    state.sort = sp.get('sort') || (state.hex ? 'color' : 'richness');
    (sp.get('hue') || '').split(',').filter(Boolean).forEach(function(v){ state.hues.add(v); });
    (sp.get('mood') || '').split(',').filter(Boolean).forEach(function(v){ state.moods.add(v); });
    (sp.get('cap') || '').split(',').filter(Boolean).forEach(function(v){ state.caps.add(v); });
  }

  function syncUrl() {
    var sp = new URLSearchParams();
    if (state.q) sp.set('q', state.q);
    if (state.theme) sp.set('theme', state.theme);
    if (state.source) sp.set('source', state.source);
    if (state.hues.size) sp.set('hue', [...state.hues].join(','));
    if (state.ground) sp.set('ground', state.ground);
    if (state.temp) sp.set('temp', state.temp);
    if (state.contrast) sp.set('contrast', state.contrast);
    if (state.fontStyle) sp.set('fontStyle', state.fontStyle);
    if (state.pairing) sp.set('pairing', state.pairing);
    if (state.font) sp.set('font', state.font);
    if (state.industry) sp.set('industry', state.industry);
    if (state.moods.size) sp.set('mood', [...state.moods].join(','));
    if (state.surface) sp.set('surface', state.surface);
    if (state.caps.size) sp.set('cap', [...state.caps].join(','));
    if (state.hex) { sp.set('hex', state.hex); sp.set('tol', String(state.tol)); }
    if (state.sort && state.sort !== 'richness') sp.set('sort', state.sort);
    var qs = sp.toString();
    try { history.replaceState(null, '', qs ? '?' + qs : location.pathname); } catch (e) {}
  }

  function syncControls() {
    qEl.value = state.q;
    sortColorOpt.hidden = !state.hex;
    if (!state.hex && state.sort === 'color') state.sort = 'richness';
    sortEl.value = state.sort;
    hexText.value = state.hex;
    if (state.hex) hexPick.value = state.hex;
    hexTol.value = String(state.tol);
    hexClear.hidden = !state.hex;
    fontEl.value = state.font;
    indEl.value = state.industry;

    document.querySelectorAll('[data-theme]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme)); });
    document.querySelectorAll('[data-source]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.source === state.source)); });
    document.querySelectorAll('[data-hue]').forEach(function(b){ b.setAttribute('aria-pressed', String(state.hues.has(b.dataset.hue))); });
    document.querySelectorAll('[data-ground]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.ground === state.ground)); });
    document.querySelectorAll('[data-temp]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.temp === state.temp)); });
    document.querySelectorAll('[data-contrast]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.contrast === state.contrast)); });
    document.querySelectorAll('[data-font-style]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.fontStyle === state.fontStyle)); });
    document.querySelectorAll('[data-pairing]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.pairing === state.pairing)); });
    document.querySelectorAll('[data-surface]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.surface === state.surface)); });
    document.querySelectorAll('[data-mood]').forEach(function(b){ b.setAttribute('aria-pressed', String(state.moods.has(b.dataset.mood))); });
    document.querySelectorAll('[data-cap]').forEach(function(b){ b.setAttribute('aria-pressed', String(state.caps.has(b.dataset.cap))); });

    var advCount = (state.ground ? 1 : 0) + (state.temp ? 1 : 0) + (state.contrast ? 1 : 0) +
      (state.fontStyle ? 1 : 0) + (state.pairing ? 1 : 0) + (state.font ? 1 : 0) +
      (state.industry ? 1 : 0) + (state.surface ? 1 : 0) + (state.hex ? 1 : 0) +
      state.moods.size + state.caps.size;
    moreCnt.textContent = String(advCount);
    moreCnt.hidden = advCount === 0;
    renderActiveChips();
  }

  function renderActiveChips() {
    var chips = [];
    var add = function(label, clearFn) { chips.push({ label: label, clear: clearFn }); };
    if (state.theme) add('Theme: ' + state.theme, function(){ state.theme = ''; });
    if (state.source) add('Source: ' + (SOURCE_LABELS[state.source] || state.source), function(){ state.source = ''; });
    state.hues.forEach(function(h){ add('Color: ' + h, function(){ state.hues.delete(h); }); });
    if (state.hex) add('Brand hex: ' + state.hex, function(){ state.hex = ''; });
    if (state.ground) add('Ground: ' + (GROUND_LABELS[state.ground] || state.ground), function(){ state.ground = ''; });
    if (state.temp) add('Feel: ' + state.temp, function(){ state.temp = ''; });
    if (state.contrast) add('Contrast: ' + state.contrast, function(){ state.contrast = ''; });
    if (state.fontStyle) add('Font: ' + state.fontStyle, function(){ state.fontStyle = ''; });
    if (state.pairing) add('Pairing: ' + state.pairing, function(){ state.pairing = ''; });
    if (state.font) add('Family: ' + state.font, function(){ state.font = ''; });
    if (state.industry) add('Industry: ' + state.industry, function(){ state.industry = ''; });
    if (state.surface) add('Surface: ' + state.surface, function(){ state.surface = ''; });
    state.moods.forEach(function(m){ add('Mood: ' + m, function(){ state.moods.delete(m); }); });
    state.caps.forEach(function(c){ add(CAP_LABELS[c] || c, function(){ state.caps.delete(c); }); });

    activeEl.replaceChildren();
    activeEl.hidden = chips.length === 0;
    if (!chips.length) return;
    chips.forEach(function(ch) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'active-chip';
      b.innerHTML = esc(ch.label) + ' <span aria-hidden="true">×</span>';
      b.addEventListener('click', function(){ ch.clear(); apply(true); });
      activeEl.appendChild(b);
    });
    var clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'clear-all';
    clr.textContent = 'Clear all';
    clr.addEventListener('click', function(){
      state.q = ''; state.theme = ''; state.source = ''; state.hues.clear(); state.ground = '';
      state.temp = ''; state.contrast = ''; state.fontStyle = ''; state.pairing = ''; state.font = '';
      state.industry = ''; state.moods.clear(); state.surface = ''; state.caps.clear(); state.hex = '';
      state.sort = 'richness';
      apply(true);
    });
    activeEl.appendChild(clr);
  }

  function refForDesign(d) {
    if (d.source === 'template') return 'designer:template:' + d.id.replace(/^template:/, '');
    if (d.id && d.id.indexOf('rs:') === 0) return 'designer:style:' + d.id.slice(3);
    if (d.source === 'opendesign') return 'designer:opendesign:' + d.id;
    return 'designer:refero:' + d.id;
  }

  function cardHtml(d) {
    var swatches = (d.colors || []).map(function(c){
      return '<span style="background:' + esc(c) + '" title="' + esc(c) + '"></span>';
    }).join('');
    var srcLabel = d.source === 'refero-styles' ? (d.recipeCount ? 'Deep Style · ' + d.recipeCount + ' recipes' : 'Deep Style')
      : d.source === 'opendesign' ? 'OpenDesign'
      : d.source === 'template' ? 'Template'
      : 'Refero';
    var srcCls = d.source === 'refero-styles' ? 'ds-src deep' : d.source === 'opendesign' || d.source === 'template' ? 'ds-src open' : 'ds-src';
    var isSvg = d.thumb && d.thumb.endsWith('.svg');
    var tags = [];
    if (d.theme) tags.push(d.theme);
    if (d.industry && d.industry !== 'template') tags.push(d.industry);
    if (d.fonts && d.fonts[0]) tags.push(d.fonts[0]);
    if (d.caps && d.caps.indexOf('live-preview') >= 0) tags.push('live preview');
    if (d.caps && d.caps.indexOf('starter-kit') >= 0) tags.push('starter kit');
    var mcpRef = refForDesign(d);
    var mcpBtn = '<button type="button" class="mcp-send-btn compact" data-mcp-ref="' + esc(mcpRef) + '" data-mcp-label="' + esc(d.name) + '" aria-pressed="false" title="Send ' + esc(mcpRef) + ' to MCP">+ MCP</button>';
    var footLeft = d.deepHref
      ? '<a href="' + esc(d.deepHref) + '">Deep Style Recipes →</a>'
      : '<span>' + esc(d.domain || srcLabel) + '</span>';
    var foot = '<div class="ds-card-foot">' + footLeft + mcpBtn + '</div>';
    return '<li class="ds-card">' +
      '<a class="ds-card-link" href="' + esc(d.href) + '">' +
        '<div class="ds-visual' + (isSvg ? ' svg-fit' : '') + '">' +
          '<div class="ds-swatch-fallback" aria-hidden="true">' + swatches + '</div>' +
          (d.thumb ? '<img src="' + esc(d.thumb) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') +
        '</div>' +
        (swatches ? '<div class="ds-palette" aria-hidden="true">' + swatches + '</div>' : '') +
        '<div class="ds-body">' +
          '<div class="ds-title-row"><span class="ds-title">' + esc(d.name) + '</span><span class="' + srcCls + '">' + esc(srcLabel) + '</span></div>' +
          (d.desc ? '<span class="ds-desc">' + esc(d.desc) + '</span>' : '') +
          '<div class="ds-tags">' + tags.slice(0, 4).map(function(t){ return '<span class="ds-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</a>' +
      foot +
    '</li>';
  }

  function renderGrid(append) {
    var target = Math.min(filtered.length, shown);
    if (append && renderedCount > 0 && renderedCount < target) {
      gridEl.insertAdjacentHTML('beforeend', filtered.slice(renderedCount, target).map(cardHtml).join(''));
    } else {
      gridEl.innerHTML = filtered.slice(0, target).map(cardHtml).join('');
    }
    renderedCount = target;
    if (window.DesignerMCP) window.DesignerMCP.syncButtons();
    countEl.textContent = filtered.length === allDesigns.length
      ? filtered.length + ' design systems'
      : filtered.length + ' of ' + allDesigns.length + ' design systems';
    if (summaryEl) {
      summaryEl.textContent = filtered.length > target
        ? 'Showing ' + target + ' of ' + filtered.length
        : '';
    }
    emptyEl.hidden = filtered.length > 0;
    pagerEl.hidden = filtered.length <= shown;
    if (filtered.length > shown) {
      var rem = filtered.length - shown;
      loadMoreBtn.textContent = 'Show ' + Math.min(PAGE_SIZE, rem) + ' more (' + rem + ' left)';
    }
  }

  function apply(resetPage) {
    if (resetPage) shown = PAGE_SIZE;
    syncControls();
    syncUrl();

    var terms = state.q.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    var targetRgb = state.hex ? hexRgb(state.hex) : null;
    var maxDist = state.tol;

    var out = [];
    for (var i = 0; i < allDesigns.length; i++) {
      var d = allDesigns[i];
      if (state.theme && d.theme !== state.theme) continue;
      if (state.source && (!d.sources || d.sources.indexOf(state.source) < 0)) continue;
      if (state.ground && d.groundTone !== state.ground) continue;
      if (state.temp && d.temp !== state.temp) continue;
      if (state.contrast && d.contrast !== state.contrast) continue;
      if (state.fontStyle && (!d.fontStyles || d.fontStyles.indexOf(state.fontStyle) < 0)) continue;
      if (state.pairing && d.fontPairing !== state.pairing) continue;
      if (state.font && (!d.fonts || d.fonts.indexOf(state.font) < 0)) continue;
      if (state.industry && d.industry !== state.industry) continue;
      if (state.surface && (!d.surfaces || d.surfaces.indexOf(state.surface) < 0)) continue;

      if (state.hues.size) {
        var hueHit = false;
        state.hues.forEach(function(h){ if (d.hues && d.hues.indexOf(h) >= 0) hueHit = true; });
        if (!hueHit) continue;
      }
      if (state.moods.size) {
        var moodHit = true;
        state.moods.forEach(function(m){ if (!d.moods || d.moods.indexOf(m) < 0) moodHit = false; });
        if (!moodHit) continue;
      }
      if (state.caps.size) {
        var capHit = true;
        state.caps.forEach(function(c){ if (!d.caps || d.caps.indexOf(c) < 0) capHit = false; });
        if (!capHit) continue;
      }
      if (terms.length) {
        var matchAll = true;
        for (var t = 0; t < terms.length; t++) {
          if (d._hay.indexOf(terms[t]) < 0) { matchAll = false; break; }
        }
        if (!matchAll) continue;
      }
      var dist = 0;
      if (targetRgb) {
        dist = minPaletteDist(d, targetRgb);
        if (dist > maxDist) continue;
      }
      d._dist = dist;
      out.push(d);
    }

    if (state.sort === 'name') out.sort(function(a, b){ return a.name.localeCompare(b.name); });
    else if (state.sort === 'light') out.sort(function(a, b){ return (b.lum - a.lum) || a.name.localeCompare(b.name); });
    else if (state.sort === 'dark') out.sort(function(a, b){ return (a.lum - b.lum) || a.name.localeCompare(b.name); });
    else if (state.sort === 'color' && targetRgb) out.sort(function(a, b){ return (a._dist - b._dist) || (b.richness - a.richness); });
    else out.sort(function(a, b){ return (b.richness - a.richness) || a.name.localeCompare(b.name); });

    filtered = out;
    renderGrid();
  }

  // Event wiring (debounced text search & rAF-throttled color sliders for responsive INP)
  var searchTimer = 0;
  var sliderRaf = 0;
  qEl.addEventListener('input', function(){
    state.q = qEl.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function(){ apply(true); }, 100);
  });
  qEl.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && qEl.value) {
      e.preventDefault();
      qEl.value = '';
      state.q = '';
      apply(true);
    }
  });
  if (mobToggle && toolbarEl) {
    mobToggle.addEventListener('click', function(){
      var open = toolbarEl.classList.toggle('mob-open');
      mobToggle.setAttribute('aria-expanded', String(open));
    });
  }
  sortEl.addEventListener('change', function(){ state.sort = sortEl.value; apply(false); });
  moreBtn.addEventListener('click', function(){
    var open = drawer.hidden;
    drawer.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('[data-theme]').forEach(function(b){
    b.addEventListener('click', function(){ state.theme = b.dataset.theme; apply(true); });
  });
  document.querySelectorAll('[data-source]').forEach(function(b){
    b.addEventListener('click', function(){ state.source = b.dataset.source; apply(true); });
  });
  document.querySelectorAll('[data-hue]').forEach(function(b){
    b.addEventListener('click', function(){
      var v = b.dataset.hue;
      if (state.hues.has(v)) state.hues.delete(v); else state.hues.add(v);
      apply(true);
    });
  });
  document.querySelectorAll('[data-ground]').forEach(function(b){
    b.addEventListener('click', function(){ state.ground = state.ground === b.dataset.ground ? '' : b.dataset.ground; apply(true); });
  });
  document.querySelectorAll('[data-temp]').forEach(function(b){
    b.addEventListener('click', function(){ state.temp = state.temp === b.dataset.temp ? '' : b.dataset.temp; apply(true); });
  });
  document.querySelectorAll('[data-contrast]').forEach(function(b){
    b.addEventListener('click', function(){ state.contrast = state.contrast === b.dataset.contrast ? '' : b.dataset.contrast; apply(true); });
  });
  document.querySelectorAll('[data-font-style]').forEach(function(b){
    b.addEventListener('click', function(){ state.fontStyle = state.fontStyle === b.dataset.fontStyle ? '' : b.dataset.fontStyle; apply(true); });
  });
  document.querySelectorAll('[data-pairing]').forEach(function(b){
    b.addEventListener('click', function(){ state.pairing = state.pairing === b.dataset.pairing ? '' : b.dataset.pairing; apply(true); });
  });
  document.querySelectorAll('[data-surface]').forEach(function(b){
    b.addEventListener('click', function(){ state.surface = state.surface === b.dataset.surface ? '' : b.dataset.surface; apply(true); });
  });
  document.querySelectorAll('[data-mood]').forEach(function(b){
    b.addEventListener('click', function(){
      var v = b.dataset.mood;
      if (state.moods.has(v)) state.moods.delete(v); else state.moods.add(v);
      apply(true);
    });
  });
  document.querySelectorAll('[data-cap]').forEach(function(b){
    b.addEventListener('click', function(){
      var v = b.dataset.cap;
      if (state.caps.has(v)) state.caps.delete(v); else state.caps.add(v);
      apply(true);
    });
  });
  fontEl.addEventListener('change', function(){ state.font = fontEl.value; apply(true); });
  indEl.addEventListener('change', function(){ state.industry = indEl.value; apply(true); });
  function scheduleSliderApply() {
    if (sliderRaf) return;
    sliderRaf = requestAnimationFrame(function(){ sliderRaf = 0; apply(true); });
  }
  hexPick.addEventListener('input', function(){
    state.hex = hexPick.value.toLowerCase();
    state.sort = 'color';
    scheduleSliderApply();
  });
  hexText.addEventListener('input', function(){
    var v = hexText.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      state.hex = v.toLowerCase();
      state.sort = 'color';
      apply(true);
    } else if (!v) {
      state.hex = '';
      apply(true);
    }
  });
  hexTol.addEventListener('input', function(){ state.tol = Number(hexTol.value) || 55; if (state.hex) scheduleSliderApply(); });
  hexClear.addEventListener('click', function(){ state.hex = ''; state.sort = 'richness'; apply(true); });
  loadMoreBtn.addEventListener('click', function(){ shown += PAGE_SIZE; renderGrid(true); });
  showAllBtn.addEventListener('click', function(){ shown = filtered.length; renderGrid(true); });

  hydrateFromUrl();
  var hasInitialFilters = Boolean(
    state.q || state.theme || state.source || state.ground || state.temp || state.contrast ||
    state.fontStyle || state.pairing || state.font || state.industry || state.surface ||
    state.hex || state.hues.size || state.moods.size || state.caps.size || state.sort !== 'richness'
  );
  if (hasInitialFilters || ssrInitialCount === 0) {
    countEl.textContent = 'Filtering design systems…';
    gridEl.innerHTML = Array.from({ length: 8 }, function(){
      return '<li class="skel-card" aria-hidden="true"><div class="skel skel-media"></div><div class="skel-lines"><div class="skel skel-line w-60"></div><div class="skel skel-line w-90"></div><div class="skel skel-line w-40"></div></div></li>';
    }).join('');
    renderedCount = 0;
  }
  var cachedDesigns = window.__DESIGNER_CACHE && window.__DESIGNER_CACHE.designs;
  (cachedDesigns ? Promise.resolve(cachedDesigns) : fetch(INDEX_URL).then(function(r){ return r.json(); })).then(function(data){
    window.__DESIGNER_CACHE = window.__DESIGNER_CACHE || {};
    window.__DESIGNER_CACHE.designs = data;
    allDesigns = (data.designs || []).map(function(d){
      d._hay = [
        d.name, d.domain, d.desc, d.industry, d.theme, d.groundTone,
        (d.fonts || []).join(' '),
        (d.moods || []).join(' '),
        (d.hues || []).join(' '),
        (d.colors || []).join(' '),
        (d.sources || []).join(' ')
      ].filter(Boolean).join(' ').toLowerCase();
      d._rgb = (d.colors || []).map(hexRgb).filter(Boolean);
      return d;
    });
    if (state.ground || state.temp || state.contrast || state.fontStyle || state.pairing || state.font || state.industry || state.surface || state.hex || state.moods.size || state.caps.size) {
      drawer.hidden = false;
      moreBtn.setAttribute('aria-expanded', 'true');
    }
    if (!hasInitialFilters && ssrInitialCount > 0) {
      filtered = allDesigns;
      syncControls();
      // Preserve SSR above-the-fold cards without flicker; append remaining items of page 1.
      renderGrid(true);
    } else {
      apply(true);
    }
  }).catch(function(err){
    countEl.textContent = 'Failed to load design systems index: ' + err.message;
  });
})();
</script>
</body>
</html>`;
}
