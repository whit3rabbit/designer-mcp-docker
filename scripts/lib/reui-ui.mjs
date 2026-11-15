/**
 * reui-ui.mjs — ReUI component library gallery HTML (similar to reui.io/components).
 *
 * Serves two views:
 *   - /reui            Overview of all 87 categories with sidebar + screenshot cards
 *   - /reui/:category  Live interactive component grid + slide-over Radix/Base code sheet
 */

import { BASE_CSS, NAV_CSS, nav } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const REUI_CSS = `
  .reui-shell { display: flex; min-height: calc(100vh - 46px); }
  .reui-sidebar {
    width: 248px; flex: none; position: sticky; top: 46px; height: calc(100vh - 46px);
    overflow-y: auto; border-right: 1px solid var(--line); background: var(--bg);
    padding: 12px 10px 24px; scrollbar-width: thin; scrollbar-color: var(--line) transparent;
  }
  .reui-side-search {
    width: 100%; background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 7px; padding: 6px 9px; font: inherit; font-size: 12px; margin-bottom: 10px;
  }
  .reui-side-label {
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); padding: 6px 8px 4px;
  }
  .reui-side-link {
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
    padding: 5px 8px; border-radius: 6px; text-decoration: none; color: var(--muted);
    font-size: 12.5px; line-height: 1.35;
  }
  .reui-side-link:hover { color: var(--fg); background: var(--panel); }
  .reui-side-link.on { color: var(--fg); background: var(--panel2); font-weight: 600; box-shadow: inset 0 0 0 1px var(--line); }
  .reui-side-link .cnt { font-size: 11px; opacity: .7; font-variant-numeric: tabular-nums; }
  .reui-main { flex: 1; min-width: 0; padding: 22px 28px 64px; max-width: 1380px; }
  .reui-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
  .reui-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .reui-header p { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; max-width: 720px; }
  .reui-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .reui-crumb a { color: var(--muted); text-decoration: none; }
  .reui-crumb a:hover { color: var(--fg); }
  .reui-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    padding: 10px 12px; background: var(--panel); border: 1px solid var(--line);
    border-radius: 10px; margin-bottom: 18px;
  }
  .reui-toolbar input {
    flex: 1 1 220px; min-width: 160px; background: var(--panel2); color: var(--fg);
    border: 1px solid var(--line); border-radius: 7px; padding: 6px 10px; font: inherit; font-size: 13px;
  }
  .reui-seg { display: inline-flex; background: var(--panel2); border: 1px solid var(--line); border-radius: 7px; padding: 2px; gap: 2px; }
  .reui-seg button {
    background: transparent; color: var(--muted); border: 0; border-radius: 5px;
    padding: 4px 9px; font: inherit; font-size: 12px; cursor: pointer;
  }
  .reui-seg button[aria-pressed="true"] { background: #262d46; color: var(--fg); font-weight: 500; }
  .reui-count { font-size: 12px; color: var(--muted); margin-left: auto; font-variant-numeric: tabular-nums; }
  .reui-cat-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;
  }
  .reui-cat-card {
    display: flex; flex-direction: column; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; transition: border-color .15s ease, transform .15s ease;
  }
  .reui-cat-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .reui-cat-shot {
    position: relative; aspect-ratio: 3 / 2; background: #0a0c0f;
    border-bottom: 1px solid var(--line); overflow: hidden;
  }
  .reui-cat-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .reui-cat-meta { padding: 11px 14px 13px; display: flex; flex-direction: column; gap: 4px; }
  .reui-cat-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .reui-cat-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .reui-cat-top span { font-size: 11.5px; color: var(--muted); }
  .reui-cat-desc { font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .reui-comp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .reui-comp-grid.cols-1 { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 960px) {
    .reui-comp-grid { grid-template-columns: minmax(0, 1fr); }
    .reui-sidebar { display: none; }
    .reui-main { padding: 16px; }
  }
  .reui-card {
    display: flex; flex-direction: column; background: var(--panel);
    border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
  }
  .reui-card.full { grid-column: 1 / -1; }
  .reui-frame-wrap {
    position: relative; background: #09090b; min-height: 260px; flex: 1;
    border-bottom: 1px solid var(--line); display: flex;
  }
  .reui-frame-wrap.light { background: #ffffff; }
  .reui-frame-wrap iframe {
    width: 100%; height: 300px; border: 0; display: block; background: transparent;
  }
  .reui-card.full .reui-frame-wrap iframe { height: 380px; }
  .reui-card-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 9px 12px; background: var(--panel); min-height: 44px;
  }
  .reui-card-info { min-width: 0; flex: 1; display: flex; align-items: center; gap: 8px; }
  .reui-card-title { font-size: 12.5px; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .reui-card-id { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; flex: none; }
  .reui-card-actions { display: flex; align-items: center; gap: 6px; flex: none; }
  .reui-btn {
    background: var(--panel2); color: var(--fg); border: 1px solid var(--line);
    border-radius: 6px; padding: 4px 9px; font: inherit; font-size: 12px; cursor: pointer;
    text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
  }
  .reui-btn:hover { border-color: var(--accent); }
  .reui-sheet-backdrop {
    position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.6);
    display: none; justify-content: flex-end;
  }
  .reui-sheet-backdrop.open { display: flex; }
  .reui-sheet {
    width: min(720px, 100vw); height: 100%; background: var(--bg);
    border-left: 1px solid var(--line); display: flex; flex-direction: column;
    box-shadow: -12px 0 40px rgba(0,0,0,.5);
  }
  .reui-sheet-head {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 14px 18px; border-bottom: 1px solid var(--line); background: var(--panel);
  }
  .reui-sheet-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
  .reui-sheet-head p { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
  .reui-sheet-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 10px 18px; border-bottom: 1px solid var(--line); background: var(--panel);
  }
  .reui-sheet-body { flex: 1; overflow: auto; padding: 14px 18px; background: var(--code-bg); }
  .reui-sheet-body pre { margin: 0; font-size: 12.5px; line-height: 1.55; white-space: pre; overflow-x: auto; }
`;

function renderSidebar(categories, activeSlug, total) {
  const links = categories
    .map(
      (c) => `<a class="reui-side-link${c.slug === activeSlug ? " on" : ""}" href="/reui/${encodeURIComponent(c.slug)}" data-cat="${esc(c.label.toLowerCase())} ${esc(c.slug)}">
        <span>${esc(c.label)}</span><span class="cnt">${c.count}</span>
      </a>`,
    )
    .join("");
  return `<aside class="reui-sidebar" aria-label="ReUI categories">
    <input class="reui-side-search" id="reui-side-search" type="search" placeholder="Filter categories…" aria-label="Filter categories">
    <a class="reui-side-link${!activeSlug ? " on" : ""}" href="/reui">
      <span>All Categories</span><span class="cnt">${total}</span>
    </a>
    <div class="reui-side-label">Components (${categories.length})</div>
    <div id="reui-side-list">${links}</div>
  </aside>`;
}

const SIDEBAR_SCRIPT = `
const sideSearch = document.getElementById('reui-side-search');
if (sideSearch) {
  const sideLinks = [...document.querySelectorAll('#reui-side-list .reui-side-link')];
  sideSearch.addEventListener('input', () => {
    const q = sideSearch.value.trim().toLowerCase();
    for (const el of sideLinks) {
      el.style.display = !q || el.dataset.cat.includes(q) ? '' : 'none';
    }
  });
}
`;

export function reuiCatalogHtml(index) {
  const categories = index?.categories ?? [];
  const total = index?.total ?? 0;

  const cards = categories
    .map((c) => {
      const search = [c.label, c.slug, c.description, ...(c.items || []).map((i) => `${i.name} ${i.label} ${i.title}`)].join(" ").toLowerCase();
      return `<a class="reui-cat-card" href="/reui/${encodeURIComponent(c.slug)}" data-search="${esc(search)}">
        <div class="reui-cat-shot">
          <img class="shot-img" data-slug="${esc(c.slug)}" src="/reui/screenshot/${encodeURIComponent(c.slug)}-dark.png" alt="${esc(c.label)}" loading="lazy" decoding="async">
        </div>
        <div class="reui-cat-meta">
          <div class="reui-cat-top">
            <strong>${esc(c.label)}</strong>
            <span>${c.count} ${c.count === 1 ? "component" : "components"}</span>
          </div>
          ${c.description ? `<div class="reui-cat-desc">${esc(c.description)}</div>` : ""}
        </div>
      </a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ReUI Components · Designer</title>
<style>${BASE_CSS}${NAV_CSS}${REUI_CSS}</style>
</head><body>
${nav("reui")}
<div class="reui-shell">
  ${renderSidebar(categories, null, total)}
  <main class="reui-main">
    <div class="reui-header">
      <div>
        <h1>ReUI Components</h1>
        <p>${total} open-source shadcn/ui components across ${categories.length} categories — live interactive previews with Radix UI &amp; Base UI source.</p>
      </div>
    </div>
    <div class="reui-toolbar">
      <input id="reui-search" type="search" placeholder="Search ${categories.length} categories or ${total} components…" aria-label="Search ReUI">
      <div class="reui-seg" role="group" aria-label="Preview theme">
        <button type="button" data-shot-theme="dark" aria-pressed="true">Dark</button>
        <button type="button" data-shot-theme="light" aria-pressed="false">Light</button>
      </div>
      <span class="reui-count" id="reui-count">${categories.length} categories</span>
    </div>
    <div class="reui-cat-grid" id="reui-cat-grid">${cards}</div>
  </main>
</div>
<script>
${SIDEBAR_SCRIPT}
const grid = document.getElementById('reui-cat-grid');
const search = document.getElementById('reui-search');
const count = document.getElementById('reui-count');
const cards = [...grid.querySelectorAll('.reui-cat-card')];
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const match = !q || card.dataset.search.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  }
  count.textContent = visible + ' ' + (visible === 1 ? 'category' : 'categories');
});
const themeBtns = [...document.querySelectorAll('[data-shot-theme]')];
const imgs = [...document.querySelectorAll('.shot-img')];
for (const btn of themeBtns) {
  btn.addEventListener('click', () => {
    const t = btn.dataset.shotTheme;
    for (const b of themeBtns) b.setAttribute('aria-pressed', String(b === btn));
    for (const img of imgs) img.src = '/reui/screenshot/' + encodeURIComponent(img.dataset.slug) + '-' + t + '.png';
  });
}
grid.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.style.display = 'none';
}, true);
</script>
</body></html>`;
}

export function reuiCategoryHtml(index, category, previewPath = () => null) {
  const categories = index?.categories ?? [];
  const total = index?.total ?? 0;
  const items = category?.items ?? [];

  const cards = items
    .map((item, idx) => {
      const full = item.gridSize === 1 ? " full" : "";
      const p = previewPath(category.slug, item.name);
      const desc = item.description || item.title || item.label || item.name;
      const search = `${item.name} ${item.label} ${item.title} ${item.description}`.toLowerCase();
      return `<article class="reui-card${full}" data-index="${idx}" data-search="${esc(search)}">
        <div class="reui-frame-wrap">
          ${p ? `<iframe sandbox="allow-scripts" loading="lazy" data-base-src="${esc(p)}" src="${esc(p)}?theme=dark" title="${esc(desc)}"></iframe>` : `<div style="margin:auto;color:var(--muted);font-size:12px;">Preview not built</div>`}
        </div>
        <div class="reui-card-foot">
          <div class="reui-card-info">
            <span class="reui-card-title" title="${esc(desc)}">${esc(desc)}</span>
            <span class="reui-card-id">${esc(item.name)}</span>
          </div>
          <div class="reui-card-actions">
            <button type="button" class="reui-btn copy-item-btn" data-index="${idx}">Copy</button>
            <button type="button" class="reui-btn view-item-btn" data-index="${idx}">View code</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  const payload = JSON.stringify(
    items.map((item) => ({
      name: item.name,
      label: item.label,
      title: item.title,
      description: item.description,
      radixCode: item.radixCode || "",
      baseCode: item.baseCode || "",
    })),
  ).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(category.label)} · ReUI Components</title>
<style>${BASE_CSS}${NAV_CSS}${REUI_CSS}</style>
</head><body>
${nav("reui")}
<div class="reui-shell">
  ${renderSidebar(categories, category.slug, total)}
  <main class="reui-main">
    <div class="reui-crumb"><a href="/reui">ReUI Components</a> / ${esc(category.label)}</div>
    <div class="reui-header">
      <div>
        <h1>${esc(category.label)}</h1>
        ${category.description ? `<p>${esc(category.description)}</p>` : ""}
      </div>
    </div>
    <div class="reui-toolbar">
      <input id="reui-item-search" type="search" placeholder="Filter ${esc(category.label)} components…" aria-label="Filter components">
      <div class="reui-seg" role="group" aria-label="Grid columns">
        <button type="button" data-cols="2" aria-pressed="true">2 cols</button>
        <button type="button" data-cols="1" aria-pressed="false">1 col</button>
      </div>
      <div class="reui-seg" role="group" aria-label="Preview theme">
        <button type="button" data-theme="dark" aria-pressed="true">Dark</button>
        <button type="button" data-theme="light" aria-pressed="false">Light</button>
      </div>
      <div class="reui-seg" role="group" aria-label="Default library">
        <button type="button" data-base="radix" aria-pressed="true">Radix UI</button>
        <button type="button" data-base="base" aria-pressed="false">Base UI</button>
      </div>
      <span class="reui-count" id="reui-item-count">${items.length} ${items.length === 1 ? "component" : "components"}</span>
    </div>
    <div class="reui-comp-grid" id="reui-comp-grid">${cards}</div>
  </main>
</div>

<div class="reui-sheet-backdrop" id="reui-sheet-backdrop" role="dialog" aria-modal="true" aria-labelledby="reui-sheet-title">
  <div class="reui-sheet">
    <div class="reui-sheet-head">
      <div>
        <h2 id="reui-sheet-title"></h2>
        <p id="reui-sheet-desc"></p>
      </div>
      <button type="button" class="reui-btn" id="reui-sheet-close">Close</button>
    </div>
    <div class="reui-sheet-bar">
      <div class="reui-seg" role="group" aria-label="Code library">
        <button type="button" data-sheet-base="radix" aria-pressed="true">Radix UI</button>
        <button type="button" data-sheet-base="base" aria-pressed="false">Base UI</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span id="reui-sheet-status" style="font-size:12px;color:var(--muted);"></span>
        <button type="button" class="reui-btn" id="reui-sheet-copy">Copy code</button>
        <button type="button" class="reui-btn" id="reui-sheet-dl">Download .tsx</button>
      </div>
    </div>
    <div class="reui-sheet-body"><pre><code id="reui-sheet-code"></code></pre></div>
  </div>
</div>

<script>
${SIDEBAR_SCRIPT}
const REUI_ITEMS = ${payload};
let currentBase = 'radix';
let currentTheme = 'dark';
let activeSheetIndex = -1;

const grid = document.getElementById('reui-comp-grid');
const search = document.getElementById('reui-item-search');
const count = document.getElementById('reui-item-count');
const cards = [...grid.querySelectorAll('.reui-card')];

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const match = !q || card.dataset.search.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  }
  count.textContent = visible + ' ' + (visible === 1 ? 'component' : 'components');
});

const colBtns = [...document.querySelectorAll('[data-cols]')];
for (const btn of colBtns) {
  btn.addEventListener('click', () => {
    for (const b of colBtns) b.setAttribute('aria-pressed', String(b === btn));
    grid.classList.toggle('cols-1', btn.dataset.cols === '1');
  });
}

const themeBtns = [...document.querySelectorAll('[data-theme]')];
const frameWraps = [...document.querySelectorAll('.reui-frame-wrap')];
const frames = [...document.querySelectorAll('.reui-frame-wrap iframe')];
for (const btn of themeBtns) {
  btn.addEventListener('click', () => {
    currentTheme = btn.dataset.theme;
    for (const b of themeBtns) b.setAttribute('aria-pressed', String(b === btn));
    for (const wrap of frameWraps) wrap.classList.toggle('light', currentTheme === 'light');
    for (const f of frames) {
      const baseSrc = f.dataset.baseSrc;
      if (baseSrc) {
        try { f.contentWindow?.postMessage({ type: 'reui-theme', theme: currentTheme }, '*'); } catch {}
        if (!f.dataset.loaded) f.src = baseSrc + '?theme=' + currentTheme;
      }
    }
  });
}
for (const f of frames) {
  f.addEventListener('load', () => {
    f.dataset.loaded = '1';
    try { f.contentWindow?.postMessage({ type: 'reui-theme', theme: currentTheme }, '*'); } catch {}
  });
}

const baseBtns = [...document.querySelectorAll('[data-base]')];
const sheetBaseBtns = [...document.querySelectorAll('[data-sheet-base]')];
function setBase(next) {
  currentBase = next;
  for (const b of baseBtns) b.setAttribute('aria-pressed', String(b.dataset.base === next));
  for (const b of sheetBaseBtns) b.setAttribute('aria-pressed', String(b.dataset.sheetBase === next));
  if (activeSheetIndex >= 0) renderSheetCode();
}
for (const btn of baseBtns) btn.addEventListener('click', () => setBase(btn.dataset.base));
for (const btn of sheetBaseBtns) btn.addEventListener('click', () => setBase(btn.dataset.sheetBase));

function getCode(item) {
  return currentBase === 'base' ? (item.baseCode || item.radixCode) : (item.radixCode || item.baseCode);
}

const backdrop = document.getElementById('reui-sheet-backdrop');
const sheetTitle = document.getElementById('reui-sheet-title');
const sheetDesc = document.getElementById('reui-sheet-desc');
const sheetCode = document.getElementById('reui-sheet-code');
const sheetStatus = document.getElementById('reui-sheet-status');

function renderSheetCode() {
  const item = REUI_ITEMS[activeSheetIndex];
  if (!item) return;
  sheetTitle.textContent = item.name;
  sheetDesc.textContent = item.description || item.title || '';
  sheetCode.textContent = getCode(item);
  sheetStatus.textContent = '';
}

function openSheet(index) {
  activeSheetIndex = index;
  renderSheetCode();
  backdrop.classList.add('open');
}

function closeSheet() {
  backdrop.classList.remove('open');
  activeSheetIndex = -1;
}

document.getElementById('reui-sheet-close').addEventListener('click', closeSheet);
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeSheet(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeSheetIndex >= 0) closeSheet(); });

grid.addEventListener('click', async (e) => {
  const viewBtn = e.target.closest('.view-item-btn');
  if (viewBtn) return openSheet(Number(viewBtn.dataset.index));
  const copyBtn = e.target.closest('.copy-item-btn');
  if (copyBtn) {
    const item = REUI_ITEMS[Number(copyBtn.dataset.index)];
    if (!item) return;
    try {
      await navigator.clipboard.writeText(getCode(item));
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = prev; }, 1200);
    } catch {}
  }
});

document.getElementById('reui-sheet-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(sheetCode.textContent);
    sheetStatus.textContent = 'Copied';
  } catch {
    sheetStatus.textContent = 'Copy failed';
  }
});

document.getElementById('reui-sheet-dl').addEventListener('click', () => {
  const item = REUI_ITEMS[activeSheetIndex];
  if (!item) return;
  const blob = new Blob([sheetCode.textContent], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = item.name + '.tsx';
  a.click();
  URL.revokeObjectURL(a.href);
});
</script>
</body></html>`;
}
