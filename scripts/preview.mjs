#!/usr/bin/env node
/**
 * design-preview — a live preview server for the design-system catalog.
 *
 * Runs alongside the MCP server and exposes the cached catalog over HTTP with
 * a thumbnail gallery, so you can browse designs in a browser instead of only
 * through tool calls.
 *
 * It reuses the upstream package's own renderer
 * (`fidgetcoding-refero-mcp/dist/design-md.js` -> renderDesignMd) so the
 * DESIGN.md served here is byte-identical to what `refero_design_md` returns.
 *
 * Thumbnails are served from the LOCAL cache (`<cache>/thumbs/<id>.jpg`).
 * There is no CDN redirect: once `fetch-thumbs.mjs` has run, the gallery
 * makes zero outbound requests. OpenDesign entries have no bitmap thumbnail —
 * their preview HTML is self-contained — so they render a generated swatch
 * card instead.
 *
 * Routes
 *   GET /                      gallery UI
 *   GET /api/designs           JSON list (?theme=&industry=&source=&q=&limit=&offset=)
 *   GET /api/designs/:id       full design JSON
 *   GET /api/designs/:id/design.md   rendered DESIGN.md
 *   GET /api/facets            theme/industry/font distributions
 *   GET /api/search?q=         ranked search over the catalog
 *   GET /thumb/:id             local thumbnail bytes
 *   GET /design/:id            detail page
 *   GET /skill                 downloadable skill archive
 *   GET /healthz               readiness probe
 *
 * `/api/styles` and `/style/:id` remain as aliases for the old paths.
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   PORT               listen port (default 8787)
 *   HOST               bind address (default 127.0.0.1)
 */

import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mergeDesign } from "./lib/cache.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR =
  process.env.DESIGN_CACHE_DIR ||
  process.env.REFERO_CACHE_DIR ||
  join(homedir(), ".design-cache");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

// Where the skill lives. In the image it is /app/skills/designer-mcp; in a
// checkout it is <repo>/skills/designer-mcp.
const SKILL_DIR = process.env.SKILL_DIR || join(HERE, "..", "skills", "designer-mcp");

// The upstream package renders DESIGN.md from the full style record. Import it
// from the installed package so both surfaces stay identical. Resolve it
// relative to this file, then walk up a few levels — the scripts live in
// different places in dev (scripts/) and in the image (/app).
const { createRequire } = await import("node:module");
function loadRenderer() {
  const candidates = [];
  let dir = HERE;
  for (let i = 0; i < 5; i++) {
    candidates.push(join(dir, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(c)) return import(`file://${c}`);
  }
  // Last resort: plain node resolution from cwd.
  const require = createRequire(join(process.cwd(), "index.js"));
  return import(`file://${require.resolve("fidgetcoding-refero-mcp/dist/design-md.js")}`);
}
const { renderDesignMd } = await loadRenderer();

/**
 * DESIGN.md for a design, whichever source it came from.
 *
 * Refero entries are rendered by the upstream renderer so the output stays
 * byte-identical to what `refero_design_md` returns. OpenDesign entries ship
 * their own hand-written DESIGN.md — far richer than anything we could
 * synthesise from tokens — so it is served verbatim.
 */
function designMarkdown(full) {
  if (full.designMd) return full.designMd;
  return renderDesignMd(full);
}

// ------------------------------------------------------------------ data
let catalog = [];
let byId = new Map();
let loadedAt = 0;

async function loadCatalog() {
  const p = join(CACHE_DIR, "catalog.json");
  if (!existsSync(p)) throw new Error(`no catalog at ${p}`);
  const raw = JSON.parse(await readFile(p, "utf8"));
  // The merged catalog carries both `designs` and `styles` keys pointing at
  // the same array, so either works.
  catalog = raw.designs || raw.styles || [];
  byId = new Map(catalog.map((s) => [s.id, s]));
  loadedAt = Date.now();
}

async function loadFull(id) {
  const entry = byId.get(id);
  const source = entry?.source || "refero";
  const p =
    source === "opendesign"
      ? join(CACHE_DIR, "systems", `${id}.json`)
      : join(CACHE_DIR, "styles", `${id}.json`);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(await readFile(p, "utf8"));
  // Refero files store { style }; OpenDesign files store { system } plus the
  // package payload. mergeDesign normalises both into one shape.
  return mergeDesign(entry, raw.style ?? raw.system ?? null);
}

/** Local thumbnail bytes for a design, or null. */
async function loadThumb(id) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const p = join(CACHE_DIR, "thumbs", `${id}${ext}`);
    if (!existsSync(p)) continue;
    const buf = await readFile(p);
    const type =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { buf, type };
  }
  return null;
}

/**
 * A generated swatch card for sources with no bitmap thumbnail
 * (OpenDesign). Pure SVG — no external fonts, no network.
 */
function swatchSvg(d) {
  const colors = (d.colors || []).slice(0, 7);
  const sw =
    colors.length > 0
      ? colors
          .map(
            (c, i) =>
              `<rect x="${i * 90}" y="0" width="90" height="150" fill="${esc(c.hex || "#333")}"/>`,
          )
          .join("")
      : `<rect x="0" y="0" width="630" height="150" fill="#22262c"/>`;
  const label = esc(d.siteName || d.id);
  const bg = d.colorScheme === "dark" ? "#0d0f12" : "#f4f5f7";
  const fg = d.colorScheme === "dark" ? "#e6e9ee" : "#12151a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="630" height="150" viewBox="0 0 630 150">
<rect width="630" height="150" fill="${bg}"/>
<g transform="translate(0,0)">${sw}</g>
<text x="16" y="132" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16" fill="${fg}">${label}</text>
</svg>`;
}

// ------------------------------------------------------------------ search
/** Rank catalog entries against a free-text query. */
function search(query, limit = 40) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = [];
  for (const s of catalog) {
    const hay = [
      s.siteName,
      s.northStar,
      s.industry,
      ...(s.fonts || []),
      ...(s.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (s.siteName?.toLowerCase().includes(t)) score += 10;
      if (s.northStar?.toLowerCase().includes(t)) score += 4;
      if (s.industry?.toLowerCase().includes(t)) score += 3;
      if ((s.fonts || []).some((f) => f.toLowerCase().includes(t))) score += 2;
    }
    if (score > 0) scored.push({ ...s, _score: score });
  }
  scored.sort((a, b) => b._score - a._score || a.siteName.localeCompare(b.siteName));
  return scored.slice(0, limit);
}

function facets() {
  const count = (fn) => {
    const m = new Map();
    for (const s of catalog) {
      const v = fn(s);
      if (!v) continue;
      for (const x of Array.isArray(v) ? v : [v]) m.set(x, (m.get(x) || 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  };
  return {
    total: catalog.length,
    themes: count((s) => s.colorScheme),
    industries: count((s) => s.industry),
    fonts: count((s) => s.fonts),
    sources: count((s) => s.source || "refero"),
    updatedAt: loadedAt,
  };
}

// ------------------------------------------------------------------ html
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function galleryHtml() {
  const f = facets();
  const themeOpts = f.themes
    .map((t) => `<option value="${esc(t.value)}">${esc(t.value)} (${t.count})</option>`)
    .join("");
  const indOpts = f.industries
    .map((t) => `<option value="${esc(t.value)}">${esc(t.value)} (${t.count})</option>`)
    .join("");
  const srcOpts = f.sources
    .map((t) => `<option value="${esc(t.value)}">${esc(t.value)} (${t.count})</option>`)
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design Systems — ${f.total} designs</title>
<style>
  :root {
    --bg: #0d0f12; --panel: #16191e; --panel2: #1d2127; --line: #2a2f37;
    --fg: #e6e9ee; --muted: #9aa3b0; --accent: #7c8cff;
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg);
    font: 14px/1.5 ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif; }
  header { position: sticky; top:0; z-index:10; background:rgba(13,15,18,.92);
    backdrop-filter: blur(8px); border-bottom:1px solid var(--line); padding:14px 20px; }
  h1 { margin:0 0 10px; font-size:16px; font-weight:650; letter-spacing:-.01em; }
  h1 span { color:var(--muted); font-weight:400; }
  .bar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  input, select, button {
    background:var(--panel2); color:var(--fg); border:1px solid var(--line);
    border-radius:7px; padding:7px 10px; font:inherit; font-size:13px; }
  input { flex:1 1 220px; min-width:180px; }
  button { cursor:pointer; }
  button:hover { border-color:var(--accent); }
  .dl { font-size:13px; color:var(--accent); text-decoration:none; align-self:center;
    border:1px solid var(--line); background:var(--panel2); border-radius:7px; padding:7px 11px; }
  .dl:hover { border-color:var(--accent); }
  .grid { display:grid; gap:14px; padding:18px 20px 60px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:11px;
    overflow:hidden; display:flex; flex-direction:column; }
  .card a.shot { display:block; aspect-ratio:16/10; background:#0a0c0e center/cover no-repeat; }
  .meta { padding:11px 12px 13px; display:flex; flex-direction:column; gap:7px; }
  .name { font-weight:600; font-size:14px; }
  .ns { color:var(--muted); font-size:12px; line-height:1.45;
    display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .tags { display:flex; gap:5px; flex-wrap:wrap; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px;
    border:1px solid var(--line); background:var(--panel2); color:var(--muted); }
  .tag.theme-dark { background:#1b2a3a; color:#9ecbff; border-color:#26405c; }
  .tag.theme-light { background:#33301f; color:#f0d78c; border-color:#4a4630; }
  .tag.theme-mixed { background:#2c2438; color:#c9b3ff; border-color:#40354f; }
  .tag.src { background:#24303a; color:#8fd3c7; border-color:#2f434f; }
  .sw { display:flex; gap:3px; margin-top:2px; }
  .sw i { width:15px; height:15px; border-radius:4px; border:1px solid rgba(255,255,255,.12); }
  .links { display:flex; gap:8px; font-size:12px; margin-top:4px; }
  .links a { color:var(--accent); text-decoration:none; }
  .links a:hover { text-decoration:underline; }
  .count { color:var(--muted); font-size:12px; padding:0 20px 4px; }
  .empty { padding:60px 20px; color:var(--muted); text-align:center; }
</style>
</head>
<body>
<header>
  <h1>Design Systems <span>· ${f.total} cached designs</span></h1>
  <div class="bar">
    <input id="q" placeholder="Search names, north stars, fonts…" autocomplete="off">
    <select id="source"><option value="">All sources</option>${srcOpts}</select>
    <select id="theme"><option value="">All themes</option>${themeOpts}</select>
    <select id="ind"><option value="">All industries</option>${indOpts}</select>
    <select id="sort">
      <option value="name">Name</option>
      <option value="score">Relevance</option>
    </select>
    <button id="reset">Reset</button>
    <a class="dl" href="/skill">⬇ Skill</a>
  </div>
</header>
<div class="count" id="count"></div>
<div class="grid" id="grid"></div>

<script>
const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const qEl = document.getElementById('q');
const srcEl = document.getElementById('source');
const themeEl = document.getElementById('theme');
const indEl = document.getElementById('ind');
const sortEl = document.getElementById('sort');

// Client-side escaper — the server has its own, but this script runs alone.
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let ALL = [];

function card(s) {
  const colors = (s.colors || []).slice(0, 7).map(c =>
    '<i style="background:' + esc(c.hex || c.value || '#333') + '" title="' + esc(c.hex || c.value) + '"></i>'
  ).join('');
  const theme = String(s.colorScheme || 'light');
  const src = String(s.source || 'refero');
  return '<div class="card">' +
    '<a class="shot" style="background-image:url(/thumb/' + encodeURIComponent(s.id) + ')" href="/design/' + encodeURIComponent(s.id) + '" target="_blank"></a>' +
    '<div class="meta">' +
      '<div class="name">' + esc(s.siteName) + '</div>' +
      '<div class="ns">' + esc(s.northStar || '') + '</div>' +
      '<div class="tags">' +
        '<span class="tag theme-' + esc(theme) + '">' + esc(theme) + '</span>' +
        '<span class="tag src">' + esc(src) + '</span>' +
        (s.industry ? '<span class="tag">' + esc(s.industry) + '</span>' : '') +
        ((s.fonts || []).length ? '<span class="tag">' + esc(s.fonts[0]) + '</span>' : '') +
      '</div>' +
      '<div class="sw">' + colors + '</div>' +
      '<div class="links">' +
        '<a href="/design/' + encodeURIComponent(s.id) + '">Detail</a>' +
        '<a href="/api/designs/' + encodeURIComponent(s.id) + '/design.md">DESIGN.md</a>' +
        '<a href="' + esc(s.url || '#') + '" target="_blank" rel="noopener">Site</a>' +
      '</div>' +
    '</div></div>';
}

function render() {
  const q = qEl.value.trim().toLowerCase();
  const theme = themeEl.value;
  const ind = indEl.value;
  const src = srcEl.value;
  let list = ALL.filter(s =>
    (!src || (s.source || 'refero') === src) &&
    (!theme || s.colorScheme === theme) &&
    (!ind || s.industry === ind) &&
    (!q || (s.siteName || '').toLowerCase().includes(q) ||
      (s.northStar || '').toLowerCase().includes(q) ||
      (s.fonts || []).some(f => f.toLowerCase().includes(q)))
  );
  if (sortEl.value === 'name') list = list.slice().sort((a,b) => (a.siteName||'').localeCompare(b.siteName||''));
  countEl.textContent = list.length + ' of ' + ALL.length + ' designs';
  grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No designs match.</div>';
}

let t;
qEl.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 120); });
srcEl.addEventListener('change', render);
themeEl.addEventListener('change', render);
indEl.addEventListener('change', render);
sortEl.addEventListener('change', render);
document.getElementById('reset').addEventListener('click', () => {
  qEl.value = ''; srcEl.value = ''; themeEl.value = ''; indEl.value = ''; sortEl.value = 'name'; render();
});

fetch('/api/designs?limit=5000').then(r => r.json()).then(d => { ALL = d.designs || d.styles; render(); });
</script>
</body></html>`;
}

function detailHtml(s) {
  // Token extraction works for both sources: Refero nests them under
  // fullResult.raw, OpenDesign under fullResult.raw too (we normalise on
  // import) and additionally carries the typed token JSON.
  const tokens =
    s.fullResult?.raw?.colors?.tokens ||
    s.tokens?.tokens?.filter((t) => t.type === "color") ||
    [];
  const sw = tokens.slice(0, 60).map((t) => {
    const hex = t.value || t.hex || t.color || "";
    return '<div class="tok"><span class="chip" style="background:' + esc(hex) + '"></span>' +
      '<span class="tn">' + esc(t.name || t.context || "") + '</span>' +
      '<span class="tv">' + esc(hex) + '</span></div>';
  }).join("");
  const typeScale = s.fullResult?.designSystem?.typeScale || [];
  const ts = typeScale.map((t) =>
    '<div class="tsr"><span class="tsrole">' + esc(t.role) + '</span>' +
    '<span class="tssize">' + esc(t.size) + 'px / ' + esc(t.lineHeight) + '</span></div>'
  ).join("");
  const dos = (s.fullResult?.designSystem?.dos || []).map((d) => '<li>' + esc(d) + '</li>').join("");
  const donts = (s.fullResult?.designSystem?.donts || []).map((d) => '<li>' + esc(d) + '</li>').join("");
  const src = s.source || "refero";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.siteName)} — Design Systems</title>
<style>
  :root{--bg:#0d0f12;--panel:#16191e;--line:#2a2f37;--fg:#e6e9ee;--muted:#9aa3b0;--accent:#7c8cff;}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.6 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif}
  .wrap{max-width:1000px;margin:0 auto;padding:22px 20px 70px}
  a{color:var(--accent)}
  .shot{width:100%;border-radius:11px;border:1px solid var(--line);background:#0a0c0e center/cover no-repeat;aspect-ratio:16/9}
  h1{margin:16px 0 4px;font-size:24px;letter-spacing:-.02em}
  .ns{color:var(--muted);font-size:15px;margin-bottom:14px}
  .tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
  .tag{font-size:12px;padding:3px 9px;border-radius:999px;border:1px solid var(--line);background:var(--panel)}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:26px 0 10px}
  .toks{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
  .tok{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12px}
  .chip{width:20px;height:20px;border-radius:5px;border:1px solid rgba(255,255,255,.14);flex:none}
  .tn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tv{color:var(--muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
  .tsr{display:flex;justify-content:space-between;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 11px;margin-bottom:5px;font-size:13px}
  .tsrole{color:var(--muted)}
  ul{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 12px 12px 30px}
  pre{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
</style></head><body><div class="wrap">
<a href="/">&larr; back to gallery</a>
<img class="shot" src="/thumb/${encodeURIComponent(s.id)}" alt="">
<h1>${esc(s.siteName)}</h1>
<div class="ns">${esc(s.northStar || "")}</div>
<div class="tags">
  <span class="tag">${esc(src)}</span>
  <span class="tag">${esc(s.colorScheme || "")}</span>
  ${s.industry ? `<span class="tag">${esc(s.industry)}</span>` : ""}
  ${(s.fonts || []).map((f) => `<span class="tag">${esc(f)}</span>`).join("")}
</div>
<h2>Color tokens (${tokens.length})</h2><div class="toks">${sw}</div>
${typeScale.length ? `<h2>Type scale</h2><div>${ts}</div>` : ""}
${dos ? `<h2>Do</h2><ul>${dos}</ul>` : ""}
${donts ? `<h2>Don't</h2><ul>${donts}</ul>` : ""}
<h2>DESIGN.md</h2>
<pre>${esc(designMarkdown(s))}</pre>
</div></body></html>`;
}

// ------------------------------------------------------------------ server
function json(res, code, body) {
  const payload = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(payload) });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const p = url.pathname;

    if (p === "/healthz") return json(res, 200, { ok: true, styles: catalog.length, updatedAt: loadedAt });

    if (p === "/" || p === "/index.html") {
      const html = galleryHtml();
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": Buffer.byteLength(html) });
      return res.end(html);
    }

    if (p === "/api/designs" || p === "/api/styles") {
      const theme = url.searchParams.get("theme");
      const ind = url.searchParams.get("industry");
      const src = url.searchParams.get("source");
      const q = url.searchParams.get("q");
      const limit = Math.min(Number(url.searchParams.get("limit") || 200), 5000);
      const offset = Number(url.searchParams.get("offset") || 0);
      let list = q ? search(q, 5000) : catalog;
      if (theme) list = list.filter((s) => s.colorScheme === theme);
      if (ind) list = list.filter((s) => s.industry === ind);
      if (src) list = list.filter((s) => (s.source || "refero") === src);
      return json(res, 200, {
        total: list.length,
        offset,
        limit,
        designs: list.slice(offset, offset + limit),
        // Alias so older clients keep working.
        styles: list.slice(offset, offset + limit),
      });
    }

    if (p === "/api/facets") return json(res, 200, facets());

    if (p === "/api/search") {
      const q = url.searchParams.get("q") || "";
      return json(res, 200, {
        query: q,
        results: search(q, Number(url.searchParams.get("limit") || 40)),
      });
    }

    // Ids are UUIDs (refero) or slugs (opendesign), so the pattern is
    // deliberately permissive but still excludes path separators.
    const mDesign = p.match(/^\/(?:api\/designs|api\/styles)\/([^/]+?)(\/design\.md)?$/);
    if (mDesign) {
      const id = decodeURIComponent(mDesign[1]);
      const full = await loadFull(id);
      if (!full) return json(res, 404, { error: "design not in cache", id });
      if (mDesign[2]) {
        const md = designMarkdown(full);
        res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
        return res.end(md);
      }
      return json(res, 200, full);
    }

    const mPage = p.match(/^\/(?:design|style)\/([^/]+)$/);
    if (mPage) {
      const id = decodeURIComponent(mPage[1]);
      const full = await loadFull(id);
      if (!full) return json(res, 404, { error: "design not in cache", id });
      const html = detailHtml(full);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": Buffer.byteLength(html) });
      return res.end(html);
    }

    // Thumbnails are served from the LOCAL cache. No redirect to a CDN, so
    // the gallery works with no network at all.
    const mThumb = p.match(/^\/thumb\/([^/]+)$/);
    if (mThumb) {
      const id = decodeURIComponent(mThumb[1]);
      const thumb = await loadThumb(id);
      if (thumb) {
        res.writeHead(200, {
          "content-type": thumb.type,
          "content-length": thumb.buf.length,
          "cache-control": "public, max-age=31536000, immutable",
        });
        return res.end(thumb.buf);
      }
      // No bitmap for this entry (OpenDesign) — render a generated swatch.
      const d = byId.get(id);
      if (d) {
        const svg = swatchSvg(d);
        res.writeHead(200, {
          "content-type": "image/svg+xml; charset=utf-8",
          "content-length": Buffer.byteLength(svg),
          "cache-control": "public, max-age=3600",
        });
        return res.end(svg);
      }
      return json(res, 404, { error: "no thumbnail", id });
    }

    // The skill is served from the container so a container-only deployment
    // can hand it out without needing the repo.
    if (p === "/skill" || p === "/skill/" || p === "/skill.zip") {
      // In the image the zip sits beside the skill dir; in a checkout it may
      // be inside it. Try both.
      const zipCandidates = [
        join(SKILL_DIR, "designer-mcp-skill.zip"),
        join(dirname(SKILL_DIR), "designer-mcp-skill.zip"),
      ];
      for (const zip of zipCandidates) {
        if (!existsSync(zip)) continue;
        const buf = await readFile(zip);
        res.writeHead(200, {
          "content-type": "application/zip",
          "content-length": buf.length,
          "content-disposition": 'attachment; filename="designer-mcp-skill.zip"',
        });
        return res.end(buf);
      }
      // No prebuilt zip in the image — offer the skill directory as a tarball.
      const tar = spawnSync(
        "tar",
        ["-czf", "-", "-C", dirname(SKILL_DIR), "designer-mcp"],
        { maxBuffer: 64 * 1024 * 1024 },
      );
      if (tar.status === 0 && tar.stdout?.length) {
        res.writeHead(200, {
          "content-type": "application/gzip",
          "content-length": tar.stdout.length,
          "content-disposition": 'attachment; filename="designer-mcp-skill.tar.gz"',
        });
        return res.end(tar.stdout);
      }
      return json(res, 404, { error: "skill not found in image", skillDir: SKILL_DIR });
    }

    if (p === "/skill/SKILL.md") {
      const md = join(SKILL_DIR, "SKILL.md");
      if (!existsSync(md)) return json(res, 404, { error: "SKILL.md not found" });
      const body = await readFile(md, "utf8");
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(body);
    }

    return json(res, 404, { error: "not found", path: p });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

// Wait for the catalog rather than dying. The cache is often populated by a
// separate fetch container that may still be running when the gallery starts,
// so a missing catalog here is normal, not fatal. Without this the container
// crash-loops until the fetch finishes.
const CATALOG_WAIT_MS = Number(process.env.DESIGN_CATALOG_WAIT_MS || 300000);
const CATALOG_POLL_MS = Number(process.env.DESIGN_CATALOG_POLL_MS || 2000);

async function waitForCatalog() {
  const deadline = Date.now() + CATALOG_WAIT_MS;
  let announced = false;
  while (Date.now() < deadline) {
    if (existsSync(join(CACHE_DIR, "catalog.json"))) {
      try {
        await loadCatalog();
        return true;
      } catch {
        // Written but not yet complete — fall through and retry.
      }
    }
    if (!announced) {
      console.log(
        `design-preview waiting for a catalog at ${join(CACHE_DIR, "catalog.json")} ` +
          `(up to ${Math.round(CATALOG_WAIT_MS / 1000)}s). ` +
          `Populate it with: node scripts/refero-public-fetch.js --limit 0`,
      );
      announced = true;
    }
    await new Promise((r) => setTimeout(r, CATALOG_POLL_MS));
  }
  return false;
}

if (!(await waitForCatalog())) {
  console.error(
    `design-preview: no catalog at ${join(CACHE_DIR, "catalog.json")} after ` +
      `${Math.round(CATALOG_WAIT_MS / 1000)}s. Populate it with: ` +
      `node scripts/refero-public-fetch.js --limit 0`,
  );
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  const bySource = {};
  for (const d of catalog) {
    const s = d.source || "refero";
    bySource[s] = (bySource[s] || 0) + 1;
  }
  console.log(
    `design-preview on http://${HOST}:${PORT} — ${catalog.length} designs ` +
      `(${Object.entries(bySource).map(([k, v]) => `${k}: ${v}`).join(", ")})`,
  );
});
