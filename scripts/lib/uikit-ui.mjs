/**
 * uikit-ui.mjs — UI kits gallery HTML: the generic offline layer for the
 * frameworks the bespoke layers do not cover.
 *
 * Serves:
 *   - /uikits                     kit index (baked kits + licence-restricted pointers)
 *   - /uikits/:kit                one kit's items, grouped
 *   - /uikits/:kit/item/:slug     one item: rendered docs + baked file list
 *   - /uikits/:kit/file/:path     one baked file, escaped text
 *   - /uikits/:kit/preview/:slug  live token preview (Open Props css variables)
 *
 * Docs are the markdown trees baked by scripts/fetch-uikits.mjs. Rendering
 * is markdown-it. Pages load zero remote resources: doc images render as
 * links, never as <img>.
 */

import MarkdownIt from "markdown-it";
import { shellHead, shellStyle, nav, mcpButton } from "./ui.mjs";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const markdown = new MarkdownIt({ html: false, linkify: true });
// Rule 1: a doc page loads nothing remote. Upstream docs embed badges and
// screenshots from CDNs, so an image renders as a link instead and nothing is
// fetched until a reader clicks. The layer bakes text only, so an image that
// points inside the kit renders as its alt text.
markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const src = String(token.attrGet("src") || "");
  const alt = self.renderInlineAsText(token.children, options, env);
  if (/^https?:\/\//i.test(src)) return `<a href="${esc(src)}" rel="noopener">${esc(alt || "image")}</a>`;
  return alt ? `<em>(${esc(alt)})</em>` : "";
};
// Relative doc links resolve to the offline item routes when the target is a
// baked page of the same kit; everything else stays a plain anchor.
const linkOpen = markdown.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = String(tokens[idx].attrGet("href") || "");
  const map = env?.docMap;
  if (map && !/^(https?:)?\/\//.test(href) && !href.startsWith("/")) {
    const clean = href.replace(/^[./]+/, "").replace(/\.mdx?$/, "");
    for (const [path, slug] of map) {
      if (path.replace(/\.mdx?$/, "") === clean || path.split("/").pop().replace(/\.mdx?$/, "") === clean.split("/").pop()) {
        tokens[idx].attrSet("href", `/uikits/${urlPath(env.kit)}/item/${urlPath(slug)}`);
        break;
      }
    }
  }
  tokens[idx].attrSet("rel", "noopener");
  return linkOpen(tokens, idx, options, env, self);
};

/** Render one item's doc markdown with the kit's doc link map. */
export function renderUikitDoc(catalog, item, content) {
  const docMap = new Map();
  for (const i of catalog.items || []) for (const d of i.docs || []) docMap.set(d, i.slug);
  return markdown.render(String(content || ""), { docMap, kit: catalog.kit });
}

/** Escape a path for use inside a URL path segment (keeps slashes). */
const urlPath = (s) => String(s ?? "").split("/").map(encodeURIComponent).join("/");

const UIKIT_CSS = `
  .uik-shell { max-width: 1200px; margin: 0 auto; padding: 26px 28px 64px; }
  .uik-header h1 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -.02em; }
  .uik-header p { margin: 6px 0 0; color: var(--muted); font-size: 13.5px; max-width: 780px; }
  .uik-badges { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0 18px; }
  .uik-badge { font-size: 11.5px; color: var(--muted); border: 1px solid var(--line); background: var(--panel); border-radius: 999px; padding: 3px 10px; }
  .uik-badge b { color: var(--fg); font-weight: 600; }
  .uik-note {
    margin: 0 0 18px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line);
    border-left: 3px solid var(--accent); border-radius: 10px; font-size: 12.5px; color: var(--muted);
  }
  .uik-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  .uik-card {
    display: flex; flex-direction: column; gap: 5px; text-decoration: none; color: inherit;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 13px 15px; transition: border-color .15s ease, transform .15s ease; position: relative;
  }
  .uik-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .uik-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .uik-card-top strong { font-size: 14px; font-weight: 600; color: var(--fg); }
  .uik-card-top span { font-size: 11px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .uik-card-desc { font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .uik-card-preview {
    position: absolute; right: 12px; bottom: 12px; font-size: 11px; color: var(--accent);
    text-decoration: none; border: 1px solid var(--line); border-radius: 999px; padding: 2px 9px; background: var(--panel2);
  }
  .uik-section-h { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 26px 0 12px; }
  .uik-mcp { margin-top: 22px; padding: 11px 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; font-size: 12px; color: var(--muted); }
  .uik-mcp code { color: var(--fg); background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; font-size: 11.5px; }
  .uik-crumb { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .uik-crumb a { color: var(--muted); text-decoration: none; }
  .uik-crumb a:hover { color: var(--fg); }
  .uik-doc { max-width: 880px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 26px 30px 34px; }
  .uik-doc h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -.02em; }
  .uik-doc-sub { color: var(--muted); font-size: 13.5px; margin: 0 0 18px; }
  .uik-doc-body { font-size: 13.5px; line-height: 1.6; }
  .uik-doc-body h2 { font-size: 17px; margin: 26px 0 8px; letter-spacing: -.01em; }
  .uik-doc-body h3 { font-size: 14.5px; margin: 20px 0 6px; }
  .uik-doc-body p, .uik-doc-body li { color: var(--text); }
  .uik-doc-body code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; background: var(--code-bg); border: 1px solid var(--line); border-radius: 5px; padding: 1px 5px; }
  .uik-doc-body pre { background: var(--code-bg); border: 1px solid var(--line); border-radius: 9px; padding: 13px 15px; overflow-x: auto; font-size: 12.5px; line-height: 1.55; }
  .uik-doc-body pre code { border: 0; padding: 0; background: transparent; font-size: inherit; }
  .uik-doc-body table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12.5px; }
  .uik-doc-body th, .uik-doc-body td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
  .uik-doc-body th { background: var(--panel2); font-weight: 600; }
  .uik-doc-body blockquote { margin: 12px 0; padding: 4px 14px; border-left: 3px solid var(--line); color: var(--muted); }
  .uik-files { margin-top: 18px; max-width: 880px; }
  .uik-files h2 { font-size: 14px; margin: 0 0 8px; color: var(--fg); }
  .uik-filelist { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
  .uik-filelist a {
    display: flex; justify-content: space-between; gap: 10px; text-decoration: none; color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 7px; padding: 6px 10px;
  }
  .uik-filelist a:hover { color: var(--fg); border-color: var(--accent); }
  .uik-filelist a span:last-child { color: var(--muted); font-variant-numeric: tabular-nums; }
  .uik-code { max-width: 980px; background: var(--code-bg); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; overflow-x: auto; font-size: 12.5px; line-height: 1.55; }
  .uik-code pre { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
  .uik-demo { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; margin-top: 14px; }
  .uik-demo-card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; font-size: 12px; }
  .uik-demo-card .name { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--fg); word-break: break-all; }
  .uik-demo-card .value { color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; margin-top: 3px; word-break: break-all; }
  .uik-swatch { height: 46px; border-radius: 8px; border: 1px solid var(--line); margin-bottom: 8px; }
  .uik-easing { height: 34px; border-radius: 8px; background: var(--panel2); border: 1px solid var(--line); margin-bottom: 8px; position: relative; }
  .uik-easing i { position: absolute; left: 4px; top: 4px; bottom: 4px; width: 34px; border-radius: 6px; background: var(--accent); transition: left .9s; }
  .uik-easing:hover i { left: calc(100% - 38px); }
  .uik-anim { height: 30px; border-radius: 8px; background: var(--panel2); border: 1px solid var(--line); margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 15px; }
  @media (max-width: 960px) { .uik-shell { padding: 16px; } }
`;

const UIKIT_STYLE_LINK = shellStyle("uikit", UIKIT_CSS);

function page(title, active, mainHtml) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(UIKIT_STYLE_LINK)}
<title>${esc(title)} · Designer</title>
</head><body>
${nav(active)}
<main class="uik-shell">${mainHtml}</main>
</body></html>`;
}

const KIND_LABEL = {
  "docs+source": "docs + source",
  docs: "docs",
  assets: "assets",
  pointer: "pointer (licence-restricted)",
};

function kitBadges(row) {
  return [
    `<span class="uik-badge">kind <b>${esc(KIND_LABEL[row.kind] || row.kind)}</b></span>`,
    row.category ? `<span class="uik-badge">${esc(row.category)}</span>` : "",
    row.license?.spdx ? `<span class="uik-badge">licence <b>${esc(row.license.spdx)}</b></span>` : "",
    row.usesTailwind ? `<span class="uik-badge">Tailwind <b>yes</b></span>` : `<span class="uik-badge">Tailwind <b>no</b></span>`,
    row.totals ? `<span class="uik-badge"><b>${row.totals.items}</b> items</span>` : "",
    row.error ? `<span class="uik-badge">bake failed</span>` : "",
  ].join("");
}

/** /uikits — the kit index over every pinned kit. */
export function uikitsIndexHtml(index) {
  const kits = index.kits || [];
  const cards = kits
    .map((row) => {
      const href = `/uikits/${urlPath(row.kit)}`;
      const desc = row.error
        ? `Last bake failed: ${row.error}`
        : row.note ||
          (row.kind === "pointer"
            ? "Licence-restricted: the first-party llms.txt index is cached, component code stays upstream."
            : `${row.totals?.docs || 0} doc pages, ${row.totals?.source || 0} source files baked offline.`);
      return `<a class="uik-card" href="${href}">
        <div class="uik-card-top"><strong>${esc(row.name)}</strong><span>${esc(row.kit)}</span></div>
        <div class="uik-card-desc">${esc(desc)}</div>
        <div class="uik-badges" style="margin: 6px 0 0;">${kitBadges(row)}</div>
      </a>`;
    })
    .join("");
  const main = `
    <div class="uik-header">
      <h1>UI kits</h1>
      <p>The frameworks the bespoke layers do not cover, baked offline from first-party npm and GitHub sources at pinned versions, plus the licence-restricted ecosystems cached as llms.txt indexes only. Licences are read from each kit's own archive at bake time.</p>
    </div>
    <div class="uik-badges">
      <span class="uik-badge"><b>${index.totals?.baked ?? kits.filter((k) => k.kind !== "pointer" && !k.error).length}</b> kits baked</span>
      <span class="uik-badge"><b>${index.totals?.items ?? 0}</b> items</span>
    </div>
    <div class="uik-grid">${cards}</div>
    <div class="uik-mcp">Pick these programmatically with the <code>design_kit_*</code> MCP tools (<code>design_kit_list</code>, <code>design_kit_search</code>, <code>design_kit_docs</code>, <code>design_kit_code</code>) or the JSON at <code>/api/uikits</code>.</div>`;
  return page("UI kits", "uikits", main);
}

/** /uikits/:kit — one kit's items grouped, or its licence notice for pointers. */
export function uikitKitHtml(catalog) {
  const items = catalog.items || [];
  const groups = [...new Set(items.map((i) => i.group || "items"))];
  const cards = (pool) =>
    pool
      .map((i) => {
        const preview = i.previewable
          ? `<a class="uik-card-preview" href="/uikits/${urlPath(catalog.kit)}/preview/${urlPath(i.slug)}">preview</a>`
          : "";
        const counts = i.kind === "pointer"
          ? ""
          : `<span style="font-size:11px;color:var(--muted)">${i.docs?.length ? `${i.docs.length} doc${i.docs.length > 1 ? "s" : ""}` : "no docs"} · ${i.source?.length || 0} files</span>`;
        return `<a class="uik-card" href="/uikits/${urlPath(catalog.kit)}/item/${urlPath(i.slug)}">
          <div class="uik-card-top"><strong>${esc(i.title)}</strong><span>${esc(i.slug)}</span></div>
          <div class="uik-card-desc">${esc(i.summary || i.group || "")}</div>
          ${counts}${preview}
        </a>`;
      })
      .join("");
  const sections = groups
    .map((g) => {
      const pool = items.filter((i) => (i.group || "items") === g);
      return `<div class="uik-section-h">${esc(g)} (${pool.length})</div><div class="uik-grid">${cards(pool)}</div>`;
    })
    .join("");
  const notice = catalog.note
    ? `<div class="uik-note">${esc(catalog.note)}</div>`
    : "";
  const main = `
    <div class="uik-crumb"><a href="/uikits">UI kits</a> / ${esc(catalog.kit)}</div>
    <div class="uik-header">
      <h1>${esc(catalog.name)}</h1>
      <p>${catalog.kind === "pointer"
        ? "Cached as a first-party llms.txt index only. Read it for names, variants and install commands; fetch the code from upstream."
        : `Baked offline from the pinned first-party source. ${items.length} items.`}</p>
    </div>
    <div class="uik-badges">${kitBadges(catalog)}</div>
    ${notice}
    ${sections}
    <div class="uik-mcp">Items resolve with <code>design_kit_list {"kit": "${esc(catalog.kit)}"}</code>; docs with <code>design_kit_docs</code>; code with <code>design_kit_code</code>. Catalog JSON: <code>/api/uikits/${esc(catalog.kit)}/catalog.json</code>.</div>`;
  return page(`${catalog.name} · UI kits`, "uikits", main);
}

/**
 * /uikits/:kit/item/:slug — one item: rendered doc + baked file list.
 * `docsContent` is the raw primary doc text (rendered here); `files` is
 * [{path, bytes}] from the kit manifest, restricted to the item.
 */
export function uikitItemHtml(catalog, item, docsContent, files) {
  const docsHtml = docsContent ? renderUikitDoc(catalog, item, docsContent) : "";
  const kitUrl = `/uikits/${urlPath(catalog.kit)}`;
  const fileRows = (files || [])
    .map(
      (f) => `<a href="${kitUrl}/file/${urlPath(f.path)}"><span>${esc(f.path)}</span><span>${f.bytes ?? ""}${f.bytes != null ? " B" : ""}</span></a>`,
    )
    .join("");
  const preview = item.previewable
    ? `<a class="uik-badge" href="${kitUrl}/preview/${urlPath(item.slug)}" style="text-decoration:none">live preview →</a>`
    : "";
  const docsSection = docsHtml
    ? `<div class="uik-doc" style="margin-top:14px"><div class="uik-doc-body">${docsHtml}</div></div>`
    : "";
  const main = `
    <div class="uik-crumb"><a href="/uikits">UI kits</a> / <a href="${kitUrl}">${esc(catalog.name)}</a> / ${esc(item.slug)}</div>
    <div class="uik-header"><div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px"><h1>${esc(item.title)}</h1>${mcpButton(`designer:uikit:${catalog.kit}:${item.slug}`, `${catalog.name} — ${item.title}`)}</div><p>${esc(item.summary || "")}</p></div>
    <div class="uik-badges">${kitBadges(catalog)}${preview}</div>
    ${docsSection}
    ${fileRows ? `<div class="uik-files"><h2>Baked files (${files.length})</h2><div class="uik-filelist">${fileRows}</div></div>` : ""}
    <div class="uik-mcp">Docs: <code>design_kit_docs {"kit": "${esc(catalog.kit)}", "item": "${esc(item.slug)}"}</code>${
      item.source?.length ? ` · Code: <code>design_kit_code {"kit": "${esc(catalog.kit)}", "item": "${esc(item.slug)}"}</code>` : ""
    }</div>`;
  return page(`${item.title} · ${catalog.name}`, "uikits", main);
}

/** /uikits/:kit/file/:path — one baked file, escaped text. */
export function uikitFileHtml(catalog, filePath, content) {
  const kitUrl = `/uikits/${urlPath(catalog.kit)}`;
  const main = `
    <div class="uik-crumb"><a href="/uikits">UI kits</a> / <a href="${kitUrl}">${esc(catalog.name)}</a> / ${esc(filePath)}</div>
    <div class="uik-header"><h1 style="font-size:16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${esc(filePath)}</h1></div>
    <div class="uik-code"><pre>${esc(content)}</pre></div>
    <div class="uik-mcp">Read this file programmatically with <code>design_kit_code {"kit": "${esc(catalog.kit)}", "item": "<item>", "path": "${esc(filePath)}"}</code>.</div>`;
  return page(`${filePath} · ${catalog.name}`, "uikits", main);
}

// ------------------------------------------------------------- live previews
// Open Props css is custom properties only (no element styles), so the token
// sheet can be linked straight into a gallery page and the demo markup uses
// the variables inline. The demo presentation is authored by this repo; the
// tokens are upstream's.

const COLOR_VALUE = /^(#|rgb|hsl|oklch|oklab|color-mix|color\()/i;

/** Parse up to `cap` custom property declarations out of a css token sheet. */
function parseTokens(cssText, cap = 400) {
  const out = [];
  const re = /(--[\w-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(cssText)) && out.length < cap) {
    out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

function openpropsDemoHtml(cssText) {
  const tokens = parseTokens(cssText);
  const colors = tokens.filter((t) => COLOR_VALUE.test(t.value)).slice(0, 24);
  const easings = tokens.filter((t) => t.name.startsWith("--ease-")).slice(0, 12);
  const animations = tokens.filter((t) => t.name.startsWith("--animation-")).slice(0, 8);
  const rest = tokens.filter((t) => !COLOR_VALUE.test(t.value) && !t.name.startsWith("--ease-") && !t.name.startsWith("--animation-")).slice(0, 36);
  const colorCards = colors
    .map((t) => `<div class="uik-demo-card"><div class="uik-swatch" style="background: var(${esc(t.name)})"></div><div class="name">${esc(t.name)}</div><div class="value">${esc(t.value)}</div></div>`)
    .join("");
  const easingCards = easings
    .map((t) => `<div class="uik-demo-card"><div class="uik-easing"><i style="transition-timing-function: var(${esc(t.name)})"></i></div><div class="name">${esc(t.name)}</div><div class="value">hover to feel it</div></div>`)
    .join("");
  const animCards = animations
    .map((t) => `<div class="uik-demo-card"><div class="uik-anim" style="animation: var(${esc(t.name)}) 2s ease-in-out infinite">↻</div><div class="name">${esc(t.name)}</div></div>`)
    .join("");
  const restCards = rest
    .map((t) => `<div class="uik-demo-card"><div class="name">${esc(t.name)}</div><div class="value">${esc(t.value)}</div></div>`)
    .join("");
  const section = (title, html) => (html ? `<div class="uik-section-h">${title}</div><div class="uik-demo">${html}</div>` : "");
  return [
    section("Colors", colorCards),
    section("Easings (hover the bars)", easingCards),
    section("Animations", animCards),
    section("Sizes, radii, shadows and more", restCards),
    "",
  ].join("\n    ");
}

/**
 * /uikits/openprops/preview/:slug — live token sheet preview. The css is
 * linked from the baked file route (same origin); nothing is inlined.
 */
export function uikitPreviewHtml(catalog, item, cssRelPath) {
  const kitUrl = `/uikits/${urlPath(catalog.kit)}`;
  const cssUrl = `${kitUrl}/raw/${urlPath(cssRelPath)}`;
  const demo = openpropsDemoHtml(item._cssText || "");
  const main = `
    <div class="uik-crumb"><a href="/uikits">UI kits</a> / <a href="${kitUrl}">${esc(catalog.name)}</a> / <a href="${kitUrl}/item/${urlPath(item.slug)}">${esc(item.slug)}</a> / preview</div>
    <div class="uik-header">
      <h1>${esc(item.title)} — live tokens</h1>
      <p>The baked css is linked from this origin and every sample below resolves a real token. Presentation authored by this repo; the tokens are upstream's, MIT.</p>
    </div>
    <div class="uik-badges">
      <span class="uik-badge">css <b>${esc(cssRelPath)}</b></span>
      ${kitBadges(catalog)}
    </div>
    ${demo}
    <div class="uik-mcp">Drive these tokens programmatically with <code>design_kit_code {"kit": "${esc(catalog.kit)}", "item": "${esc(item.slug)}"}</code> to read the css.</div>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${shellHead(UIKIT_STYLE_LINK)}
<title>${esc(item.title)} preview · ${esc(catalog.name)} · Designer</title>
<link rel="stylesheet" href="${esc(cssUrl)}">
</head><body>
${nav("uikits")}
<main class="uik-shell">${main}</main>
</body></html>`;
}
