/**
 * ui.mjs — the HTML for the component library and preset galleries.
 *
 * These pages share a nav bar with the design gallery so the three
 * sources sit under one roof: designs, components, presets.
 *
 * Everything is rendered server-side from the local cache. No CDN, no
 * network, no client-side framework.
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const BASE_CSS = `
  :root {
    --bg: #0d0f12; --panel: #16191e; --panel2: #1d2127; --line: #2a2f37;
    --fg: #e6e9ee; --muted: #9aa3b0; --accent: #7c8cff;
    --code-bg: #0a0c0f;
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg);
    font: 14px/1.5 ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif; }
  a { color: var(--accent); }
`;

/** The top nav bar shared by every page. */
export function nav(active) {
  const tab = (href, label, key) =>
    `<a class="tab${active === key ? " on" : ""}" href="${href}">${label}</a>`;
  return `<nav class="nav">
    <span class="brand">▣ Designer</span>
    ${tab("/", "Designs", "designs")}
    ${tab("/components", "Components", "components")}
    ${tab("/presets", "Gradients &amp; Patterns", "presets")}
    <span class="spacer"></span>
    <a class="dl" href="/skill">⬇ Skill</a>
  </nav>`;
}

export const NAV_CSS = `
  .nav { position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:4px;
    background:rgba(13,15,18,.94); backdrop-filter:blur(10px);
    border-bottom:1px solid var(--line); padding:0 16px; height:46px; }
  .brand { font-weight:650; margin-right:14px; letter-spacing:-.01em; color:var(--fg); }
  .tab { color:var(--muted); text-decoration:none; padding:6px 11px; border-radius:7px;
    font-size:13px; white-space:nowrap; }
  .tab:hover { color:var(--fg); background:var(--panel2); }
  .tab.on { color:var(--fg); background:var(--panel2); box-shadow:inset 0 0 0 1px var(--line); }
  .spacer { flex:1; }
  .dl { font-size:13px; color:var(--accent); text-decoration:none; border:1px solid var(--line);
    background:var(--panel2); border-radius:7px; padding:5px 11px; }
  .dl:hover { border-color:var(--accent); }
`;

const SHARED_CSS = `
  .bar { display:flex; gap:8px; flex-wrap:wrap; align-items:center; padding:14px 20px 0; }
  input, select, button { background:var(--panel2); color:var(--fg); border:1px solid var(--line);
    border-radius:7px; padding:7px 10px; font:inherit; font-size:13px; }
  input { flex:1 1 220px; min-width:180px; }
  button { cursor:pointer; }
  button:hover { border-color:var(--accent); }
  .count { color:var(--muted); font-size:12px; padding:10px 20px 4px; }
  .empty { padding:60px 20px; color:var(--muted); text-align:center; }
  h1 { margin:0; font-size:16px; font-weight:650; letter-spacing:-.01em; }
  h1 span { color:var(--muted); font-weight:400; }
`;

// ------------------------------------------------------------------ components
export function componentsHtml(catalog) {
  const total = catalog?.total ?? 0;
  const variants = catalog?.variants ?? 0;
  const cats = [...new Set((catalog?.components || []).map((c) => c.category).filter(Boolean))].sort();

  const catOpts = cats
    .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Components — ${total} React components</title>
<style>
${BASE_CSS}
${NAV_CSS}
${SHARED_CSS}
  .grid { display:grid; gap:12px; padding:18px 20px 60px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:11px;
    padding:13px 14px 14px; display:flex; flex-direction:column; gap:8px; }
  .card h3 { margin:0; font-size:14px; font-weight:600; }
  .desc { color:var(--muted); font-size:12px; line-height:1.5;
    display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .tags { display:flex; gap:5px; flex-wrap:wrap; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); }
  .tag.cat { background:#24303a; color:#8fd3c7; border-color:#2f434f; }
  .vlist { display:flex; flex-direction:column; gap:3px; margin-top:2px; }
  .v { font-size:11px; color:var(--muted); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
  .v b { color:var(--fg); font-weight:500; }
</style>
</head>
<body>
${nav("components")}
<div class="bar">
  <h1>Components <span>· ${total} components, ${variants} variants</span></h1>
</div>
<div class="bar">
  <input id="q" placeholder="Search components…" autocomplete="off">
  <select id="cat"><option value="">All categories</option>${catOpts}</select>
  <button id="reset">Reset</button>
</div>
<div class="count" id="count"></div>
<div class="grid" id="grid"></div>
<script>
const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const qEl = document.getElementById('q');
const catEl = document.getElementById('cat');
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let ALL = ${JSON.stringify(catalog?.components || [])};

function card(c) {
  const vs = (c.variants || []).map(v =>
    '<div class="v"><b>' + esc(v.name) + '</b> · ' + esc(v.filename) + '</div>').join('');
  return '<div class="card">' +
    '<h3>' + esc(c.name) + '</h3>' +
    (c.category ? '<div class="tags"><span class="tag cat">' + esc(c.category) + '</span></div>' : '') +
    '<div class="desc">' + esc(c.description || '') + '</div>' +
    '<div class="vlist">' + vs + '</div>' +
    '<div class="tags"><a class="tag" href="/component/' + encodeURIComponent(c.slug) + '">Open →</a></div>' +
  '</div>';
}

function render() {
  const q = qEl.value.trim().toLowerCase();
  const cat = catEl.value;
  let list = ALL;
  if (cat) list = list.filter(c => c.category === cat);
  if (q) list = list.filter(c =>
    (c.name + ' ' + (c.description || '') + ' ' + (c.category || '') + ' ' +
     (c.variants || []).map(v => v.name + ' ' + v.id).join(' ')).toLowerCase().includes(q));
  grid.innerHTML = list.map(card).join('') ||
    '<div class="empty">No components match.</div>';
  countEl.textContent = list.length + ' of ' + ALL.length + ' components';
}

qEl.addEventListener('input', render);
catEl.addEventListener('change', render);
document.getElementById('reset').addEventListener('click', () => {
  qEl.value = ''; catEl.value = ''; render();
});
render();
</script>
</body>
</html>`;
}

export function componentDetailHtml(component) {
  const variants = component?.variants || [];
  const tabs = variants
    .map(
      (v, i) =>
        `<button class="vtab${i === 0 ? " on" : ""}" data-i="${i}">${esc(v.name)}</button>`,
    )
    .join("");

  const panels = variants
    .map((v, i) => {
      const deps = (v.dependencies || []).join(", ");
      return `<section class="panel${i === 0 ? " on" : ""}" data-i="${i}">
  <div class="phead">
    <span class="file">${esc(v.filename)}</span>
    ${deps ? `<span class="deps">deps: ${esc(deps)}</span>` : ""}
    <button class="copy" data-i="${i}">Copy</button>
  </div>
  <pre><code>${esc(v.code)}</code></pre>
</section>`;
    })
    .join("");

  const faq = (component?.faq || [])
    .map(
      (f) =>
        `<details class="faq"><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(component?.title || component?.slug)} — Components</title>
<style>
${BASE_CSS}
${NAV_CSS}
  .wrap { padding:18px 20px 60px; max-width:1100px; }
  h1 { margin:0 0 4px; font-size:19px; font-weight:650; letter-spacing:-.015em; }
  .lead { color:var(--muted); margin:0 0 14px; font-size:13px; max-width:70ch; line-height:1.6; }
  .install { background:var(--code-bg); border:1px solid var(--line); border-radius:8px;
    padding:9px 12px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size:12px; color:#9fd3a8; overflow-x:auto; margin-bottom:16px; }
  .vtabs { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px; }
  .vtab { background:var(--panel2); border:1px solid var(--line); color:var(--muted);
    border-radius:7px; padding:6px 11px; cursor:pointer; font:inherit; font-size:13px; }
  .vtab.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .panel { display:none; }
  .panel.on { display:block; }
  .phead { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
  .file { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:var(--fg); }
  .deps { color:var(--muted); font-size:11px; }
  .copy { margin-left:auto; background:var(--panel2); border:1px solid var(--line);
    color:var(--fg); border-radius:7px; padding:5px 11px; cursor:pointer; font:inherit; font-size:12px; }
  .copy:hover { border-color:var(--accent); }
  pre { background:var(--code-bg); border:1px solid var(--line); border-radius:10px;
    padding:14px 16px; overflow-x:auto; font-size:12px; line-height:1.6;
    font-family:ui-monospace, SFMono-Regular, Menlo, monospace; color:#d7dbe3; }
  .faq { border:1px solid var(--line); border-radius:9px; padding:9px 12px; margin-top:8px;
    background:var(--panel); }
  .faq summary { cursor:pointer; font-size:13px; }
  .faq p { color:var(--muted); font-size:12px; line-height:1.6; margin:8px 0 2px; }
  .back { font-size:12px; text-decoration:none; }
</style>
</head>
<body>
${nav("components")}
<div class="wrap">
  <a class="back" href="/components">← All components</a>
  <h1>${esc(component?.title || component?.slug)}</h1>
  <p class="lead">${esc(component?.description || "")}</p>
  ${component?.install ? `<div class="install">${esc(component.install)}</div>` : ""}
  <div class="vtabs">${tabs}</div>
  ${panels}
  ${faq ? `<h1 style="margin-top:22px;font-size:14px">Questions</h1>${faq}` : ""}
</div>
<script>
const tabs = [...document.querySelectorAll('.vtab')];
const panels = [...document.querySelectorAll('.panel')];
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('on', x === t));
  panels.forEach(p => p.classList.toggle('on', p.dataset.i === t.dataset.i));
}));
document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', async () => {
  const panel = document.querySelector('.panel[data-i="' + btn.dataset.i + '"] code');
  try {
    await navigator.clipboard.writeText(panel.innerText);
    btn.textContent = 'Copied';
    setTimeout(() => btn.textContent = 'Copy', 1400);
  } catch (e) { btn.textContent = 'Failed'; }
}));
</script>
</body>
</html>`;
}

// ------------------------------------------------------------------ presets
export function presetsHtml(catalogs) {
  const list = catalogs?.catalogs || [];
  const total = catalogs?.total ?? 0;

  const cards = list
    .map(
      (c) => `<div class="card">
    <div class="swatch" style="background:${esc(c.preview || "#222")}"></div>
    <div class="meta">
      <h3>${esc(c.label || c.kind)}</h3>
      <div class="desc">${esc(c.summary || "")}</div>
      <div class="tags"><span class="tag">${c.total} presets</span></div>
      <div class="tags"><a class="tag" href="/presets/${encodeURIComponent(c.kind)}">Open →</a></div>
    </div>
  </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gradients &amp; Patterns — ${total} presets</title>
<style>
${BASE_CSS}
${NAV_CSS}
${SHARED_CSS}
  .grid { display:grid; gap:12px; padding:18px 20px 60px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:11px; overflow:hidden; }
  .swatch { height:130px; border-bottom:1px solid var(--line); }
  .meta { padding:12px 14px 14px; display:flex; flex-direction:column; gap:8px; }
  .card h3 { margin:0; font-size:14px; font-weight:600; }
  .desc { color:var(--muted); font-size:12px; line-height:1.5; }
  .tags { display:flex; gap:5px; flex-wrap:wrap; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); text-decoration:none; }
  .tag:hover { border-color:var(--accent); color:var(--fg); }
</style>
</head>
<body>
${nav("presets")}
<div class="bar"><h1>Gradients &amp; Patterns <span>· ${total} presets</span></h1></div>
<div class="count">${list.length} catalogs</div>
<div class="grid">
${cards || '<div class="empty">No presets cached. Run: node scripts/fetch-presets.mjs</div>'}
</div>
</body>
</html>`;
}

export function presetDetailHtml(catalog) {
  const presets = catalog?.presets || [];
  const kind = catalog?.kind || "presets";

  const cards = presets
    .map((p) => {
      const style = p.style && typeof p.style === "object"
        ? Object.entries(p.style)
            .map(([k, v]) => `${k}:${v}`)
            .join(";")
        : "";
      const label = p.name || p.label || p.id;
      return `<div class="card">
  <div class="swatch" style="${esc(style)};background:${esc(style)}"></div>
  <div class="meta">
    <h3>${esc(label)}</h3>
    ${p.category ? `<div class="tags"><span class="tag">${esc(p.category)}</span></div>` : ""}
    ${p.description ? `<div class="desc">${esc(p.description)}</div>` : ""}
    <div class="tags"><span class="tag mono">${esc(p.id)}</span></div>
    ${p.code ? `<pre><code>${esc(p.code)}</code></pre>` : ""}
  </div>
</div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(catalog?.label || kind)} — ${presets.length} presets</title>
<style>
${BASE_CSS}
${NAV_CSS}
${SHARED_CSS}
  .grid { display:grid; gap:12px; padding:18px 20px 60px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:11px; overflow:hidden; }
  .swatch { height:120px; border-bottom:1px solid var(--line); }
  .meta { padding:12px 14px 14px; display:flex; flex-direction:column; gap:8px; }
  .card h3 { margin:0; font-size:14px; font-weight:600; }
  .desc { color:var(--muted); font-size:12px; line-height:1.5; }
  .tags { display:flex; gap:5px; flex-wrap:wrap; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); }
  .tag.mono { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background:var(--code-bg); border:1px solid var(--line); border-radius:8px; padding:10px 12px;
    overflow-x:auto; font-size:11px; line-height:1.55; margin:0;
    font-family:ui-monospace, SFMono-Regular, Menlo, monospace; color:#d7dbe3; }
</style>
</head>
<body>
${nav("presets")}
<div class="bar">
  <h1>${esc(catalog?.label || kind)} <span>· ${presets.length} presets</span></h1>
</div>
<div class="bar"><a class="tag" href="/presets">← All catalogs</a></div>
<div class="grid">
${cards || '<div class="empty">No presets cached.</div>'}
</div>
</body>
</html>`;
}
