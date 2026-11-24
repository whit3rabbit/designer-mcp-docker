/**
 * components-ui.mjs — Unified Components Hub & Cross-Library Comparator HTML.
 *
 * Serves:
 *   - /components                  Unified catalog: library filter bar, stack filters,
 *                                  canonical cross-library spotlight, and clearly badged cards
 *   - /components/compare          Directory of all generic UI components across libraries
 *   - /components/compare/:slug    Cross-library comparator with live offline preview switcher
 */

import { BASE_CSS, NAV_CSS, nav, subnav, themeHead } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function categoryLabel(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

export function componentsSubnav(active, counts = {}) {
  return subnav(
    [
      { href: "/components", label: "All Components", key: "components" },
      { href: "/components/compare", label: "Compare Across Libraries", key: "compare", count: counts.concepts },
      { href: "/components/icons", label: "Icons (Lucide)", key: "icons" },
      { href: "/components/charts", label: "Charts & Data Viz", key: "charts" },
      { href: "/components/fonts", label: "Local Fonts", key: "fonts" },
      { href: "/reui", label: "ReUI", key: "reui" },
      { href: "/heroui", label: "HeroUI", key: "heroui" },
      { href: "/mantine", label: "Mantine", key: "mantine" },
      { href: "/daisyui", label: "daisyUI", key: "daisyui" },
      { href: "/baseui", label: "Base UI", key: "baseui" },
      { href: "/uikits", label: "UI Kits", key: "uikits" },
      { href: "/tailwind", label: "Tailwind", key: "tailwind" },
    ],
    active,
  );
}

const HUB_CSS = `
  .hub { max-width: 1540px; margin: 0 auto; padding: 22px clamp(14px, 3vw, 32px) 68px; }
  .hub h1 { margin: 0; font-size: clamp(22px, 3vw, 28px); font-weight: 700; letter-spacing: -.02em; color: var(--strong); }
  .hub-lead { margin: 5px 0 16px; color: var(--muted); font-size: 13.5px; max-width: 78ch; }
  .hub-panel { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
  .hub-row { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
  .hub-label { font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin-right: 3px; }
  .hub-search {
    flex: 1 1 260px; min-width: 190px; padding: 8px 12px; border-radius: 8px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--fg); font: inherit; font-size: 13.5px;
  }
  .hub-select {
    padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg); font: inherit; font-size: 12.5px; cursor: pointer;
  }
  .hub-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line);
    background: var(--panel2); color: var(--fg); font: inherit; font-size: 12px; cursor: pointer;
  }
  .hub-chip:hover { border-color: var(--accent); }
  .hub-chip[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); font-weight: 600; }
  .hub-chip span { color: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
  .hub-lib-banner {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 14px; border-radius: 10px; border: 1px solid var(--accent-line); background: var(--accent-bg); margin-bottom: 14px; font-size: 12.5px;
  }
  .hub-lib-banner[hidden] { display: none; }
  .hub-lib-banner strong { color: var(--strong); }
  .hub-lib-banner a { font-weight: 600; text-decoration: none; white-space: nowrap; }
  .hub-lib-banner a:hover { text-decoration: underline; }
  .compare-strip { margin-bottom: 18px; }
  .compare-strip[hidden] { display: none; }
  .compare-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 9px; }
  .compare-head h2 { margin: 0; font-size: 14px; font-weight: 650; color: var(--strong); }
  .compare-head a { font-size: 12.5px; text-decoration: none; }
  .compare-pills { display: flex; flex-wrap: wrap; gap: 7px; }
  .compare-pill {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 9px;
    border: 1px solid var(--line); background: var(--panel); color: var(--fg); text-decoration: none; font-size: 12.5px; font-weight: 550;
  }
  .compare-pill:hover { border-color: var(--accent); color: var(--strong); }
  .compare-pill .cnt { font-size: 11px; color: var(--accent); background: var(--accent-bg); border-radius: 999px; padding: 1px 6px; font-weight: 600; }
  .browse-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .browse-filters button {
    font: inherit; font-size: 12px; padding: 5px 9px; border-radius: 7px;
    border: 1px solid var(--line); background: var(--panel2); color: var(--fg); cursor: pointer;
  }
  .browse-filters button:hover { border-color: var(--accent); }
  .browse-filters button[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); font-weight: 600; }
  .browse-filters button span { color: var(--muted); margin-inline-start: 3px; }
  .browse-count { color: var(--muted); font-size: 12.5px; margin: 10px 0 10px; }
  .browse-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 248px), 1fr)); gap: 14px; }
  .browse-grid [hidden] { display: none !important; }
  .browse-card {
    display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--line);
    border-radius: 11px; background: var(--panel); color: var(--fg); text-decoration: none; overflow: clip;
    transition: border-color .14s ease, transform .14s ease;
  }
  .browse-card:hover, .browse-card:focus-within { border-color: var(--accent); transform: translateY(-1px); }
  .browse-visual {
    display: grid; place-items: center; position: relative; isolation: isolate; aspect-ratio: 16 / 10;
    width: 100%; border-bottom: 1px solid var(--line); background: var(--panel2); color: var(--muted);
  }
  .browse-visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .browse-visual:has(img:not([hidden])) .thumb-fallback { visibility: hidden; }
  .browse-visual img[hidden] { display: none; }
  .thumb-fallback { font-size: 11.5px; padding: 8px; text-align: center; }
  .browse-meta { display: flex; flex-direction: column; gap: 5px; padding: 10px 12px 12px; flex: 1; }
  .browse-meta strong { font-weight: 650; color: var(--strong); font-size: 14px; }
  .browse-meta small, .browse-meta .desc { color: var(--muted); font-size: 12px; }
  .browse-meta .desc { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.45; }
  .card-badges { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; padding-top: 4px; }
  .cbadge { font-size: 10.5px; padding: 1px 7px; border-radius: 999px; border: 1px solid var(--line); background: var(--panel2); color: var(--muted); white-space: nowrap; }
  .cbadge.lib { color: var(--strong); font-weight: 550; }
  .cbadge.live { color: var(--ok-fg); border-color: color-mix(in srgb, var(--ok-fg) 40%, var(--line)); }
  .browse-empty { color: var(--muted); padding: 28px 0; text-align: center; }
  .browse-empty[hidden] { display: none; }
  .hub-pager { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
  .hub-pager[hidden] { display: none; }
  .hub-btn {
    padding: 7px 14px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--panel); color: var(--strong); font: inherit; font-size: 12.5px; font-weight: 550; cursor: pointer; text-decoration: none;
  }
  .hub-btn:hover { border-color: var(--accent); }
`;

/**
 * /components — Unified Component Hub.
 *
 * Default initial render displays the SSR-rendered AI + Slopstrap cards clearly badged with
 * their exact library/stack, PLUS the Generic Cross-Library Spotlight bar and Library Filter chips.
 * Selecting any library chip (shadcn, ReUI, HeroUI, Mantine, daisyUI, HyperUI, Base UI, Chakra, MUI, etc.)
 * or "Compare Generic" switches seamlessly via the cached `/api/components-hub.json` index.
 */
export function unifiedComponentsHtml({
  componentsCatalog,
  hub,
  thumbnailPath = () => null,
  hubUrl = "/api/components-hub.json",
}) {
  const ssrComponents = componentsCatalog?.components ?? [];
  const counts = new Map();
  for (const c of ssrComponents) {
    if (c.category) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }
  const catFilters = [["", ssrComponents.length], ...[...counts].sort(([a], [b]) => a.localeCompare(b))];

  const ssrCards = ssrComponents
    .map((item) => {
      const { slug, title, description, category, breadcrumb, variants = [] } = item;
      const isSlop = slug === "slopstrap";
      const libName = isSlop ? "Slopstrap" : "GradientDeck AI";
      const stack = isSlop ? "HTML + CSS" : "React";
      const styling = isSlop ? "CSS Framework" : "Tailwind + Motion";
      const name = breadcrumb?.split("/").at(-1)?.trim() || title || item.name || slug;
      const thumb = variants.length && thumbnailPath(slug, variants[0].id);
      const search = [name, title, slug, description, category, libName, stack, styling, ...variants.flatMap((v) => [v.name, v.id, v.filename])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return `<a class="browse-card" href="/component/${encodeURIComponent(slug)}" data-ssr="1" data-lib="${isSlop ? "slopstrap" : "gradientdeck"}" data-stack="${esc(stack.toLowerCase())}" data-live="1" data-category="${esc(category || "")}" data-search="${esc(search)}">
      <span class="browse-visual"><span class="thumb-fallback">${esc(libName)}</span>
        ${thumb ? `<img src="${esc(thumb)}" alt="" width="640" height="400" loading="lazy" decoding="async">` : ""}
      </span>
      <span class="browse-meta"><strong>${esc(name)}</strong>
        <small>${esc(categoryLabel(category))}${category ? " · " : ""}${variants.length} ${variants.length === 1 ? "variant" : "variants"}</small>
        ${description ? `<span class="desc">${esc(description)}</span>` : ""}
        <span class="card-badges">
          <span class="cbadge lib">${esc(libName)}</span>
          <span class="cbadge">${esc(stack)}</span>
          <span class="cbadge live">Live</span>
        </span>
      </span>
    </a>`;
    })
    .join("");

  const topConcepts = (hub?.concepts || []).slice(0, 16);
  const conceptPills = topConcepts
    .map((c) => `<a class="compare-pill" href="/components/compare/${encodeURIComponent(c.slug)}">${esc(c.name)} <span class="cnt">${c.libCount} libs</span></a>`)
    .join("");

  const libs = hub?.libraries || [];
  const primaryIds = ["gradientdeck", "shadcn", "reui", "heroui", "mantine", "daisyui", "hyperui", "baseui", "uikit:chakra", "uikit:mui", "uikit:antd", "uikit:primereact", "uikit:ark", "uikit:coss", "uikit:magicui", "uikit:motion", "uikit:openprops"];
  const libById = new Map(libs.map((l) => [l.id, l]));
  const primaryLibs = primaryIds.map((id) => libById.get(id)).filter(Boolean);
  const moreLibs = libs.filter((l) => !primaryIds.includes(l.id));

  const libChips = [
    `<button type="button" class="hub-chip" data-lib="gradientdeck" aria-pressed="true">GradientDeck AI <span>${ssrComponents.length}</span></button>`,
    `<button type="button" class="hub-chip" data-lib="compare" aria-pressed="false">Generic / Compare <span>${hub?.concepts?.length || 0}</span></button>`,
    ...primaryLibs
      .filter((l) => l.id !== "gradientdeck")
      .map((l) => `<button type="button" class="hub-chip" data-lib="${esc(l.id)}" aria-pressed="false">${esc(l.short || l.name)} <span>${l.count}</span></button>`),
  ].join("");

  const moreSelect = moreLibs.length
    ? `<select id="hub-more-lib" class="hub-select" aria-label="More UI kits">
        <option value="">More UI kits (${moreLibs.length})…</option>
        ${moreLibs.map((l) => `<option value="${esc(l.id)}">${esc(l.name)} (${l.count})</option>`).join("")}
      </select>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${themeHead()}
<title>Components — Unified Multi-Library Gallery</title>
<style>${BASE_CSS}${NAV_CSS}${HUB_CSS}</style>
</head>
<body>
${nav("components")}
${componentsSubnav("components", { concepts: hub?.concepts?.length || 0 })}
<main class="hub">
  <h1>Components</h1>
  <p class="hub-lead">Browse <strong>${hub?.totals?.items || ssrComponents.length}</strong> components across <strong>${hub?.totals?.libraries || 1}</strong> offline libraries. Filter by a specific library (shadcn/ui, ReUI, HeroUI, Mantine, daisyUI, GradientDeck AI, Chakra, MUI…) or pick a generic component to compare implementations side by side.</p>

  ${conceptPills ? `<section class="compare-strip" id="compare-strip" aria-label="Compare generic components across libraries">
    <div class="compare-head">
      <h2>Compare Generic Components Across Libraries</h2>
      <a href="/components/compare">View all ${hub?.concepts?.length || 0} cross-library components →</a>
    </div>
    <div class="compare-pills">${conceptPills}</div>
  </section>` : ""}

  <section class="hub-panel" aria-label="Filter components">
    <div class="hub-row">
      <input id="browse-query" class="hub-search" type="search" placeholder="Search components (button, dialog, voice orb, table...)" aria-label="Search components" autocomplete="off">
      <div class="hub-row" role="group" aria-label="Stack filter">
        <button type="button" class="hub-chip" data-stack="" aria-pressed="true">All stacks</button>
        <button type="button" class="hub-chip" data-stack="live" aria-pressed="false">Live Preview</button>
        <button type="button" class="hub-chip" data-stack="react" aria-pressed="false">React</button>
        <button type="button" class="hub-chip" data-stack="html" aria-pressed="false">HTML + CSS</button>
        <button type="button" class="hub-chip" data-stack="headless" aria-pressed="false">Headless</button>
      </div>
    </div>
    <div class="hub-row" role="group" aria-label="Library filter">
      <span class="hub-label">Library</span>
      ${libChips}
      ${moreSelect}
    </div>
  </section>

  <div id="hub-lib-banner" class="hub-lib-banner" hidden>
    <span id="hub-lib-desc"></span>
    <a id="hub-lib-link" href="#">Open full library view →</a>
  </div>

  <div id="browse-filters" class="browse-filters" role="group" aria-label="Categories">
    ${catFilters.map(([cat, cnt]) => `<button type="button" data-filter="${esc(cat)}" aria-pressed="${!cat}">${cat ? esc(categoryLabel(cat)) : "All"} <span>${cnt}</span></button>`).join("")}
  </div>

  <p id="browse-count" class="browse-count" role="status">${ssrComponents.length} components</p>
  <div id="browse-grid" class="browse-grid">${ssrCards}</div>
  <p id="browse-empty" class="browse-empty"${ssrComponents.length ? " hidden" : ""}>No matching components.</p>
  <div id="hub-pager" class="hub-pager" hidden>
    <button type="button" id="hub-more" class="hub-btn">Show more</button>
  </div>
</main>
<script>
(function(){
  var HUB_URL = ${JSON.stringify(hubUrl)};
  var query = document.getElementById('browse-query');
  var filtersWrap = document.getElementById('browse-filters');
  var grid = document.getElementById('browse-grid');
  var countEl = document.getElementById('browse-count');
  var emptyEl = document.getElementById('browse-empty');
  var bannerEl = document.getElementById('hub-lib-banner');
  var bannerDesc = document.getElementById('hub-lib-desc');
  var bannerLink = document.getElementById('hub-lib-link');
  var moreSelect = document.getElementById('hub-more-lib');
  var pagerEl = document.getElementById('hub-pager');
  var moreBtn = document.getElementById('hub-more');
  var compareStrip = document.getElementById('compare-strip');

  var ssrCards = [...grid.querySelectorAll('.browse-card[data-ssr]')];
  var ssrFiltersHtml = filtersWrap.innerHTML;

  var activeLib = 'gradientdeck';
  var activeStack = '';
  var activeCat = '';
  var hubData = null;
  var dynamicShown = 72;
  var currentDynamicList = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function capLabel(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function wireCategoryButtons() {
    var btns = [...filtersWrap.querySelectorAll('[data-filter]')];
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeCat = btn.dataset.filter;
        btns.forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
        if (activeLib === 'gradientdeck') filterSsr();
        else renderDynamic(true);
      });
    });
  }

  function filterSsr() {
    var terms = query.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    var shown = 0;
    for (var i = 0; i < ssrCards.length; i++) {
      var card = ssrCards[i];
      var catOk = !activeCat || card.dataset.category === activeCat;
      var stackOk = !activeStack ||
        (activeStack === 'live' && card.dataset.live === '1') ||
        (activeStack === 'react' && card.dataset.stack.indexOf('react') >= 0) ||
        (activeStack === 'html' && card.dataset.stack.indexOf('html') >= 0) ||
        (activeStack === 'headless' && false);
      var qOk = terms.every(function(t){ return card.dataset.search.indexOf(t) >= 0; });
      var hit = catOk && stackOk && qOk;
      card.hidden = !hit;
      if (hit) shown++;
    }
    countEl.textContent = (shown === ssrCards.length ? shown : shown + ' of ' + ssrCards.length) + ' components';
    emptyEl.hidden = shown > 0;
    pagerEl.hidden = true;
  }

  function buildDynamicCategories(list) {
    var map = new Map();
    for (var i = 0; i < list.length; i++) {
      var c = list[i].category || '';
      if (c) map.set(c, (map.get(c) || 0) + 1);
    }
    var pairs = [['', list.length]].concat([...map.entries()].sort(function(a,b){ return a[0].localeCompare(b[0]); }));
    filtersWrap.innerHTML = pairs.map(function(p){
      return '<button type="button" data-filter="' + esc(p[0]) + '" aria-pressed="' + String(p[0] === activeCat) + '">' +
        (p[0] ? esc(capLabel(p[0])) : 'All') + ' <span>' + p[1] + '</span></button>';
    }).join('');
    wireCategoryButtons();
  }

  function renderDynamicCard(it) {
    if (activeLib === 'compare') {
      var libs = (it.implementations || []).slice(0, 5).map(function(im){
        return '<span class="cbadge' + (im.previewable ? ' live' : '') + '">' + esc(im.libName) + '</span>';
      }).join('');
      var extra = (it.implementations || []).length > 5 ? '<span class="cbadge">+' + (it.implementations.length - 5) + '</span>' : '';
      return '<a class="browse-card" href="/components/compare/' + encodeURIComponent(it.slug) + '">' +
        '<span class="browse-meta"><strong>' + esc(it.name) + '</strong>' +
          '<small>' + esc(it.category) + ' · ' + it.libCount + ' libraries (' + it.liveCount + ' live)</small>' +
          '<span class="card-badges">' + libs + extra + '</span>' +
        '</span></a>';
    }
    var visual = it.thumb
      ? '<span class="browse-visual"><span class="thumb-fallback">' + esc(it.libName) + '</span><img src="' + esc(it.thumb) + '" alt="" loading="lazy" decoding="async" onerror="this.hidden=true"></span>'
      : '';
    return '<a class="browse-card" href="' + esc(it.href) + '">' +
      visual +
      '<span class="browse-meta"><strong>' + esc(it.name) + '</strong>' +
        '<small>' + esc(it.category || '') + (it.variantCount > 1 ? ' · ' + it.variantCount + ' variants' : '') + '</small>' +
        (it.desc ? '<span class="desc">' + esc(it.desc) + '</span>' : '') +
        '<span class="card-badges">' +
          '<span class="cbadge lib">' + esc(it.libName) + '</span>' +
          '<span class="cbadge">' + esc(it.stack) + '</span>' +
          (it.previewable ? '<span class="cbadge live">Live</span>' : '<span class="cbadge">Docs</span>') +
        '</span>' +
      '</span></a>';
  }

  function renderDynamic(resetPage) {
    if (!hubData) return;
    if (resetPage) dynamicShown = 72;
    var terms = query.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    var pool = activeLib === 'compare'
      ? (hubData.concepts || [])
      : (hubData.items || []).filter(function(it){ return it.lib === activeLib; });

    var list = pool.filter(function(it) {
      if (activeCat && (it.category || '') !== activeCat) return false;
      if (activeStack) {
        if (activeLib === 'compare') {
          if (activeStack === 'live' && !(it.liveCount > 0)) return false;
        } else {
          var st = String(it.stack || '').toLowerCase() + ' ' + String(it.styling || '').toLowerCase();
          if (activeStack === 'live' && !it.previewable) return false;
          if (activeStack === 'react' && st.indexOf('react') < 0) return false;
          if (activeStack === 'html' && st.indexOf('html') < 0 && st.indexOf('css') < 0) return false;
          if (activeStack === 'headless' && st.indexOf('headless') < 0) return false;
        }
      }
      if (terms.length) {
        var hay = activeLib === 'compare'
          ? (it.name + ' ' + it.slug + ' ' + it.category + ' ' + (it.implementations || []).map(function(x){ return x.libName; }).join(' ')).toLowerCase()
          : (it.name + ' ' + it.slug + ' ' + (it.category || '') + ' ' + (it.desc || '') + ' ' + it.libName + ' ' + it.stack + ' ' + it.styling).toLowerCase();
        for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return false;
      }
      return true;
    });

    currentDynamicList = list;
    grid.innerHTML = list.slice(0, dynamicShown).map(renderDynamicCard).join('');
    countEl.textContent = list.length + (activeLib === 'compare' ? ' generic components' : ' components');
    emptyEl.hidden = list.length > 0;
    pagerEl.hidden = list.length <= dynamicShown;
    if (list.length > dynamicShown) {
      moreBtn.textContent = 'Show more (' + (list.length - dynamicShown) + ' remaining)';
    }
  }

  function ensureHub(cb) {
    if (hubData) return cb();
    countEl.textContent = 'Loading multi-library catalog…';
    fetch(HUB_URL).then(function(r){ return r.json(); }).then(function(d){
      hubData = d;
      cb();
    }).catch(function(err){
      countEl.textContent = 'Failed to load library catalog: ' + err.message;
    });
  }

  function syncUrl() {
    var sp = new URLSearchParams();
    if (activeLib && activeLib !== 'gradientdeck') sp.set('lib', activeLib);
    if (activeStack) sp.set('stack', activeStack);
    if (query.value.trim()) sp.set('q', query.value.trim());
    var qs = sp.toString();
    try { history.replaceState(null, '', qs ? '?' + qs : location.pathname); } catch (e) {}
  }

  function setLibrary(lib) {
    activeLib = lib || 'gradientdeck';
    activeCat = '';
    document.querySelectorAll('[data-lib]').forEach(function(b){
      b.setAttribute('aria-pressed', String(b.dataset.lib === activeLib));
    });
    if (moreSelect) moreSelect.value = moreSelect.querySelector('option[value="' + activeLib + '"]') ? activeLib : '';
    syncUrl();

    if (activeLib === 'gradientdeck') {
      bannerEl.hidden = true;
      if (compareStrip) compareStrip.hidden = false;
      grid.replaceChildren.apply(grid, ssrCards);
      filtersWrap.innerHTML = ssrFiltersHtml;
      wireCategoryButtons();
      filterSsr();
      return;
    }

    if (compareStrip) compareStrip.hidden = activeLib === 'compare';
    ensureHub(function() {
      if (activeLib === 'compare') {
        bannerEl.hidden = false;
        bannerDesc.innerHTML = '<strong>Cross-Library Generic Components</strong> — click any component to compare live previews &amp; docs across libraries.';
        bannerLink.href = '/components/compare';
        bannerLink.textContent = 'Full comparison directory →';
        buildDynamicCategories(hubData.concepts || []);
      } else {
        var meta = (hubData.libraries || []).find(function(l){ return l.id === activeLib; });
        bannerEl.hidden = !meta;
        if (meta) {
          bannerDesc.innerHTML = '<strong>' + esc(meta.name) + '</strong> · ' + esc(meta.stack) + ' · ' + esc(meta.styling) + ' — ' + esc(meta.summary || '');
          bannerLink.href = meta.href;
          bannerLink.textContent = 'Open dedicated ' + meta.name + ' explorer →';
        }
        buildDynamicCategories((hubData.items || []).filter(function(it){ return it.lib === activeLib; }));
      }
      renderDynamic(true);
    });
  }

  document.querySelectorAll('[data-lib]').forEach(function(btn){
    btn.addEventListener('click', function(){ setLibrary(btn.dataset.lib); });
  });
  if (moreSelect) {
    moreSelect.addEventListener('change', function(){
      if (moreSelect.value) setLibrary(moreSelect.value);
    });
  }
  document.querySelectorAll('[data-stack]').forEach(function(btn){
    btn.addEventListener('click', function(){
      activeStack = btn.dataset.stack;
      document.querySelectorAll('[data-stack]').forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
      syncUrl();
      if (activeLib === 'gradientdeck') filterSsr();
      else renderDynamic(true);
    });
  });
  query.addEventListener('input', function(){
    syncUrl();
    if (activeLib === 'gradientdeck') filterSsr();
    else renderDynamic(true);
  });
  moreBtn.addEventListener('click', function(){
    dynamicShown += 72;
    grid.innerHTML = currentDynamicList.slice(0, dynamicShown).map(renderDynamicCard).join('');
    pagerEl.hidden = currentDynamicList.length <= dynamicShown;
    if (currentDynamicList.length > dynamicShown) {
      moreBtn.textContent = 'Show more (' + (currentDynamicList.length - dynamicShown) + ' remaining)';
    }
  });
  grid.addEventListener('error', function(e){
    if (e.target instanceof HTMLImageElement) e.target.hidden = true;
  }, true);

  wireCategoryButtons();
  var sp = new URLSearchParams(location.search);
  if (sp.get('q')) query.value = sp.get('q');
  if (sp.get('stack')) {
    activeStack = sp.get('stack');
    document.querySelectorAll('[data-stack]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.stack === activeStack)); });
  }
  if (sp.get('lib') && sp.get('lib') !== 'gradientdeck') {
    setLibrary(sp.get('lib'));
  } else {
    filterSsr();
  }
})();
</script>
</body>
</html>`;
}

/**
 * /components/compare — Full cross-library generic component directory.
 */
export function compareIndexHtml(hub) {
  const concepts = hub?.concepts || [];
  const categories = [...new Set(concepts.map((c) => c.category))].sort();
  const libNames = [...new Set(concepts.flatMap((c) => c.implementations.map((i) => i.libName)))].sort();

  const cards = concepts
    .map((c) => {
      const libs = c.implementations
        .map((im) => `<span class="cbadge${im.previewable ? " live" : ""}">${esc(im.libName)}</span>`)
        .join("");
      const search = [c.name, c.slug, c.category, ...c.implementations.map((i) => i.libName)].join(" ").toLowerCase();
      const libList = c.implementations.map((i) => i.libName).join("|");
      return `<a class="browse-card" href="/components/compare/${encodeURIComponent(c.slug)}" data-cat="${esc(c.category)}" data-libs="${esc(libList)}" data-search="${esc(search)}">
        <span class="browse-meta">
          <strong>${esc(c.name)}</strong>
          <small>${esc(c.category)} · ${c.libCount} libraries · ${c.liveCount} live preview${c.liveCount === 1 ? "" : "s"}</small>
          <span class="card-badges">${libs}</span>
        </span>
      </a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${themeHead()}
<title>Compare Generic Components Across Libraries</title>
<style>${BASE_CSS}${NAV_CSS}${HUB_CSS}</style>
</head>
<body>
${nav("components")}
${componentsSubnav("compare", { concepts: concepts.length })}
<main class="hub">
  <h1>Compare Components Across Libraries</h1>
  <p class="hub-lead">Pick a generic UI primitive to inspect and switch between implementations across shadcn/ui, ReUI, HeroUI v3, Mantine, daisyUI, HyperUI, Base UI, Chakra UI, Material UI, Ant Design, PrimeReact, Ark UI, and coss ui.</p>

  <section class="hub-panel">
    <div class="hub-row">
      <input id="cmp-q" class="hub-search" type="search" placeholder="Filter generic components (button, dialog, table, tabs...)" aria-label="Filter generic components" autocomplete="off">
      <select id="cmp-lib" class="hub-select" aria-label="Require library">
        <option value="">Any library</option>
        ${libNames.map((n) => `<option value="${esc(n)}">Includes ${esc(n)}</option>`).join("")}
      </select>
    </div>
    <div class="hub-row" role="group" aria-label="Category">
      <button type="button" class="hub-chip" data-cat="" aria-pressed="true">All <span>${concepts.length}</span></button>
      ${categories.map((cat) => `<button type="button" class="hub-chip" data-cat="${esc(cat)}" aria-pressed="false">${esc(cat)} <span>${concepts.filter((c) => c.category === cat).length}</span></button>`).join("")}
    </div>
  </section>

  <p id="cmp-count" class="browse-count" role="status">${concepts.length} generic components</p>
  <div class="browse-grid">${cards}</div>
  <p id="cmp-empty" class="browse-empty" hidden>No generic components match that filter.</p>
</main>
<script>
(function(){
  var q = document.getElementById('cmp-q');
  var lib = document.getElementById('cmp-lib');
  var btns = [...document.querySelectorAll('[data-cat]')];
  var cards = [...document.querySelectorAll('.browse-grid .browse-card')];
  var countEl = document.getElementById('cmp-count');
  var emptyEl = document.getElementById('cmp-empty');
  var cat = '';
  function apply() {
    var terms = q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
    var reqLib = lib.value;
    var n = 0;
    cards.forEach(function(card){
      var hit = (!cat || card.dataset.cat === cat) &&
        (!reqLib || card.dataset.libs.split('|').indexOf(reqLib) >= 0) &&
        terms.every(function(t){ return card.dataset.search.indexOf(t) >= 0; });
      card.hidden = !hit;
      if (hit) n++;
    });
    countEl.textContent = (n === cards.length ? n : n + ' of ' + cards.length) + ' generic components';
    emptyEl.hidden = n > 0;
  }
  q.addEventListener('input', apply);
  lib.addEventListener('change', apply);
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      cat = b.dataset.cat;
      btns.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
  });
})();
</script>
</body>
</html>`;
}

/**
 * /components/compare/:slug — Cross-library comparator for a single generic component.
 */
export function compareConceptHtml(concept, hub) {
  const impls = concept.implementations || [];
  const tabs = impls
    .map((im, i) => `<button type="button" role="tab" class="cmp-tab" data-i="${i}" aria-selected="${i === 0}">
      ${esc(im.libName)}
      <span class="cmp-dot${im.previewable ? " live" : ""}">${im.previewable ? "Live" : "Docs"}</span>
    </button>`)
    .join("");

  const daisyThemes = impls.find((im) => im.lib === "daisyui")?.themes || [];
  const related = (hub?.concepts || [])
    .filter((c) => c.category === concept.category && c.slug !== concept.slug)
    .slice(0, 8)
    .map((c) => `<a class="compare-pill" href="/components/compare/${encodeURIComponent(c.slug)}">${esc(c.name)} <span class="cnt">${c.libCount}</span></a>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${themeHead()}
<title>${esc(concept.name)} — Compare Across ${impls.length} Libraries</title>
<style>
${BASE_CSS}${NAV_CSS}${HUB_CSS}
.cmp-wrap { max-width: 1260px; margin: 0 auto; padding: 22px clamp(14px, 3vw, 32px) 72px; }
.cmp-crumb { font-size: 12.5px; color: var(--muted); margin-bottom: 8px; }
.cmp-crumb a { color: var(--muted); text-decoration: none; }
.cmp-crumb a:hover { color: var(--strong); }
.cmp-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 16px 0 14px; }
.cmp-tab {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 9px;
  border: 1px solid var(--line); background: var(--panel); color: var(--fg); font: inherit; font-size: 13px; font-weight: 550; cursor: pointer;
}
.cmp-tab:hover { border-color: var(--accent); }
.cmp-tab[aria-selected="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); }
.cmp-dot { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--panel2); color: var(--muted); border: 1px solid var(--line); }
.cmp-dot.live { color: var(--ok-fg); border-color: color-mix(in srgb, var(--ok-fg) 40%, var(--line)); }
.cmp-stage { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.cmp-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--panel2);
}
.cmp-bar-left { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.cmp-bar-left strong { font-size: 15px; color: var(--strong); }
.cmp-bar-right { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.cmp-vp { display: inline-flex; gap: 4px; }
.cmp-vp button {
  padding: 4px 9px; border-radius: 6px; border: 1px solid var(--line); background: var(--panel);
  color: var(--fg); font: inherit; font-size: 12px; cursor: pointer;
}
.cmp-vp button[aria-pressed="true"] { background: var(--accent-bg); border-color: var(--accent-line); color: var(--strong); font-weight: 600; }
.cmp-frame-host { display: flex; justify-content: center; padding: 14px; background: var(--bg); min-height: 200px; }
.cmp-frame-host iframe { width: 100%; max-width: 100%; height: 340px; border: 1px solid var(--line); border-radius: 8px; background: #fff; transition: width .2s ease; }
.cmp-docs-box { padding: 28px 24px; max-width: 720px; }
.cmp-docs-box h2 { margin: 0 0 8px; font-size: 17px; color: var(--strong); }
.cmp-docs-box p { margin: 0 0 14px; color: var(--muted); font-size: 13.5px; line-height: 1.6; }
.cmp-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.cmp-primary {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 8px;
  background: var(--accent); color: var(--accent-ink); text-decoration: none; font-size: 12.5px; font-weight: 600;
}
.cmp-related { margin-top: 28px; }
.cmp-related h2 { margin: 0 0 10px; font-size: 14px; color: var(--strong); }
</style>
</head>
<body>
${nav("components")}
${componentsSubnav("compare", { concepts: hub?.concepts?.length || 0 })}
<main class="cmp-wrap">
  <div class="cmp-crumb"><a href="/components">Components</a> / <a href="/components/compare">Compare</a> / ${esc(concept.category)}</div>
  <h1>${esc(concept.name)}</h1>
  <p class="hub-lead">Implemented across <strong>${impls.length}</strong> offline libraries (${concept.liveCount} with live interactive previews). Pick a library below to inspect its rendering, stack, and full source.</p>

  <div class="cmp-tabs" role="tablist" aria-label="Library implementations">${tabs}</div>

  <section class="cmp-stage" aria-live="polite">
    <div class="cmp-bar">
      <div class="cmp-bar-left">
        <strong id="cmp-lib-title"></strong>
        <span id="cmp-stack" class="cbadge"></span>
        <span id="cmp-styling" class="cbadge"></span>
        <span id="cmp-variants" class="cbadge"></span>
      </div>
      <div class="cmp-bar-right">
        <select id="cmp-daisy-theme" class="hub-select" hidden aria-label="daisyUI theme">
          ${daisyThemes.map((t) => `<option value="${esc(t)}">Theme: ${esc(t)}</option>`).join("")}
        </select>
        <div id="cmp-heroui-theme" class="cmp-vp" hidden>
          <button type="button" data-ht="light" aria-pressed="true">Light</button>
          <button type="button" data-ht="dark" aria-pressed="false">Dark</button>
        </div>
        <div id="cmp-vp" class="cmp-vp" role="group" aria-label="Preview viewport">
          <button type="button" data-w="100%" aria-pressed="true">Desktop</button>
          <button type="button" data-w="768px" aria-pressed="false">Tablet</button>
          <button type="button" data-w="375px" aria-pressed="false">Mobile</button>
        </div>
        <button type="button" id="cmp-mcp-btn" class="mcp-send-btn" data-mcp-ref="" data-mcp-label="">+ Send to MCP</button>
        <a id="cmp-open-lib" class="cmp-primary" href="#">Open full library page →</a>
      </div>
    </div>
    <div id="cmp-stage-body" class="cmp-frame-host"></div>
  </section>

  ${related ? `<section class="cmp-related"><h2>More ${esc(concept.category)} components</h2><div class="compare-pills">${related}</div></section>` : ""}
</main>
<script>
(function(){
  var IMPLS = ${JSON.stringify(impls)};
  var tabs = [...document.querySelectorAll('.cmp-tab')];
  var titleEl = document.getElementById('cmp-lib-title');
  var stackEl = document.getElementById('cmp-stack');
  var stylingEl = document.getElementById('cmp-styling');
  var variantsEl = document.getElementById('cmp-variants');
  var openLibEl = document.getElementById('cmp-open-lib');
  var mcpBtnEl = document.getElementById('cmp-mcp-btn');
  var stageBody = document.getElementById('cmp-stage-body');
  var vpWrap = document.getElementById('cmp-vp');
  var daisyThemeEl = document.getElementById('cmp-daisy-theme');
  var heroThemeWrap = document.getElementById('cmp-heroui-theme');

  var currentIdx = 0;
  var currentWidth = '100%';
  var currentHeroTheme = 'light';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function implMcpRef(im) {
    if (!im) return '';
    if (im.lib === 'heroui') return 'designer:heroui:' + im.slug;
    if (im.lib === 'mantine') return 'designer:mantine:' + im.slug;
    if (im.lib === 'daisyui') return 'designer:daisyui:' + im.slug + (daisyThemeEl.value ? '?theme=' + daisyThemeEl.value : '');
    if (im.lib === 'baseui') return 'designer:baseui:' + im.slug;
    if (im.lib === 'reui') return 'designer:reui:' + im.slug;
    if (im.lib === 'gradientdeck') return 'designer:component:' + im.slug;
    if (im.lib && im.lib.indexOf('uikit:') === 0) return 'designer:uikit:' + im.lib.slice(6) + ':' + im.slug;
    return 'designer:compare:' + ${JSON.stringify(concept.slug)};
  }

  function renderImpl(idx) {
    currentIdx = idx;
    var im = IMPLS[idx];
    if (!im) return;
    tabs.forEach(function(t, i){ t.setAttribute('aria-selected', String(i === idx)); });
    titleEl.textContent = im.libName + ' — ' + im.name;
    stackEl.textContent = im.stack;
    stylingEl.textContent = im.styling;
    variantsEl.textContent = (im.variantCount || 1) + (im.variantCount === 1 ? ' item' : ' variants / files');
    openLibEl.href = im.href;
    if (mcpBtnEl) {
      var ref = implMcpRef(im);
      mcpBtnEl.setAttribute('data-mcp-ref', ref);
      mcpBtnEl.setAttribute('data-mcp-label', im.libName + ' — ' + im.name);
      mcpBtnEl.title = 'Send ' + ref + ' to MCP';
      if (window.DesignerMCP) window.DesignerMCP.syncButtons();
    }

    daisyThemeEl.hidden = im.lib !== 'daisyui' || !im.previewable;
    heroThemeWrap.hidden = im.lib !== 'heroui' || !im.previewable;
    vpWrap.hidden = !im.previewable;

    if (im.previewable && im.previewUrl) {
      var src = im.previewUrl;
      if (im.lib === 'daisyui' && daisyThemeEl.value) src += '?theme=' + encodeURIComponent(daisyThemeEl.value);
      if (im.lib === 'heroui') src += '?theme=' + encodeURIComponent(currentHeroTheme);
      var frame = document.createElement('iframe');
      frame.src = src;
      frame.title = im.libName + ' ' + im.name + ' preview';
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.style.width = currentWidth;
      if (im.lib === 'heroui' && currentHeroTheme === 'dark') frame.style.background = '#0d0f12';
      stageBody.replaceChildren(frame);
    } else {
      var reuiPeer = IMPLS.find(function(x){ return x.lib === 'reui'; });
      stageBody.innerHTML = '<div class="cmp-docs-box">' +
        '<h2>' + esc(im.libName) + ' · ' + esc(im.name) + '</h2>' +
        '<p>' + esc(im.desc || (im.libName + ' provides offline documentation and component source files for ' + im.name + '.')) + '</p>' +
        '<div class="cmp-actions">' +
          '<a class="cmp-primary" href="' + esc(im.href) + '">Open offline docs &amp; source →</a>' +
          (im.lib === 'baseui' && reuiPeer ? '<a class="hub-btn" href="' + esc(reuiPeer.href) + '">See live Base UI render in ReUI →</a>' : '') +
        '</div>' +
      '</div>';
    }
  }

  tabs.forEach(function(t){ t.addEventListener('click', function(){ renderImpl(Number(t.dataset.i)); }); });
  vpWrap.querySelectorAll('button').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentWidth = btn.dataset.w;
      vpWrap.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
      var f = stageBody.querySelector('iframe');
      if (f) f.style.width = currentWidth;
    });
  });
  daisyThemeEl.addEventListener('change', function(){ renderImpl(currentIdx); });
  heroThemeWrap.querySelectorAll('button').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentHeroTheme = btn.dataset.ht;
      heroThemeWrap.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b === btn)); });
      renderImpl(currentIdx);
    });
  });
  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d || d.source !== 'design-preview' || d.type !== 'height') return;
    var f = stageBody.querySelector('iframe');
    if (f && f.contentWindow === e.source) {
      f.style.height = Math.max(140, Math.min(680, Math.ceil(d.height) + 24)) + 'px';
    }
  });

  if (IMPLS.length) renderImpl(0);
})();
</script>
</body>
</html>`;
}
