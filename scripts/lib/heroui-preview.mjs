/**
 * heroui-preview.mjs — Native offline HTML/CSS live previews for HeroUI v3 components.
 *
 * Uses the baked `@heroui/styles` stylesheet (`bake/heroui/styles/heroui.min.css`),
 * served locally at `/heroui/css/heroui.min.css`, with zero external network requests.
 * Supports `?theme=light` and `?theme=dark` via HeroUI's native `data-theme` tokens.
 */

const EXAMPLES = {
  button: `<div class="h-row">
    <button type="button" class="button button--primary">Primary</button>
    <button type="button" class="button button--secondary">Secondary</button>
    <button type="button" class="button button--tertiary">Tertiary</button>
    <button type="button" class="button button--outline">Outline</button>
    <button type="button" class="button button--ghost">Ghost</button>
    <button type="button" class="button button--danger">Danger</button>
    <button type="button" class="button button--danger-soft">Danger Soft</button>
  </div>
  <div class="h-row" style="margin-top:12px">
    <button type="button" class="button button--primary button--sm">Small</button>
    <button type="button" class="button button--primary">Medium</button>
    <button type="button" class="button button--primary button--lg">Large</button>
    <button type="button" class="button button--secondary" disabled>Disabled</button>
  </div>`,

  "button-group": `<div class="button-group" role="group" aria-label="View mode">
    <button type="button" class="button button--secondary">Day</button>
    <button type="button" class="button button--primary">Week</button>
    <button type="button" class="button button--secondary">Month</button>
  </div>`,

  card: `<div class="h-grid">
    <article class="card card--default" style="max-width:340px">
      <div class="card__header">
        <h3 class="card__title">HeroUI v3 Card</h3>
        <p class="card__description">Rendered offline with @heroui/styles oklch tokens.</p>
      </div>
      <div class="card__content">
        <p style="margin:0;font-size:13px;opacity:.85">Supports default, secondary, tertiary, and transparent surface elevations.</p>
      </div>
      <div class="card__footer" style="display:flex;gap:8px;justify-content:flex-end">
        <button type="button" class="button button--ghost button--sm">Cancel</button>
        <button type="button" class="button button--primary button--sm">Deploy</button>
      </div>
    </article>
    <article class="card card--secondary" style="max-width:340px">
      <div class="card__header">
        <h3 class="card__title">Secondary Surface</h3>
        <p class="card__description">Subtle layered background contrast.</p>
      </div>
      <div class="card__content">
        <div class="h-row"><span class="chip chip--accent chip--soft">v3 Beta</span><span class="chip chip--success chip--soft">Offline</span></div>
      </div>
    </article>
  </div>`,

  chip: `<div class="h-row">
    <span class="chip chip--default">Default</span>
    <span class="chip chip--accent">Accent</span>
    <span class="chip chip--success">Success</span>
    <span class="chip chip--warning">Warning</span>
    <span class="chip chip--danger">Danger</span>
  </div>
  <div class="h-row" style="margin-top:10px">
    <span class="chip chip--accent chip--soft chip--sm">Soft SM</span>
    <span class="chip chip--success chip--soft chip--md">Soft MD</span>
    <span class="chip chip--danger chip--soft chip--lg">Soft LG</span>
  </div>`,

  badge: `<div class="h-row" style="gap:18px">
    <span class="badge badge--default">Default</span>
    <span class="badge badge--accent">Accent</span>
    <span class="badge badge--primary">Primary</span>
    <span class="badge badge--secondary">Secondary</span>
    <span class="badge badge--danger">99+</span>
    <span class="badge badge--accent badge--soft">Soft</span>
  </div>`,

  alert: `<div class="h-col">
    <div class="alert alert--accent">
      <div class="alert__content">
        <div class="alert__title">Offline cache ready</div>
        <div class="alert__description">All HeroUI v3 stylesheets and docs are served locally with zero outbound network calls.</div>
      </div>
    </div>
    <div class="alert alert--success">
      <div class="alert__content">
        <div class="alert__title">Build verified</div>
        <div class="alert__description">Theme variables compiled with oklch color spaces.</div>
      </div>
    </div>
    <div class="alert alert--warning">
      <div class="alert__content">
        <div class="alert__title">Check peer dependencies</div>
        <div class="alert__description">HeroUI v3 requires React 19 and Tailwind CSS v4.</div>
      </div>
    </div>
    <div class="alert alert--danger">
      <div class="alert__content">
        <div class="alert__title">Connection refused</div>
        <div class="alert__description">Unable to reach remote endpoint in offline mode.</div>
      </div>
    </div>
  </div>`,

  avatar: `<div class="h-row">
    <span class="avatar avatar--sm"><span class="avatar__fallback avatar__fallback--default">AL</span></span>
    <span class="avatar avatar--md"><span class="avatar__fallback avatar__fallback--accent">JD</span></span>
    <span class="avatar avatar--lg"><span class="avatar__fallback avatar__fallback--success">MK</span></span>
    <span class="avatar avatar--md"><span class="avatar__fallback avatar__fallback--warning">SR</span></span>
    <span class="avatar avatar--md"><span class="avatar__fallback avatar__fallback--danger">WR</span></span>
  </div>`,

  input: `<div class="h-col" style="max-width:360px">
    <div>
      <label class="label label--required" for="hi-email">Email address</label>
      <input id="hi-email" class="input input--primary input--full-width" type="email" placeholder="alex@example.com">
    </div>
    <div>
      <label class="label" for="hi-sec">Secondary variant</label>
      <input id="hi-sec" class="input input--secondary input--full-width" type="text" value="HeroUI v3">
    </div>
  </div>`,

  textarea: `<div class="h-col" style="max-width:420px">
    <label class="label" for="hi-ta">Project notes</label>
    <textarea id="hi-ta" class="textarea input input--primary input--full-width" rows="3" placeholder="Describe your design tokens..."></textarea>
  </div>`,

  checkbox: `<div class="h-row">
    <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" class="checkbox" checked><span>Enable offline cache</span>
    </label>
    <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" class="checkbox"><span>Include dark theme tokens</span>
    </label>
  </div>`,

  switch: `<div class="h-row">
    <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" role="switch" class="switch" checked><span>Auto-sync tokens</span>
    </label>
    <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" role="switch" class="switch"><span>Compact density</span>
    </label>
  </div>`,

  tabs: `<div class="tabs" style="max-width:480px">
    <div class="tabs__list-container">
      <div class="tabs__list" role="tablist">
        <button type="button" class="tabs__tab" role="tab" aria-selected="true" data-selected="true">Overview</button>
        <button type="button" class="tabs__tab" role="tab" aria-selected="false">Tokens</button>
        <button type="button" class="tabs__tab" role="tab" aria-selected="false">CSS</button>
      </div>
    </div>
    <div class="tabs__panel" role="tabpanel" style="padding:12px 4px;font-size:13px">
      HeroUI v3 tabs styled with semantic BEM classes and oklch surface tokens.
    </div>
  </div>`,

  accordion: `<div class="accordion accordion--surface" style="max-width:480px">
    <details class="accordion__item" open>
      <summary class="accordion__trigger" style="cursor:pointer;list-style:none">What is HeroUI v3?</summary>
      <div class="accordion__panel" style="padding:8px 0 12px;font-size:13px;opacity:.85">
        An accessible React + Tailwind v4 component system built on React Aria and @heroui/styles.
      </div>
    </details>
    <details class="accordion__item">
      <summary class="accordion__trigger" style="cursor:pointer;list-style:none">Does this preview run offline?</summary>
      <div class="accordion__panel" style="padding:8px 0 12px;font-size:13px;opacity:.85">
        Yes — styled directly by the baked local heroui.min.css stylesheet.
      </div>
    </details>
  </div>`,

  breadcrumbs: `<nav aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li class="breadcrumbs__item"><a class="breadcrumbs__link" href="#home">Home</a><span class="breadcrumbs__separator">/</span></li>
      <li class="breadcrumbs__item"><a class="breadcrumbs__link" href="#components">Components</a><span class="breadcrumbs__separator">/</span></li>
      <li class="breadcrumbs__item"><span class="breadcrumbs__link" aria-current="page">Breadcrumbs</span></li>
    </ol>
  </nav>`,

  kbd: `<div class="h-row">
    <kbd class="kbd"><span class="kbd__abbr">⌘</span><span class="kbd__content">K</span></kbd>
    <kbd class="kbd"><span class="kbd__abbr">⇧</span><span class="kbd__abbr">⌘</span><span class="kbd__content">P</span></kbd>
    <kbd class="kbd"><span class="kbd__content">Esc</span></kbd>
  </div>`,

  link: `<div class="h-row">
    <a class="link" href="#docs">Default HeroUI Link</a>
    <a class="link" href="#docs" style="text-decoration:underline">Underlined Link</a>
  </div>`,

  separator: `<div class="h-col" style="max-width:420px">
    <div style="font-size:13px">Section above divider</div>
    <hr class="separator separator--horizontal" style="width:100%;margin:6px 0">
    <div class="h-row" style="font-size:13px">
      <span>Docs</span>
      <span class="separator separator--vertical" style="height:16px"></span>
      <span>Styles</span>
      <span class="separator separator--vertical" style="height:16px"></span>
      <span>Theme</span>
    </div>
  </div>`,

  skeleton: `<div style="display:flex;gap:12px;align-items:center;max-width:360px">
    <div class="skeleton skeleton--shimmer" style="width:44px;height:44px;border-radius:999px;flex:none"></div>
    <div style="flex:1;display:grid;gap:8px">
      <div class="skeleton skeleton--shimmer" style="height:14px;width:72%;border-radius:6px"></div>
      <div class="skeleton skeleton--shimmer" style="height:12px;width:95%;border-radius:6px"></div>
    </div>
  </div>`,

  spinner: `<div class="h-row">
    <span class="spinner spinner--sm spinner--accent" role="status" aria-label="Loading"></span>
    <span class="spinner spinner--md spinner--accent" role="status" aria-label="Loading"></span>
    <span class="spinner spinner--lg spinner--success" role="status" aria-label="Loading"></span>
    <span class="spinner spinner--xl spinner--warning" role="status" aria-label="Loading"></span>
  </div>`,

  surface: `<div class="h-row">
    <div class="surface surface--default" style="padding:14px 18px;border-radius:12px">Default surface</div>
    <div class="surface surface--secondary" style="padding:14px 18px;border-radius:12px">Secondary surface</div>
    <div class="surface surface--tertiary" style="padding:14px 18px;border-radius:12px">Tertiary surface</div>
  </div>`,

  label: `<div class="h-row">
    <label class="label">Standard label</label>
    <label class="label label--required">Required field</label>
    <label class="label label--disabled">Disabled field</label>
    <label class="label label--invalid">Invalid field</label>
  </div>`,

  "close-button": `<div class="h-row">
    <button type="button" class="close-button" aria-label="Close">×</button>
    <button type="button" class="button button--secondary button--sm">Dismiss</button>
  </div>`,

  "progress-bar": `<div class="h-col" style="max-width:380px">
    <div style="display:flex;justify-content:space-between;font-size:12px"><span>Baking offline cache</span><span>76%</span></div>
    <div class="progress-bar" style="height:8px;border-radius:999px;background:var(--surface-secondary, #e5e7eb);overflow:hidden">
      <div style="width:76%;height:100%;background:var(--accent, #006fee);border-radius:999px"></div>
    </div>
  </div>`,

  table: `<table class="table" style="width:100%;max-width:540px;border-collapse:collapse;font-size:13px">
    <thead>
      <tr style="border-bottom:1px solid var(--border, #e4e4e7);text-align:left">
        <th style="padding:8px 10px">Component</th>
        <th style="padding:8px 10px">Category</th>
        <th style="padding:8px 10px">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid var(--border, #e4e4e7)">
        <td style="padding:8px 10px">Button</td><td style="padding:8px 10px">Actions</td>
        <td style="padding:8px 10px"><span class="chip chip--success chip--soft chip--sm">Live</span></td>
      </tr>
      <tr>
        <td style="padding:8px 10px">Card</td><td style="padding:8px 10px">Surfaces</td>
        <td style="padding:8px 10px"><span class="chip chip--accent chip--soft chip--sm">Styled</span></td>
      </tr>
    </tbody>
  </table>`,
};

export function hasHeroUiPreview(slug) {
  return Object.prototype.hasOwnProperty.call(EXAMPLES, slug);
}

export function listHeroUiPreviewSlugs() {
  return Object.keys(EXAMPLES);
}

export function heroUiPreviewDocument(slug, { cssHref = "/heroui/css/heroui.min.css", theme = "light" } = {}) {
  const snippet = EXAMPLES[slug];
  if (!snippet) return null;
  const safeTheme = theme === "dark" ? "dark" : "light";
  return `<!doctype html>
<html lang="en" data-preview="loading" data-theme="${safeTheme}" class="${safeTheme === "dark" ? "dark" : ""}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HeroUI v3 ${slug} preview</title>
<script>
try {
  var t = new URLSearchParams(location.search).get("theme");
  if (t === "dark" || t === "light") {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }
} catch (e) {}
</script>
<link rel="stylesheet" href="${cssHref}">
<style>
  html, body { margin: 0; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body { background: var(--background, #ffffff); color: var(--foreground, #11181c); }
  html.dark body, html[data-theme="dark"] body { background: var(--background, #0d0f12); color: var(--foreground, #ecedee); }
  #preview-root { padding: 20px; display: flow-root; }
  .h-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .h-col { display: flex; flex-direction: column; gap: 10px; }
  .h-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
</style>
</head>
<body>
<div id="preview-root">${snippet}</div>
<script>
(function(){
  var root = document.documentElement;
  function send() {
    var el = document.getElementById("preview-root");
    var h = el ? Math.ceil(el.getBoundingClientRect().height) : 140;
    try { parent.postMessage({ source: "design-preview", type: "height", height: Math.max(84, h) }, "*"); } catch (e) {}
  }
  root.setAttribute("data-preview", "ready");
  send();
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.getElementById("preview-root"));
  // Interactive tabs demo support
  document.querySelectorAll('.tabs__tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      var list = tab.closest('.tabs__list');
      if (!list) return;
      list.querySelectorAll('.tabs__tab').forEach(function(o){
        var on = o === tab;
        o.setAttribute('aria-selected', String(on));
        if (on) o.setAttribute('data-selected', 'true'); else o.removeAttribute('data-selected');
      });
    });
  });
})();
</script>
</body>
</html>`;
}
