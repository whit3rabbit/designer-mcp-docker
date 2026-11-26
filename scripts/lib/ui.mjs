/**
 * ui.mjs — the HTML for the component library, preset, and template galleries.
 *
 * These pages share a nav bar with the design gallery so the sources sit
 * under one roof: designs, components, presets, templates.
 *
 * The gallery renders its pages from the local cache and loads compiled
 * component demos in separate frames.
 */

import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { glassCss, glassProperties } from "./liquid-glass.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Registry of content-hashed shared shell assets served at `/shell/<filename>`
 * (both by `preview.mjs` and emitted into `shell/` by `build-static.mjs`).
 * Avoids duplicating ~15–20 KB of identical CSS/JS into every HTML document.
 */
export const SHELL_ASSETS = new Map();

export function registerShellAsset(name, ext, text, type) {
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 10);
  const filename = `${name}.${hash}.${ext}`;
  const path = `/shell/${filename}`;
  if (!SHELL_ASSETS.has(filename)) {
    const content = Buffer.from(text, "utf8");
    SHELL_ASSETS.set(filename, {
      filename,
      path,
      content,
      gzip: gzipSync(content, { level: 6 }),
      type,
      etag: `"${hash}"`,
    });
  }
  return path;
}

/** Register a named section stylesheet and return its `<link rel="stylesheet">` tag. */
export function shellStyle(name, css) {
  const path = registerShellAsset(name, "css", css, "text/css; charset=utf-8");
  return `<link rel="stylesheet" href="${path}">`;
}

/**
 * FOUC-prevention head snippet for adaptive light/dark theme.
 * Place immediately after <meta name="viewport"> in <head>.
 */
export function themeHead() {
  return `<meta name="color-scheme" content="light dark">
<script>try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark")document.querySelector('meta[name="color-scheme"]').content=s;}catch(e){}</script>`;
}

export const BASE_CSS = `
  :root {
    color-scheme: light dark;
    --bg: light-dark(#fafafa, #09090b);
    --panel: light-dark(#ffffff, #111113);
    --panel2: light-dark(#f4f4f5, #18181b);
    --line: light-dark(#e4e4e7, #27272a);
    --line-strong: light-dark(#d4d4d8, #3f3f46);
    --fg: light-dark(#18181b, #e4e4e7);
    --strong: light-dark(#09090b, #fafafa);
    --text: light-dark(#27272a, #d4d4d8);
    --muted: light-dark(#52525b, #a1a1aa);
    --chip: light-dark(#f4f4f5, #27272a);
    --accent: light-dark(#2563eb, #60a5fa);
    --accent-ink: #ffffff;
    --accent-bg: light-dark(#eff6ff, #172554);
    --accent-line: light-dark(#93c5fd, #1d4ed8);
    --code-bg: light-dark(#f4f4f5, #050507);
    --code-fg: light-dark(#18181b, #e4e4e7);
    --ok-fg: light-dark(#15803d, #4ade80);
    --nav-bg: light-dark(rgba(250,250,250,.88), rgba(9,9,11,.88));
    --brand: light-dark(#15803d, #4ade80);
    --shadow-sm: light-dark(0 1px 2px rgba(9,9,11,.05), 0 1px 2px rgba(0,0,0,.4));
    --shadow-lg: light-dark(0 18px 48px rgba(9,9,11,.14), 0 18px 54px rgba(0,0,0,.6));
    --skel-a: light-dark(#e4e4e7, #18181b);
    --skel-b: light-dark(#f4f4f5, #27272a);
    --font: "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  :root:has(> head > meta[name="color-scheme"][content="dark"]) { color-scheme: dark; }
  :root:has(> head > meta[name="color-scheme"][content="light"]) { color-scheme: light; }
  [hidden] { display: none !important; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 14px/1.55 var(--font); font-optical-sizing: auto;
    -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
  }
  a { color: var(--accent); }
  a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px;
  }
  dialog:modal { overscroll-behavior: contain; }
  dialog::backdrop { overflow: hidden; overscroll-behavior: contain; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
`;

const PILLAR_FOR = {
  designs: "designs",
  "refero-styles": "designs",
  templates: "designs",
  components: "components",
  reui: "components",
  baseui: "components",
  heroui: "components",
  mantine: "components",
  daisyui: "components",
  uikits: "components",
  tailwind: "components",
  icons: "components",
  charts: "components",
  fonts: "components",
  starters: "starters",
  dashboards: "starters",
  slopstrap: "starters",
  presets: "presets",
  assets: "assets",
  docs: "assets",
};

/**
 * Reusable "+ Send to MCP" button wired automatically by the shared nav script.
 */
export function mcpButton(ref, label, { compact = false, extraClass = "" } = {}) {
  const cls = `mcp-send-btn${compact ? " compact" : ""}${extraClass ? ` ${extraClass}` : ""}`;
  return `<button type="button" class="${cls}" data-mcp-ref="${esc(ref)}" data-mcp-label="${esc(label)}" aria-pressed="false" title="Send ${esc(ref)} to MCP">${compact ? "+ MCP" : "+ Send to MCP"}</button>`;
}

/**
 * The unified 5-pillar top navigation bar shared by every page,
 * plus the adaptive light/dark two-state scheme toggle and the floating MCP Picks Tray.
 */
export function nav(active) {
  const pillar = PILLAR_FOR[active] || active;
  const tab = (href, label, key) => {
    const isOn = pillar === key;
    return `<a class="tab${isOn ? " on" : ""}" href="${href}"${isOn ? ' aria-current="page"' : ""}>${label}</a>`;
  };
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
<div id="nav-progress" class="nav-progress" aria-hidden="true"></div>
<header class="site-header" id="site-header" data-site-root="/">
  <nav class="nav" aria-label="Primary">
    <button type="button" class="nav-menu-btn" id="nav-menu-btn" popovertarget="nav-links" popovertargetaction="toggle" aria-controls="nav-links" aria-expanded="false" aria-label="Open navigation menu">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11"/></svg>
    </button>
    <a class="brand" href="/"><svg class="brand-mark" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/><rect x="4.5" y="4.5" width="7" height="7" rx="1.2" fill="currentColor"/></svg><span>Designer</span></a>
    <div class="nav-links" id="nav-links">
      ${tab("/", "Design Systems", "designs")}
      ${tab("/components", "Components", "components")}
      ${tab("/starters", "Starters", "starters")}
      ${tab("/presets", "Effects &amp; Presets", "presets")}
      ${tab("/assets", "Assets &amp; Docs", "assets")}
      <a class="tab nav-mobile-skill" href="/skill">Download Skill ZIP</a>
    </div>
    <span class="spacer"></span>
    <button type="button" class="cmd-trigger" id="cmd-trigger" aria-haspopup="dialog" aria-controls="cmd-palette" title="Quick search across designs, components, and tools (⌘K or /)">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.8 10.8 14 14"/></svg>
      <span class="cmd-trigger-label">Search…</span>
      <kbd class="cmd-kbd" aria-hidden="true">⌘K</kbd>
    </button>
    <button type="button" class="mcp-tray-btn" id="mcp-tray-btn" aria-expanded="false" aria-controls="mcp-tray" title="Open MCP Picks Tray">
      <span aria-hidden="true">⚡</span> <span class="mcp-btn-label">MCP</span> <span class="mcp-tray-cnt" id="mcp-tray-cnt" hidden>0</span>
    </button>
    <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle color theme" title="Toggle light/dark theme">
      <span class="theme-icon-light" aria-hidden="true">☀</span>
      <span class="theme-icon-dark" aria-hidden="true">☾</span>
    </button>
    <a class="dl" href="/skill">Skill</a>
  </nav>
</header>
<dialog id="cmd-palette" class="cmd-dlg" closedby="any" aria-labelledby="cmd-title" data-site-root="/">
  <h1 id="cmd-title" class="sr-only">Quick Search</h1>
  <div class="cmd-head">
    <svg class="cmd-ico" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.8 10.8 14 14"/></svg>
    <input id="cmd-input" class="cmd-input" type="text" inputmode="search" placeholder="Jump to any design system, component, library, icon, or page…" aria-label="Quick search" aria-autocomplete="list" aria-controls="cmd-results" autocomplete="off" spellcheck="false" autofocus>
    <button type="button" id="cmd-close" class="mcp-icon-btn" aria-label="Close search">×</button>
  </div>
  <div class="cmd-scopes" role="tablist" aria-label="Search scope">
    <button type="button" role="tab" class="cmd-scope" data-scope="all" aria-selected="true">All</button>
    <button type="button" role="tab" class="cmd-scope" data-scope="designs" aria-selected="false">Designs</button>
    <button type="button" role="tab" class="cmd-scope" data-scope="components" aria-selected="false">Components</button>
    <button type="button" role="tab" class="cmd-scope" data-scope="compare" aria-selected="false">Compare</button>
    <button type="button" role="tab" class="cmd-scope" data-scope="pages" aria-selected="false">Pages &amp; Tools</button>
    <span id="cmd-status" class="cmd-status" role="status"></span>
  </div>
  <div id="cmd-results" class="cmd-results" role="listbox" aria-label="Search results"></div>
  <div class="cmd-foot">
    <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
    <span><kbd>↵</kbd> Open</span>
    <span><kbd>Esc</kbd> Close</span>
    <span class="cmd-foot-right">100% offline index</span>
  </div>
</dialog>
<aside id="mcp-tray" class="mcp-tray" data-picks-api="/api/picks" aria-label="MCP Picks Tray" hidden>
  <div class="mcp-tray-head">
    <div class="mcp-tray-title">
      <strong>MCP Picks Tray</strong>
      <span id="mcp-tray-mode" class="mcp-mode">Static · Copy Prompt</span>
    </div>
    <button type="button" id="mcp-tray-close" class="mcp-icon-btn" aria-label="Close MCP tray">×</button>
  </div>
  <div id="mcp-tray-list" class="mcp-tray-list"></div>
  <p id="mcp-tray-empty" class="mcp-tray-empty">Click <strong>+ Send to MCP</strong> on any design system, component, icon, font, or preset to queue its ID for your AI agent.</p>
  <div class="mcp-tray-foot">
    <button type="button" id="mcp-copy-prompt" class="mcp-act primary">Copy MCP Prompt</button>
    <button type="button" id="mcp-copy-ids" class="mcp-act">Copy IDs</button>
    <button type="button" id="mcp-clear-all" class="mcp-act">Clear</button>
    <span id="mcp-tray-status" class="mcp-status" role="status"></span>
  </div>
</aside>
<button type="button" id="back-to-top" class="back-to-top" aria-label="Back to top" title="Back to top" hidden>↑ Top</button>
<script src="${SHELL_JS_PATH}"></script>`;
}

const SHELL_NAV_JS = `(function(){
  var meta = document.querySelector('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'color-scheme';
    meta.content = 'light dark';
    document.head.appendChild(meta);
  }
  function applyStored() {
    try {
      var s = localStorage.getItem('color-scheme');
      meta.content = (s === 'light' || s === 'dark') ? s : 'light dark';
    } catch (e) {}
  }
  applyStored();
  var btn = document.getElementById('theme-toggle');
  if (btn && !btn.dataset.wired) {
    btn.dataset.wired = '1';
    btn.addEventListener('click', function() {
      var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var cur = meta.content === 'dark' ? 'dark' : meta.content === 'light' ? 'light' : (sysDark ? 'dark' : 'light');
      var target = cur === 'dark' ? 'light' : 'dark';
      var sys = sysDark ? 'dark' : 'light';
      try {
        if (target === sys) localStorage.removeItem('color-scheme');
        else localStorage.setItem('color-scheme', target);
      } catch (e) {}
      meta.content = target === sys ? 'light dark' : target;
    });
    window.addEventListener('storage', function(ev) {
      if (ev.key === 'color-scheme') applyStored();
    });
  }

  function onDomReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  // Ensure skip-link target, active subnav scroll, and dialog light-dismiss fallback after full DOM parse
  onDomReady(function() {
    if (!document.getElementById('main-content')) {
      var mainEl = document.querySelector('main, .wrap, .detail, .reui-main, .heroui-main, .mant-main, .dai-main, .base-main, .uk-main');
      if (mainEl) mainEl.id = 'main-content';
    }
    var activeSub = document.querySelector('.subnav .sub-tab[aria-current="page"]');
    if (activeSub && activeSub.scrollIntoView) {
      try { activeSub.scrollIntoView({ inline: 'nearest', block: 'nearest' }); } catch (e) {}
    }
    document.querySelectorAll('dialog[closedby="any"]').forEach(wireLightDismiss);
  });

  // Responsive mobile popover nav synchronization
  var navMenuBtn = document.getElementById('nav-menu-btn');
  var navLinks = document.getElementById('nav-links');
  if (navMenuBtn && navLinks && !navMenuBtn.dataset.wired) {
    navMenuBtn.dataset.wired = '1';
    var hasPopover = Object.hasOwn ? Object.hasOwn(HTMLElement.prototype, 'popover') : ('popover' in HTMLElement.prototype);
    var mq = window.matchMedia('(max-width: 860px)');
    function syncNavMode() {
      if (mq.matches) {
        if (hasPopover) navLinks.setAttribute('popover', 'auto');
        else navLinks.classList.add('is-drawer');
      } else {
        if (hasPopover) {
          try { if (navLinks.matches(':popover-open')) navLinks.hidePopover(); } catch (e) {}
          navLinks.removeAttribute('popover');
        }
        navLinks.classList.remove('is-drawer', 'is-open');
        navMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
    syncNavMode();
    if (mq.addEventListener) mq.addEventListener('change', syncNavMode);
    if (hasPopover) {
      navLinks.addEventListener('toggle', function(ev) {
        navMenuBtn.setAttribute('aria-expanded', String(ev.newState === 'open'));
      });
    } else {
      navMenuBtn.addEventListener('click', function() {
        var open = navLinks.classList.toggle('is-open');
        navMenuBtn.setAttribute('aria-expanded', String(open));
      });
    }
  }

  // Top navigation loading progress bar for same-origin MPA links
  var progressBar = document.getElementById('nav-progress');
  var progressTimer = 0;
  function startNavProgress() {
    if (!progressBar) return;
    clearTimeout(progressTimer);
    progressBar.classList.remove('done');
    progressBar.classList.add('active');
    progressTimer = setTimeout(function(){ progressBar.classList.remove('active'); }, 6000);
  }
  function resetNavProgress() {
    if (!progressBar) return;
    clearTimeout(progressTimer);
    progressBar.classList.remove('active', 'done');
  }
  window.addEventListener('pageshow', resetNavProgress);
  document.addEventListener('click', function(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw[0] === '#' || raw.indexOf('javascript:') === 0) return;
    try {
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      startNavProgress();
    } catch (err) {}
  });

  // Back-to-top button on long pages
  var topBtn = document.getElementById('back-to-top');
  if (topBtn && !topBtn.dataset.wired) {
    topBtn.dataset.wired = '1';
    var topTick = false;
    function syncTopBtn() {
      topTick = false;
      topBtn.hidden = (window.scrollY || document.documentElement.scrollTop || 0) < 620;
    }
    window.addEventListener('scroll', function() {
      if (!topTick) { topTick = true; requestAnimationFrame(syncTopBtn); }
    }, { passive: true });
    topBtn.addEventListener('click', function() {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    syncTopBtn();
  }

  // Reusable iframe loading overlay helper (exposed on window.DesignerUI)
  function watchFrame(container, iframe) {
    if (!container || !iframe) return;
    container.classList.add('is-loading');
    var overlay = container.querySelector('.frame-loader');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'frame-loader';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<span class="frame-spinner"></span><span>Loading preview…</span>';
      container.appendChild(overlay);
    }
    var settled = false;
    function done() {
      if (settled) return;
      settled = true;
      container.classList.remove('is-loading');
    }
    iframe.addEventListener('load', done, { once: true });
    iframe.addEventListener('error', done, { once: true });
    function onMsg(ev) {
      if (ev.source === iframe.contentWindow && ev.data && ev.data.source === 'design-preview') {
        done();
        window.removeEventListener('message', onMsg);
      }
    }
    window.addEventListener('message', onMsg);
    setTimeout(done, 4500);
  }

  // Helper: closedby="any" pointer fallback for browsers lacking HTMLDialogElement.closedBy
  function wireLightDismiss(dlg) {
    if (!dlg || ('closedBy' in HTMLDialogElement.prototype) || dlg.dataset.ldWired) return;
    dlg.dataset.ldWired = '1';
    var pressedOutside = false;
    function outside(e) {
      var r = dlg.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    }
    dlg.addEventListener('pointerdown', function(e) { pressedOutside = outside(e); });
    dlg.addEventListener('pointerup', function(e) { if (pressedOutside && outside(e)) dlg.close(); });
  }
  document.querySelectorAll('dialog[closedby="any"]').forEach(wireLightDismiss);

  window.__DESIGNER_CACHE = window.__DESIGNER_CACHE || {};
  window.DesignerUI = {
    watchFrame: watchFrame,
    wireLightDismiss: wireLightDismiss,
    startNavProgress: startNavProgress
  };

  // ---- Shared MCP Picks Tray & [data-mcp-ref] button wiring ----
  var STORAGE_KEY = 'designer-mcp-picks';
  var tray = document.getElementById('mcp-tray');
  var trayBtn = document.getElementById('mcp-tray-btn');
  var trayCnt = document.getElementById('mcp-tray-cnt');
  var trayMode = document.getElementById('mcp-tray-mode');
  var trayList = document.getElementById('mcp-tray-list');
  var trayEmpty = document.getElementById('mcp-tray-empty');
  var trayStatus = document.getElementById('mcp-tray-status');
  if (!tray || !trayBtn || tray.dataset.wired) return;
  tray.dataset.wired = '1';

  var apiBase = (tray.getAttribute('data-picks-api') || '').trim();
  var liveSync = false;
  var picks = [];

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function loadLocal() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function(p){ return p && typeof p.ref === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function saveLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(picks)); } catch (e) {}
  }
  function setStatus(msg) {
    if (!trayStatus) return;
    trayStatus.textContent = msg;
    if (msg) setTimeout(function(){ if (trayStatus.textContent === msg) trayStatus.textContent = ''; }, 2000);
  }
  function syncButtons() {
    var set = new Set(picks.map(function(p){ return p.ref; }));
    document.querySelectorAll('[data-mcp-ref]').forEach(function(el){
      var ref = el.getAttribute('data-mcp-ref') || '';
      var on = Boolean(ref && set.has(ref));
      var prev = el.getAttribute('aria-pressed');
      if (prev !== String(on)) el.setAttribute('aria-pressed', String(on));
      var compact = el.classList.contains('compact');
      var label = on ? (compact ? '✓ MCP' : '✓ Sent to MCP') : (compact ? '+ MCP' : '+ Send to MCP');
      if (el.textContent !== label) el.textContent = label;
    });
  }
  function renderTray() {
    trayCnt.textContent = String(picks.length);
    trayCnt.hidden = picks.length === 0;
    trayBtn.classList.toggle('has-picks', picks.length > 0);
    trayMode.textContent = liveSync ? 'Live MCP Sync' : 'Static · Copy Prompt';
    trayMode.classList.toggle('live', liveSync);
    trayEmpty.hidden = picks.length > 0;
    trayList.innerHTML = picks.map(function(p, idx){
      return '<div class="mcp-item" data-idx="' + idx + '">' +
        '<div class="mcp-item-top">' +
          '<div class="mcp-item-meta"><strong>' + escHtml(p.label || p.ref) + '</strong><code>' + escHtml(p.ref) + '</code></div>' +
          '<button type="button" class="mcp-rm" data-rm="' + escHtml(p.ref) + '" aria-label="Remove ' + escHtml(p.label || p.ref) + '">×</button>' +
        '</div>' +
        '<input type="text" class="mcp-note" data-note-ref="' + escHtml(p.ref) + '" value="' + escHtml(p.note || '') + '" placeholder="Optional note for agent (e.g. use dark palette)…" aria-label="Note for ' + escHtml(p.label || p.ref) + '">' +
      '</div>';
    }).join('');
    syncButtons();
  }
  function buildPrompt() {
    if (!picks.length) return '';
    var lines = ['Use these picks from Designer MCP:'];
    picks.forEach(function(p){
      lines.push('- ' + p.ref + (p.label ? ' (' + p.label + ')' : '') + (p.note ? ' — ' + p.note : ''));
    });
    lines.push(liveSync
      ? 'Call design_picks (or design_resolve on each reference) to inspect tokens, docs, and source before implementing.'
      : 'Call design_resolve on each reference to inspect tokens, docs, and source before implementing.');
    return lines.join('\\n');
  }
  async function addOrUpdate(entry) {
    if (!entry || !entry.ref) return;
    var existing = picks.find(function(p){ return p.ref === entry.ref; });
    var next = {
      ref: entry.ref,
      label: entry.label || (existing && existing.label) || entry.ref,
      note: entry.note !== undefined ? entry.note : (existing ? (existing.note || '') : ''),
      pickedAt: new Date().toISOString()
    };
    picks = [next].concat(picks.filter(function(p){ return p.ref !== entry.ref; })).slice(0, 50);
    saveLocal();
    renderTray();
    if (liveSync && apiBase) {
      try {
        var r = await fetch(apiBase, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(next)
        });
        if (r.ok) {
          var d = await r.json();
          if (Array.isArray(d.picks)) { picks = d.picks; saveLocal(); renderTray(); }
        }
      } catch (e) {}
    }
  }
  async function removeOne(ref) {
    picks = picks.filter(function(p){ return p.ref !== ref; });
    saveLocal();
    renderTray();
    if (liveSync && apiBase) {
      try {
        var r = await fetch(apiBase + '/' + encodeURIComponent(ref), { method: 'DELETE' });
        if (r.ok) {
          var d = await r.json();
          if (Array.isArray(d.picks)) { picks = d.picks; saveLocal(); renderTray(); }
        }
      } catch (e) {}
    }
  }
  async function clearAll() {
    picks = [];
    saveLocal();
    renderTray();
    if (liveSync && apiBase) {
      try { await fetch(apiBase, { method: 'DELETE' }); } catch (e) {}
    }
    setStatus('Cleared');
  }
  function setOpen(open) {
    tray.hidden = !open;
    trayBtn.setAttribute('aria-expanded', String(open));
  }

  trayBtn.addEventListener('click', function(){ setOpen(tray.hidden); });
  document.getElementById('mcp-tray-close').addEventListener('click', function(){ setOpen(false); });
  document.getElementById('mcp-clear-all').addEventListener('click', clearAll);
  document.getElementById('mcp-copy-prompt').addEventListener('click', async function(){
    if (!picks.length) return setStatus('Tray is empty');
    try { await navigator.clipboard.writeText(buildPrompt()); setStatus('Prompt copied'); }
    catch (e) { setStatus('Clipboard blocked'); }
  });
  document.getElementById('mcp-copy-ids').addEventListener('click', async function(){
    if (!picks.length) return setStatus('Tray is empty');
    try { await navigator.clipboard.writeText(picks.map(function(p){ return p.ref; }).join('\\n')); setStatus('IDs copied'); }
    catch (e) { setStatus('Clipboard blocked'); }
  });
  trayList.addEventListener('click', function(e){
    var rm = e.target.closest('[data-rm]');
    if (rm) removeOne(rm.getAttribute('data-rm'));
  });
  trayList.addEventListener('change', function(e){
    var inp = e.target.closest('[data-note-ref]');
    if (!inp) return;
    var ref = inp.getAttribute('data-note-ref');
    var cur = picks.find(function(p){ return p.ref === ref; });
    if (cur) addOrUpdate({ ref: ref, label: cur.label, note: inp.value });
  });

  document.addEventListener('click', function(e){
    var target = e.target.closest('[data-mcp-ref]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      var ref = target.getAttribute('data-mcp-ref');
      var label = target.getAttribute('data-mcp-label') || ref;
      if (!ref) return;
      var exists = picks.some(function(p){ return p.ref === ref; });
      if (exists) removeOne(ref);
      else {
        addOrUpdate({ ref: ref, label: label });
        setStatus('Sent to MCP');
      }
      return;
    }
    if (!tray.hidden && !tray.contains(e.target) && !trayBtn.contains(e.target)) {
      setOpen(false);
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !tray.hidden) setOpen(false);
  });
  window.addEventListener('storage', function(ev){
    if (ev.key === STORAGE_KEY) { picks = loadLocal(); renderTray(); }
  });

  window.DesignerMCP = {
    list: function(){ return picks.slice(); },
    send: addOrUpdate,
    remove: removeOne,
    clear: clearAll,
    open: function(){ setOpen(true); },
    close: function(){ setOpen(false); },
    syncButtons: syncButtons
  };

  picks = loadLocal();
  renderTray();
  if (apiBase) {
    fetch(apiBase).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if (d && d.live) {
        liveSync = true;
        if (Array.isArray(d.picks)) { picks = d.picks; saveLocal(); }
        renderTray();
      }
    }).catch(function(){});
  }

  // ---- Global Quick Search Command Palette (⌘K / Ctrl+K / /) ----
  var cmdDlg = document.getElementById('cmd-palette');
  var cmdTrigger = document.getElementById('cmd-trigger');
  var cmdInput = document.getElementById('cmd-input');
  var cmdClose = document.getElementById('cmd-close');
  var cmdResults = document.getElementById('cmd-results');
  var cmdStatus = document.getElementById('cmd-status');
  if (!cmdDlg || !cmdInput || !cmdResults) return;
  wireLightDismiss(cmdDlg);

  var siteRoot = cmdDlg.getAttribute('data-site-root') || '/';
  var isStatic = siteRoot !== '/';
  function resolveRoute(path) {
    if (!path || path === '/') return isStatic ? siteRoot + 'index.html' : '/';
    if (!isStatic) return path[0] === '/' ? path : '/' + path;
    var clean = path.replace(/^(?:\\.\\.\\/|\\.\\/|\\/)+/, '');
    if (/\\.(?:html|json|zip|css|js|svg|png|webp)$/i.test(clean)) return siteRoot + clean;
    return siteRoot + clean.replace(/\\/$/, '') + '/index.html';
  }
  function resolveIndexHref(href) {
    if (!href) return resolveRoute('/');
    if (!isStatic) return href;
    return siteRoot + href.replace(/^(?:\\.\\.\\/|\\.\\/|\\/)+/, '');
  }

  var QUICK_PAGES = [
    { name: 'Design Systems', sub: 'Unified gallery of 1,747 DESIGN.md systems', kind: 'page', route: '/', tags: 'refero opendesign templates palette color theme' },
    { name: 'Components Hub', sub: '2,035 components across 25 offline UI libraries', kind: 'page', route: '/components', tags: 'ui react html shadcn heroui mantine daisyui' },
    { name: 'Compare Across Libraries', sub: '49 generic UI primitives side by side', kind: 'page', route: '/components/compare', tags: 'button dialog tabs accordion table compare' },
    { name: 'Icons Browser (Lucide)', sub: '1,500+ offline vector icons with SVG/JSX copy', kind: 'page', route: '/components/icons', tags: 'svg lucide icon phosphor remix' },
    { name: 'Charts & Data Viz', sub: 'Chart.js, ECharts, ApexCharts, D3 & Tabulator', kind: 'page', route: '/components/charts', tags: 'graph plot chart table data visualization' },
    { name: 'Local Fonts Specimen', sub: '11 baked @fontsource variable & display fonts', kind: 'page', route: '/components/fonts', tags: 'typography typeface woff2 inter archivo lora' },
    { name: 'Starters & App Kits', sub: 'Offline dashboards, system templates & Slopstrap', kind: 'page', route: '/starters', tags: 'dashboard starter template kit zip' },
    { name: 'Effects & Presets', sub: '159 background patterns, gradients & Liquid Glass', kind: 'page', route: '/presets', tags: 'gradient pattern liquid glass css backdrop' },
    { name: 'Assets & Offline CDN', sub: 'Import map, starter ZIP, vendor JS/CSS & library manifests', kind: 'page', route: '/assets', tags: 'cdn importmap zip manifest npm' },
    { name: 'UI SDK Offline Docs', sub: '@ui-sdk/core, react & web headless references', kind: 'page', route: '/docs', tags: 'documentation headless accessibility' },
    { name: 'Refero Deep Styles', sub: '788 deep design-system profiles with CSS recipes', kind: 'page', route: '/refero-styles', tags: 'refero styles recipes tokens' },
    { name: 'ReUI Components', sub: '1,264 shadcn/ui Radix + Base UI live components', kind: 'page', route: '/reui', tags: 'reui shadcn radix baseui' },
    { name: 'HeroUI v3', sub: '73 components, guides & live CSS previews', kind: 'page', route: '/heroui', tags: 'heroui react aria tailwind' },
    { name: 'Mantine UI', sub: '123 ready-made components with live previews', kind: 'page', route: '/mantine', tags: 'mantine react css modules' },
    { name: 'daisyUI 5', sub: '68 pure-CSS components across 35 themes', kind: 'page', route: '/daisyui', tags: 'daisyui tailwind themes html' },
    { name: 'Base UI', sub: 'Headless @base-ui/react components & handbook', kind: 'page', route: '/baseui', tags: 'baseui headless mui react' },
    { name: 'UI Kits (16 libraries)', sub: 'Chakra, MUI, Ant Design, PrimeReact, Ark, Magic UI…', kind: 'page', route: '/uikits', tags: 'chakra mui antd primereact ark magicui motion openprops' },
    { name: 'Tailwind (HyperUI & shadcn)', sub: 'HTML & React Tailwind component examples', kind: 'page', route: '/tailwind', tags: 'tailwind hyperui shadcn' }
  ];

  var cmdScope = 'all';
  var cmdActiveIdx = 0;
  var cmdList = [];
  var loadingIndexes = false;
  var indexesReady = false;
  var designItems = [];
  var compItems = [];
  var compareItems = [];

  function ingestDesigns(data) {
    if (!data || !Array.isArray(data.designs)) return;
    window.__DESIGNER_CACHE.designs = data;
    designItems = data.designs.map(function(d){
      var ref = d.source === 'template' ? 'designer:template:' + String(d.id).replace(/^template:/, '')
        : String(d.id || '').indexOf('rs:') === 0 ? 'designer:style:' + String(d.id).slice(3)
        : d.source === 'opendesign' ? 'designer:opendesign:' + d.id
        : 'designer:refero:' + d.id;
      return {
        kind: 'designs',
        name: d.name || d.id,
        sub: [d.theme, d.industry && d.industry !== 'template' ? d.industry : '', d.domain || ''].filter(Boolean).join(' · ') || d.source,
        href: resolveIndexHref(d.href),
        colors: (d.colors || []).slice(0, 5),
        badge: d.source === 'refero-styles' ? 'Deep Style' : d.source === 'opendesign' ? 'OpenDesign' : d.source === 'template' ? 'Template' : 'Refero',
        ref: ref,
        hay: (d.name + ' ' + (d.domain || '') + ' ' + (d.industry || '') + ' ' + (d.theme || '') + ' ' + (d.fonts || []).join(' ') + ' ' + (d.moods || []).join(' ')).toLowerCase()
      };
    });
  }
  function ingestHub(data) {
    if (!data) return;
    window.__DESIGNER_CACHE.hub = data;
    compareItems = (data.concepts || []).map(function(c){
      return {
        kind: 'compare',
        name: c.name,
        sub: c.category + ' · ' + c.libCount + ' libraries (' + c.liveCount + ' live)',
        href: resolveRoute('/components/compare/' + encodeURIComponent(c.slug)),
        badge: c.libCount + ' libs',
        live: c.liveCount > 0,
        ref: 'designer:compare:' + c.slug,
        hay: (c.name + ' ' + c.slug + ' ' + c.category + ' ' + (c.implementations || []).map(function(x){ return x.libName; }).join(' ')).toLowerCase()
      };
    });
    compItems = (data.items || []).map(function(it){
      var ref = it.lib === 'heroui' ? 'designer:heroui:' + it.slug
        : it.lib === 'mantine' ? 'designer:mantine:' + it.slug
        : it.lib === 'daisyui' ? 'designer:daisyui:' + it.slug
        : it.lib === 'baseui' ? 'designer:baseui:' + it.slug
        : it.lib === 'reui' ? 'designer:reui:' + it.slug
        : it.lib === 'gradientdeck' ? 'designer:component:' + it.slug
        : it.lib && it.lib.indexOf('uikit:') === 0 ? 'designer:uikit:' + it.lib.slice(6) + ':' + it.slug
        : '';
      return {
        kind: 'components',
        name: it.name,
        sub: it.libName + (it.category ? ' · ' + it.category : ''),
        href: resolveIndexHref(it.href),
        badge: it.libName,
        live: Boolean(it.previewable),
        ref: ref,
        hay: (it.name + ' ' + it.slug + ' ' + (it.category || '') + ' ' + it.libName + ' ' + (it.stack || '')).toLowerCase()
      };
    });
  }

  function ensureCmdIndexes() {
    if (indexesReady) return;
    if (window.__DESIGNER_CACHE.designs && !designItems.length) ingestDesigns(window.__DESIGNER_CACHE.designs);
    if (window.__DESIGNER_CACHE.hub && !compItems.length) ingestHub(window.__DESIGNER_CACHE.hub);
    if (designItems.length && compItems.length) { indexesReady = true; return; }
    if (loadingIndexes) return;
    loadingIndexes = true;
    if (cmdStatus) cmdStatus.textContent = 'Indexing catalog…';
    var p1 = designItems.length ? Promise.resolve() : fetch(siteRoot + 'api/designs-index.json').then(function(r){ return r.ok ? r.json() : null; }).then(ingestDesigns).catch(function(){});
    var p2 = compItems.length ? Promise.resolve() : fetch(siteRoot + 'api/components-hub.json').then(function(r){ return r.ok ? r.json() : null; }).then(ingestHub).catch(function(){});
    Promise.all([p1, p2]).then(function(){
      loadingIndexes = false;
      indexesReady = true;
      if (cmdStatus) cmdStatus.textContent = (designItems.length + compItems.length + compareItems.length).toLocaleString() + ' indexed';
      if (cmdDlg.open) renderCmdResults();
    });
  }

  function scoreMatch(item, terms, rawQ) {
    var nameL = item.name.toLowerCase();
    var hay = item.hay;
    for (var i = 0; i < terms.length; i++) {
      if (hay.indexOf(terms[i]) < 0) return 0;
    }
    var score = 10;
    if (nameL === rawQ) score += 100;
    else if (nameL.indexOf(rawQ) === 0) score += 50;
    else if (nameL.indexOf(rawQ) >= 0) score += 25;
    if (item.live) score += 4;
    return score;
  }

  function renderCmdResults() {
    var rawQ = cmdInput.value.trim().toLowerCase();
    var terms = rawQ ? rawQ.split(/\\s+/).filter(Boolean) : [];
    var out = [];

    if (!terms.length) {
      if (cmdScope === 'all' || cmdScope === 'pages') {
        QUICK_PAGES.slice(0, cmdScope === 'pages' ? 18 : 8).forEach(function(p){
          out.push({ kind: 'pages', name: p.name, sub: p.sub, href: resolveRoute(p.route), badge: 'Page' });
        });
      }
      if (cmdScope === 'all' || cmdScope === 'compare') {
        compareItems.slice(0, cmdScope === 'compare' ? 24 : 6).forEach(function(c){ out.push(c); });
      }
      if (cmdScope === 'designs') {
        designItems.slice(0, 24).forEach(function(d){ out.push(d); });
      }
      if (cmdScope === 'components') {
        compItems.slice(0, 24).forEach(function(c){ out.push(c); });
      }
    } else {
      var scored = [];
      if (cmdScope === 'all' || cmdScope === 'pages') {
        QUICK_PAGES.forEach(function(p){
          var hay = (p.name + ' ' + p.sub + ' ' + p.tags).toLowerCase();
          var sc = scoreMatch({ name: p.name, hay: hay }, terms, rawQ);
          if (sc) scored.push({ sc: sc + 12, item: { kind: 'pages', name: p.name, sub: p.sub, href: resolveRoute(p.route), badge: 'Page' } });
        });
      }
      if (cmdScope === 'all' || cmdScope === 'compare') {
        compareItems.forEach(function(c){
          var sc = scoreMatch(c, terms, rawQ);
          if (sc) scored.push({ sc: sc + 10, item: c });
        });
      }
      if (cmdScope === 'all' || cmdScope === 'designs') {
        var dCount = 0;
        for (var i = 0; i < designItems.length; i++) {
          var sc = scoreMatch(designItems[i], terms, rawQ);
          if (sc) { scored.push({ sc: sc, item: designItems[i] }); if (++dCount >= 40) break; }
        }
      }
      if (cmdScope === 'all' || cmdScope === 'components') {
        var cCount = 0;
        for (var j = 0; j < compItems.length; j++) {
          var sc2 = scoreMatch(compItems[j], terms, rawQ);
          if (sc2) { scored.push({ sc: sc2, item: compItems[j] }); if (++cCount >= 40) break; }
        }
      }
      scored.sort(function(a, b){ return b.sc - a.sc || a.item.name.localeCompare(b.item.name); });
      out = scored.slice(0, 32).map(function(x){ return x.item; });
    }

    cmdList = out;
    cmdActiveIdx = 0;

    if (!out.length) {
      if (loadingIndexes) {
        cmdResults.innerHTML = '<div class="cmd-skel-wrap"><div class="skel cmd-skel-row"></div><div class="skel cmd-skel-row"></div><div class="skel cmd-skel-row"></div></div>';
      } else {
        cmdResults.innerHTML = '<div class="cmd-empty">No matches for <strong>' + escHtml(cmdInput.value.trim()) + '</strong>. Try a library name, component (dialog, table), or design style.</div>';
      }
      return;
    }

    cmdResults.innerHTML = out.map(function(it, idx){
      var swatches = it.colors && it.colors.length
        ? '<span class="cmd-swatches" aria-hidden="true">' + it.colors.map(function(c){ return '<span style="background:' + escHtml(c) + '"></span>'; }).join('') + '</span>'
        : '';
      var mcp = it.ref
        ? '<button type="button" class="mcp-send-btn compact" data-mcp-ref="' + escHtml(it.ref) + '" data-mcp-label="' + escHtml(it.name) + '" aria-pressed="false">+ MCP</button>'
        : '';
      return '<a class="cmd-item' + (idx === 0 ? ' active' : '') + '" role="option" id="cmd-opt-' + idx + '" aria-selected="' + (idx === 0) + '" data-cmd-idx="' + idx + '" href="' + escHtml(it.href) + '">' +
        swatches +
        '<span class="cmd-item-text"><strong>' + escHtml(it.name) + '</strong><small>' + escHtml(it.sub || '') + '</small></span>' +
        '<span class="cmd-item-end">' +
          (it.live ? '<span class="cmd-badge live">Live</span>' : '') +
          '<span class="cmd-badge">' + escHtml(it.badge || it.kind) + '</span>' +
          mcp +
        '</span>' +
      '</a>';
    }).join('');
    cmdInput.setAttribute('aria-activedescendant', 'cmd-opt-0');
    syncButtons();
  }

  function setCmdActive(idx) {
    if (!cmdList.length) return;
    cmdActiveIdx = (idx + cmdList.length) % cmdList.length;
    var items = cmdResults.querySelectorAll('.cmd-item');
    items.forEach(function(el, i){
      var on = i === cmdActiveIdx;
      el.classList.toggle('active', on);
      el.setAttribute('aria-selected', String(on));
      if (on && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    });
    cmdInput.setAttribute('aria-activedescendant', 'cmd-opt-' + cmdActiveIdx);
  }

  function openCmd() {
    if (cmdDlg.open) return;
    if (!tray.hidden) setOpen(false);
    cmdDlg.showModal();
    cmdInput.focus();
    cmdInput.select();
    ensureCmdIndexes();
    renderCmdResults();
  }

  if (cmdTrigger) cmdTrigger.addEventListener('click', openCmd);
  if (cmdClose) cmdClose.addEventListener('click', function(){ cmdDlg.close(); });
  var cmdTimer = 0;
  cmdInput.addEventListener('input', function(){
    clearTimeout(cmdTimer);
    cmdTimer = setTimeout(renderCmdResults, 60);
  });
  cmdInput.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown') { e.preventDefault(); setCmdActive(cmdActiveIdx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCmdActive(cmdActiveIdx - 1); }
    else if (e.key === 'Enter') {
      var active = cmdResults.querySelector('.cmd-item.active');
      if (active) { e.preventDefault(); startNavProgress(); location.href = active.href; }
    }
  });
  cmdDlg.querySelectorAll('.cmd-scope').forEach(function(tab){
    tab.addEventListener('click', function(){
      cmdScope = tab.dataset.scope;
      cmdDlg.querySelectorAll('.cmd-scope').forEach(function(t){ t.setAttribute('aria-selected', String(t === tab)); });
      renderCmdResults();
      cmdInput.focus();
    });
  });
  cmdResults.addEventListener('mousemove', function(e){
    var row = e.target.closest('.cmd-item');
    if (!row) return;
    var idx = Number(row.dataset.cmdIdx);
    if (!isNaN(idx) && idx !== cmdActiveIdx) setCmdActive(idx);
  });

  document.addEventListener('keydown', function(e){
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdDlg.open) cmdDlg.close();
      else openCmd();
      return;
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !cmdDlg.open) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (document.activeElement && document.activeElement.isContentEditable)) return;
      var pageSearch = document.querySelector('#ds-q, #browse-query, #ic-q, #cmp-q, #reui-search, #heroui-search, #mant-search, #dai-search');
      if (pageSearch) { e.preventDefault(); pageSearch.focus(); pageSearch.select(); }
      else { e.preventDefault(); openCmd(); }
    }
  });
})();
`;

export const SHELL_JS_PATH = registerShellAsset("shell", "js", SHELL_NAV_JS, "text/javascript; charset=utf-8");

/** Optional contextual secondary strip shown under the main nav on hub sub-pages. */
export function subnav(items, active) {
  const links = items
    .map(({ href, label, key, count, sep }) => {
      const on = active === key;
      const badge = count !== undefined && count !== null ? ` <span class="sub-cnt">${esc(count)}</span>` : "";
      const divider = sep ? '<span class="sub-sep" aria-hidden="true"></span>' : "";
      return `${divider}<a class="sub-tab${on ? " on" : ""}" href="${esc(href)}"${on ? ' aria-current="page"' : ""}>${esc(label)}${badge}</a>`;
    })
    .join("");
  return `<nav class="subnav" aria-label="Section">${links}</nav>`;
}

export const NAV_CSS = `
  .sr-only {
    position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
    clip:rect(0,0,0,0); white-space:nowrap; border:0;
  }
  .skip-link {
    position:fixed; top:-48px; left:12px; z-index:120; padding:8px 14px;
    background:var(--accent); color:var(--accent-ink); border-radius:8px;
    font:600 13px var(--font); text-decoration:none; transition:top .15s ease;
  }
  .skip-link:focus { top:10px; }
  .nav-progress {
    position:fixed; top:0; left:0; right:0; height:2.5px; z-index:110; pointer-events:none;
    background:linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--ok-fg)));
    transform-origin:0 50%; transform:scaleX(0); opacity:0;
  }
  .nav-progress.active {
    opacity:1; animation:nav-prog 2.8s cubic-bezier(.15,.75,.3,1) forwards;
  }
  @keyframes nav-prog {
    0% { transform:scaleX(.06); }
    45% { transform:scaleX(.62); }
    100% { transform:scaleX(.92); }
  }
  .site-header { position:sticky; top:0; z-index:30; }
  .nav {
    display:flex; align-items:center; gap:6px;
    background:var(--nav-bg); backdrop-filter:blur(12px) saturate(1.4); -webkit-backdrop-filter:blur(12px) saturate(1.4);
    border-bottom:1px solid var(--line); padding:0 16px; height:52px;
  }
  .nav-menu-btn {
    display:none; flex:none; align-items:center; justify-content:center;
    width:32px; height:32px; padding:0; border-radius:8px;
    border:1px solid var(--line); background:var(--panel2); color:var(--fg); cursor:pointer;
  }
  .nav-menu-btn:hover { border-color:var(--accent); color:var(--strong); }
  .brand {
    flex:none; display:inline-flex; align-items:center; gap:7px; white-space:nowrap;
    font-weight:700; margin-right:10px; letter-spacing:-.025em; color:var(--strong);
    text-decoration:none; font-size:15px;
  }
  .brand-mark { color:var(--accent); flex:none; }
  .nav-links { display:flex; align-items:center; gap:3px; min-width:0; }
  .nav-mobile-skill { display:none; }
  .tab {
    color:var(--muted); text-decoration:none; padding:6px 11px; border-radius:7px;
    font-size:13px; font-weight:500; white-space:nowrap; border:1px solid transparent;
    transition:color .12s ease, background-color .12s ease, border-color .12s ease;
  }
  .tab:hover { color:var(--strong); background:var(--panel2); }
  .tab.on, .tab[aria-current="page"] {
    color:var(--strong); background:var(--accent-bg); border-color:var(--accent-line); font-weight:600;
  }
  .spacer { flex:1; min-width:6px; }
  .cmd-trigger {
    flex:none; display:inline-flex; align-items:center; gap:7px; height:32px; padding:0 10px;
    background:var(--panel2); color:var(--muted); border:1px solid var(--line); border-radius:8px;
    font:500 12.5px var(--font); cursor:pointer; white-space:nowrap;
    transition:border-color .12s ease, color .12s ease, background-color .12s ease;
  }
  .cmd-trigger:hover { border-color:var(--accent); color:var(--strong); background:var(--panel); }
  .cmd-kbd {
    font:600 10.5px var(--mono); padding:1px 5px; border-radius:5px;
    border:1px solid var(--line); background:var(--panel); color:var(--muted);
  }
  .theme-toggle {
    flex:none; display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px;
    background:var(--panel2); color:var(--fg); border:1px solid var(--line); border-radius:8px;
    cursor:pointer; font-size:14px; padding:0;
  }
  .theme-toggle:hover { border-color:var(--accent); color:var(--strong); }
  .theme-icon-light { display:none; }
  .theme-icon-dark { display:inline; }
  @media (prefers-color-scheme: dark) {
    :root:not(:has(> head > meta[name="color-scheme"][content="light"])) .theme-icon-light { display:inline; }
    :root:not(:has(> head > meta[name="color-scheme"][content="light"])) .theme-icon-dark { display:none; }
  }
  :root:has(> head > meta[name="color-scheme"][content="dark"]) .theme-icon-light { display:inline; }
  :root:has(> head > meta[name="color-scheme"][content="dark"]) .theme-icon-dark { display:none; }
  :root:has(> head > meta[name="color-scheme"][content="light"]) .theme-icon-light { display:none; }
  :root:has(> head > meta[name="color-scheme"][content="light"]) .theme-icon-dark { display:inline; }
  .dl {
    flex:none; display:inline-flex; align-items:center; height:32px; font-size:12.5px; font-weight:600;
    color:var(--accent); text-decoration:none; border:1px solid var(--line);
    background:var(--panel2); border-radius:8px; padding:0 11px; white-space:nowrap;
  }
  .dl:hover { border-color:var(--accent); background:var(--accent-bg); }
  @media (max-width: 860px) {
    .nav { padding:0 12px; gap:6px; }
    .nav-menu-btn { display:inline-flex; }
    .nav-links:not(:is(:popover-open, .\:popover-open, .is-open)) { display:none; }
    .nav-links.is-drawer.is-open,
    .nav-links[popover]:is(:popover-open, .\:popover-open) {
      position:fixed; inset:auto; inset-block-start:56px; inset-inline-start:12px;
      width:min(280px, calc(100dvw - 24px)); max-height:calc(100dvh - 72px);
      display:flex; flex-direction:column; align-items:stretch; gap:4px;
      padding:8px; margin:0; border-radius:12px; border:1px solid var(--line);
      background:var(--panel); box-shadow:var(--shadow-lg); overflow:auto; z-index:80;
    }
    .nav-links .tab { padding:9px 12px; font-size:13.5px; }
    .nav-mobile-skill { display:block; margin-top:4px; border-top:1px solid var(--line); border-radius:0 0 7px 7px; color:var(--accent); }
    .cmd-trigger-label, .cmd-kbd { display:none; }
    .cmd-trigger { width:32px; padding:0; justify-content:center; }
    .dl { display:none; }
  }
  @media (max-width: 420px) {
    .mcp-btn-label { display:none; }
  }
  .subnav {
    display:flex; align-items:center; gap:5px; overflow-x:auto; padding:8px 16px;
    background:var(--panel); border-bottom:1px solid var(--line);
    scrollbar-width:none; -webkit-mask-image:linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent);
    mask-image:linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent);
  }
  .subnav::-webkit-scrollbar { display:none; }
  .sub-sep { flex:none; width:1px; height:16px; background:var(--line); margin:0 4px; }
  .sub-tab {
    color:var(--muted); text-decoration:none; font-size:12.5px; padding:4px 10px;
    border-radius:999px; border:1px solid transparent; white-space:nowrap;
    transition:color .12s ease, background-color .12s ease;
  }
  .sub-tab:hover { color:var(--strong); background:var(--panel2); }
  .sub-tab.on, .sub-tab[aria-current="page"] {
    color:var(--strong); background:var(--accent-bg); border-color:var(--accent-line); font-weight:600;
  }
  .sub-cnt { color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; }

  /* ---- Global Command Palette (dialog) ---- */
  .cmd-dlg {
    width:min(640px, calc(100dvw - 24px)); max-height:min(76dvh, 620px);
    padding:0; margin:min(10dvh, 84px) auto auto;
    border:1px solid var(--line-strong); border-radius:14px;
    background:var(--panel); color:var(--fg); box-shadow:var(--shadow-lg);
    overflow:hidden; opacity:0;
    transition-property:opacity, transform, display, overlay;
    transition-duration:.14s; transition-timing-function:ease-out;
    transition-behavior:allow-discrete;
  }
  @media (prefers-reduced-motion: no-preference) {
    .cmd-dlg { transform:translateY(-8px) scale(.98); }
  }
  .cmd-dlg[open] {
    display:flex; flex-direction:column; opacity:1; transform:none;
  }
  @starting-style {
    .cmd-dlg[open] { opacity:0; }
    @media (prefers-reduced-motion: no-preference) {
      .cmd-dlg[open] { transform:translateY(-8px) scale(.98); }
    }
  }
  .cmd-dlg::backdrop {
    background:rgba(6,8,12,0); backdrop-filter:blur(2px);
    transition-property:background-color, display, overlay;
    transition-duration:.18s; transition-timing-function:ease-out;
    transition-behavior:allow-discrete;
  }
  .cmd-dlg[open]::backdrop { background:rgba(6,8,12,.6); }
  @starting-style {
    .cmd-dlg[open]::backdrop { background:rgba(6,8,12,0); }
  }
  .cmd-head {
    display:flex; align-items:center; gap:10px; padding:11px 14px;
    border-bottom:1px solid var(--line); background:var(--panel);
  }
  .cmd-ico { flex:none; color:var(--muted); }
  .cmd-input {
    flex:1; min-width:0; border:0; background:transparent; color:var(--strong);
    font:500 14.5px var(--font); padding:4px 0; outline:none;
  }
  .cmd-input:focus-visible { outline:none; }
  .cmd-scopes {
    display:flex; align-items:center; gap:5px; flex-wrap:wrap;
    padding:8px 14px; border-bottom:1px solid var(--line); background:var(--panel2);
  }
  .cmd-scope {
    padding:3px 9px; border-radius:999px; border:1px solid transparent;
    background:transparent; color:var(--muted); font:550 12px var(--font); cursor:pointer;
  }
  .cmd-scope:hover { color:var(--strong); background:var(--panel); }
  .cmd-scope[aria-selected="true"] {
    background:var(--accent-bg); border-color:var(--accent-line); color:var(--strong); font-weight:600;
  }
  .cmd-status { margin-left:auto; font-size:11px; color:var(--muted); font-variant-numeric:tabular-nums; }
  .cmd-results { overflow-y:auto; padding:6px; flex:1; min-height:140px; background:var(--panel); }
  .cmd-item {
    display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:9px;
    text-decoration:none; color:var(--fg); border:1px solid transparent;
  }
  .cmd-item.active, .cmd-item:hover {
    background:var(--panel2); border-color:var(--line);
  }
  .cmd-swatches {
    flex:none; display:inline-flex; width:44px; height:24px; border-radius:6px;
    overflow:hidden; border:1px solid var(--line);
  }
  .cmd-swatches span { flex:1; }
  .cmd-item-text { min-width:0; flex:1; display:flex; flex-direction:column; gap:1px; }
  .cmd-item-text strong { font-size:13.5px; font-weight:600; color:var(--strong); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cmd-item-text small { font-size:11.5px; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .cmd-item-end { flex:none; display:inline-flex; align-items:center; gap:5px; }
  .cmd-badge {
    font-size:10.5px; padding:1px 7px; border-radius:999px;
    border:1px solid var(--line); background:var(--panel); color:var(--muted); white-space:nowrap;
  }
  .cmd-badge.live { color:var(--ok-fg); border-color:color-mix(in srgb, var(--ok-fg) 40%, var(--line)); }
  .cmd-empty { padding:28px 16px; text-align:center; font-size:13px; color:var(--muted); }
  .cmd-skel-wrap { padding:8px; display:flex; flex-direction:column; gap:8px; }
  .cmd-skel-row { height:42px; border-radius:8px; }
  .cmd-foot {
    display:flex; align-items:center; gap:14px; padding:8px 14px;
    border-top:1px solid var(--line); background:var(--panel2); font-size:11.5px; color:var(--muted);
  }
  .cmd-foot kbd {
    font:600 10.5px var(--mono); padding:1px 5px; border-radius:4px;
    border:1px solid var(--line); background:var(--panel); color:var(--fg); margin-right:3px;
  }
  .cmd-foot-right { margin-left:auto; }

  /* ---- Reusable Skeletons, Iframe Loader & Back-to-top ---- */
  .skel {
    background:linear-gradient(90deg, var(--skel-a) 25%, var(--skel-b) 50%, var(--skel-a) 75%);
    background-size:200% 100%; animation:skel-shimmer 1.3s ease-in-out infinite;
  }
  @keyframes skel-shimmer {
    0% { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .skel { animation:none; background:var(--skel-a); }
  }
  .skel-card {
    border:1px solid var(--line); border-radius:11px; background:var(--panel); overflow:hidden;
    display:flex; flex-direction:column;
  }
  .skel-media { aspect-ratio:16/10; width:100%; }
  .skel-lines { padding:12px; display:flex; flex-direction:column; gap:8px; }
  .skel-line { height:12px; border-radius:6px; }
  .skel-line.w-60 { width:60%; height:14px; }
  .skel-line.w-90 { width:90%; }
  .skel-line.w-40 { width:40%; }
  .frame-host { position:relative; }
  .frame-loader {
    position:absolute; inset:0; z-index:4; display:flex; align-items:center; justify-content:center; gap:9px;
    background:var(--panel); color:var(--muted); font-size:12.5px; font-weight:500;
    opacity:0; pointer-events:none; transition:opacity .18s ease;
  }
  .frame-host.is-loading .frame-loader { opacity:1; }
  .frame-spinner {
    width:15px; height:15px; border-radius:50%;
    border:2px solid var(--line-strong); border-top-color:var(--accent);
    animation:frame-spin .7s linear infinite;
  }
  @keyframes frame-spin { to { transform:rotate(360deg); } }
  .back-to-top {
    position:fixed; right:18px; bottom:18px; z-index:45;
    padding:7px 13px; border-radius:999px; border:1px solid var(--line-strong);
    background:var(--panel); color:var(--strong); font:600 12px var(--font);
    box-shadow:var(--shadow-sm); cursor:pointer;
  }
  .back-to-top:hover { border-color:var(--accent); color:var(--accent); }

  /* ---- MCP Picks Tray ---- */
  .mcp-tray-btn {
    flex:none; display:inline-flex; align-items:center; gap:5px; height:32px; padding:0 10px;
    background:var(--panel2); color:var(--fg); border:1px solid var(--line); border-radius:8px;
    font:600 12px var(--font); cursor:pointer; white-space:nowrap;
  }
  .mcp-tray-btn:hover, .mcp-tray-btn.has-picks { border-color:var(--accent-line); background:var(--accent-bg); color:var(--strong); }
  .mcp-tray-cnt {
    display:inline-flex; align-items:center; justify-content:center; min-width:17px; height:17px; padding:0 4px;
    border-radius:999px; background:var(--accent); color:var(--accent-ink); font-size:10.5px; font-weight:700;
    font-variant-numeric:tabular-nums;
  }
  .mcp-tray {
    position:fixed; right:16px; top:60px; z-index:70; width:min(400px, calc(100vw - 24px));
    max-height:calc(100dvh - 80px); display:flex; flex-direction:column;
    background:var(--panel); color:var(--fg); border:1px solid var(--line-strong); border-radius:12px;
    box-shadow:var(--shadow-lg); overflow:hidden;
  }
  .mcp-tray-head {
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:10px 14px; border-bottom:1px solid var(--line); background:var(--panel2);
  }
  .mcp-tray-title { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .mcp-tray-title strong { font-size:13.5px; color:var(--strong); }
  .mcp-mode {
    font-size:10.5px; padding:1px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel); color:var(--muted);
  }
  .mcp-mode.live { color:var(--ok-fg); border-color:color-mix(in srgb, var(--ok-fg) 45%, var(--line)); }
  .mcp-icon-btn {
    background:transparent; border:1px solid var(--line); color:var(--muted); border-radius:6px;
    width:26px; height:26px; cursor:pointer; font-size:16px; line-height:1; padding:0;
  }
  .mcp-icon-btn:hover { color:var(--strong); border-color:var(--accent); }
  .mcp-tray-list { overflow-y:auto; padding:8px 12px; display:flex; flex-direction:column; gap:8px; max-height:52dvh; }
  .mcp-tray-empty { margin:0; padding:18px 14px; font-size:12.5px; color:var(--muted); line-height:1.5; }
  .mcp-item { border:1px solid var(--line); border-radius:9px; padding:8px 10px; background:var(--panel2); display:flex; flex-direction:column; gap:6px; }
  .mcp-item-top { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
  .mcp-item-meta { min-width:0; display:flex; flex-direction:column; gap:2px; }
  .mcp-item-meta strong { font-size:12.5px; color:var(--strong); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .mcp-item-meta code { font-size:11px; color:var(--accent); font-family:var(--mono); word-break:break-all; }
  .mcp-rm { background:transparent; border:0; color:var(--muted); cursor:pointer; font-size:15px; line-height:1; padding:2px 4px; border-radius:4px; }
  .mcp-rm:hover { color:var(--strong); background:var(--panel); }
  .mcp-note {
    width:100%; padding:5px 8px; border-radius:6px; border:1px solid var(--line);
    background:var(--panel); color:var(--fg); font:inherit; font-size:11.5px;
  }
  .mcp-tray-foot {
    display:flex; flex-wrap:wrap; align-items:center; gap:6px;
    padding:10px 12px; border-top:1px solid var(--line); background:var(--panel2);
  }
  .mcp-act {
    padding:5px 10px; border-radius:7px; border:1px solid var(--line); background:var(--panel);
    color:var(--strong); font:550 12px var(--font); cursor:pointer;
  }
  .mcp-act:hover { border-color:var(--accent); }
  .mcp-act.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); }
  .mcp-status { font-size:11.5px; color:var(--ok-fg); margin-left:auto; }
  .mcp-send-btn {
    display:inline-flex; align-items:center; gap:4px; padding:5px 11px; border-radius:7px;
    border:1px solid var(--accent-line); background:var(--accent-bg); color:var(--strong);
    font:600 12px var(--font); cursor:pointer; white-space:nowrap;
  }
  .mcp-send-btn:hover { border-color:var(--accent); }
  .mcp-send-btn[aria-pressed="true"] {
    background:var(--accent); border-color:var(--accent); color:var(--accent-ink);
  }
  .mcp-send-btn.compact { padding:2px 8px; font-size:11px; border-radius:999px; }
  @media (forced-colors: active) {
    .tab[aria-current="page"], .sub-tab[aria-current="page"] { outline: 2px solid Highlight; }
  }
`;

export const SHELL_CSS_PATH = registerShellAsset("shell", "css", `${BASE_CSS}\n${NAV_CSS}`, "text/css; charset=utf-8");

/** Shared head snippet: FOUC-free color-scheme + immutable shell stylesheet + optional section CSS links. */
export function shellHead(extraLinks = "") {
  return `${themeHead()}\n<link rel="stylesheet" href="${SHELL_CSS_PATH}">${extraLinks ? `\n${extraLinks}` : ""}`;
}

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

export function assetsHtml(manifest, importMap = null, origin = "", libraries = []) {
  const packages = manifest?.packages ?? [];
  const packageRows = packages.filter(({ group }) => group !== "dependency").map(({ name, version, license, notices, group }) => `<li>
    <strong>${esc(name)}</strong> ${esc(version)} <span>${esc(license)}</span>
    ${group === "deck" ? "<span>Legacy decks</span>" : ""}
    ${notices.map((path) => `<a href="/assets/${manifest.version}/starter/${esc(path)}" download>License</a>`).join(" ")}
  </li>`).join("");
  const fileRows = (manifest?.files ?? []).map(({ path, url }) =>
    `<li><a href="${esc(url)}" download>${esc(path)}</a></li>`).join("");
  const vendorFiles = (manifest?.files ?? [])
    .filter(({ path }) => path.startsWith("vendor/") || path.startsWith("css/"))
    .map(({ path, url, bytes }) =>
      `<li><a href="${esc(url)}" download>${esc(path)}</a> <span>(${(bytes / 1024).toFixed(1)} KB)</span></li>`)
    .join("");
  const groups = manifest?.groups ?? {};
  const slop = manifest?.slopstrap ?? null;
  const groupRows = [
    ["previews", "Bundled browser modules behind every live component preview", "/components"],
    ["starter", "The offline starter: page, sources, compiled modules", manifest?.archive?.url ?? "/assets/starter.zip"],
    ["tailwind", "HyperUI and shadcn example sources, offline", "/tailwind"],
    ["templates", "Vendored design-system template files", "/templates"],
    ["slopstrap", "The vendored Slopstrap joke framework: zip, css, js", "/slopstrap"],
    ["thumbnails", "Per-variant preview thumbnails", ""],
    ["fonts", "Shared webfont binaries (woff2) — live specimens", "/components/fonts"],
  ].map(([key, what, href]) => {
    const count = groups[key];
    if (count === undefined) return "";
    const body = href ? `<a href="${esc(href)}">${esc(what)}</a>` : esc(what);
    return `<tr><td><strong>${count}</strong></td><td>${body}</td><td class="muted">${esc(key)}</td></tr>`;
  }).join("");
  const mapImports = importMap?.imports ?? {};
  const mapJson = importMap ? JSON.stringify(
    Object.fromEntries(Object.entries(mapImports).map(([specifier, path]) => [specifier, `${origin}${path}`])),
    null, 1,
  ) : "";
  const mapCount = Object.keys(mapImports).length;
  const libCards = (libraries || []).map((lib) => {
    const install = lib.install?.npm || lib.install?.pnpm || lib.install?.cli || (typeof lib.install === "string" ? lib.install : "");
    return `<div class="lib-card">
      <div class="lib-head"><strong>${esc(lib.name || lib.id)}</strong><span class="lib-cat">${esc(lib.category || "")}</span></div>
      ${lib.summary || lib.description ? `<p class="lib-desc">${esc(lib.summary || lib.description)}</p>` : ""}
      ${install ? `<pre class="lib-cmd"><code>${esc(install)}</code></pre>` : ""}
      <div class="lib-links"><a href="/api/library/${encodeURIComponent(lib.id)}">JSON manifest</a></div>
    </div>`;
  }).join("");
  const secNav = subnav([
    { href: "/assets", label: "Offline CDN & Assets", key: "assets" },
    { href: "/docs", label: "UI SDK Offline Docs", key: "docs" },
    { href: "/components/icons", label: "Icons Browser", key: "icons" },
    { href: "/components/charts", label: "Charts & Data Viz", key: "charts" },
    { href: "/components/fonts", label: "Local Fonts", key: "fonts" },
  ], "assets");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>Assets &amp; Docs — Offline CDN</title>
<style>
main { max-width:980px; margin:0 auto; padding:22px 20px 64px; }
h1 { font-size:22px; margin:0 0 12px; color:var(--strong); }
h2 { font-size:15px; margin:26px 0 10px; color:var(--strong); }
.actions { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.cdn-tiles { display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:10px; margin:16px 0 22px; }
.cdn-tile { display:flex; flex-direction:column; gap:4px; padding:12px 14px; border:1px solid var(--line); border-radius:10px; background:var(--panel); text-decoration:none; color:var(--fg); }
.cdn-tile:hover { border-color:var(--accent); }
.cdn-tile strong { color:var(--strong); font-size:13.5px; }
.cdn-tile span { color:var(--muted); font-size:12px; }
.lib-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(270px, 1fr)); gap:10px; margin:10px 0 18px; }
.lib-card { border:1px solid var(--line); border-radius:10px; background:var(--panel); padding:12px 14px; display:flex; flex-direction:column; gap:6px; }
.lib-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.lib-head strong { color:var(--strong); font-size:13.5px; }
.lib-cat { font-size:11px; color:var(--muted); background:var(--panel2); border:1px solid var(--line); border-radius:999px; padding:1px 7px; }
.lib-desc { margin:0; font-size:12px; color:var(--muted); line-height:1.45; }
.lib-cmd { margin:2px 0 0; padding:7px 9px; font-size:11.5px; background:var(--code-bg); color:var(--code-fg); border:1px solid var(--line); border-radius:7px; overflow-x:auto; }
.lib-links { font-size:11.5px; margin-top:auto; }
ul { padding-left:20px; overflow-wrap:anywhere; }
li { padding:3px 0; }
li span { color:var(--muted); margin:0 4px; }
summary { cursor:pointer; }
table { border-collapse:collapse; width:100%; }
th { text-align:left; padding:0 10px 6px 0; color:var(--muted); font-weight:normal; }
td { padding:5px 10px 5px 0; border-top:1px solid var(--line); vertical-align:top; }
td:first-child { white-space:nowrap; }
.muted, p.muted { color:var(--muted); }
pre { background:var(--code-bg); color:var(--code-fg); border:1px solid var(--line); border-radius:8px; padding:12px; overflow-x:auto; overflow-wrap:normal; font-size:12px; line-height:1.5; margin:8px 0; }
code { font-family:var(--mono); }
</style>
</head>
<body>
${nav("assets")}
${secNav}
<main>
<h1>Offline frontend assets &amp; docs</h1>
<div class="cdn-tiles">
  <a class="cdn-tile" href="/components/icons"><strong>Icons Browser</strong><span>Search &amp; copy 1,500+ Lucide icons from local vendor bundle</span></a>
  <a class="cdn-tile" href="/components/charts"><strong>Charts &amp; Data Viz</strong><span>Live Chart.js, ECharts, ApexCharts, D3, Tabulator &amp; Gridstack</span></a>
  <a class="cdn-tile" href="/components/fonts"><strong>Local Fonts</strong><span>Live type specimens for all 11 baked @fontsource families</span></a>
  <a class="cdn-tile" href="/docs"><strong>UI SDK Offline Docs</strong><span>Browse @ui-sdk/core, react &amp; web markdown references</span></a>
</div>
${manifest ? `
<div class="actions">
  <a class="dl" href="${esc(manifest.archive.url)}" download>Download starter ZIP</a>
  <a class="dl" href="${esc(manifest.starter)}">Open starter example</a>
  <a class="dl" href="/assets/manifest.json">Asset manifest</a>
  <a class="dl" href="/assets/importmap.json">Import map (JSON)</a>
  <a class="dl" href="/skill/marketplace.zip" download>Marketplace ZIP</a>
  ${slop ? `<a class="dl" href="${esc(slop.zip.url)}" download>Download Slopstrap ZIP</a>` : ""}
</div>
<p class="muted">Build version <code>${esc(manifest.version)}</code>, content-addressed: every file is served under
<code>/assets/${esc(manifest.version)}/</code> with immutable caching, sha256 ETags, and conditional-request revalidation.</p>

<h2>What is served</h2>
<table>
  <tr><th scope="col">Files</th><th scope="col">Group</th><th scope="col">Key</th></tr>
  ${groupRows}
</table>

<h2>The offline import map</h2>
<p>${mapCount} bare specifiers resolve to bundled browser modules on this server: react, motion,
gsap, lucide-react, phosphor, radix-ui, cn, class-variance-authority, and the shadcn components.
Embed the map below in any page and those imports load from here instead of a public CDN, with
zero outbound network. Modules carry CORS <code>*</code>, so the page does not have to live here.</p>
${importMap ? `<pre><code>&lt;script type="importmap"&gt;
${esc(mapJson)}
&lt;/script&gt;</code></pre>
<p class="muted">${origin ? `URLs are absolute against <code>${esc(origin)}</code>. The JSON form is at <a href="/assets/importmap.json">/assets/importmap.json</a>.` : "Paths are site-root relative. A running gallery also serves this map with absolute URLs at <code>/assets/importmap.json</code>."}</p>
` : "<p class=\"muted\">This build predates the import map. Rebuild the frontend to publish it.</p>"}

${libCards ? `<h2>Library install manifests</h2><p class="muted">Offline install commands and setup specs served at <code>/api/libraries</code>.</p><div class="lib-grid">${libCards}</div>` : ""}

<h2>Dashboard &amp; Visualization JS / CSS</h2>
<ul>${vendorFiles}</ul>
${slop ? `
<h2>Slopstrap</h2>
<p>The vendored <a href="https://slopstrap.mikelacher.com/">Slopstrap</a> framework by
Mike Lacher (MIT, upstream README inside the zip): a joke CSS and JS bundle that makes
any page look hastily vibecoded by an LLM. Grab the
<a href="${esc(slop.zip.url)}" download>zip</a> (${(slop.zip.bytes / 1024).toFixed(0)} KB),
the <a href="${esc(slop.css.url)}">css</a> and <a href="${esc(slop.js.url)}">js</a> directly,
or see it live on the <a href="/slopstrap">Slop examples page</a>.</p>
` : ""}
<h2>Packages</h2>
<ul>${packageRows}</ul>
<details><summary>All starter files</summary><ul>${fileRows}</ul></details>
` : "<p>Frontend assets are unavailable. Build the frontend to generate the starter pack.</p>"}
</main>
</body>
</html>`;
}

/**
 * The Starters pillar hub: brings Dashboards, Design System Starter Kits, and Slopstrap under one roof.
 */
export function startersHtml({ dashboards = [], templates = [], slopstrap = null } = {}) {
  const dashCards = dashboards.map((d) => `<a class="st-card" href="/dashboard/${encodeURIComponent(d.slug)}">
    <span class="st-visual"><img src="/dashboard/${encodeURIComponent(d.slug)}/cover" alt="${esc(d.name)}" loading="lazy" decoding="async"></span>
    <span class="st-meta">
      <span class="st-top"><strong>${esc(d.name)}</strong><span class="st-pill">Dashboard ZIP</span></span>
      ${d.description ? `<span class="st-desc">${esc(d.description)}</span>` : ""}
      <span class="st-badges">${(d.stack || d.frameworks || []).slice(0, 4).map((t) => `<span class="st-tag">${esc(t)}</span>`).join("")}</span>
    </span>
  </a>`).join("");

  const tmplCards = templates.map((t) => {
    const swatches = [t.ground, t.text, t.accent].filter(Boolean)
      .map((c) => `<span class="sw" style="background:${esc(c)}"></span>`).join("");
    const starters = (t.starterTemplates || []).map((s) => s.name).join(", ");
    return `<a class="st-card" href="/template/${encodeURIComponent(t.slug)}">
      <span class="st-visual"><img src="/template/${encodeURIComponent(t.slug)}/thumb" alt="${esc(t.name)}" loading="lazy" decoding="async"></span>
      <span class="st-meta">
        <span class="st-top"><strong>${esc(t.name)}</strong><span class="st-pill">${t.tokensCount || 48} tokens</span></span>
        ${t.description ? `<span class="st-desc">${esc(t.description)}</span>` : ""}
        <span class="st-badges">${swatches ? `<span class="sws">${swatches}</span>` : ""}${t.headingFont ? `<span class="st-tag">${esc(t.headingFont)}</span>` : ""}${starters ? `<span class="st-tag">${esc(starters)}</span>` : ""}</span>
      </span>
    </a>`;
  }).join("");

  const secNav = subnav([
    { href: "/starters", label: "All Starters", key: "starters" },
    { href: "/dashboards", label: "Dashboards", key: "dashboards", count: dashboards.length },
    { href: "/templates", label: "System Templates", key: "templates", count: templates.length },
    { href: "/slopstrap", label: "Slopstrap", key: "slopstrap" },
  ], "starters");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>Starters — Dashboards, System Templates &amp; Kits</title>
<style>
.st-wrap { max-width:1440px; margin:0 auto; padding:24px clamp(14px, 3vw, 36px) 64px; }
.st-wrap h1 { font-size:24px; margin:0 0 6px; color:var(--strong); }
.st-lead { color:var(--muted); margin:0 0 22px; max-width:72ch; }
.st-sec { margin:28px 0 12px; display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
.st-sec h2 { margin:0; font-size:16px; color:var(--strong); }
.st-sec a { font-size:12.5px; text-decoration:none; }
.st-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap:14px; }
.st-card { display:flex; flex-direction:column; border:1px solid var(--line); border-radius:11px; background:var(--panel); text-decoration:none; color:var(--fg); overflow:hidden; }
.st-card:hover { border-color:var(--accent); }
.st-visual { aspect-ratio:16/10; background:var(--panel2); border-bottom:1px solid var(--line); overflow:hidden; display:block; }
.st-visual img { width:100%; height:100%; object-fit:cover; display:block; }
.st-meta { padding:12px 14px 14px; display:flex; flex-direction:column; gap:6px; }
.st-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.st-top strong { font-size:14.5px; color:var(--strong); }
.st-pill { font-size:11px; color:var(--accent); background:var(--accent-bg); border:1px solid var(--accent-line); border-radius:999px; padding:1px 8px; white-space:nowrap; }
.st-desc { font-size:12.5px; color:var(--muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.st-badges { display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-top:2px; }
.st-tag { font-size:11px; color:var(--muted); background:var(--panel2); border:1px solid var(--line); border-radius:999px; padding:1px 7px; }
.sws { display:inline-flex; }
.sw { width:16px; height:16px; border-radius:4px; border:1px solid var(--line); }
.sw + .sw { margin-left:-3px; }
.slop-banner { margin-top:28px; padding:16px 18px; border:1px solid var(--line); border-radius:12px; background:var(--panel); display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; }
.slop-banner h3 { margin:0 0 4px; font-size:15px; color:var(--strong); }
.slop-banner p { margin:0; font-size:12.5px; color:var(--muted); max-width:66ch; }
.slop-actions { display:flex; gap:8px; flex-wrap:wrap; }
</style>
</head>
<body>
${nav("starters")}
${secNav}
<main class="st-wrap">
  <h1>Starters &amp; App Kits</h1>
  <p class="st-lead">Complete multi-page dashboards, copyable design-system starter kits (landing pages &amp; slide decks), and standalone frameworks — all bundled offline with zero CDN dependencies.</p>

  <div class="st-sec"><h2>Offline Dashboard Starters (${dashboards.length})</h2><a href="/dashboards">Open dashboards view →</a></div>
  <div class="st-grid">${dashCards || '<p class="st-lead">No dashboard starters cached.</p>'}</div>

  <div class="st-sec"><h2>Design System Starter Kits (${templates.length})</h2><a href="/templates">Open system templates →</a></div>
  <div class="st-grid">${tmplCards || '<p class="st-lead">No system templates cached.</p>'}</div>

  <section class="slop-banner">
    <div>
      <h3>Slopstrap v4.2.0 — Satirical AI Design Showcase</h3>
      <p>Mike Lacher's MIT-licensed CSS &amp; JS joke framework rendered live offline: purple gradients, blinking status dots, border beams, and slop-level switcher.</p>
    </div>
    <div class="slop-actions">
      <a class="dl" href="/slopstrap">Open live Slopstrap →</a>
      ${slopstrap?.zip?.url ? `<a class="dl" href="${esc(slopstrap.zip.url)}" download>Download ZIP</a>` : ""}
    </div>
  </section>
</main>
</body>
</html>`;
}

// ------------------------------------------------------------------ components
const BROWSE_CSS = `
  .browse { max-width: 1540px; margin: 0 auto; padding: 24px clamp(14px, 3vw, 36px) 60px; }
  .browse h1 { font-size: 24px; margin: 0; line-height: 1.25; }
  .browse .back { display: inline-block; margin-bottom: 10px; color: var(--muted); font-size: 13px; }
  .browse-controls { margin-top: 14px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .browse input, .browse button {
    font: inherit; color: var(--fg); background: var(--panel2); border: 1px solid var(--line); border-radius: 7px;
    padding: 6px 10px;
  }
  .browse input { width: min(100%, 350px); min-width: 0; padding: 8px 11px; }
  .browse button { cursor: pointer; }
  .browse :focus-visible, .catalog-dialog :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .browse button[aria-pressed="true"] { color: var(--strong); background: var(--accent-bg); border-color: var(--accent-line); }
  .browse-count { color: var(--muted); font-size: 12px; margin: 13px 0 9px; }
  .browse-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .browse-filters button { font-size: 12px; padding: 5px 9px; }
  .browse-filters button span { color: var(--muted); margin-inline-start: 3px; }
  .source-tabs { display: flex; flex-wrap: wrap; gap: 12px; margin: 13px 0; }
  .source-tabs a { padding: 5px 0; color: var(--muted); text-decoration: none; }
  .source-tabs a[aria-current="page"] { color: var(--fg); border-bottom: 2px solid var(--accent); }
  .browse-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 236px), 1fr)); gap: 13px; }
  .browse-presets .browse-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr)); }
  @media (max-width: 540px) {
    .browse-presets .browse-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 155px), 1fr)); }
  }
  .browse [hidden] { display: none !important; }
  .browse-card {
    display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--line);
    border-radius: 10px; background: var(--panel); color: var(--fg); text-decoration: none; overflow: clip;
  }
  .browse-card:hover, .browse-card:focus-within { border-color: var(--accent); }
  .browse button.browse-card { padding: 0; text-align: left; background: var(--panel); }
  .browse-visual { display: grid; place-items: center; position: relative; isolation: isolate; aspect-ratio: 16 / 10;
    width: 100%; border-bottom: 1px solid var(--line); background: var(--panel2); color: var(--muted); }
  .browse-visual img, .browse-visual .swatch { position: absolute; inset: 0; width: 100%; height: 100%; }
  .browse-visual img { object-fit: cover; }
  .browse-visual:has(img:not([hidden])) .thumb-fallback { visibility: hidden; }
  .browse-visual img[hidden] { display: none; }
  .browse-meta { display: grid; gap: 4px; padding: 10px 12px 12px; }
  .browse-meta strong { font-weight: 650; }
  .browse-meta small, .browse-meta .desc { color: var(--muted); font-size: 12px; }
  .browse-meta .desc { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .browse-empty { color: var(--muted); padding: 20px 0; }
  .catalog-dialog { box-sizing: border-box; width: min(760px, calc(100% - 24px)); max-height: 90dvh;
    border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--fg); padding: 14px; }
  .catalog-dialog::backdrop { background: rgba(6,8,12,.72); }
  .catalog-dialog header, .catalog-dialog footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .catalog-dialog header h2 { flex: 1; margin: 0; font-size: 17px; }
  .catalog-dialog .browse-visual { aspect-ratio: 3 / 1; min-height: 120px; border: 1px solid var(--line);
    border-radius: 7px; overflow: hidden; margin: 10px 0; }
  .catalog-dialog pre { padding: 10px; margin: 10px 0; max-height: 250px; overflow: auto; border: 1px solid var(--line);
    border-radius: 7px; background: var(--code-bg); }
`;

function categoryLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function browsePage({ active, title, heading, back = "", sourceNav = "", items, itemName, searchLabel, dialog = "", script = "", styles = "" }) {
  const counts = new Map();
  for (const { category } of items) {
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const filters = [["", items.length], ...[...counts].sort(([a], [b]) => a.localeCompare(b))];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>${esc(title)}</title>
<style>${BROWSE_CSS}${styles}</style>
</head>
<body>
${nav(active)}
<main class="browse browse-${active}">
  ${back}
  <h1>${esc(heading)}</h1>
  ${sourceNav}
  <div class="browse-controls"><input id="browse-query" type="search" placeholder="${esc(searchLabel)}" aria-label="${esc(searchLabel)}" autocomplete="off"></div>
  <div class="browse-filters" role="group" aria-label="Categories">
    ${filters.map(([category, count]) => `<button type="button" data-filter="${esc(category)}" aria-pressed="${!category}">${category ? esc(categoryLabel(category)) : "All"} <span>${count}</span></button>`).join("")}
  </div>
  <p id="browse-count" class="browse-count" role="status">${items.length} ${esc(itemName)}</p>
  <div class="browse-grid">${items.map(({ card }) => card).join("")}</div>
  <p id="browse-empty" class="browse-empty"${items.length ? " hidden" : ""}>No matching ${esc(itemName)}.</p>
  ${dialog}
</main>
<script>
const query = document.querySelector('#browse-query');
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.browse-grid [data-search]')];
const count = document.querySelector('#browse-count');
const empty = document.querySelector('#browse-empty');
let category = '';
function filterCards() {
  const terms = query.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
  let shown = 0;
  for (const card of cards) {
    const matches = (!category || card.dataset.category === category) && terms.every(term => card.dataset.search.includes(term));
    card.hidden = !matches;
    shown += Number(matches);
  }
  count.textContent = (shown === cards.length ? shown : shown + ' of ' + cards.length) + ' ' + ${JSON.stringify(itemName)};
  empty.hidden = shown > 0;
}
query.addEventListener('input', filterCards);
for (const button of filters) button.addEventListener('click', () => {
  category = button.dataset.filter;
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
  filterCards();
});
filterCards();
${script}
</script>
</body>
</html>`;
}

function cardAttributes(category, terms) {
  return `data-category="${esc(category)}" data-search="${esc(terms.filter(Boolean).join(" ").toLowerCase())}"`;
}

export function componentsHtml(catalog, thumbnailPath = () => null) {
  const items = (catalog?.components ?? []).map((item) => {
    const { slug, title, description, category, breadcrumb, variants = [] } = item;
    const name = breadcrumb?.split("/").at(-1)?.trim() || title || item.name || slug;
    const thumb = variants.length && thumbnailPath(slug, variants[0].id);
    const search = [name, title, slug, description, category, ...variants.flatMap((v) => [v.name, v.id, v.filename])];
    return { category, card: `<a class="browse-card" href="/component/${encodeURIComponent(slug)}" ${cardAttributes(category, search)}>
      <span class="browse-visual"><span class="thumb-fallback">Preview unavailable</span>
        ${thumb ? `<img src="${esc(thumb)}" alt="" width="640" height="400" loading="lazy" decoding="async">` : ""}
      </span>
      <span class="browse-meta"><strong>${esc(name)}</strong>
        <small>${esc(categoryLabel(category))}${category ? " · " : ""}${variants.length} ${variants.length === 1 ? "variant" : "variants"}</small>
        ${description ? `<span class="desc">${esc(description)}</span>` : ""}
      </span>
    </a>` };
  });
  return browsePage({
    active: "components", title: "Components", heading: "Components", items,
    itemName: "components", searchLabel: "Search components",
    script: `document.querySelector('.browse-grid').addEventListener('error', (event) => {
      if (event.target instanceof HTMLImageElement) event.target.hidden = true;
    }, true);`,
  });
}

const tailwindNames = { hyperui: "HyperUI", shadcn: "shadcn/ui" };
const tailwindIndex = (source) => source === "hyperui" ? "/tailwind" : "/tailwind/shadcn";

export function tailwindCatalogHtml(source, groups) {
  const sourceNav = `<nav class="source-tabs" aria-label="Component sources">
    ${Object.entries(tailwindNames).map(([key, name]) =>
      `<a href="${tailwindIndex(key)}"${key === source ? ' aria-current="page"' : ""}>${name}</a>`).join("")}
  </nav>`;
  const items = groups.map(({ slug, name, category, variants, thumbnail }) => ({
    category,
    card: `<a class="browse-card" href="/tailwind/${source}/${encodeURIComponent(slug)}" ${cardAttributes(category, [name, slug, category])}>
      <span class="browse-visual">${thumbnail ? `<img src="${esc(thumbnail)}" alt="" width="640" height="400" loading="lazy" decoding="async">` : "Preview unavailable"}</span>
      <span class="browse-meta"><strong>${esc(name)}</strong>
        <small>${category ? `${esc(categoryLabel(category))} · ` : ""}${variants.length} ${variants.length === 1 ? "example" : "examples"}</small>
      </span>
    </a>`,
  }));
  return browsePage({
    active: "tailwind", title: `${tailwindNames[source]} components`, heading: "Tailwind components", sourceNav,
    items, itemName: "components", searchLabel: `Search ${tailwindNames[source]} components`,
  });
}

export function tailwindExampleHtml(source, group, selected, example) {
  const href = `/tailwind/${source}/${encodeURIComponent(group.slug)}`;
  const sourceName = tailwindNames[source];
  const links = group.variants.map(({ id }) => {
    const label = id.endsWith("-dark") ? `${id.slice(0, -5)} dark` : id;
    return `<a href="${href}?variant=${encodeURIComponent(id)}"${id === selected ? ' aria-current="page"' : ""}>${esc(label)}</a>`;
  }).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>${esc(group.name)} · ${sourceName}</title>
<style>${BROWSE_CSS}
.example { max-width: 1180px; }
.example h1 { margin-bottom: 12px; }
.viewport-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 10px 0; }
.viewport-bar span { color: var(--muted); font-size: 12px; margin-right: 4px; }
.viewport-bar button { font: inherit; font-size: 12px; color: var(--fg); background: var(--panel2); border: 1px solid var(--line); border-radius: 6px; padding: 4px 10px; cursor: pointer; }
.viewport-bar button[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); }
.frame-stage { display: flex; justify-content: center; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 8px; overflow: auto; }
.example iframe { display: block; width: 100%; max-width: 100%; height: clamp(280px, 57vh, 540px); border: 1px solid var(--line);
  border-radius: 6px; background: white; transition: width .2s ease; }
.example details { margin-top: 14px; }
.example summary { cursor: pointer; }
.example .source-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding-top: 9px; }
.example pre { background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px;
  padding: 12px; max-height: 420px; overflow: auto; }
</style></head><body>
${nav("tailwind")}
<main class="browse example">
  <a class="back" href="${tailwindIndex(source)}">← ${sourceName} components</a>
  <h1>${esc(group.name)}</h1>
  ${group.variants.length > 1 ? `<nav class="source-tabs" aria-label="Examples">${links}</nav>` : ""}
  ${group.slug === "application-skip-links" ? "<p>Focus the preview, then press Tab to show the skip link.</p>" : ""}
  <div class="viewport-bar" role="group" aria-label="Preview viewport">
    <span>Viewport:</span>
    <button type="button" data-width="100%" aria-pressed="true">Desktop</button>
    <button type="button" data-width="768px" aria-pressed="false">Tablet (768px)</button>
    <button type="button" data-width="375px" aria-pressed="false">Mobile (375px)</button>
  </div>
  <div class="frame-stage frame-host" id="tw-frame-host">
    <iframe sandbox="allow-scripts" src="${esc(example.preview)}" title="${esc(group.name)} preview"></iframe>
  </div>
  <details><summary>${source === "hyperui" ? "HTML source" : "React source"}</summary>
    <div class="source-actions"><button type="button" id="copy-example">Copy source</button>
      <a href="${esc(example.download)}" download>Download source</a><span id="copy-status" role="status"></span></div>
    <pre><code id="example-code">${esc(example.code)}</code></pre>
  </details>
</main>
<script>
const previewFrame = document.querySelector('.example iframe');
const frameHost = document.getElementById('tw-frame-host');
if (window.DesignerUI && frameHost && previewFrame) window.DesignerUI.watchFrame(frameHost, previewFrame);
const vpBtns = [...document.querySelectorAll('.viewport-bar button')];
for (const btn of vpBtns) {
  btn.addEventListener('click', () => {
    for (const b of vpBtns) b.setAttribute('aria-pressed', String(b === btn));
    previewFrame.style.width = btn.dataset.width;
  });
}
const exampleCode = document.querySelector('#example-code');
const copyStatus = document.querySelector('#copy-status');
document.querySelector('#copy-example').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(exampleCode.textContent);
    copyStatus.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(exampleCode);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Source selected. Copy it with your keyboard.';
  }
});
</script></body></html>`;
}

export function componentDetailHtml(component, previewPaths = []) {
  const variants = component?.variants || [];
  const tabs = variants
    .map(
      (v, i) =>
        `<button type="button" class="vtab${i === 0 ? " on" : ""}" aria-pressed="${i === 0}" data-i="${i}" data-preview="${esc(previewPaths[i])}">${esc(v.name)}</button>`,
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
${shellHead()}
<title>${esc(component?.title || component?.slug)} — Components</title>
<style>
  .wrap { padding:18px 20px 60px; max-width:1100px; }
  h1 { margin:0 0 4px; font-size:19px; font-weight:650; letter-spacing:-.015em; }
  .lead { color:var(--muted); margin:0 0 14px; font-size:13px; max-width:70ch; line-height:1.6; }
  .home { margin:-8px 0 12px; font-size:12px; overflow-wrap:anywhere; }
  .install { background:var(--code-bg); border:1px solid var(--line); border-radius:8px;
    padding:9px 12px; font-family:var(--mono);
    font-size:12px; color:var(--ok-fg); overflow-x:auto; margin-bottom:16px; }
  .vtabs { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px; }
  .vtab { background:var(--panel2); border:1px solid var(--line); color:var(--muted);
    border-radius:7px; padding:6px 11px; cursor:pointer; font:inherit; font-size:13px; }
  .vtab.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .panel { display:none; }
  .panel.on { display:block; }
  .preview { margin-bottom:16px; }
  .preview h2 { font-size:14px; margin:0 0 6px; }
  .preview iframe { width:100%; height:96px; min-height:64px; border:1px solid var(--line);
    background:var(--panel); border-radius:10px; }
  .preview p { color:var(--muted); }
  .phead { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
  .file { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; color:var(--fg); }
  .deps { color:var(--muted); font-size:11px; }
  .copy { margin-left:auto; background:var(--panel2); border:1px solid var(--line);
    color:var(--fg); border-radius:7px; padding:5px 11px; cursor:pointer; font:inherit; font-size:12px; }
  .copy:hover { border-color:var(--accent); }
  pre { background:var(--code-bg); border:1px solid var(--line); border-radius:10px;
    padding:14px 16px; overflow-x:auto; font-size:12px; line-height:1.6;
    font-family:var(--mono); color:var(--code-fg); }
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
  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:4px 0">
    <h1>${esc(component?.title || component?.slug)}</h1>
    ${component?.slug ? mcpButton(`designer:component:${component.slug}`, `${component.title || component.slug}`) : ""}
  </div>
  <p class="lead">${esc(component?.description || "")}</p>
  ${component?.homepage ? `<p class="home"><a href="${esc(component.homepage)}" rel="noreferrer">${esc(component.homepage)}</a></p>` : ""}
  ${component?.install ? `<div class="install">${esc(component.install)}</div>` : ""}
  <div class="vtabs">${tabs}</div>
  <section class="preview" aria-labelledby="preview-heading"${variants.length ? "" : " hidden"}>
    <h2 id="preview-heading">Preview</h2>
    <div id="preview-slot" class="frame-host"></div>
    <p id="preview-status" role="status" hidden>Preview unavailable for this cache entry. Rebuild the frontend with the current catalog.</p>
  </section>
  ${panels}
  ${faq ? `<h1 style="margin-top:22px;font-size:14px">Questions</h1>${faq}` : ""}
</div>
<script>
const tabs = [...document.querySelectorAll('.vtab')];
const panels = [...document.querySelectorAll('.panel')];
const previewSlot = document.getElementById('preview-slot');
const previewStatus = document.getElementById('preview-status');
function selectVariant(t) {
  tabs.forEach(x => {
    x.classList.toggle('on', x === t);
    x.setAttribute('aria-pressed', String(x === t));
  });
  panels.forEach(p => p.classList.toggle('on', p.dataset.i === t.dataset.i));
  const path = t.dataset.preview;
  previewStatus.hidden = Boolean(path);
  if (path && previewSlot.firstElementChild?.getAttribute('src') === path) return;
  previewSlot.replaceChildren();
  if (!path) return;
  const frame = document.createElement('iframe');
  frame.title = t.textContent + ' preview';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.src = path;
  previewSlot.append(frame);
  if (window.DesignerUI) window.DesignerUI.watchFrame(previewSlot, frame);
}
tabs.forEach(t => t.addEventListener('click', () => selectVariant(t)));
if (tabs.length) selectVariant(tabs[0]);
// Preview docs report their rendered height; grow the frame to fit.
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.source !== 'design-preview' || d.type !== 'height') return;
  const frame = previewSlot.querySelector('iframe');
  if (!frame || frame.contentWindow !== e.source) return;
  const next = String(Math.max(64, Math.min(720, Math.ceil(d.height))) + 'px');
  if (frame.style.height !== next) frame.style.height = next;
});
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

/**
 * The Slopstrap examples page: the vendored joke framework rendered live,
 * straight from the /assets files. Declarative only — the framework's own
 * script hydrates marquees, testimonials, counters, prose, and toggles from
 * data attributes on load, so no gallery wiring is needed beyond the level
 * switcher.
 */
export function slopstrapHtml(manifest) {
  const slop = manifest?.slopstrap ?? null;
  const head = (title, { extra = "", htmlAttrs = 'lang="en"' } = {}) => `<!doctype html>
<html ${htmlAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>${esc(title)}</title>
<style>
  .gate { background:var(--panel); border:1px solid var(--line); border-radius:12px;
    padding:16px 18px; max-width:760px; margin:0 auto; }
  .gate h1 { font-size:18px; margin:0 0 6px; }
  .gate p { color:var(--muted); font-size:13px; line-height:1.6; margin:6px 0; }
  .actions { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0 4px; }
  .actions a, .lvbtn { background:var(--panel2); color:var(--fg); border:1px solid var(--line);
    border-radius:7px; padding:6px 11px; font-size:12px; text-decoration:none; cursor:pointer; font:inherit; }
  .actions a:hover, .lvbtn:hover { border-color:var(--accent); }
  .lvbtn.on { background:var(--accent); border-color:var(--accent); color:#fff; }
  .lvlabel { color:var(--muted); font-size:12px; align-self:center; margin-right:2px; }
  .note { color:var(--muted); font-size:12px; line-height:1.6; margin-top:10px; }
  .note code { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
</style>
${extra}
</head>`;
  if (!slop) {
    return `${head("Slopstrap unavailable")}
<body>
${nav("slopstrap")}
<main style="padding:40px 20px; text-align:center; color:var(--muted);">
  <p>The Slopstrap layer is not in this frontend build. Run <code>npm run bake</code> and
  <code>npm run frontend:build</code> with <code>data/slopstrap/</code> present to serve it.</p>
</main>
</body>
</html>`;
  }
  const fmtKB = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
  return `${head("Slopstrap: certified AI slop, served offline", {
    extra: `<link rel="stylesheet" href="${esc(slop.css.url)}">`,
    htmlAttrs: 'lang="en" data-slop-level="3"',
  })}
<body class="slop-body slop-grid-bg">
${nav("slopstrap")}
<div class="slop-orb-layer" aria-hidden="true">
  <div class="slop-orb slop-orb-purple"></div>
  <div class="slop-orb slop-orb-cyan"></div>
  <div class="slop-orb slop-orb-pink"></div>
  <div class="slop-orb slop-orb-emerald"></div>
</div>
<div class="slop-content-layer">
  <header class="slop-container slop-section-sm">
    <div class="gate">
      <h1>Slopstrap v4.2.0</h1>
      <p>Mike Lacher's satirical CSS and JS framework. It bundles every certified AI design
      tell: purple gradients, blinking status dots, border beams, fake testimonials, and a
      logo marquee. Everything below is rendered live from the vendored files, fully offline.</p>
      <div class="actions">
        <a href="${esc(slop.zip.url)}" download>Download ZIP (${fmtKB(slop.zip.bytes)})</a>
        <a href="https://slopstrap.mikelacher.com/" rel="noreferrer">Upstream site</a>
        <a href="/component/slopstrap">Catalog entry</a>
        <span class="lvlabel">Slop level:</span>
        <button type="button" class="lvbtn" data-slop-level-set="1">1 Subtle</button>
        <button type="button" class="lvbtn" data-slop-level-set="2">2 One-shot</button>
        <button type="button" class="lvbtn on" data-slop-level-set="3">3 Peak</button>
        <button type="button" class="lvbtn" data-slop-level-set="4">4 Overdrive</button>
      </div>
      <p class="note">MIT licensed per the upstream README inside the zip, which ships verbatim.
      The gallery never links Google Fonts, so Inter and Instrument Serif fall back to system
      fonts. The runnable examples live on the
      <a href="/component/slopstrap">component page</a> and in
      <a href="${esc(slop.zip.url)}" download>the zip</a>.</p>
    </div>
  </header>

  <main class="slop-container slop-section">
    <section class="slop-center">
      <span class="slop-pill slop-pill-shimmer slop-mb-3">
        <span class="slop-dot slop-dot-green"></span> Now with 100 percent more slop
      </span>
      <h1 class="slop-h1">
        <span class="slop-text-gradient">It's not just a framework,</span>
        <span class="slop-serif-emphasis slop-text-gradient-hot">it's a lifestyle</span>
      </h1>
      <p class="slop-lead">Every class below ships in the zip. Copy one, and your page
      immediately looks like a Series B landing page built in one shot.</p>
      <div class="slop-row slop-row-center slop-mb-4">
        <a class="slop-btn slop-btn-primary slop-btn-lg" href="${esc(slop.zip.url)}" download>Download the slop</a>
        <a class="slop-btn slop-btn-ghost slop-btn-lg" href="https://slopstrap.mikelacher.com/" rel="noreferrer">Read the docs</a>
      </div>
      <div data-slop-marquee></div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Status dots, connected to nothing</h2>
      <div class="slop-row slop-mt-2">
        <span class="slop-dot slop-dot-green"></span>
        <span class="slop-dot slop-dot-purple"></span>
        <span class="slop-dot slop-dot-cyan"></span>
        <span class="slop-dot slop-dot-amber"></span>
        <span class="slop-dot slop-dot-pink"></span>
        <span class="slop-dot slop-dot-red"></span>
        <span class="slop-dot slop-dot-indigo"></span>
        <span class="slop-dot slop-dot-rainbow"></span>
        <span class="slop-mono slop-muted">8 services, 0 backends</span>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Buttons that shimmer</h2>
      <div class="slop-row slop-mt-2">
        <button class="slop-btn slop-btn-primary">Get started</button>
        <button class="slop-btn slop-btn-rainbow">Book a demo</button>
        <button class="slop-btn slop-btn-ghost">Learn more</button>
        <button class="slop-btn slop-btn-primary slop-btn-sm">Small</button>
        <button class="slop-btn slop-btn-primary slop-btn-lg">Large</button>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Pills and badges of authority</h2>
      <div class="slop-row slop-mt-2">
        <span class="slop-pill slop-pill-shimmer"><span class="slop-dot slop-dot-green"></span> NEW</span>
        <span class="slop-badge slop-badge-ai">AI-POWERED</span>
        <span class="slop-badge slop-badge-popular">POPULAR</span>
        <span class="slop-badge slop-badge-emerald">SOC2 TYPE ∞</span>
        <span class="slop-badge slop-badge-cyan">REAL-TIME</span>
        <span class="slop-badge slop-badge-amber">BETA</span>
        <span class="slop-badge slop-badge-pink">10x</span>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Fat left borders of importance</h2>
      <div class="slop-grid-3 slop-mt-2">
        <div class="slop-border-l-purple" style="padding-left:12px"><p class="slop-muted">Purple means vision.</p></div>
        <div class="slop-border-l-cyan" style="padding-left:12px"><p class="slop-muted">Cyan means velocity.</p></div>
        <div class="slop-border-l-rainbow" style="padding-left:12px"><p class="slop-muted">Rainbow means the sprint went well.</p></div>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Typography with one italic serif word</h2>
      <h3 class="slop-h2 slop-mt-2">
        <span class="slop-text-gradient">Reimagine your</span>
        <span class="slop-serif-emphasis">workflow</span>
      </h3>
      <p class="slop-mt-2">
        Underlines that look hand-drawn, because authenticity is a font choice:
        <span class="slop-underline">game-changing</span>,
        <span class="slop-underline slop-underline-squiggle slop-underline-cyan">blazingly fast</span>,
        <span class="slop-underline slop-underline-double slop-underline-pink">enterprise-ready</span>.
      </p>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Cards, beams, and cards inside cards</h2>
      <div class="slop-grid-3 slop-mt-2">
        <div class="slop-card">
          <h3 class="slop-h3">Plain card</h3>
          <p class="slop-muted">Frosted glass, soft shadow, quiet dignity.</p>
        </div>
        <div class="slop-card slop-card-beam">
          <h3 class="slop-h3">Beam card</h3>
          <p class="slop-muted">A border beam rotates, and a spotlight follows your cursor.</p>
        </div>
        <div class="slop-card slop-card-nested">
          <h3 class="slop-h3">Nested card</h3>
          <div class="slop-card slop-mt-2">
            <p class="slop-muted">A card, within a card, within a landing page.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Stats that count themselves</h2>
      <div class="slop-grid-3 slop-mt-2">
        <div class="slop-stat-card">
          <div class="slop-stat-value" data-slop-count="420%">0%</div>
          <div class="slop-stat-label">More synergy</div>
          <div class="slop-stat-delta">▲ +420% YoY</div>
        </div>
        <div class="slop-stat-card">
          <div class="slop-stat-value" data-slop-count="2.4M">0</div>
          <div class="slop-stat-label">Developers, probably</div>
          <div class="slop-stat-delta">▲ 100% MoM</div>
        </div>
        <div class="slop-stat-card">
          <div class="slop-stat-value" data-slop-count="99.99%">0%</div>
          <div class="slop-stat-label">Uptime, self-certified</div>
          <div class="slop-stat-delta">0 real incidents</div>
        </div>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Terminal, AI bar, and progress</h2>
      <div class="slop-grid-2 slop-mt-2">
        <div class="slop-terminal">
          <div class="slop-terminal-header"><span class="slop-traffic-lights"></span> zsh</div>
          <pre class="slop-code">npx create-slop-app
✔ agents configured      ✔ vibes calibrated
✔ synergy at 420%        ▓▓▓▓▓▓▓▓▓░ 90%</pre>
        </div>
        <div class="slop-card">
          <div class="slop-row slop-row-between">
            <h3 class="slop-h3">AI workload</h3>
            <span class="slop-badge slop-badge-ai">AI-POWERED</span>
          </div>
          <div class="slop-ai-bar slop-mt-2"><div class="slop-progress-bar" style="width:87%"></div></div>
          <div class="slop-progress slop-mt-2"><div class="slop-progress-bar" style="width:64%"></div></div>
          <p class="slop-muted slop-mt-2">87% of compute is thinking about synergy.</p>
        </div>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Alerts</h2>
      <div class="slop-alert slop-mt-2">
        <span class="slop-dot slop-dot-amber"></span>
        Warning: this page contains 14 purple gradients, injected automatically.
      </div>
      <div class="slop-alert slop-mt-2">
        <span class="slop-dot slop-dot-green"></span>
        Great news: the thing you waited for is now generally available.
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Pricing with a billing toggle</h2>
      <div class="slop-row slop-row-center slop-mt-2" data-slop-billing-toggle>
        <span class="slop-muted">Monthly</span>
        <button class="slop-switch" type="button" aria-label="Toggle billing period">
          <span class="slop-switch-thumb"></span>
        </button>
        <span class="slop-muted">Yearly <span class="slop-badge slop-badge-emerald">save 20%</span></span>
      </div>
      <div class="slop-grid-3 slop-mt-3">
        <div class="slop-pricing-card">
          <h3 class="slop-h3">Hobby</h3>
          <div class="slop-price" data-price-monthly="$0" data-price-yearly="$0">$0<span class="slop-muted">/mo</span></div>
          <ul class="slop-feature-list">
            <li>1 project</li>
            <li>3 gradients per page</li>
          </ul>
          <button class="slop-btn slop-btn-ghost slop-w-full">Start free</button>
        </div>
        <div class="slop-pricing-card slop-pricing-popular">
          <span class="slop-pricing-popular-tag">RECOMMENDED BY OUR LANDING PAGE</span>
          <h3 class="slop-h3">Pro</h3>
          <div class="slop-price" data-price-monthly="$29" data-price-yearly="$23">$29<span class="slop-muted">/mo</span></div>
          <ul class="slop-feature-list">
            <li>Unlimited gradients</li>
            <li>Agentic workflows on toast</li>
          </ul>
          <button class="slop-btn slop-btn-primary slop-btn-lg slop-w-full">Go Pro</button>
        </div>
        <div class="slop-pricing-card">
          <h3 class="slop-h3">Enterprise</h3>
          <div class="slop-price">Let's talk<span class="slop-muted">/quarter</span></div>
          <ul class="slop-feature-list">
            <li>SSO, SAML, and other acronyms</li>
            <li>On-prem, cloud, or spiritually</li>
          </ul>
          <button class="slop-btn slop-btn-ghost slop-w-full">Contact sales</button>
        </div>
      </div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Synthetic social proof</h2>
      <div class="slop-mt-2" data-slop-testimonials="3"></div>
    </section>

    <section class="slop-section-sm">
      <h2 class="slop-h3">Extraneous copy, generated live</h2>
      <div class="slop-mt-2" data-slop-prose="ai" data-slop-paragraphs="2"></div>
    </section>
  </main>

  <footer class="slop-container slop-section-sm slop-center">
    <p class="slop-muted slop-mono">
      Slopstrap v4.2.0 by <a class="slop-muted" href="https://mikelacher.com/" rel="noreferrer">Mike Lacher</a>,
      MIT, served offline by the designer-mcp gallery.
    </p>
  </footer>
</div>
<script src="${esc(slop.js.url)}" defer></script>
<script>
document.querySelectorAll('[data-slop-level-set]').forEach((btn) => btn.addEventListener('click', () => {
  const level = btn.dataset.slopLevelSet;
  document.documentElement.setAttribute('data-slop-level', level);
  if (window.Slopstrap) window.Slopstrap.setLevel(level);
  document.querySelectorAll('[data-slop-level-set]').forEach((b) => b.classList.toggle('on', b === btn));
}));
</script>
</body>
</html>`;
}

// ------------------------------------------------------------------ presets
function presetCatalogVisual(c) {
  if (c.preview) return `<div class="swatch" style="background:${esc(c.preview)}"></div>`;
  if (c.kind === "liquid-glass") {
    return `<div class="swatch glass-scene swatch-center"><div class="liquid-glass glass-sample" style="--glass-blur:18px;--glass-saturate:188%;--glass-contrast:108%;--glass-tint:rgba(255,255,255,0.22);--glass-border:rgba(255,255,255,0.45);--glass-radius:16px"></div></div>`;
  }
  return `<div class="swatch swatch-triptych" aria-hidden="true">
    <span style="background:radial-gradient(120% 100% at 50% 0%,#0f766e 0%,#09090b 75%)"></span>
    <span style="background:radial-gradient(#3f3f46 1px,transparent 1px) 0 0/12px 12px,linear-gradient(135deg,#18181b,#09090b)"></span>
    <span style="background:radial-gradient(circle at 20% 20%,#6366f1 0%,transparent 55%),radial-gradient(circle at 80% 80%,#ec4899 0%,transparent 55%),#09090b"></span>
  </div>`;
}

export function presetsHtml(catalogs) {
  const list = catalogs?.catalogs || [];
  const total = catalogs?.total ?? 0;

  const cards = list
    .map(
      (c) => `<a class="card" href="/presets/${encodeURIComponent(c.kind)}">
    ${presetCatalogVisual(c)}
    <div class="meta">
      <h3>${esc(c.label || c.kind)}</h3>
      <div class="desc">${esc(c.summary || (c.kind === "liquid-glass" ? "Frosted translucent glass surfaces with tunable blur, saturation, and specular borders." : "Copy-ready CSS radial glows, dot matrices, architectural grids, and mesh gradients."))}</div>
      <div class="tags"><span class="tag-pill">${c.total} presets</span><span class="tag-cta">Browse catalog</span></div>
    </div>
  </a>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>Gradients &amp; Patterns — ${total} presets</title>
<style>
${SHARED_CSS}
${GLASS_PREVIEW_CSS}
  .grid { display:grid; gap:14px; padding:18px 20px 60px; max-width:1200px;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  .card { display:flex; flex-direction:column; background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; text-decoration:none; color:inherit; transition:border-color .14s ease; }
  .card:hover, .card:focus-visible { border-color:var(--accent); }
  .swatch { height:150px; border-bottom:1px solid var(--line); position:relative; }
  .swatch-center { display:grid; place-items:center; }
  .swatch-triptych { display:grid; grid-template-columns:repeat(3,1fr); }
  .swatch-triptych span { height:100%; border-right:1px solid rgba(255,255,255,.08); }
  .swatch-triptych span:last-child { border-right:none; }
  .meta { padding:14px 16px 16px; display:flex; flex-direction:column; gap:8px; flex:1; }
  .card h3 { margin:0; font-size:15px; font-weight:600; color:var(--strong); }
  .desc { color:var(--muted); font-size:12.5px; line-height:1.5; }
  .tags { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:auto; padding-top:4px; }
  .tag-pill { font-size:11px; padding:2px 8px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); font-variant-numeric:tabular-nums; }
  .tag-cta { font-size:12px; font-weight:550; color:var(--accent); }
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

function presetStyle(style) {
  if (!style || typeof style !== "object") return "";
  return Object.entries(style)
    .filter(([name, value]) => /^[A-Za-z][A-Za-z0-9-]*$/.test(name) &&
      (typeof value === "string" || typeof value === "number") && !/(?:https?:|url\(\s*['"]?\/\/)/i.test(String(value)))
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase())}: ${value}`)
    .join(";");
}

const GLASS_PREVIEW_CSS = `
${glassCss()}
.glass-scene {
  overflow: clip;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.22) 1px, transparent 1px) 0 0 / 13px 13px,
    linear-gradient(rgb(255 255 255 / 0.22) 1px, transparent 1px) 0 0 / 13px 13px,
    linear-gradient(126deg, #1d2759 0 25%, #7650c2 25% 47%, #df7894 47% 63%, #3b9eb1 63% 82%, #20355d 82%);
}
.glass-sample { width: 62%; height: 60%; }
.glass-description { color: var(--muted); margin: 6px 0 0; }
.glass-compare { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.browse .glass-compare input { width: auto; accent-color: var(--accent); }
`;

export function presetDetailHtml(catalog) {
  const heading = catalog?.label || catalog?.kind || "Presets";
  const glass = catalog?.kind === "liquid-glass";
  const items = (catalog?.presets ?? []).map((preset, index) => {
    const { id, description } = preset;
    const category = glass ? preset.theme : preset.category;
    const name = preset.name || preset.label || id;
    const properties = glass ? glassProperties(preset) : null;
    const style = properties ? Object.entries(properties).map(([key, value]) => `${key}: ${value}`).join(";") : presetStyle(preset.style);
    const code = properties ? glassCss(properties) : preset.code;
    return { category, card: `<button type="button" class="browse-card" aria-haspopup="dialog"
      data-preset="${index}" data-description="${esc(description)}" ${cardAttributes(category, [name, id, category, description])}>
      <span class="browse-visual${glass ? " glass-scene" : ""}">${style ? `<span class="${glass ? "liquid-glass glass-sample" : "swatch"}" data-material style="${esc(style)}"></span>` : "Preview unavailable"}</span>
      <span class="browse-meta"><strong>${esc(name)}</strong>${category ? `<small>${esc(categoryLabel(category))}</small>` : ""}</span>
    </button>
    <template id="preset-code-${index}">${esc(code)}</template>` };
  });
  return browsePage({
    active: "presets", title: heading, heading, items, itemName: "presets", searchLabel: "Search presets",
    styles: glass ? GLASS_PREVIEW_CSS : "",
    back: '<a class="back" href="/presets">← All catalogs</a>',
    dialog: `<dialog class="catalog-dialog" closedby="any" aria-labelledby="preset-title">
      <header><h2 id="preset-title"></h2><button type="button" id="preset-close" autofocus>Close</button></header>
      ${glass ? '<p class="glass-description" id="preset-description" hidden></p>' : ""}
      <div class="browse-visual${glass ? " glass-scene" : ""}"><span class="${glass ? "liquid-glass glass-sample" : "swatch"}" id="preset-swatch"></span></div>
      ${glass ? '<label class="glass-compare"><input id="preset-effect" type="checkbox" checked> Show effect</label>' : ""}
      <pre><code id="preset-code"></code></pre>
      <footer><button type="button" id="preset-copy">${glass ? "Copy CSS" : "Copy code"}</button><button type="button" id="preset-mcp" class="mcp-send-btn" data-mcp-ref="" data-mcp-label="">+ Send to MCP</button><span id="preset-status" role="status"></span></footer>
    </dialog>`,
    script: `
const dialog = document.querySelector('.catalog-dialog');
const code = document.querySelector('#preset-code');
const swatch = document.querySelector('#preset-swatch');
const copy = document.querySelector('#preset-copy');
const presetMcp = document.querySelector('#preset-mcp');
const presetKind = ${JSON.stringify(catalog?.kind || "patterns")};
const presetIds = ${JSON.stringify((catalog?.presets ?? []).map((p) => p.id || p.slug || p.name || ""))};
const status = document.querySelector('#preset-status');
const effect = document.querySelector('#preset-effect');
const description = document.querySelector('#preset-description');
effect?.addEventListener('change', () => { swatch.hidden = !effect.checked; });
for (const card of cards) card.addEventListener('click', () => {
  const titleText = card.querySelector('strong').textContent;
  document.querySelector('#preset-title').textContent = titleText;
  const pid = presetIds[Number(card.dataset.preset)] || '';
  if (presetMcp && pid) {
    presetMcp.setAttribute('data-mcp-ref', 'designer:preset:' + presetKind + ':' + pid);
    presetMcp.setAttribute('data-mcp-label', titleText + ' (' + presetKind + ')');
    if (window.DesignerMCP) window.DesignerMCP.syncButtons();
  }
  const style = card.querySelector('[data-material]')?.getAttribute('style');
  swatch.parentElement.hidden = !style;
  swatch.setAttribute('style', style || '');
  if (effect) {
    effect.checked = true;
    swatch.hidden = false;
    description.textContent = card.dataset.description;
    description.hidden = !description.textContent;
  }
  code.textContent = document.querySelector('#preset-code-' + card.dataset.preset).content.textContent;
  code.parentElement.hidden = copy.hidden = !code.textContent;
  status.textContent = '';
  dialog.showModal();
});
document.querySelector('#preset-close').addEventListener('click', () => dialog.close());
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'Copied';
  } catch {
    const selection = getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Code selected. Copy it with your keyboard.';
  }
});`,
  });
}

export function uiSdkDocsHtml(docs = []) {
  const sections = [...new Set(docs.map((d) => d.section))];
  const chips = [
    `<button type="button" data-sec="" aria-pressed="true">All (${docs.length})</button>`,
    ...sections.map((s) => `<button type="button" data-sec="${esc(s)}" aria-pressed="false">${esc(s)} (${docs.filter((d) => d.section === s).length})</button>`),
  ].join("");
  const list = docs.map((d) =>
    `<button type="button" class="doc-item" data-sec="${esc(d.section)}" data-path="${esc(d.path)}" data-search="${esc(`${d.path} ${d.title} ${d.section}`.toLowerCase())}">
      <strong>${esc(d.title)}</strong><small>${esc(d.path)}</small>
    </button>`).join("");

  const secNav = subnav([
    { href: "/assets", label: "Offline CDN & Assets", key: "assets" },
    { href: "/docs", label: "UI SDK Offline Docs", key: "docs" },
    { href: "/components/icons", label: "Icons Browser", key: "icons" },
    { href: "/components/charts", label: "Charts & Data Viz", key: "charts" },
    { href: "/components/fonts", label: "Local Fonts", key: "fonts" },
  ], "docs");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>UI SDK Offline Docs (@ui-sdk/core, react, web)</title>
<style>
.docs-wrap { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 16px; max-width: 1480px; margin: 0 auto; padding: 18px 20px 60px; }
@media (max-width: 860px) { .docs-wrap { grid-template-columns: 1fr; } }
.docs-side { display: flex; flex-direction: column; gap: 10px; }
.docs-side input { width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line); border-radius: 7px; padding: 8px 10px; font: inherit; }
.docs-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.docs-chips button { font: inherit; font-size: 12px; color: var(--fg); background: var(--panel2); border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.docs-chips button[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); }
.docs-list { display: flex; flex-direction: column; gap: 4px; max-height: 70vh; overflow: auto; }
.doc-item { text-align: left; background: var(--panel); color: var(--fg); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; cursor: pointer; font: inherit; display: flex; flex-direction: column; gap: 2px; }
.doc-item:hover, .doc-item[aria-current="true"] { border-color: var(--accent); background: var(--panel2); }
.doc-item strong { font-size: 13px; }
.doc-item small { color: var(--muted); font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.doc-item[hidden] { display: none; }
.docs-view { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; min-height: 60vh; overflow: auto; }
.docs-view pre { white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.6; margin: 0; }
.docs-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.docs-head span { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--muted); }
</style>
</head>
<body>
${nav("docs")}
${secNav}
<div class="docs-wrap">
  <aside class="docs-side">
    <h1 style="margin:0;font-size:18px">UI SDK Offline Docs</h1>
    <input id="doc-q" type="search" placeholder="Filter docs (select, dialog, webmcp...)" aria-label="Filter UI SDK docs">
    <div class="docs-chips">${chips}</div>
    <div class="docs-list" id="doc-list">${list}</div>
  </aside>
  <main class="docs-view">
    <div class="docs-head"><span id="doc-path">Select a doc</span><a id="doc-raw" href="#" download hidden>Download .md</a></div>
    <pre id="doc-body">Select a document from the left to read it offline, or use the MCP tools design_kit_search and design_kit_docs (kit: "ui-sdk").</pre>
  </main>
</div>
<script>
const q = document.getElementById('doc-q');
const chips = [...document.querySelectorAll('.docs-chips button')];
const items = [...document.querySelectorAll('.doc-item')];
const pathEl = document.getElementById('doc-path');
const bodyEl = document.getElementById('doc-body');
const rawEl = document.getElementById('doc-raw');
let sec = '';
function filter() {
  const s = q.value.trim().toLowerCase();
  for (const it of items) {
    it.hidden = (sec && it.dataset.sec !== sec) || (s && !it.dataset.search.includes(s));
  }
}
q.addEventListener('input', filter);
chips.forEach(c => c.addEventListener('click', () => {
  sec = c.dataset.sec;
  chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
  filter();
}));
async function openDoc(btn) {
  items.forEach(x => x.removeAttribute('aria-current'));
  btn.setAttribute('aria-current', 'true');
  const p = btn.dataset.path;
  const url = '/api/ui-sdk-docs/' + p;
  pathEl.textContent = p;
  rawEl.href = url;
  rawEl.hidden = false;
  bodyEl.textContent = 'Loading...';
  const res = await fetch(url);
  bodyEl.textContent = res.ok ? await res.text() : 'Failed to load ' + p;
}
items.forEach(it => it.addEventListener('click', () => openDoc(it)));
const first = items.find(it => it.dataset.path === 'SKILL.md') || items[0];
if (first) openDoc(first);
</script>
</body>
</html>`;
}

// --------------------------------------------------------------- templates
export function templatesHtml(index) {
  const systems = index?.systems || [];
  const total = index?.total ?? systems.length;

  const cards = systems
    .map((s) => {
      const swatches = [s.ground, s.text, s.accent]
        .filter(Boolean)
        .map(
          (c) =>
            `<span class="sw" style="background:${esc(c)}" title="${esc(c)}"></span>`,
        )
        .join("");
      const starters = (s.starterTemplates || [])
        .map((t) => esc(t.name))
        .join(", ");
      return `<div class="card">
    <a href="/template/${encodeURIComponent(s.slug)}"><img class="cover" src="/template/${encodeURIComponent(s.slug)}/thumb" alt="${esc(s.name)} cover"></a>
    <div class="meta">
      <h3><a href="/template/${encodeURIComponent(s.slug)}">${esc(s.name)}</a></h3>
      <div class="desc">${esc(s.description || "")}</div>
      <div class="tags"><span class="sws">${swatches}</span><span class="tag">${esc(s.headingFont || "")}</span></div>
      <div class="tags"><span class="tag">${s.tokensCount} tokens</span><span class="tag">${s.filesCount} files</span>${starters ? `<span class="tag">starters: ${starters}</span>` : ""}</div>
    </div>
  </div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>System templates — ${total} design systems</title>
<style>
${SHARED_CSS}
  .grid { display:grid; gap:12px; padding:18px 20px 60px;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:11px; overflow:hidden; }
  .cover { display:block; width:100%; height:150px; object-fit:cover; border-bottom:1px solid var(--line); }
  .meta { padding:12px 14px 14px; display:flex; flex-direction:column; gap:8px; }
  .card h3 { margin:0; font-size:14px; font-weight:600; }
  .card h3 a { color:var(--fg); text-decoration:none; }
  .card h3 a:hover { color:var(--accent); }
  .desc { color:var(--muted); font-size:12px; line-height:1.5; }
  .tags { display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); }
  .sws { display:inline-flex; }
  .sw { width:18px; height:18px; border-radius:5px; border:1px solid rgba(255,255,255,.15); }
  .sw + .sw { margin-left:-4px; }
</style>
</head>
<body>
${nav("templates")}
<div class="bar"><h1>System templates <span>· ${total} generic design systems</span></h1></div>
<div class="count">Vendored starting points: copy one whole and build on its tokens. The MCP exposes these as design_template and design_file (kind: "template").</div>
<div class="grid">
${cards || '<div class="empty">No templates cached. Run: npm run templates</div>'}
</div>
</body>
</html>`;
}

export function templateDetailHtml(record, previewLinks = {}) {
  const m = record?.manifest || {};
  const roles = m.colors?.roles || {};
  const theme = record?.theme || {};
  const tokens = record?.tokens || [];

  const swatches = Object.entries(roles)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<div class="swbig"><span class="sw2" style="background:${esc(v)}"></span><span class="swname">${esc(k)}</span><span class="swval">${esc(v)}</span></div>`,
    )
    .join("");

  const knobs = [
    ["density", theme.density],
    ["radius", theme.radius],
    ["layoutStyle", theme.layoutStyle],
    ["dividers", theme.dividers],
    ["buttonStyle", theme.buttonStyle],
    ["imageTreatment", theme.imageTreatment],
    ["iconSet", theme.iconSet],
    ["frame", theme.frame],
  ]
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `<span class="tag"><b>${esc(k)}</b> ${esc(String(v))}</span>`)
    .join("");

  const kinds = ["color", "font", "spacing", "radius", "shadow"];
  const tokenTables = kinds
    .map((kind) => {
      const rows = tokens
        .filter((t) => t.kind === kind)
        .map(
          (t) =>
            `<tr><td class="mono">${esc(t.name)}</td><td class="mono val">${esc(t.value)}</td></tr>`,
        )
        .join("");
      return rows
        ? `<details open><summary>${esc(kind)} <span class="cnt">${tokens.filter((t) => t.kind === kind).length}</span></summary>
  <table>${rows}</table></details>`
        : "";
    })
    .join("");

  const compRows = (m.components?.classes || [])
    .map(
      (c) =>
        `<tr><td class="mono">${esc(c.class)}</td><td>${esc(c.what)}</td><td class="mono">${esc(c.demo)}</td></tr>`,
    )
    .join("");

  const starters = (m.starterTemplates?.all || [])
    .map(
      (t) =>
        `<div class="starter"><b>${esc(t.name)}</b> <span class="mono">${esc(t.entryPath)}</span>
          <div class="desc">${esc(t.description || "")}</div>
          ${previewLinks[t.entryPath] ? `<button class="template-preview" type="button" data-preview="${esc(previewLinks[t.entryPath])}" data-name="${esc(t.name)}">Preview ${esc(t.name)}</button>` : ""}
        </div>`,
    )
    .join("");

  const files = (record.files || [])
    .map(
      (f) =>
        `<li><span class="mono">${esc(f.path)}</span>${f.binary ? ' <span class="tag">binary</span>' : ""}</li>`,
    )
    .join("");

  const manifestJson = JSON.stringify(m, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead()}
<title>${esc(record?.name || record?.slug)} — System templates</title>
<style>
  .wrap { padding:18px 20px 60px; max-width:1100px; }
  h1 { margin:0 0 4px; font-size:19px; font-weight:650; letter-spacing:-.015em; }
  h2 { font-size:14px; font-weight:650; margin:22px 0 8px; }
  .lead { color:var(--muted); margin:0 0 14px; font-size:13px; max-width:70ch; line-height:1.6; }
  .back { font-size:12px; text-decoration:none; }
  .swroles { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:12px; }
  .swbig { display:flex; align-items:center; gap:7px; font-size:11px; }
  .sw2 { width:26px; height:26px; border-radius:7px; border:1px solid rgba(255,255,255,.15); }
  .swname { color:var(--fg); }
  .swval { color:var(--muted); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
  .knobs { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); }
  .tag b { color:var(--fg); font-weight:550; }
  details { border:1px solid var(--line); border-radius:9px; padding:8px 12px; margin-bottom:8px;
    background:var(--panel); }
  summary { cursor:pointer; font-size:13px; }
  .cnt { color:var(--muted); font-size:11px; margin-left:5px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; font-size:12px; }
  td { padding:4px 8px 4px 0; border-top:1px solid var(--line); vertical-align:top; }
  .mono { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:11.5px; }
  .val { color:var(--muted); word-break:break-all; }
  .starter { padding:8px 0; border-top:1px solid var(--line); font-size:12px; }
  .template-preview { margin-top:5px; color:var(--accent); background:var(--panel2); border:1px solid var(--line);
    border-radius:7px; cursor:pointer; font:inherit; padding:4px 8px; }
  #template-frame iframe { width:100%; height:clamp(340px, 65vh, 720px); border:1px solid var(--line);
    margin-top:8px; border-radius:9px; background:var(--panel); }
  .starter .desc { color:var(--muted); margin-top:3px; line-height:1.5; }
  ul.files { list-style:none; padding:0; margin:0; columns:2; font-size:12px; }
  ul.files li { padding:3px 0; color:var(--muted); }
  ul.files .mono { color:var(--fg); }
  pre { background:var(--code-bg); border:1px solid var(--line); border-radius:10px;
    padding:14px 16px; overflow-x:auto; font-size:11.5px; line-height:1.6; max-height:480px;
    font-family:var(--mono); color:var(--code-fg); }
</style>
</head>
<body>
${nav("templates")}
<div class="wrap">
  <a class="back" href="/templates">← All templates</a>
  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:4px 0">
    <h1>${esc(record?.name || record?.slug)}</h1>
    ${record?.slug ? mcpButton(`designer:template:${record.slug}`, `${record.name || record.slug} (Template)`) : ""}
  </div>
  <p class="lead">${esc(record?.description || "")}</p>
  <h2>Color roles</h2>
  <div class="swroles">${swatches}</div>
  <h2>Theme parameters</h2>
  <div class="knobs">${knobs}</div>
  <h2>Tokens</h2>
  ${tokenTables}
  <h2>Component classes</h2>
  ${compRows ? `<table>${compRows}</table>` : '<div class="lead">No component table.</div>'}
  <h2>Starter templates</h2>
  ${starters || '<div class="lead">None.</div>'}
  <div id="template-frame"></div>
  <h2>Files</h2>
  <ul class="files">${files}</ul>
  <h2>design-system manifest</h2>
  <details><summary>The filled manifest JSON (schema ${esc(m.schemaVersion || "")})</summary><pre>${esc(manifestJson)}</pre></details>
</div>
<script>
const slot = document.getElementById('template-frame');
const previewButtons = [...document.querySelectorAll('.template-preview')];
function loadTemplatePreview(button, scroll) {
  const frame = document.createElement('iframe');
  frame.title = button.dataset.name + ' preview';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.src = button.dataset.preview;
  slot.replaceChildren(frame);
  if (scroll) frame.scrollIntoView({ block: 'nearest' });
}
previewButtons.forEach(button => {
  button.addEventListener('click', () => loadTemplatePreview(button, true));
});
if (previewButtons.length) loadTemplatePreview(previewButtons[0], false);
</script>
</body>
</html>`;
}
