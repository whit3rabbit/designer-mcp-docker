/**
 * kit-ui.mjs — the design-system gallery pages.
 *
 * The catalog is browsed as ONE gallery rather than two: the Agent Kit's
 * design-system spoke is the model for the detail page, and its hub — a
 * searchable grid of covers with tag chips — is the model for the index.
 *
 * A detail page shows the system two ways:
 *
 *   Open Design    the rendered preview — the system as its own tokens
 *                  render it
 *   Claude Design  the same system in Claude's file format: the cover, the
 *                  token tables, the README
 *
 * Both views are served from the local cache as static documents, so the
 * page loads no third-party code, no fonts and no images.
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The page shell.
 *
 * Light by default with a dark scheme for readers who ask for one — the
 * gallery is read for long stretches, so the reader's own preference wins.
 */
export const KIT_CSS = `
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --panel: #fafafa; --panel2: #f0f0f0; --line: #e3e3e3;
    --text: #494949; --strong: #202020; --muted: #6b6b6b; --chip: #ededed;
    --accent: #202020; --accent-ink: #fafafa; --brand: #007106;
    --font: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1c1c1c; --panel: #262626; --panel2: #2f2f2f; --line: #3a3a3a;
      --text: #e3e3e3; --strong: #fafafa; --muted: #a8a8a8; --chip: #333333;
      --accent: #fafafa; --accent-ink: #202020; --brand: #87ea5c;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 var(--font); }
  a { color: inherit; }
  a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 28px max(16px, env(safe-area-inset-left)) 64px; }
  h1 { font-size: clamp(28px, 4vw, 40px); line-height: 1.15; color: var(--strong); margin: 0 0 8px; text-wrap: balance; }
  h2 { font-size: 20px; color: var(--strong); margin: 32px 0 12px; }
  .lede { color: var(--muted); max-width: 68ch; margin: 0 0 24px; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 20px; }
  .filters input {
    font: inherit; padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px;
    background: var(--bg); color: var(--text); min-width: 220px; flex: 1 1 220px; max-width: 360px;
  }
  .chip {
    font: 13px/1 var(--font); padding: 7px 10px; border-radius: 999px; border: 1px solid var(--line);
    background: var(--bg); color: var(--text); cursor: pointer;
  }
  .chip[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; list-style: none; padding: 0; margin: 0; }
  .card a { display: grid; gap: 10px; text-decoration: none; }
  .thumb {
    aspect-ratio: 16 / 10; height: auto; border-radius: 10px; border: 1px solid var(--line);
    overflow: hidden; background: var(--panel); display: block; width: 100%;
    object-fit: cover; object-position: top;
  }
  .cover .thumb { aspect-ratio: 10 / 3; }
  .cover .bar { display: flex; height: 10px; border: 1px solid var(--line); border-top: 0; border-radius: 0 0 10px 10px; overflow: hidden; margin-top: -10px; }
  .cover .bar span { flex: 1; }
  .card .title { font-weight: 600; color: var(--strong); line-height: 1.3; }
  .card a:hover .title { text-decoration: underline; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .tags li { font-size: 12px; padding: 3px 8px; border-radius: 999px; background: var(--chip); color: var(--muted); }
  .empty { color: var(--muted); }
  .count { color: var(--muted); font-size: 14px; margin: 0 0 16px; }

  /* ---------------------------------------------- the design-system spoke */
  .spoke { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 28px; align-items: start; }
  @media (max-width: 860px) { .spoke { grid-template-columns: minmax(0, 1fr); } }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
  .tab {
    font: 600 14px/1 var(--font); padding: 9px 14px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--bg); color: var(--muted); cursor: pointer;
  }
  .tab[aria-selected="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .frame { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--bg); }
  .frame iframe { display: block; width: 100%; height: min(78vh, 820px); border: 0; }
  aside { display: grid; gap: 18px; }
  aside section { border: 1px solid var(--line); border-radius: 10px; padding: 16px; display: grid; gap: 10px; background: var(--panel); }
  aside h2 { margin: 0; font-size: 15px; }
  aside p { margin: 0; font-size: 14px; }
  .btn {
    display: inline-flex; justify-content: center; gap: 8px; font: 600 14px/1 var(--font);
    padding: 10px 14px; border-radius: 8px; border: 1px solid var(--accent);
    background: var(--accent); color: var(--accent-ink); cursor: pointer; text-decoration: none;
  }
  .btn.secondary { background: transparent; color: var(--strong); border-color: var(--line); }
  .prompt {
    font: 13px/1.45 var(--mono); background: var(--bg); border: 1px solid var(--line);
    border-radius: 6px; padding: 8px 10px; white-space: pre-wrap; word-break: break-word; margin: 0;
  }
  ul.files { margin: 0; padding-left: 18px; font-size: 14px; }
  .note { font-size: 13px; color: var(--muted); }
  .swatches { display: flex; }
  .swatches span { flex: 1; height: 8px; }
  footer { margin-top: 48px; font-size: 13px; color: var(--muted); }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

/** The shared nav bar. */
export function kitNav(active) {
  const tab = (href, label, key) =>
    `<a class="tab${active === key ? " on" : ""}" href="${href}">${label}</a>`;
  return `<nav class="kitnav">
  <a class="brand" href="/">▣ Designer</a>
  ${tab("/", "Designs", "designs")}
  ${tab("/components", "Components", "components")}
  ${tab("/presets", "Gradients &amp; Patterns", "presets")}
  ${tab("/templates", "System templates", "templates")}
  ${tab("/assets", "Assets", "assets")}
  <span class="spacer"></span>
  <a class="dl" href="/skill">⬇ Skill</a>
</nav>`;
}

export const KIT_NAV_CSS = `
  .kitnav {
    position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 4px;
    background: var(--bg); border-bottom: 1px solid var(--line); padding: 0 16px; height: 46px;
    overflow-x: auto; scrollbar-width: thin;
  }
  .kitnav .brand { font-weight: 700; color: var(--strong); text-decoration: none; margin-right: 14px; letter-spacing: -0.01em; }
  .kitnav .tab { color: var(--muted); text-decoration: none; padding: 6px 11px; border-radius: 7px; font-size: 13px; white-space: nowrap; }
  .kitnav .tab:hover { color: var(--strong); background: var(--panel2); }
  .kitnav .tab.on { color: var(--strong); background: var(--panel2); box-shadow: inset 0 0 0 1px var(--line); }
  .kitnav .spacer { flex: 1; }
  .kitnav .dl {
    font-size: 13px; color: var(--strong); text-decoration: none; border: 1px solid var(--line);
    background: var(--panel2); border-radius: 7px; padding: 5px 11px; white-space: nowrap;
  }
`;

/**
 * The gallery index.
 *
 * Cards are covers: the rendered preview where one is cached, the swatch
 * strip otherwise. Filtering is by tag, because a tag is how a reader thinks
 * about a design system ("premium", "developer", "consumer").
 */
export function galleryIndexHtml({ designs, tags, total }) {
  const chips = tags
    .map(
      (tag) =>
        `<button type="button" class="chip" data-tag="${esc(tag.value)}" aria-pressed="false">${esc(tag.value)} <span class="n">${tag.count}</span></button>`,
    )
    .join("");

  const cards = designs
    .map((d) => {
      const swatches = (d.colors || [])
        .slice(0, 6)
        .map((c) => `<span style="background:${esc(c.hex || c.value || "#888")}"></span>`)
        .join("");
      const cover = d.thumb
        ? `<img class="thumb" src="${esc(d.thumb)}" alt="" loading="lazy" decoding="async">`
        : `<span class="thumb"></span>`;
      const tagList = (d.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
      return `<li class="card" data-tags="${esc((d.tags || []).join("|"))}" data-search="${esc(d.search)}">
  <a href="/design/${encodeURIComponent(d.id)}">
    ${cover}
    ${swatches ? `<span class="swatches" aria-hidden="true">${swatches}</span>` : ""}
    <span class="title">${esc(d.siteName)}</span>
  </a>
  ${tagList ? `<ul class="tags">${tagList}</ul>` : ""}
</li>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design Systems — ${total} designs</title>
<style>${KIT_CSS}${KIT_NAV_CSS}</style>
</head>
<body>
${kitNav("designs")}
<div class="wrap">
<header class="site">
  <h1>Design systems</h1>
  <p class="lede">Each one sets colors, type and spacing as tokens. Open one to see it, then use it with Open Design or add it to Claude Design.</p>
</header>
<div class="filters" role="search">
  <input id="q" type="search" placeholder="Search" aria-label="Search design systems" autocomplete="off">
  ${chips}
</div>
<p class="count" id="count" role="status">${total} designs</p>
<ul class="grid">${cards}</ul>
<p class="empty" id="empty" hidden>No design system matches that.</p>
<footer>Design systems are cached locally. Refero styles, Open Design packages and the Agent Kit all serve from this one gallery.</footer>
</div>
<script>
const q = document.getElementById('q');
const chips = [...document.querySelectorAll('.chip')];
const cards = [...document.querySelectorAll('.card')];
const count = document.getElementById('count');
const empty = document.getElementById('empty');
let tag = '';
function mark() { chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.tag === tag))); }
function apply() {
  const s = q.value.trim().toLowerCase();
  let n = 0;
  for (const card of cards) {
    const ok = (!tag || card.dataset.tags.split('|').indexOf(tag) >= 0) && (!s || card.dataset.search.indexOf(s) >= 0);
    card.hidden = !ok;
    if (ok) n++;
  }
  count.textContent = n + (n === cards.length ? ' designs' : ' of ' + cards.length + ' designs');
  empty.hidden = n > 0;
}
q.addEventListener('input', apply);
for (const chip of chips) chip.addEventListener('click', () => {
  tag = tag === chip.dataset.tag ? '' : chip.dataset.tag;
  mark();
  apply();
});
apply();
</script>
</body>
</html>`;
}

/**
 * The prompt blocks.
 *
 * Two ways to hand a design system to a tool: the Open Design Agent Kit
 * prompt, and the Claude Design prompt with the folder it reads from. Both
 * are copy-paste, so both get a copy button.
 */
function promptBlock(id, text, label) {
  return `<section>
  <h2>${label}</h2>
  <pre class="prompt" id="${id}">${esc(text)}</pre>
  <div><button type="button" class="btn" data-copy="${id}">Copy prompt</button></div>
</section>`;
}

/**
 * The design-system detail page.
 *
 * `views` lists the tabs that can be shown (the Open Design preview and the
 * Claude Design view); `main` is the content below the frame; `aside` the
 * panels beside it.
 */
export function designDetailHtml({ design, views = [], main = "", aside = "", tags = [] }) {
  const tabButtons = views
    .map(
      (v, i) =>
        `<button type="button" role="tab" class="tab" data-src="${esc(v.src)}" data-hash="${esc(v.hash || "")}" aria-selected="${i === 0}">${esc(v.label)}</button>`,
    )
    .join("");

  const first = views[0];
  const tagList = tags.map((t) => `<li>${esc(t)}</li>`).join("");
  const frame = first
    ? `<div class="tabs" role="tablist" aria-label="Which view">${tabButtons}</div>
       <div class="frame"><iframe id="view" src="${esc(first.src)}" title="${esc(first.label)} view" sandbox="allow-scripts" loading="lazy"></iframe></div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(design.siteName)} — Design Systems</title>
<style>${KIT_CSS}${KIT_NAV_CSS}</style>
</head>
<body>
${kitNav("designs")}
<div class="wrap">
<a href="/">&larr; All design systems</a>
<h1>${esc(design.siteName)}</h1>
<p class="lede">${esc(design.northStar || "")}</p>
${tagList ? `<ul class="tags">${tagList}</ul>` : ""}
${aside ? `<div class="spoke">
<div>
${frame}
${main}
</div>
<aside>
${aside}
</aside>
</div>` : main}
<footer>Design data cached locally. No external requests are made by this page.</footer>
</div>
${views.length ? `<script>
const tabs = [...document.querySelectorAll('.tab')];
const frame = document.getElementById('view');
function show(t) {
  tabs.forEach((o) => o.setAttribute('aria-selected', String(o === t)));
  if (frame.getAttribute('src') !== t.dataset.src) frame.setAttribute('src', t.dataset.src);
  history.replaceState(null, '', t.dataset.hash ? '#' + t.dataset.hash : location.pathname);
}
for (const t of tabs) t.addEventListener('click', () => show(t));
const hash = location.hash.slice(1);
for (const t of tabs) if (hash && t.dataset.hash === hash) show(t);
</script>` : ""}
${views.length ? `<script>
for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.addEventListener('click', function () {
    const text = document.getElementById(btn.getAttribute('data-copy')).textContent;
    const done = function () {
      const label = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = label; }, 1500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  });
}
</script>` : ""}
</body>
</html>`;
}

/** A copy-to-clipboard prompt panel. */
export function promptPanel(id, text, label) {
  return `<section>
  <h2>${esc(label)}</h2>
  <pre class="prompt" id="${esc(id)}">${esc(text)}</pre>
  <div><button type="button" class="btn" data-copy="${esc(id)}">Copy prompt</button></div>
</section>`;
}

/** A downloadable file list. */
export function filePanel(title, files) {
  const items = files
    .map((f) => `<li><a href="${esc(f.href)}" download>${esc(f.label)}</a></li>`)
    .join("");
  return `<section>
  <h2>${esc(title)}</h2>
  <ul class="files">${items}</ul>
</section>`;
}

export { esc };
