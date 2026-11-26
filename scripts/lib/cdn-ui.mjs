/**
 * cdn-ui.mjs — Visual offline browsers powered by the cached CDN assets in /assets/.
 *
 *   - /components/icons   Searchable 1,500+ Lucide icon browser (from local lucide.min.js)
 *                         with live size/stroke/color controls + Copy SVG / React JSX / HTML
 *   - /components/charts  Live interactive Chart.js, Apache ECharts, ApexCharts, D3.js,
 *                         and Tabulator Data Grid gallery from local vendor bundles
 *   - /components/fonts   Live type specimen tester for all 11 baked @fontsource families
 */

import { shellHead, shellStyle, nav } from "./ui.mjs";
import { componentsSubnav } from "./components-ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function assetUrl(manifest, rel) {
  if (!manifest?.version) return "";
  return `/assets/${manifest.version}/starter/${rel}`;
}

function pkgVersion(manifest, name) {
  return (manifest?.packages || []).find((p) => p.name === name)?.version || "";
}

const CDN_BASE_CSS = `
  .cdn-wrap { max-width: 1500px; margin: 0 auto; padding: 22px clamp(14px, 3vw, 32px) 72px; }
  .cdn-wrap h1 { margin: 0; font-size: clamp(22px, 3vw, 28px); font-weight: 700; letter-spacing: -.02em; color: var(--strong); }
  .cdn-lead { margin: 5px 0 18px; color: var(--muted); font-size: 13.5px; max-width: 78ch; }
  .cdn-bar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
    padding: 12px 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; margin-bottom: 14px;
  }
  .cdn-bar input[type="search"], .cdn-bar input[type="text"], .cdn-bar select {
    padding: 7px 11px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg); font: inherit; font-size: 13px;
  }
  .cdn-bar input[type="search"] { flex: 1 1 240px; min-width: 180px; }
  .cdn-ctl { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  .cdn-ctl input[type="range"] { width: 88px; accent-color: var(--accent); }
  .cdn-ctl input[type="color"] { width: 28px; height: 26px; border: 1px solid var(--line); border-radius: 6px; padding: 2px; background: var(--panel2); cursor: pointer; }
  .cdn-count { font-size: 12.5px; color: var(--muted); margin: 0 0 12px; }
  .cdn-pill {
    display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--fg); font: inherit; font-size: 12px; cursor: pointer;
  }
  .cdn-pill:hover { border-color: var(--accent); }
  .cdn-pill[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); font-weight: 600; }
  .cdn-btn {
    padding: 6px 12px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--strong); font: inherit; font-size: 12.5px; font-weight: 550; cursor: pointer;
  }
  .cdn-btn:hover { border-color: var(--accent); }
  .cdn-btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
  .cdn-note {
    margin-top: 22px; padding: 12px 15px; border-radius: 10px; border: 1px solid var(--line);
    background: var(--panel); color: var(--muted); font-size: 12.5px; line-height: 1.6;
  }
  .cdn-note code { font-family: var(--mono); background: var(--code-bg); color: var(--code-fg); padding: 1px 5px; border-radius: 4px; border: 1px solid var(--line); }
`;

const CDN_STYLE_LINK = shellStyle("cdn", CDN_BASE_CSS);

/**
 * /components/icons — Searchable 1,500+ Lucide Icon Browser powered by local lucide.min.js.
 */
export function iconsBrowserHtml({ manifest, counts = {} }) {
  const lucideJs = assetUrl(manifest, "vendor/lucide.min.js");
  const lucideVer = pkgVersion(manifest, "lucide");
  const phosphorVer = pkgVersion(manifest, "@phosphor-icons/react");
  const remixVer = pkgVersion(manifest, "@remixicon/react");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(CDN_STYLE_LINK)}
<title>Offline Icons Browser — Lucide ${esc(lucideVer)}</title>
<style>
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; --ic-size: 24px; --ic-stroke: 2; --ic-color: currentColor; }
.icon-grid svg { width: var(--ic-size); height: var(--ic-size); stroke-width: var(--ic-stroke); stroke: var(--ic-color); }
.icon-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 8px 11px; border: 1px solid var(--line); border-radius: 10px;
  background: var(--panel); color: var(--fg); cursor: pointer; font: inherit; text-align: center;
  transition: border-color .12s ease, transform .12s ease;
  content-visibility: auto; contain-intrinsic-size: auto 92px;
}
.icon-card:hover { border-color: var(--accent); transform: translateY(-1px); }
.icon-card span { font-size: 11px; color: var(--muted); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-pager { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
.icon-pager[hidden] { display: none; }
.icon-dlg {
  width: min(560px, calc(100% - 24px)); border: 1px solid var(--line); border-radius: 14px;
  background: var(--panel); color: var(--fg); padding: 18px;
}
.icon-dlg::backdrop { background: rgba(6, 8, 12, .68); }
.icon-dlg header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.icon-dlg header h2 { margin: 0; font-size: 17px; color: var(--strong); }
.icon-preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.icon-tile { display: grid; place-items: center; height: 96px; border-radius: 10px; border: 1px solid var(--line); }
.icon-tile.light { background: #ffffff; color: #111827; }
.icon-tile.dark { background: #0d0f12; color: #f3f4f6; }
.icon-dlg pre { background: var(--code-bg); color: var(--code-fg); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; font-size: 11.5px; overflow-x: auto; margin: 8px 0; font-family: var(--mono); }
.icon-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.icon-status { font-size: 12px; color: var(--ok-fg); }
</style>
</head>
<body>
${nav("icons")}
${componentsSubnav("icons", counts)}
<main class="cdn-wrap">
  <h1>Icons Browser</h1>
  <p class="cdn-lead">Rendered 100% offline from the cached <code>lucide.min.js</code>${lucideVer ? ` (v${esc(lucideVer)})` : ""} bundle. Click any icon to copy raw SVG, React JSX, or HTML. The offline import map also serves <code>@phosphor-icons/react</code>${phosphorVer ? ` (${esc(phosphorVer)})` : ""} and <code>@remixicon/react</code>${remixVer ? ` (${esc(remixVer)})` : ""}.</p>

  ${lucideJs ? `
  <div class="cdn-bar">
    <input id="ic-q" type="search" placeholder="Search 1,500+ Lucide icons (arrow, chart, shield, sparkle, user...)" aria-label="Search icons" autocomplete="off">
    <label class="cdn-ctl">Size <input id="ic-size" type="range" min="16" max="44" value="24"><span id="ic-size-v">24px</span></label>
    <label class="cdn-ctl">Stroke <input id="ic-stroke" type="range" min="1" max="3" step="0.25" value="2"><span id="ic-stroke-v">2</span></label>
    <label class="cdn-ctl">Color <input id="ic-color" type="color" value="#7c8cff"><button type="button" id="ic-color-reset" class="cdn-btn" style="padding:3px 7px;font-size:11px">Auto</button></label>
  </div>
  <p id="ic-count" class="cdn-count" role="status">Loading icons…</p>
  <div id="ic-grid" class="icon-grid">
    ${Array.from({ length: 18 }, () => '<div class="skel" style="height:86px;border-radius:10px" aria-hidden="true"></div>').join("")}
  </div>
  <div id="ic-pager" class="icon-pager" hidden>
    <button type="button" id="ic-more" class="cdn-btn">Show more icons</button>
  </div>

  <dialog id="ic-dlg" class="icon-dlg" closedby="any" aria-labelledby="ic-dlg-title">
    <header><h2 id="ic-dlg-title"></h2><button type="button" id="ic-close" class="cdn-btn">Close</button></header>
    <div class="icon-preview-row">
      <div class="icon-tile light" id="ic-tile-light"></div>
      <div class="icon-tile dark" id="ic-tile-dark"></div>
    </div>
    <pre><code id="ic-code"></code></pre>
    <div class="icon-actions">
      <button type="button" id="ic-copy-svg" class="cdn-btn primary">Copy SVG</button>
      <button type="button" id="ic-copy-jsx" class="cdn-btn">Copy React JSX</button>
      <button type="button" id="ic-copy-html" class="cdn-btn">Copy HTML</button>
      <button type="button" id="ic-send-mcp" class="mcp-send-btn" data-mcp-ref="" data-mcp-label="">+ Send to MCP</button>
      <span id="ic-status" class="icon-status" role="status"></span>
    </div>
  </dialog>

  <div class="cdn-note">
    <strong>Additional offline icon sets in <code>/assets/importmap.json</code>:</strong>
    Import <code>lucide-react</code> or <code>@phosphor-icons/react</code> directly in any browser ES module using the gallery's offline import map on <a href="/assets">Assets &amp; Docs</a>.
  </div>

  <script src="${esc(lucideJs)}"></script>
  <script>
  (function(){
    var grid = document.getElementById('ic-grid');
    var qEl = document.getElementById('ic-q');
    var sizeEl = document.getElementById('ic-size');
    var sizeV = document.getElementById('ic-size-v');
    var strokeEl = document.getElementById('ic-stroke');
    var strokeV = document.getElementById('ic-stroke-v');
    var colorEl = document.getElementById('ic-color');
    var colorReset = document.getElementById('ic-color-reset');
    var countEl = document.getElementById('ic-count');
    var pagerEl = document.getElementById('ic-pager');
    var moreBtn = document.getElementById('ic-more');
    var dlg = document.getElementById('ic-dlg');
    var dlgTitle = document.getElementById('ic-dlg-title');
    var tileLight = document.getElementById('ic-tile-light');
    var tileDark = document.getElementById('ic-tile-dark');
    var codeEl = document.getElementById('ic-code');
    var statusEl = document.getElementById('ic-status');

    var customColor = '';
    var PAGE = 120;
    var shown = PAGE;
    var rendered = 0;
    var allIcons = [];
    var filtered = [];
    var selected = null;

    function toKebab(name) {
      return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
    }
    function buildSvg(def, size, stroke, color) {
      var attrs = {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color || 'currentColor',
        'stroke-width': stroke,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      };
      var head = Object.keys(attrs).map(function(k){ return k + '="' + attrs[k] + '"'; }).join(' ');
      var inner = (Array.isArray(def) ? def : []).map(function(node){
        var tag = node[0], a = node[1] || {};
        var aStr = Object.keys(a).map(function(k){ return k + '="' + String(a[k]).replace(/"/g,'&quot;') + '"'; }).join(' ');
        return '<' + tag + (aStr ? ' ' + aStr : '') + '/>';
      }).join('');
      return '<svg ' + head + '>' + inner + '</svg>';
    }

    function applyIconVars() {
      var size = Number(sizeEl.value);
      var stroke = Number(strokeEl.value);
      sizeV.textContent = size + 'px';
      strokeV.textContent = String(stroke);
      grid.style.setProperty('--ic-size', size + 'px');
      grid.style.setProperty('--ic-stroke', String(stroke));
      grid.style.setProperty('--ic-color', customColor || 'currentColor');
    }

    function render(append) {
      applyIconVars();
      var target = Math.min(filtered.length, shown);
      var start = (append && rendered > 0 && rendered < target) ? rendered : 0;
      var frag = document.createDocumentFragment();
      for (var i = start; i < target; i++) {
        var ic = filtered[i];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-card';
        btn.innerHTML = buildSvg(ic.def, 24, 2, '') + '<span>' + ic.kebab + '</span>';
        btn.dataset.idx = String(i);
        frag.appendChild(btn);
      }
      if (start === 0) grid.replaceChildren(frag);
      else grid.appendChild(frag);
      rendered = target;
      countEl.textContent = filtered.length === allIcons.length
        ? allIcons.length + ' Lucide icons'
        : filtered.length + ' of ' + allIcons.length + ' Lucide icons';
      pagerEl.hidden = filtered.length <= shown;
      if (filtered.length > shown) {
        moreBtn.textContent = 'Show ' + Math.min(PAGE, filtered.length - shown) + ' more (' + (filtered.length - shown) + ' left)';
      }
    }

    function filter(reset) {
      if (reset) shown = PAGE;
      var terms = qEl.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
      filtered = terms.length
        ? allIcons.filter(function(ic){ return terms.every(function(t){ return ic.search.indexOf(t) >= 0; }); })
        : allIcons;
      render();
    }

    function openIcon(ic) {
      selected = ic;
      var size = Number(sizeEl.value);
      var stroke = Number(strokeEl.value);
      dlgTitle.textContent = ic.name + ' (' + ic.kebab + ')';
      tileLight.innerHTML = buildSvg(ic.def, 40, stroke, customColor);
      tileDark.innerHTML = buildSvg(ic.def, 40, stroke, customColor);
      codeEl.textContent = 'import { ' + ic.name + ' } from "lucide-react";\\n<' + ic.name + ' size={' + size + '} strokeWidth={' + stroke + '}' + (customColor ? ' color="' + customColor + '"' : '') + ' />';
      var mcpIc = document.getElementById('ic-send-mcp');
      if (mcpIc) {
        mcpIc.setAttribute('data-mcp-ref', 'designer:icon:lucide:' + ic.kebab);
        mcpIc.setAttribute('data-mcp-label', 'Lucide Icon: ' + ic.name);
        if (window.DesignerMCP) window.DesignerMCP.syncButtons();
      }
      statusEl.textContent = '';
      dlg.showModal();
    }

    async function copyText(text, label) {
      try {
        await navigator.clipboard.writeText(text);
        statusEl.textContent = label + ' copied';
      } catch (e) {
        statusEl.textContent = 'Clipboard unavailable';
      }
    }

    grid.addEventListener('click', function(e){
      var card = e.target.closest('.icon-card');
      if (!card) return;
      var ic = filtered[Number(card.dataset.idx)];
      if (ic) openIcon(ic);
    });
    document.getElementById('ic-close').addEventListener('click', function(){ dlg.close(); });
    document.getElementById('ic-copy-svg').addEventListener('click', function(){
      if (!selected) return;
      copyText(buildSvg(selected.def, Number(sizeEl.value), Number(strokeEl.value), customColor), 'SVG');
    });
    document.getElementById('ic-copy-jsx').addEventListener('click', function(){
      if (!selected) return;
      copyText(codeEl.textContent, 'React JSX');
    });
    document.getElementById('ic-copy-html').addEventListener('click', function(){
      if (!selected) return;
      copyText('<i data-lucide="' + selected.kebab + '"></i>', 'HTML');
    });
    var icTimer = 0;
    qEl.addEventListener('input', function(){
      clearTimeout(icTimer);
      icTimer = setTimeout(function(){ filter(true); }, 80);
    });
    sizeEl.addEventListener('input', applyIconVars);
    strokeEl.addEventListener('input', applyIconVars);
    colorEl.addEventListener('input', function(){ customColor = colorEl.value; applyIconVars(); });
    colorReset.addEventListener('click', function(){ customColor = ''; applyIconVars(); });
    moreBtn.addEventListener('click', function(){ shown += PAGE; render(true); });

    if (window.lucide && window.lucide.icons) {
      allIcons = Object.keys(window.lucide.icons).sort().map(function(name){
        var kebab = toKebab(name);
        return { name: name, kebab: kebab, def: window.lucide.icons[name], search: (name + ' ' + kebab.replace(/-/g, ' ')).toLowerCase() };
      });
      filter(true);
    } else {
      countEl.textContent = 'Local lucide.min.js did not expose window.lucide.icons.';
    }
  })();
  </script>` : '<p class="cdn-lead">Frontend assets have not been built yet. Run <code>npm run frontend:build</code>.</p>'}
</main>
</body>
</html>`;
}

/**
 * /components/charts — Live interactive Charts & Data Visualization gallery from local vendor bundles.
 */
export function chartsBrowserHtml({ manifest, counts = {} }) {
  const chartJs = assetUrl(manifest, "vendor/chart.umd.min.js");
  const echartsJs = assetUrl(manifest, "vendor/echarts.min.js");
  const apexJs = assetUrl(manifest, "vendor/apexcharts.min.js");
  const apexCss = assetUrl(manifest, "css/apexcharts.css");
  const d3Js = assetUrl(manifest, "vendor/d3.min.js");
  const tabJs = assetUrl(manifest, "vendor/tabulator.min.js");
  const tabCss = assetUrl(manifest, "css/tabulator.min.css");

  const vChart = pkgVersion(manifest, "chart.js");
  const vEcharts = pkgVersion(manifest, "echarts");
  const vApex = pkgVersion(manifest, "apexcharts");
  const vD3 = pkgVersion(manifest, "d3");
  const vTab = pkgVersion(manifest, "tabulator-tables");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(CDN_STYLE_LINK)}
<title>Charts &amp; Data Visualization — Offline CDN Showcase</title>
${apexCss ? `<link rel="stylesheet" href="${esc(apexCss)}">` : ""}
${tabCss ? `<link rel="stylesheet" href="${esc(tabCss)}">` : ""}
<style>
.viz-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap: 16px; }
.viz-card {
  display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 12px;
  background: var(--panel); overflow: hidden;
}
.viz-head {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;
  padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--panel2);
}
.viz-head strong { font-size: 14.5px; color: var(--strong); }
.viz-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--accent-line); background: var(--accent-bg); color: var(--strong); font-family: var(--mono); }
.viz-stage { padding: 14px; min-height: 270px; position: relative; }
.viz-stage canvas { max-height: 250px; }
.viz-foot { padding: 10px 14px; border-top: 1px solid var(--line); font-size: 12px; }
.viz-foot summary { cursor: pointer; color: var(--muted); font-weight: 550; }
.viz-foot pre { background: var(--code-bg); color: var(--code-fg); border: 1px solid var(--line); border-radius: 8px; padding: 10px; overflow-x: auto; font-size: 11.5px; margin: 8px 0 0; font-family: var(--mono); }
.viz-full { grid-column: 1 / -1; }
</style>
</head>
<body>
${nav("charts")}
${componentsSubnav("charts", counts)}
<main class="cdn-wrap">
  <h1>Charts &amp; Data Visualization</h1>
  <p class="cdn-lead">Live interactive charts and data tables powered directly by the cached offline vendor bundles under <code>/assets/</code> — zero CDN requests, ready to embed in dashboards and prototypes.</p>

  ${chartJs ? `
  <div class="viz-grid">
    <section class="viz-card">
      <div class="viz-head"><strong>Area &amp; Line Series</strong><div style="display:flex;gap:6px;align-items:center"><span class="viz-badge">Chart.js ${esc(vChart)}</span><button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:chart:chartjs" data-mcp-label="Chart.js ${esc(vChart)}">+ MCP</button></div></div>
      <div class="viz-stage"><canvas id="viz-chartjs"></canvas></div>
      <div class="viz-foot"><details><summary>Offline embed snippet</summary><pre><code>&lt;script src="${esc(chartJs)}"&gt;&lt;/script&gt;
&lt;canvas id="chart"&gt;&lt;/canvas&gt;
&lt;script&gt;new Chart(document.getElementById('chart'), { type: 'line', data: { ... } });&lt;/script&gt;</code></pre></details></div>
    </section>

    <section class="viz-card">
      <div class="viz-head"><strong>Multi-Series Bar &amp; Trend</strong><div style="display:flex;gap:6px;align-items:center"><span class="viz-badge">Apache ECharts ${esc(vEcharts)}</span><button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:chart:echarts" data-mcp-label="Apache ECharts ${esc(vEcharts)}">+ MCP</button></div></div>
      <div class="viz-stage"><div id="viz-echarts" style="width:100%;height:250px"></div></div>
      <div class="viz-foot"><details><summary>Offline embed snippet</summary><pre><code>&lt;script src="${esc(echartsJs)}"&gt;&lt;/script&gt;
&lt;div id="ec" style="height:260px"&gt;&lt;/div&gt;
&lt;script&gt;echarts.init(document.getElementById('ec')).setOption({ ... });&lt;/script&gt;</code></pre></details></div>
    </section>

    <section class="viz-card">
      <div class="viz-head"><strong>Smooth Area Sparkline</strong><div style="display:flex;gap:6px;align-items:center"><span class="viz-badge">ApexCharts ${esc(vApex)}</span><button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:chart:apexcharts" data-mcp-label="ApexCharts ${esc(vApex)}">+ MCP</button></div></div>
      <div class="viz-stage"><div id="viz-apex" style="width:100%;min-height:245px"></div></div>
      <div class="viz-foot"><details><summary>Offline embed snippet</summary><pre><code>&lt;link rel="stylesheet" href="${esc(apexCss)}"&gt;
&lt;script src="${esc(apexJs)}"&gt;&lt;/script&gt;
&lt;script&gt;new ApexCharts(document.querySelector('#apex'), { chart: { type: 'area' }, ... }).render();&lt;/script&gt;</code></pre></details></div>
    </section>

    <section class="viz-card">
      <div class="viz-head"><strong>Responsive SVG Bar Distribution</strong><div style="display:flex;gap:6px;align-items:center"><span class="viz-badge">D3.js ${esc(vD3)}</span><button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:chart:d3" data-mcp-label="D3.js ${esc(vD3)}">+ MCP</button></div></div>
      <div class="viz-stage"><div id="viz-d3" style="width:100%;height:250px"></div></div>
      <div class="viz-foot"><details><summary>Offline embed snippet</summary><pre><code>&lt;script src="${esc(d3Js)}"&gt;&lt;/script&gt;
&lt;script&gt;d3.select('#viz').append('svg')...&lt;/script&gt;</code></pre></details></div>
    </section>

    <section class="viz-card viz-full">
      <div class="viz-head"><strong>Interactive Sortable Data Grid</strong><div style="display:flex;gap:6px;align-items:center"><span class="viz-badge">Tabulator ${esc(vTab)}</span><button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:chart:tabulator" data-mcp-label="Tabulator ${esc(vTab)}">+ MCP</button></div></div>
      <div class="viz-stage"><div id="viz-tabulator"></div></div>
      <div class="viz-foot"><details><summary>Offline embed snippet</summary><pre><code>&lt;link rel="stylesheet" href="${esc(tabCss)}"&gt;
&lt;script src="${esc(tabJs)}"&gt;&lt;/script&gt;
&lt;script&gt;new Tabulator('#grid', { data: rows, layout: 'fitColumns', columns: [...] });&lt;/script&gt;</code></pre></details></div>
    </section>
  </div>

  <script src="${esc(chartJs)}" defer></script>
  <script src="${esc(echartsJs)}" defer></script>
  <script src="${esc(apexJs)}" defer></script>
  <script src="${esc(d3Js)}" defer></script>
  <script src="${esc(tabJs)}" defer></script>
  <script>
  window.addEventListener('DOMContentLoaded', function(){
    var muted = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#64748b';
    var line = getComputedStyle(document.documentElement).getPropertyValue('--line').trim() || '#334155';

    // 1. Chart.js
    if (window.Chart) {
      new Chart(document.getElementById('viz-chartjs'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            { label: 'Design Systems', data: [420, 680, 910, 1180, 1420, 1540, 1747], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.16)', fill: true, tension: 0.35 },
            { label: 'Live Components', data: [120, 340, 560, 890, 1210, 1490, 1620], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.12)', fill: true, tension: 0.35 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: muted } } },
          scales: { x: { ticks: { color: muted }, grid: { color: line } }, y: { ticks: { color: muted }, grid: { color: line } } }
        }
      });
    }

    // 2. Apache ECharts
    if (window.echarts) {
      var ec = echarts.init(document.getElementById('viz-echarts'));
      ec.setOption({
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: muted }, bottom: 0 },
        grid: { left: 40, right: 16, top: 18, bottom: 36 },
        xAxis: { type: 'category', data: ['ReUI', 'Mantine', 'HeroUI', 'daisyUI', 'HyperUI', 'AI UI'], axisLabel: { color: muted } },
        yAxis: { type: 'value', axisLabel: { color: muted }, splitLine: { lineStyle: { color: line, opacity: 0.45 } } },
        series: [
          { name: 'Components', type: 'bar', data: [87, 123, 73, 68, 68, 109], itemStyle: { color: '#6366f1', borderRadius: [5,5,0,0] } },
          { name: 'Live Previews', type: 'line', smooth: true, data: [87, 123, 24, 67, 68, 109], itemStyle: { color: '#f59e0b' } }
        ]
      });
      window.addEventListener('resize', function(){ ec.resize(); });
    }

    // 3. ApexCharts
    if (window.ApexCharts) {
      new ApexCharts(document.getElementById('viz-apex'), {
        chart: { type: 'area', height: 240, toolbar: { show: false }, background: 'transparent', foreColor: muted },
        series: [{ name: 'Token Coverage', data: [48, 64, 72, 81, 88, 94, 100] }],
        xaxis: { categories: ['v1.0', 'v1.2', 'v1.4', 'v1.6', 'v1.8', 'v2.0', 'v2.2'] },
        colors: ['#22c55e'],
        stroke: { curve: 'smooth', width: 2.5 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.38, opacityTo: 0.04 } },
        grid: { borderColor: line, strokeDashArray: 4 },
        dataLabels: { enabled: false }
      }).render();
    }

    // 4. D3.js
    if (window.d3) {
      var data = [
        { label: 'Light', value: 1180, color: '#3b82f6' },
        { label: 'Dark', value: 425, color: '#6366f1' },
        { label: 'Mixed', value: 142, color: '#14b8a6' },
        { label: 'Warm', value: 310, color: '#f97316' },
        { label: 'Vibrant', value: 490, color: '#ec4899' }
      ];
      var host = document.getElementById('viz-d3');
      var w = host.clientWidth || 440, h = 240, pad = { t: 16, r: 16, b: 30, l: 42 };
      var svg = d3.select(host).append('svg').attr('viewBox', '0 0 ' + w + ' ' + h).style('width', '100%').style('height', '100%');
      var x = d3.scaleBand().domain(data.map(function(d){ return d.label; })).range([pad.l, w - pad.r]).padding(0.28);
      var y = d3.scaleLinear().domain([0, d3.max(data, function(d){ return d.value; }) * 1.1]).range([h - pad.b, pad.t]);
      svg.selectAll('rect').data(data).join('rect')
        .attr('x', function(d){ return x(d.label); })
        .attr('y', function(d){ return y(d.value); })
        .attr('width', x.bandwidth())
        .attr('height', function(d){ return (h - pad.b) - y(d.value); })
        .attr('rx', 6).attr('fill', function(d){ return d.color; });
      svg.append('g').attr('transform', 'translate(0,' + (h - pad.b) + ')').call(d3.axisBottom(x)).attr('color', muted);
      svg.append('g').attr('transform', 'translate(' + pad.l + ',0)').call(d3.axisLeft(y).ticks(4)).attr('color', muted);
    }

    // 5. Tabulator
    if (window.Tabulator) {
      new Tabulator('#viz-tabulator', {
        layout: 'fitColumns',
        height: '240px',
        data: [
          { library: 'ReUI (shadcn)', stack: 'React + Tailwind', items: 1264, preview: 'Live (Radix + Base UI)', license: 'MIT' },
          { library: 'Mantine UI', stack: 'React + CSS Modules', items: 123, preview: 'Live (Vendored)', license: 'MIT' },
          { library: 'GradientDeck AI', stack: 'React + Motion', items: 109, preview: 'Live (Interactive)', license: 'MIT' },
          { library: 'HeroUI v3', stack: 'React + React Aria', items: 73, preview: 'Live CSS + Docs', license: 'MIT' },
          { library: 'daisyUI 5', stack: 'HTML + Tailwind CSS', items: 68, preview: 'Live (35 Themes)', license: 'MIT' },
          { library: 'HyperUI', stack: 'HTML + Tailwind CSS', items: 68, preview: 'Live (Light/Dark)', license: 'MIT' },
          { library: 'Base UI', stack: 'React Headless', items: 37, preview: 'Docs + ReUI Render', license: 'MIT' }
        ],
        columns: [
          { title: 'Library', field: 'library', sorter: 'string', headerFilter: 'input' },
          { title: 'Stack', field: 'stack', sorter: 'string' },
          { title: 'Items', field: 'items', sorter: 'number', hozAlign: 'right', width: 95 },
          { title: 'Preview Mode', field: 'preview', sorter: 'string' },
          { title: 'License', field: 'license', width: 95 }
        ]
      });
    }
  });
  </script>` : '<p class="cdn-lead">Frontend assets have not been built yet. Run <code>npm run frontend:build</code>.</p>'}
</main>
</body>
</html>`;
}

const BAKED_FONTS = [
  { family: "Inter", category: "Sans-serif", variable: true, desc: "Clean neo-grotesque UI typeface built for high-legibility screens." },
  { family: "Archivo", category: "Sans-serif", variable: true, desc: "Grotesque sans-serif built for bold headlines and modernist grids." },
  { family: "Manrope", category: "Sans-serif", variable: true, desc: "Modern geometric sans-serif with crisp tabular figures." },
  { family: "Figtree", category: "Sans-serif", variable: true, desc: "Friendly, clean geometric sans for SaaS interfaces." },
  { family: "Google Sans Flex", category: "Sans-serif", variable: true, desc: "Optical-size variable geometric sans-serif." },
  { family: "Barlow", category: "Sans-serif", variable: false, desc: "Slightly rounded low-contrast grotesque inspired by California signage." },
  { family: "Barlow Condensed", category: "Display", variable: false, desc: "Condensed industrial display variant of Barlow." },
  { family: "Lora", category: "Serif", variable: true, desc: "Well-balanced contemporary editorial serif with calligraphic roots." },
  { family: "Source Serif 4", category: "Serif", variable: true, desc: "Transitional editorial serif optimized for long-form reading." },
  { family: "Cormorant Garamond", category: "Serif", variable: true, desc: "High-contrast display serif for luxury and editorial hero titles." },
  { family: "Caprasimo", category: "Display", variable: false, desc: "Expressive high-contrast soft display serif for posters and heroes." },
];

/**
 * /components/fonts — Live type specimen tester for all locally baked @fontsource woff2 families.
 */
export function fontsBrowserHtml({ manifest, counts = {} }) {
  const fontsCss = assetUrl(manifest, "fonts/fonts.css");
  const cards = BAKED_FONTS.map((f) => {
    const fslug = f.family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `
    <article class="font-card" data-cat="${esc(f.category.toLowerCase())}" data-search="${esc(`${f.family} ${f.category} ${f.desc}`.toLowerCase())}">
      <div class="font-head">
        <div>
          <strong>${esc(f.family)}</strong>
          <span class="font-tag">${esc(f.category)}</span>
          ${f.variable ? '<span class="font-tag var">Variable</span>' : ""}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button type="button" class="mcp-send-btn compact" data-mcp-ref="designer:font:${esc(fslug)}" data-mcp-label="Font: ${esc(f.family)}">+ MCP</button>
          <button type="button" class="cdn-btn font-copy" data-family="${esc(f.family)}">Copy CSS</button>
        </div>
      </div>
      <p class="font-desc">${esc(f.desc)}</p>
      <div class="font-sample" style="font-family:'${esc(f.family)}', sans-serif">The quick brown fox jumps over 0123456789</div>
      <div class="font-charset" style="font-family:'${esc(f.family)}', sans-serif">ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789</div>
    </article>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(CDN_STYLE_LINK)}
<title>Local Offline Fonts — ${BAKED_FONTS.length} Baked Families</title>
${fontsCss ? `<link rel="stylesheet" href="${esc(fontsCss)}">` : ""}
<style>
.font-list { display: grid; gap: 14px; }
.font-card { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); padding: 16px 18px; }
.font-card[hidden] { display: none; }
.font-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.font-head strong { font-size: 16px; color: var(--strong); margin-right: 8px; }
.font-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel2); color: var(--muted); margin-right: 4px; }
.font-tag.var { color: var(--ok-fg); border-color: color-mix(in srgb, var(--ok-fg) 40%, var(--line)); }
.font-desc { margin: 5px 0 12px; font-size: 12.5px; color: var(--muted); }
.font-sample { font-size: 32px; line-height: 1.25; color: var(--strong); margin-bottom: 10px; overflow-wrap: anywhere; }
.font-charset { font-size: 13px; color: var(--muted); letter-spacing: .02em; }
</style>
</head>
<body>
${nav("fonts")}
${componentsSubnav("fonts", counts)}
<main class="cdn-wrap">
  <h1>Local Offline Fonts</h1>
  <p class="cdn-lead">${BAKED_FONTS.length} <code>@fontsource</code> webfont families bundled directly as local <code>woff2</code> binaries — zero Google Fonts requests. Include <code>${esc(fontsCss || "/assets/.../starter/fonts/fonts.css")}</code> in any offline prototype.</p>

  <div class="cdn-bar">
    <input id="fn-text" type="text" value="The quick brown fox jumps over 0123456789" placeholder="Type custom specimen text…" aria-label="Specimen text" style="flex:1 1 280px">
    <label class="cdn-ctl">Size <input id="fn-size" type="range" min="16" max="60" value="32"><span id="fn-size-v">32px</span></label>
    <label class="cdn-ctl">Weight
      <select id="fn-weight" aria-label="Font weight">
        <option value="400" selected>400 Regular</option>
        <option value="500">500 Medium</option>
        <option value="600">600 SemiBold</option>
        <option value="700">700 Bold</option>
      </select>
    </label>
    <div style="display:flex;gap:5px" role="group" aria-label="Font category">
      <button type="button" class="cdn-pill" data-fcat="" aria-pressed="true">All</button>
      <button type="button" class="cdn-pill" data-fcat="sans-serif" aria-pressed="false">Sans-serif</button>
      <button type="button" class="cdn-pill" data-fcat="serif" aria-pressed="false">Serif</button>
      <button type="button" class="cdn-pill" data-fcat="display" aria-pressed="false">Display</button>
    </div>
  </div>

  <div class="font-list">${cards}</div>
</main>
<script>
(function(){
  var FONTS_CSS = ${JSON.stringify(fontsCss)};
  var textEl = document.getElementById('fn-text');
  var sizeEl = document.getElementById('fn-size');
  var sizeV = document.getElementById('fn-size-v');
  var weightEl = document.getElementById('fn-weight');
  var samples = [...document.querySelectorAll('.font-sample')];
  var cards = [...document.querySelectorAll('.font-card')];
  var catBtns = [...document.querySelectorAll('[data-fcat]')];

  function updateSamples() {
    var txt = textEl.value || 'The quick brown fox jumps over 0123456789';
    var sz = sizeEl.value + 'px';
    var wt = weightEl.value;
    sizeV.textContent = sz;
    samples.forEach(function(el){
      el.textContent = txt;
      el.style.fontSize = sz;
      el.style.fontWeight = wt;
    });
  }
  textEl.addEventListener('input', updateSamples);
  sizeEl.addEventListener('input', updateSamples);
  weightEl.addEventListener('change', updateSamples);
  catBtns.forEach(function(b){
    b.addEventListener('click', function(){
      var cat = b.dataset.fcat;
      catBtns.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
      cards.forEach(function(c){ c.hidden = Boolean(cat && c.dataset.cat !== cat); });
    });
  });
  document.querySelectorAll('.font-copy').forEach(function(btn){
    btn.addEventListener('click', async function(){
      var fam = btn.dataset.family;
      var css = '@import "' + FONTS_CSS + '";\\nfont-family: "' + fam + '", sans-serif;';
      try {
        await navigator.clipboard.writeText(css);
        var orig = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function(){ btn.textContent = orig; }, 1400);
      } catch (e) {}
    });
  });
})();
</script>
</body>
</html>`;
}
