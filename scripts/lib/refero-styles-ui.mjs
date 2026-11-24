/**
 * refero-styles-ui.mjs — the HTML for the Refero Styles gallery.
 *
 * Same shape as the other per-layer UI modules (daisyui-ui.mjs, mantine-ui.mjs):
 * every page is a template literal with an inline <style> block, the shared
 * nav, and no remote URLs (Rule 1). Preview images come from the mirrored
 * assets through the assetPath helper the caller passes in.
 */

import { BASE_CSS, NAV_CSS, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const REFSTYLES_CSS = `
  .wrap { max-width:1540px; margin:0 auto; padding:24px clamp(14px,3vw,36px) 60px; }
  h1 { font-size:24px; margin:0; line-height:1.25; }
  .lead { color:var(--muted); font-size:13px; line-height:1.6; margin:8px 0 0; max-width:88ch; }
  .controls { margin-top:14px; display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
  .controls input { font:inherit; color:var(--fg); background:var(--panel2); border:1px solid var(--line);
    border-radius:7px; padding:8px 11px; width:min(100%,350px); min-width:0; }
  .count { color:var(--muted); font-size:12px; margin:13px 0 9px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%,252px),1fr)); gap:13px; }
  .grid [hidden] { display:none !important; }
  .card { display:flex; flex-direction:column; min-width:0; border:1px solid var(--line); border-radius:10px;
    background:var(--panel); color:var(--fg); text-decoration:none; overflow:clip; }
  .card:hover, .card:focus-within { border-color:var(--accent); }
  .visual { display:grid; place-items:center; position:relative; isolation:isolate; aspect-ratio:16/10; width:100%;
    border-bottom:1px solid var(--line); background:var(--panel2); color:var(--muted); }
  .visual img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:10px; }
  .fallback { font-size:11px; }
  .dots { display:flex; gap:0; padding:0 12px; margin-top:10px; }
  .dots span { width:18px; height:18px; border-radius:5px; border:1px solid rgba(255,255,255,.15); }
  .dots span + span { margin-left:-4px; }
  .meta { display:grid; gap:4px; padding:8px 12px 12px; }
  .meta strong { font-weight:650; }
  .meta small, .meta .desc { color:var(--muted); font-size:12px; }
  .meta .desc { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
  .empty { color:var(--muted); padding:20px 0; }
  .detail { max-width:1100px; margin:0 auto; padding:18px 20px 60px; }
  .back { display:inline-block; margin-bottom:10px; color:var(--muted); font-size:13px; text-decoration:none; }
  .detail h1 { font-size:22px; margin:0 0 4px; }
  .detail h2 { font-size:14px; font-weight:650; margin:22px 0 8px; }
  .detail h3 { font-size:12.5px; font-weight:650; margin:14px 0 6px; color:var(--fg); }
  .kicker { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin:2px 0 10px; }
  .tag { font-size:11px; padding:2px 7px; border-radius:999px; border:1px solid var(--line);
    background:var(--panel2); color:var(--muted); }
  .prose { color:var(--fg); font-size:13px; line-height:1.65; margin:0; max-width:88ch; }
  .essentials { margin:8px 0 0; padding-left:18px; color:var(--muted); font-size:12.5px; line-height:1.65; }
  .essentials li { margin:4px 0; }
  .swatches { display:grid; grid-template-columns:repeat(auto-fill,minmax(215px,1fr)); gap:8px; }
  .sw { display:flex; gap:9px; border:1px solid var(--line); border-radius:9px; background:var(--panel); padding:8px; }
  .swchip { width:34px; height:34px; border-radius:7px; border:1px solid rgba(255,255,255,.15); flex:none; }
  .swbody { min-width:0; }
  .swname { font-size:12px; font-weight:600; }
  .swval { font-size:11px; color:var(--muted); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  .swuse { font-size:11px; color:var(--muted); line-height:1.45; margin-top:2px;
    display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { text-align:left; color:var(--muted); font-weight:normal; padding:0 10px 6px 0; }
  td { padding:5px 10px 5px 0; border-top:1px solid var(--line); vertical-align:top; }
  td.mono, .mono { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11.5px; }
  td.use { color:var(--muted); }
  .comp { border:1px solid var(--line); border-radius:9px; background:var(--panel); padding:10px 12px; margin:8px 0; }
  .comp .what { color:var(--muted); font-size:12px; margin:2px 0 6px; }
  .comp .obs { color:var(--muted); font-size:12px; line-height:1.55; margin:6px 0 0; }
  .comp pre { background:var(--code-bg); border:1px solid var(--line); border-radius:8px; padding:9px 11px;
    overflow-x:auto; font-size:11px; line-height:1.55; margin:6px 0 0;
    font-family:var(--mono); color:var(--code-fg); }
  .dodont { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:12px; }
  .dodont ul { margin:6px 0 0; padding-left:18px; color:var(--muted); font-size:12.5px; line-height:1.6; }
  .dodont li { margin:4px 0; }
  .shots { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:10px; }
  .shots img { width:100%; border:1px solid var(--line); border-radius:9px; background:var(--panel2); }
  details { border:1px solid var(--line); border-radius:9px; background:var(--panel); padding:8px 12px; margin:8px 0; }
  summary { cursor:pointer; font-size:13px; }
  pre.md { white-space:pre-wrap; word-break:break-word; max-height:520px; overflow:auto;
    background:var(--code-bg); border:1px solid var(--line); border-radius:8px; padding:12px;
    font-size:11.5px; line-height:1.6; font-family:var(--mono); color:var(--code-fg); }
  .mcp { color:var(--muted); font-size:12px; margin-top:26px; line-height:1.6; }
  .mcp code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
    background:var(--panel2); border:1px solid var(--line); border-radius:5px; padding:1px 5px; }
`;

function page({ active, title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${BASE_CSS}${NAV_CSS}${REFSTYLES_CSS}</style>
</head>
<body>
${nav(active)}
${body}
</body>
</html>`;
}

function paletteDots(row) {
  const dots = (row.palette || [])
    .slice(0, 8)
    .map((c) => `<span style="background:${esc(c.value)}" title="${esc(c.name)} ${esc(c.value)}"></span>`)
    .join("");
  return dots ? `<div class="dots">${dots}</div>` : "";
}

const MCP_HINT = `<div class="mcp">The MCP exposes this layer as
<code>design_style_list</code>, <code>design_style_search</code>,
<code>design_style_get</code> and <code>design_style_get_md</code>.
Profiles and DESIGN.md exports are Refero's analysis of the depicted sites, cached locally for personal use.</div>`;

/**
 * The catalog page: one card per style with its mirrored type preview,
 * palette dots and description, plus a client-side search over names,
 * domains, descriptions, fonts and palette values.
 */
export function referoStylesCatalogHtml(catalog, { assetPath }) {
  const styles = catalog?.styles || [];
  const cards = styles
    .map((row) => {
      const preview = row.preview && assetPath ? assetPath(row.preview) : null;
      const search = [
        row.name,
        row.domain,
        row.description,
        ...(row.fonts || []).flatMap((f) => [f.family, f.substitute]),
        ...(row.palette || []).map((c) => `${c.name} ${c.value}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return `<a class="card" href="/refero-styles/style/${esc(row.uuid)}" data-search="${esc(search)}">
      <span class="visual">
        ${preview ? `<img src="${esc(preview)}" alt="" loading="lazy" decoding="async">` : `<span class="fallback">No preview</span>`}
      </span>
      ${paletteDots(row)}
      <span class="meta"><strong>${esc(row.name)}</strong>
        <small>${esc(row.domain)} · ${row.counts?.components ?? 0} components</small>
        ${row.description ? `<span class="desc">${esc(row.description)}</span>` : ""}
      </span>
    </a>`;
    })
    .join("");
  const totals = catalog?.totals || {};
  return page({
    active: "refero-styles",
    title: "Refero Styles",
    body: `<main class="wrap">
  <h1>Refero Styles</h1>
  <p class="lead">${totals.styles ?? styles.length} deep design-system profiles from Refero's public Styles
  product: named color tokens, surfaces, component recipes, typography with substitutes, dos and donts,
  and a DESIGN.md export per style. Browse the classic design catalog on
  <a href="/">Designs</a> — same sites, older shape.</p>
  <div class="controls"><input id="q" type="search" placeholder="Search styles (name, domain, font, color...)" aria-label="Search styles" autocomplete="off"></div>
  <p id="count" class="count" role="status">${styles.length} styles</p>
  <div class="grid">${cards}</div>
  <p id="empty" class="empty"${styles.length ? " hidden" : ""}>No matching styles.</p>
  ${MCP_HINT}
</main>
<script>
const query = document.getElementById('q');
const cards = [...document.querySelectorAll('.grid .card')];
const count = document.getElementById('count');
const empty = document.getElementById('empty');
function filter() {
  const terms = query.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
  let shown = 0;
  for (const card of cards) {
    const hit = terms.every(term => card.dataset.search.includes(term));
    card.hidden = !hit;
    shown += Number(hit);
  }
  count.textContent = (shown === cards.length ? shown : shown + ' of ' + cards.length) + ' styles';
  empty.hidden = shown > 0;
}
query.addEventListener('input', filter);
document.querySelector('.grid').addEventListener('error', (event) => {
  if (event.target instanceof HTMLImageElement) {
    const span = document.createElement('span');
    span.className = 'fallback';
    span.textContent = 'No preview';
    event.target.replaceWith(span);
  }
}, true);
</script>`,
  });
}

function colorSections(colors) {
  const entries = Object.entries(colors || {});
  if (!entries.length) return "";
  const groups = new Map();
  for (const [token, c] of entries) {
    const key = `${c.group || "neutral"}|${c.scope || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push([token, c]);
  }
  const order = { accent: 0, neutral: 1 };
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    const [ga, sa] = a.split("|");
    const [gb, sb] = b.split("|");
    return (order[ga] ?? 2) - (order[gb] ?? 2) || sa.localeCompare(sb);
  });
  return sorted
    .map(([key, list]) => {
      const [group, scope] = key.split("|");
      const heading = scope ? `${scope} (${group})` : group;
      const swatches = list
        .map(
          ([token, c]) => `<div class="sw">
        <span class="swchip" style="background:${esc(c.value)}"></span>
        <span class="swbody">
          <span class="swname">${esc(c.name)}</span> <span class="swval">${esc(c.value)} · ${esc(token)}</span>
          <div class="swuse">${esc(c.use || "")}</div>
        </span>
      </div>`,
        )
        .join("");
      return `<h3>${esc(heading)}</h3><div class="swatches">${swatches}</div>`;
    })
    .join("");
}

function surfacesTable(surfaces) {
  if (!Array.isArray(surfaces) || !surfaces.length) return "";
  const rows = surfaces
    .map((s) => {
      const css = Object.entries(s.css || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      const scope = s.scope ? `<div class="swuse">only for ${esc(s.scope)}</div>` : "";
      return `<tr><td><strong>${esc(s.name)}</strong>${scope}</td>
      <td class="use">${esc(s.use || "")}</td>
      <td class="mono">${esc(css)}</td>
      <td class="use">${esc(s.transfer || s.observed || "")}</td></tr>`;
    })
    .join("");
  return `<table><tr><th scope="col">Surface</th><th scope="col">Use</th><th scope="col">CSS</th><th scope="col">Transfer</th></tr>${rows}</table>`;
}

function typographyTable(typography) {
  if (!Array.isArray(typography) || !typography.length) return "";
  const rows = typography
    .map((t) => {
      const scope = t.scope ? ` <span class="tag">${esc(t.scope)}</span>` : "";
      return `<tr><td><strong>${esc(t.name)}</strong>${scope}</td>
      <td class="mono">${esc(t.font)} ${esc(String(t.weight ?? ""))}</td>
      <td class="mono">${esc(t.size || "")}</td>
      <td class="mono">${esc(t.lineHeight || "")}</td>
      <td class="mono">${esc(t.tracking || "")}</td>
      <td class="use">${esc(t.use || "")}</td></tr>`;
    })
    .join("");
  return `<table><tr><th scope="col">Recipe</th><th scope="col">Font</th><th scope="col">Size</th><th scope="col">Line</th><th scope="col">Tracking</th><th scope="col">Use</th></tr>${rows}</table>`;
}

function fontsTable(fonts) {
  const entries = Object.entries(fonts || {});
  if (!entries.length) return "";
  const rows = entries
    .map(([slot, f]) => {
      const stack = f.fallback ? `"${esc(f.family)}", ${esc(f.fallback)}` : `"${esc(f.family)}"`;
      return `<tr><td><strong>${esc(f.family || slot)}</strong></td>
      <td class="use">${esc(f.use || "")}</td>
      <td class="use">${esc(f.character || "")}</td>
      <td>${f.substitute ? `<strong>${esc(f.substitute)}</strong>${f.substituteNote ? `<div class="swuse">${esc(f.substituteNote)}</div>` : ""}` : "—"}</td>
      <td class="mono">${stack}</td></tr>`;
    })
    .join("");
  return `<table><tr><th scope="col">Family</th><th scope="col">Use</th><th scope="col">Character</th><th scope="col">Substitute</th><th scope="col">Stack</th></tr>${rows}</table>`;
}

function componentsList(components) {
  if (!Array.isArray(components) || !components.length) return "";
  return components
    .map((c) => {
      const css = Object.entries(c.css || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(";\n");
      const scope = c.scope ? ` <span class="tag">${esc(c.scope)}</span>` : "";
      const states = c.states ? `<div class="obs"><strong>States:</strong> ${esc(c.states)}</div>` : "";
      const transfer = c.transfer ? `<div class="obs"><strong>Transfer:</strong> ${esc(c.transfer)}</div>` : "";
      const sample = c.sample ? `<div class="obs"><strong>Sample:</strong> ${esc(c.sample)}</div>` : "";
      return `<div class="comp">
      <strong>${esc(c.name)}</strong>${scope}
      <div class="what">${esc(c.use || "")}</div>
      <pre>${esc(css)}</pre>
      ${c.observed ? `<div class="obs">${esc(c.observed)}</div>` : ""}
      ${states}${transfer}${sample}
    </div>`;
    })
    .join("");
}

/**
 * One style detail page: narrative, essentials, tokens, surfaces, typography,
 * fonts, component recipes, dos/donts, mirrored screenshots, and the
 * Refero-authored DESIGN.md.
 */
export function referoStyleHtml(catalog, record, { assetPath, designLink } = {}) {
  const data = record?.data || {};
  const site = record?.site || {};
  const row = (catalog?.styles || []).find((r) => r.uuid === record?.uuid) || {};
  const md = record?.views?.design_md || "";
  // The mapped asset file names live on the catalog row (built from
  // assets.json at fetch time); the stored record stays upstream-verbatim.
  const screenshots = (row.screenshots || [])
    .map((file) => (file && assetPath ? assetPath(file) : null))
    .filter(Boolean);
  const counts = row.counts || {
    components: Array.isArray(data.components) ? data.components.length : 0,
    typography: Array.isArray(data.typography) ? data.typography.length : 0,
    surfaces: Array.isArray(data.surfaces) ? data.surfaces.length : 0,
    colors: data.colors ? Object.keys(data.colors).length : 0,
  };
  const essentials = (data.essentials || [])
    .map((e) => `<li>${esc(e)}</li>`)
    .join("");
  const dos = (data.dos || []).map((d) => `<li>${esc(d)}</li>`).join("");
  const donts = (data.donts || []).map((d) => `<li>${esc(d)}</li>`).join("");
  const favicon = row.favicon && assetPath ? assetPath(row.favicon) : null;
  const resolvedDesignHref = typeof designLink === "function"
    ? (() => {
        const id = designLink(site.domain || row.domain);
        return id ? (String(id).startsWith("/") ? id : `/design/${encodeURIComponent(id)}`) : null;
      })()
    : designLink || null;
  return page({
    active: "refero-styles",
    title: `${site.name || record.uuid} — Refero Styles`,
    body: `<main class="detail">
  <a class="back" href="/">← All design systems</a>
  <div class="kicker">
    ${favicon ? `<img src="${esc(favicon)}" alt="" width="18" height="18" style="border-radius:4px">` : ""}
    <span class="tag">${esc(site.domain || "")}</span>
    <span class="tag">${counts.components} components</span>
    <span class="tag">${counts.typography} type recipes</span>
    <span class="tag">${counts.surfaces} surfaces</span>
    <span class="tag">${counts.colors} color tokens</span>
    ${resolvedDesignHref ? `<a class="tag" href="${esc(resolvedDesignHref)}">Classic Design entry →</a>` : ""}
    ${record?.uuid ? mcpButton(`designer:style:${record.uuid}`, `${site.name || record.uuid} (Deep Style)`, { compact: true }) : ""}
  </div>
  <h1>${esc(site.name || record.uuid)}</h1>
  <p class="lead">${esc(site.description || "")}</p>
  ${data.intent ? `<h2>Intent</h2><p class="prose">${esc(data.intent)}</p>` : ""}
  ${essentials ? `<h2>Essentials</h2><ul class="essentials">${essentials}</ul>` : ""}
  ${data.colors ? `<h2>Colors</h2>${colorSections(data.colors)}` : ""}
  ${data.surfaces ? `<h2>Surfaces</h2>${surfacesTable(data.surfaces)}` : ""}
  ${data.typography ? `<h2>Typography</h2>${typographyTable(data.typography)}` : ""}
  ${data.fonts ? `<h2>Fonts</h2>${fontsTable(data.fonts)}` : ""}
  ${data.components ? `<h2>Components</h2>${componentsList(data.components)}` : ""}
  ${dos || donts ? `<h2>Do / Don't</h2><div class="dodont">
    ${dos ? `<div><h3>Do</h3><ul>${dos}</ul></div>` : ""}
    ${donts ? `<div><h3>Don't</h3><ul>${donts}</ul></div>` : ""}
  </div>` : ""}
  ${screenshots.length ? `<h2>Screenshots</h2><div class="shots">${screenshots.map((src) => `<img src="${esc(src)}" alt="${esc(site.name || "")} screenshot" loading="lazy" decoding="async">`).join("")}</div>` : ""}
  ${md ? `<h2>DESIGN.md</h2><details open><summary>Refero's export for this style (${(md.length / 1024).toFixed(1)} KB)</summary><pre class="md">${esc(md)}</pre></details>` : ""}
  ${MCP_HINT}
</main>`,
  });
}
