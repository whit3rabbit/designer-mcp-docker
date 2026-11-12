/**
 * ui.mjs — the HTML for the component library, preset, and template galleries.
 *
 * These pages share a nav bar with the design gallery so the sources sit
 * under one roof: designs, components, presets, templates.
 *
 * The gallery renders its pages from the local cache and loads compiled
 * component demos in separate frames.
 */

import { glassCss, glassProperties } from "./liquid-glass.mjs";

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
    ${tab("/tailwind", "Tailwind", "tailwind")}
    ${tab("/presets", "Gradients &amp; Patterns", "presets")}
    ${tab("/templates", "System templates", "templates")}
    ${tab("/assets", "Assets", "assets")}
    <span class="spacer"></span>
    <a class="dl" href="/skill">⬇ Skill</a>
  </nav>`;
}

export const NAV_CSS = `
  .nav { position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:4px;
    background:rgba(13,15,18,.94); backdrop-filter:blur(10px);
    border-bottom:1px solid var(--line); padding:0 16px; height:46px; overflow-x:auto; scrollbar-width:thin; scrollbar-color:var(--line) transparent; }
  .brand { flex:none; white-space:nowrap; font-weight:650; margin-right:14px; letter-spacing:-.01em; color:var(--fg); }
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

export function assetsHtml(manifest) {
  const packages = manifest?.packages ?? [];
  const packageRows = packages.filter(({ group }) => group !== "dependency").map(({ name, version, license, notices, group }) => `<li>
    <strong>${esc(name)}</strong> ${esc(version)} <span>${esc(license)}</span>
    ${group === "deck" ? "<span>Legacy decks</span>" : ""}
    ${notices.map((path) => `<a href="/assets/${manifest.version}/starter/${esc(path)}" download>License</a>`).join(" ")}
  </li>`).join("");
  const fileRows = (manifest?.files ?? []).map(({ path, url }) =>
    `<li><a href="${esc(url)}" download>${esc(path)}</a></li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline frontend assets</title>
<style>
${BASE_CSS}
${NAV_CSS}
main { max-width:820px; padding:20px; }
h1 { font-size:20px; margin:0 0 12px; }
h2 { font-size:15px; margin:24px 0 8px; }
.actions { display:flex; flex-wrap:wrap; gap:10px; }
ul { padding-left:20px; overflow-wrap:anywhere; }
li { padding:3px 0; }
li span { color:var(--muted); margin:0 4px; }
summary { cursor:pointer; }
</style>
</head>
<body>
${nav("assets")}
<main>
<h1>Offline frontend assets</h1>
${manifest ? `
<div class="actions">
  <a class="dl" href="${esc(manifest.archive.url)}" download>Download starter ZIP</a>
  <a class="dl" href="${esc(manifest.starter)}">Open starter example</a>
  <a class="dl" href="/assets/manifest.json">Asset manifest</a>
</div>
<h2>Packages</h2>
<ul>${packageRows}</ul>
<details><summary>Individual files</summary><ul>${fileRows}</ul></details>
` : "<p>Frontend assets are unavailable. Build the frontend to generate the starter pack.</p>"}
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
  .browse button[aria-pressed="true"] { color: var(--fg); background: #262d46; border-color: #5362a1; }
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
<title>${esc(title)}</title>
<style>${BASE_CSS}${NAV_CSS}${BROWSE_CSS}${styles}</style>
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
<title>${esc(group.name)} · ${sourceName}</title>
<style>${BASE_CSS}${NAV_CSS}${BROWSE_CSS}
.example { max-width: 1100px; }
.example h1 { margin-bottom: 12px; }
.example iframe { display: block; width: 100%; height: clamp(280px, 57vh, 540px); border: 1px solid var(--line);
  border-radius: 10px; background: white; }
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
  <iframe sandbox="allow-scripts" src="${esc(example.preview)}" title="${esc(group.name)} preview"></iframe>
  <details><summary>${source === "hyperui" ? "HTML source" : "React source"}</summary>
    <div class="source-actions"><button type="button" id="copy-example">Copy source</button>
      <a href="${esc(example.download)}" download>Download source</a><span id="copy-status" role="status"></span></div>
    <pre><code id="example-code">${esc(example.code)}</code></pre>
  </details>
</main>
<script>
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
  .preview { margin-bottom:16px; }
  .preview h2 { font-size:14px; margin:0 0 6px; }
  .preview iframe { width:100%; height:clamp(320px, 60vh, 640px); border:1px solid var(--line);
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
  <section class="preview" aria-labelledby="preview-heading"${variants.length ? "" : " hidden"}>
    <h2 id="preview-heading">Preview</h2>
    <div id="preview-slot"></div>
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
}
tabs.forEach(t => t.addEventListener('click', () => selectVariant(t)));
if (tabs.length) selectVariant(tabs[0]);
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
    dialog: `<dialog class="catalog-dialog" aria-labelledby="preset-title">
      <header><h2 id="preset-title"></h2><button type="button" id="preset-close" autofocus>Close</button></header>
      ${glass ? '<p class="glass-description" id="preset-description" hidden></p>' : ""}
      <div class="browse-visual${glass ? " glass-scene" : ""}"><span class="${glass ? "liquid-glass glass-sample" : "swatch"}" id="preset-swatch"></span></div>
      ${glass ? '<label class="glass-compare"><input id="preset-effect" type="checkbox" checked> Show effect</label>' : ""}
      <pre><code id="preset-code"></code></pre>
      <footer><button type="button" id="preset-copy">${glass ? "Copy CSS" : "Copy code"}</button><span id="preset-status" role="status"></span></footer>
    </dialog>`,
    script: `
const dialog = document.querySelector('.catalog-dialog');
const code = document.querySelector('#preset-code');
const swatch = document.querySelector('#preset-swatch');
const copy = document.querySelector('#preset-copy');
const status = document.querySelector('#preset-status');
const effect = document.querySelector('#preset-effect');
const description = document.querySelector('#preset-description');
effect?.addEventListener('change', () => { swatch.hidden = !effect.checked; });
for (const card of cards) card.addEventListener('click', () => {
  document.querySelector('#preset-title').textContent = card.querySelector('strong').textContent;
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
<title>System templates — ${total} design systems</title>
<style>
${BASE_CSS}
${NAV_CSS}
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
<div class="count">Vendored starting points: copy one whole and build on its tokens. The MCP exposes these as design_template_* tools plus design_manifest_template.</div>
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
<title>${esc(record?.name || record?.slug)} — System templates</title>
<style>
${BASE_CSS}
${NAV_CSS}
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
    font-family:ui-monospace, SFMono-Regular, Menlo, monospace; color:#d7dbe3; }
</style>
</head>
<body>
${nav("templates")}
<div class="wrap">
  <a class="back" href="/templates">← All templates</a>
  <h1>${esc(record?.name || record?.slug)}</h1>
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
document.querySelectorAll('.template-preview').forEach(button => {
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = button.dataset.name + ' preview';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.src = button.dataset.preview;
    slot.replaceChildren(frame);
    frame.scrollIntoView({ block: 'nearest' });
  });
});
</script>
</body>
</html>`;
}
