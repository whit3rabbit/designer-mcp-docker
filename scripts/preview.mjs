#!/usr/bin/env node
/**
 * design-preview — a live preview server for the design-system catalog.
 *
 * Runs alongside the MCP server and exposes the cached catalog over HTTP with
 * a thumbnail gallery, so you can browse designs in a browser instead of only
 * through tool calls.
 *
 * It reuses the upstream package's own renderer
 * (`fidgetcoding-refero-mcp/dist/design-md.js` -> renderDesignMd) so the
 * DESIGN.md served here is byte-identical to what `refero_design_md` returns.
 *
 * Thumbnails are served from the LOCAL cache (`<cache>/thumbs/<id>.jpg`).
 * There is no CDN redirect: once `fetch-thumbs.mjs` has run, the gallery
 * makes zero outbound requests. OpenDesign entries have no bitmap thumbnail —
 * their preview HTML is self-contained — so they render a generated swatch
 * card instead.
 *
 * Routes
 *   GET /                      gallery UI
 *   GET /api/designs           JSON list (?theme=&industry=&source=&q=&limit=&offset=)
 *   GET /api/designs/:id       full design JSON
 *   GET /api/designs/:id/design.md   rendered DESIGN.md
 *   GET /api/facets            theme/industry/font distributions
 *   GET /api/search?q=         ranked search over the catalog
 *   GET /thumb/:id             local thumbnail bytes
 *   GET /design/:id            detail page
 *   GET /templates             design-system template gallery
 *   GET /template/:slug        one template's tokens, theme, components, files
 *   GET /template/:slug/thumb  local cover image bytes (WebP)
 *   GET /skill                 downloadable skill archive
 *   GET /skill/marketplace.zip the plugin as a local marketplace (offline install)
 *   GET /healthz               readiness probe
 *
 * `/api/styles` and `/style/:id` remain as aliases for the old paths.
 *
 * Env
 *   DESIGN_CACHE_DIR   cache root (default ~/.design-cache)
 *   PORT               listen port (default 8787)
 *   HOST               bind address (default 127.0.0.1)
 */

import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { htmlHeaders, loadFrontend, contentTypeFor } from "./lib/frontend.mjs";
import {
  mergeDesign,
  readComponentsIndex,
  readComponent,
  readPresetsIndex,
  readPresetCatalog,
  readLibrariesIndex,
  readLibraryEntry,
  readDesignSystemsIndex,
  readDesignSystem,
  readClaudePackage,
  readDescriptors,
  readGalleryArtifact,
  readGalleryThumb,
  readOpenDesignPackage,
  readReuiIndex,
  readReuiCategory,
  readReuiScreenshot,
  readDashboardsIndex,
  readDashboard,
  readDashboardFile,
  readDashboardCover,
  readDashboardArchive,
} from "./lib/cache.mjs";
import { reuiCatalogHtml, reuiCategoryHtml } from "./lib/reui-ui.mjs";
import { dashboardsHtml, dashboardDetailHtml } from "./lib/dashboards-ui.mjs";
import {
  readHeroUiCatalog,
  readHeroUiDoc,
  readHeroUiMigrationDoc,
  readHeroUiMigrationIndex,
  readHeroUiSource,
  readHeroUiStyles,
  readHeroUiTheme,
} from "./lib/heroui-docs.mjs";
import { herouiCatalogHtml, herouiDocHtml } from "./lib/heroui-ui.mjs";
import { readBaseUiCatalog, readBaseUiDoc, searchBaseUiDocs } from "./lib/baseui-docs.mjs";
import { baseUiCatalogHtml, baseUiDocHtml } from "./lib/baseui-ui.mjs";
import {
  readMantineCatalog,
  readMantineComponent,
  readMantineProvenance,
  readMantineAsset,
  searchMantine,
} from "./lib/mantine-docs.mjs";
import { mantineCatalogHtml, mantineCategoryHtml, mantineComponentHtml } from "./lib/mantine-ui.mjs";
import {
  readDaisyuiCatalog,
  readDaisyuiComponent,
  readDaisyuiCss,
  readDaisyuiProvenance,
  searchDaisyui,
} from "./lib/daisyui-docs.mjs";
import { daisyuiCatalogHtml, daisyuiComponentHtml } from "./lib/daisyui-ui.mjs";
import {
  assetsHtml,
  componentsHtml,
  componentDetailHtml,
  slopstrapHtml,
  tailwindCatalogHtml,
  tailwindExampleHtml,
  presetsHtml,
  presetDetailHtml,
  templatesHtml,
  templateDetailHtml,
  uiSdkDocsHtml,
  nav,
  NAV_CSS,
} from "./lib/ui.mjs";
import { listUiSdkDocs, readUiSdkDoc } from "./lib/ui-sdk-docs.mjs";
import {
  galleryIndexHtml,
  designDetailHtml,
  promptPanel,
  filePanel,
  KIT_CSS,
  KIT_NAV_CSS,
  kitNav,
  esc as kitEsc,
} from "./lib/kit-ui.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR =
  process.env.DESIGN_CACHE_DIR ||
  process.env.REFERO_CACHE_DIR ||
  join(homedir(), ".design-cache");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

// Where the plugin skills live. In the image it is
// /app/plugins/designer-mcp/skills; in a checkout it is
// <repo>/plugins/designer-mcp/skills. SKILL_DIR is the legacy alias.
const SKILLS_ROOT =
  process.env.SKILLS_ROOT ||
  process.env.SKILL_DIR || // legacy alias for the skills root
  join(HERE, "..", "plugins", "designer-mcp", "skills");
const frontend = await loadFrontend(process.env.DESIGN_FRONTEND_DIR || join(HERE, "..", "dist", "frontend"));

// The upstream package renders DESIGN.md from the full style record. Import it
// from the installed package so both surfaces stay identical. Resolve it
// relative to this file, then walk up a few levels — the scripts live in
// different places in dev (scripts/) and in the image (/app).
const { createRequire } = await import("node:module");
function loadRenderer() {
  const candidates = [];
  let dir = HERE;
  for (let i = 0; i < 5; i++) {
    candidates.push(join(dir, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(c)) return import(`file://${c}`);
  }
  // Last resort: plain node resolution from cwd.
  const require = createRequire(join(process.cwd(), "index.js"));
  return import(`file://${require.resolve("fidgetcoding-refero-mcp/dist/design-md.js")}`);
}
const { renderDesignMd } = await loadRenderer();

/**
 * DESIGN.md for a design, whichever source it came from.
 *
 * Refero entries are rendered by the upstream renderer so the output stays
 * byte-identical to what `refero_design_md` returns. OpenDesign entries ship
 * their own hand-written DESIGN.md — far richer than anything we could
 * synthesise from tokens — so it is served verbatim.
 */
function designMarkdown(full) {
  if (full.designMd) return full.designMd;
  return renderDesignMd(full);
}

// ------------------------------------------------------------------ data
let catalog = [];
let byId = new Map();
let loadedAt = 0;
let descriptors = {};

async function loadCatalog() {
  const p = join(CACHE_DIR, "catalog.json");
  if (!existsSync(p)) throw new Error(`no catalog at ${p}`);
  const raw = JSON.parse(await readFile(p, "utf8"));
  // The merged catalog carries both `designs` and `styles` keys pointing at
  // the same array, so either works.
  catalog = raw.designs || raw.styles || [];
  byId = new Map(catalog.map((s) => [s.id, s]));
  loadedAt = Date.now();
  descriptors = await readDescriptors();
}

async function loadFull(id) {
  const entry = byId.get(id);
  const source = entry?.source || "refero";
  const p =
    source === "opendesign"
      ? join(CACHE_DIR, "systems", `${id}.json`)
      : join(CACHE_DIR, "styles", `${id}.json`);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(await readFile(p, "utf8"));
  // Refero files store { style }; OpenDesign files store { system } plus the
  // package payload. mergeDesign normalises both into one shape.
  return mergeDesign(entry, raw.style ?? raw.system ?? null);
}

/**
 * Local thumbnail bytes for a design, or null.
 *
 * The extension order matters: a compressed `.webp` is preferred over the
 * original `.jpg`, because `compress-thumbs.mjs` writes the WebP alongside
 * the source and the source may still be present.
 */
async function loadThumb(id) {
  for (const ext of [".webp", ".jpg", ".jpeg", ".png"]) {
    const p = join(CACHE_DIR, "thumbs", `${id}${ext}`);
    if (!existsSync(p)) continue;
    const buf = await readFile(p);
    const type =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { buf, type };
  }
  return null;
}

/**
 * A generated swatch card for sources with no bitmap thumbnail
 * (OpenDesign). Pure SVG — no external fonts, no network.
 */
function swatchSvg(d) {
  const colors = (d.colors || []).slice(0, 7);
  const sw =
    colors.length > 0
      ? colors
          .map(
            (c, i) =>
              `<rect x="${i * 90}" y="0" width="90" height="150" fill="${esc(c.hex || "#333")}"/>`,
          )
          .join("")
      : `<rect x="0" y="0" width="630" height="150" fill="#22262c"/>`;
  const label = esc(d.siteName || d.id);
  const bg = d.colorScheme === "dark" ? "#0d0f12" : "#f4f5f7";
  const fg = d.colorScheme === "dark" ? "#e6e9ee" : "#12151a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="630" height="150" viewBox="0 0 630 150">
<rect width="630" height="150" fill="${bg}"/>
<g transform="translate(0,0)">${sw}</g>
<text x="16" y="132" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16" fill="${fg}">${label}</text>
</svg>`;
}

// ------------------------------------------------------------------ search
/** Rank catalog entries against a free-text query. */
function search(query, limit = 40) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = [];
  for (const s of catalog) {
    const hay = [
      s.siteName,
      s.northStar,
      s.industry,
      ...(s.fonts || []),
      ...(s.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (s.siteName?.toLowerCase().includes(t)) score += 10;
      if (s.northStar?.toLowerCase().includes(t)) score += 4;
      if (s.industry?.toLowerCase().includes(t)) score += 3;
      if ((s.fonts || []).some((f) => f.toLowerCase().includes(t))) score += 2;
    }
    if (score > 0) scored.push({ ...s, _score: score });
  }
  scored.sort((a, b) => b._score - a._score || a.siteName.localeCompare(b.siteName));
  return scored.slice(0, limit);
}

function facets() {
  const count = (fn) => {
    const m = new Map();
    for (const s of catalog) {
      const v = fn(s);
      if (!v) continue;
      for (const x of Array.isArray(v) ? v : [v]) m.set(x, (m.get(x) || 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  };
  return {
    total: catalog.length,
    themes: count((s) => s.colorScheme),
    industries: count((s) => s.industry),
    fonts: count((s) => s.fonts),
    sources: count((s) => s.source || "refero"),
    updatedAt: loadedAt,
  };
}

// ------------------------------------------------------------------ html
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ------------------------------------------------------------------ gallery
/**
 * The tags a design system is filed under.
 *
 * The Agent Kit's descriptors give the mood, the industry and the surface —
 * what the tokens cannot say. Refero styles have no descriptors, so they
 * fall back to their industry.
 */
function tagsFor(entry) {
  const descriptor = descriptors[entry.id];
  const tags = [];
  if (descriptor) {
    tags.push(...(descriptor.moods || []), ...(descriptor.industries || []));
  } else if (entry.industry) {
    tags.push(entry.industry);
  }
  return [...new Set(tags.map((t) => String(t).toLowerCase()))];
}

/**
 * The gallery index.
 *
 * Every design in the catalog appears here: the Refero styles and the
 * OpenDesign systems side by side. Systems carry a rendered cover; styles
 * carry their screenshot; the rest fall back to a swatch strip.
 */
function galleryHtml() {
  const designs = catalog.map((entry) => {
    const tags = tagsFor(entry);
    const search = [
      entry.siteName,
      entry.northStar,
      entry.industry,
      ...(entry.fonts || []),
      ...tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return { entry, tags, search };
  });

  // The most-used tags lead, so the chips a reader wants are visible.
  const counts = new Map();
  for (const { tags } of designs) {
    for (const tag of tags) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  const chipList = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 32)
    .map(([value, count]) => ({ value, count }));

  return galleryIndexHtml({
    total: designs.length,
    tags: chipList,
    designs: designs.map(({ entry, tags, search }) => ({
      id: entry.id,
      siteName: entry.siteName,
      tags,
      search,
      colors: entry.colors || [],
      // The OpenDesign covers are rendered images; the Refero styles have
      // screenshots. Both are local bytes.
      thumb: (entry.source || "refero") === "opendesign" ? `/thumb/${encodeURIComponent(entry.id)}` : `/thumb/${encodeURIComponent(entry.id)}`,
    })),
  });
}

/**
 * The design-system detail page.
 *
 * An OpenDesign system with cached gallery artifacts gets the full spoke:
 * the rendered preview beside the prompts and file lists that hand it to a
 * tool. Everything else — the Refero styles — keeps the token-led page,
 * because a screenshot and a token list are all there is to show.
 */
async function detailHtml(s) {
  const src = s.source || "refero";
  const reference = `designer:${src}:${s.id}`;
  const tags = tagsFor(s);

  // The Open Design preview and the Claude Design view.
  const views = [];
  if (src === "opendesign") {
    if (await readGalleryArtifact(s.id, "preview.html")) {
      views.push({ label: "Open Design", src: `/preview/${encodeURIComponent(s.id)}/open-design`, hash: "" });
    }
    if (await readGalleryArtifact(s.id, "claude/view.html")) {
      views.push({
        label: "Claude Design",
        src: `/preview/${encodeURIComponent(s.id)}/claude`,
        hash: "claude",
      });
    }
  }

  // Token extraction works for both sources: Refero nests them under
  // fullResult.raw, OpenDesign under fullResult.raw too (we normalise on
  // import) and additionally carries the typed token JSON.
  const tokens =
    s.fullResult?.raw?.colors?.tokens ||
    s.tokens?.tokens?.filter((t) => t.type === "color") ||
    [];
  const sw = tokens.slice(0, 60).map((t) => {
    const hex = t.value || t.hex || t.color || "";
    return '<div class="tok"><span class="chip" style="background:' + esc(hex) + '"></span>' +
      '<span class="tn">' + esc(t.name || t.context || "") + '</span>' +
      '<span class="tv">' + esc(hex) + '</span></div>';
  }).join("");
  const typeScale = s.fullResult?.designSystem?.typeScale || [];
  const ts = typeScale.map((t) =>
    '<div class="tsr"><span class="tsrole">' + esc(t.role) + '</span>' +
    '<span class="tssize">' + esc(t.size) + 'px / ' + esc(t.lineHeight) + '</span></div>'
  ).join("");
  const dos = (s.fullResult?.designSystem?.dos || []).map((d) => '<li>' + esc(d) + '</li>').join("");
  const donts = (s.fullResult?.designSystem?.donts || []).map((d) => '<li>' + esc(d) + '</li>').join("");

  const main = `
<h2>Color tokens (${tokens.length})</h2><div class="toks">${sw}</div>
${typeScale.length ? `<h2>Type scale</h2><div>${ts}</div>` : ""}
${dos ? `<h2>Do</h2><ul>${dos}</ul>` : ""}
${donts ? `<h2>Don't</h2><ul>${donts}</ul>` : ""}
<h2>DESIGN.md</h2>
<div class="theme-actions">
  <input id="theme-reference" aria-label="Theme reference" value="${esc(reference)}" readonly spellcheck="false">
  <button type="button" id="copy-theme">Copy theme reference</button>
  <a href="/api/designs/${encodeURIComponent(s.id)}/design.md">Open DESIGN.md</a>
  <span id="theme-status" role="status"></span>
</div>
<pre>${esc(designMarkdown(s))}</pre>`;

  if (!views.length) {
    // No gallery artifacts: show the cached screenshot preview + token-led page.
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.siteName)} — Design Systems</title>
<style>
${KIT_CSS}${KIT_NAV_CSS}
  .wrap{max-width:1040px;margin:0 auto;padding:22px 20px 70px}
  .shot-card{margin:18px 0 6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .shot-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}
  .shot-bar button{font:inherit;color:var(--strong);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 9px;cursor:pointer}
  .shot-wrap{max-height:540px;overflow:auto;background:var(--panel2)}
  .shot-wrap.full{max-height:none}
  .shot-wrap img{display:block;width:100%;height:auto}
  .toks{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
  .tok{display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12px}
  .chip{width:20px;height:20px;border-radius:5px;border:1px solid rgba(255,255,255,.14);flex:none}
  .tn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tv{color:var(--muted);font-family:var(--mono);font-size:11px}
  .tsr{display:flex;justify-content:space-between;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 11px;margin-bottom:5px;font-size:13px}
  .tsrole{color:var(--muted)}
  ul{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 12px 12px 30px}
  pre{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px;overflow:auto;font-size:12px;white-space:pre-wrap}
  .theme-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px}
  .theme-actions input,.theme-actions button{font:inherit;color:inherit;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:5px 9px}
  .theme-actions input{width:54ch;max-width:100%;font-family:var(--mono);font-size:12px}
  .theme-actions button{cursor:pointer}
  .theme-actions [role=status]{color:var(--muted);font-size:12px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:26px 0 10px}
</style></head><body>
${kitNav("designs")}
<div class="wrap">
<a href="/">&larr; All design systems</a>
<h1>${esc(s.siteName)}</h1>
<p class="lede">${esc(s.northStar || "")}</p>
${s.url ? `<p class="lede">Source <code>${esc(s.url)}</code></p>` : ""}
${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
<div class="shot-card">
  <div class="shot-bar"><span>Cached screenshot preview</span><button type="button" id="toggle-shot">Expand full height</button></div>
  <div class="shot-wrap" id="shot-wrap"><img src="/thumb/${encodeURIComponent(s.id)}" alt="${esc(s.siteName)} preview"></div>
</div>
${main}
</div>
<script>
const shotWrap = document.getElementById('shot-wrap');
const toggleShot = document.getElementById('toggle-shot');
toggleShot.addEventListener('click', () => {
  const full = shotWrap.classList.toggle('full');
  toggleShot.textContent = full ? 'Collapse height' : 'Expand full height';
});
const reference = document.getElementById('theme-reference');
const status = document.getElementById('theme-status');
document.getElementById('copy-theme').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(reference.value);
    status.textContent = 'Theme reference copied.';
  } catch {
    reference.focus();
    reference.select();
    status.textContent = 'Theme reference selected. Copy it with your keyboard.';
  }
});
</script>
</body></html>`;
  }

  // The spoke: the preview beside the panels that hand the system to a tool.
  const aside = [];
  const claude = await readClaudePackage(s.id);
  const claudeFiles = claude?.files ?? [];

  if (views.length > 1) {
    aside.push(promptPanel(
      "p-open",
      `Use the Open Design design system "${s.id}" for my designs.`,
      "Use it with Open Design",
    ));
  }
  if (claudeFiles.length) {
    aside.push(promptPanel(
      "p-claude",
      `Add the "${s.siteName}" design system to my Claude design systems. Its files, ` +
        `already in Claude's Design System format, are in ` +
        `https://github.com/feimacode/open-design-agent-kit/tree/main/claude-design-systems/${s.id}/project. ` +
        `Build a Design System artifact from them.`,
      "Add it to Claude Design",
    ));
  }

  const kitFiles = [
    { label: "DESIGN.md", href: `/api/designs/${encodeURIComponent(s.id)}/design.md` },
    { label: "tokens.css", href: `/api/designs/${encodeURIComponent(s.id)}/file/tokens.css` },
  ];
  aside.push(filePanel("Open Design files", kitFiles));

  const claudeFileList = claudeFiles.map((f) => ({
    label: f.path,
    href: `/preview/${encodeURIComponent(s.id)}/claude/file/${f.path.split("/").map(encodeURIComponent).join("/")}`,
  }));
  if (claudeFileList.length) aside.push(filePanel("Claude Design files", claudeFileList));

  aside.push(`<section>
  <h2>Theme reference</h2>
  <pre class="prompt" id="p-reference">${esc(reference)}</pre>
  <div><button type="button" class="btn" data-copy="p-reference">Copy reference</button></div>
</section>`);

  return designDetailHtml({
    design: { siteName: s.siteName, northStar: s.northStar || "" },
    views,
    main,
    aside: aside.join("\n"),
    tags,
  });
}

// ------------------------------------------------------------------ server
function json(res, code, body) {
  const payload = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(payload) });
  res.end(payload);
}

function sendHtml(res, body, kind) {
  res.writeHead(200, { ...htmlHeaders(kind), "content-length": Buffer.byteLength(body) });
  return res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const p = url.pathname;

    if (p === "/healthz") return json(res, 200, { ok: true, styles: catalog.length, updatedAt: loadedAt });

    if (p === "/" || p === "/index.html") return sendHtml(res, galleryHtml());

    if (p === "/slopstrap") return sendHtml(res, slopstrapHtml(frontend.publicManifest));

    if (p === "/assets" || p === "/assets/") {
      const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
      const origin = `${proto}://${req.headers.host || "127.0.0.1:8787"}`;
      return sendHtml(res, assetsHtml(frontend.publicManifest, frontend.importMap(), origin));
    }
    if (p === "/assets/manifest.json") {
      return frontend.publicManifest ? json(res, 200, frontend.publicManifest) :
        json(res, 404, { error: "frontend assets have not been built" });
    }
    // The offline CDN: bare specifiers resolved against this origin, so any
    // page anywhere can import react/motion/radix/shadcn from the gallery
    // with zero outbound network. CORS comes from the asset handler.
    if (p === "/assets/importmap.json") {
      const map = frontend.importMap();
      if (!map) return json(res, 404, { error: "frontend assets have not been built" });
      const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
      const host = req.headers.host || "127.0.0.1:8787";
      const origin = `${proto}://${host}`;
      return json(res, 200, {
        version: map.version,
        origin,
        base: `${origin}${map.base}`,
        imports: Object.fromEntries(
          Object.entries(map.imports).map(([specifier, path]) => [specifier, `${origin}${path}`]),
        ),
      });
    }
    if (p.startsWith("/assets/")) {
      if (await frontend.asset(req, res, p)) return;
      return json(res, 404, { error: "frontend asset not found" });
    }

    if (p === "/api/designs" || p === "/api/styles") {
      const theme = url.searchParams.get("theme");
      const ind = url.searchParams.get("industry");
      const src = url.searchParams.get("source");
      const q = url.searchParams.get("q");
      const limit = Math.min(Number(url.searchParams.get("limit") || 200), 5000);
      const offset = Number(url.searchParams.get("offset") || 0);
      let list = q ? search(q, 5000) : catalog;
      if (theme) list = list.filter((s) => s.colorScheme === theme);
      if (ind) list = list.filter((s) => s.industry === ind);
      if (src) list = list.filter((s) => (s.source || "refero") === src);
      return json(res, 200, {
        total: list.length,
        offset,
        limit,
        designs: list.slice(offset, offset + limit),
        // Alias so older clients keep working.
        styles: list.slice(offset, offset + limit),
      });
    }

    if (p === "/api/facets") return json(res, 200, facets());

    // ---------------------------------------------------- offline ui-sdk docs
    if (p === "/docs" || p === "/docs/") {
      const { docs } = await listUiSdkDocs();
      return sendHtml(res, uiSdkDocsHtml(docs));
    }
    if (p === "/api/ui-sdk-docs") {
      return json(res, 200, await listUiSdkDocs());
    }
    const mDoc = p.match(/^\/api\/ui-sdk-docs\/(.+)$/);
    if (mDoc) {
      const content = await readUiSdkDoc(decodeURIComponent(mDoc[1]));
      if (content === null) return json(res, 404, { error: "doc not found" });
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(content);
    }

    // ---------------------------------------------------- ReUI component library
    if (p === "/reui" || p === "/reui/") {
      return sendHtml(res, reuiCatalogHtml(await readReuiIndex()));
    }
    const mReuiShot = p.match(/^\/reui\/screenshot\/([a-z0-9-]+-(?:light|dark)\.png)$/);
    if (mReuiShot) {
      const buf = await readReuiScreenshot(mReuiShot[1]);
      if (!buf) return json(res, 404, { error: "reui screenshot not in cache" });
      res.writeHead(200, {
        "content-type": "image/png",
        "content-length": buf.length,
        "cache-control": "public, max-age=86400",
      });
      return res.end(buf);
    }
    const mReuiPreview = p.match(/^\/reui\/preview\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (mReuiPreview) {
      const [, catSlug, name] = mReuiPreview;
      const doc = frontend.reuiPreviewDocument(catSlug, name);
      return doc
        ? sendHtml(res, doc, "demo")
        : json(res, 404, { error: "reui preview not built" });
    }
    const mReuiCat = p.match(/^\/reui\/([a-z0-9-]+)$/);
    if (mReuiCat) {
      const catSlug = mReuiCat[1];
      const [index, category] = await Promise.all([readReuiIndex(), readReuiCategory(catSlug)]);
      if (!category) return json(res, 404, { error: "reui category not in cache", category: catSlug });
      return sendHtml(res, reuiCategoryHtml(index, category, frontend.reuiPreviewPath));
    }
    if (p === "/api/reui") {
      const index = await readReuiIndex();
      const q = (url.searchParams.get("q") || "").toLowerCase();
      let categories = index.categories || [];
      if (q) {
        categories = categories.filter((c) =>
          `${c.label} ${c.slug} ${c.description || ""} ${(c.items || []).map((i) => `${i.name} ${i.label} ${i.title}`).join(" ")}`
            .toLowerCase()
            .includes(q),
        );
      }
      return json(res, 200, { total: categories.reduce((n, c) => n + c.count, 0), categories });
    }
    const mReuiApi = p.match(/^\/api\/reui\/([a-z0-9-]+)$/);
    if (mReuiApi) {
      const category = await readReuiCategory(mReuiApi[1]);
      if (!category) return json(res, 404, { error: "reui category not in cache", category: mReuiApi[1] });
      return json(res, 200, category);
    }

    // ---------------------------------------------------- HeroUI v3 docs
    if (p === "/heroui" || p === "/heroui/") {
      return sendHtml(res, herouiCatalogHtml(await readHeroUiCatalog()));
    }
    if (p === "/api/heroui") {
      const catalog = await readHeroUiCatalog();
      const q = (url.searchParams.get("q") || "").toLowerCase();
      if (q && catalog.components?.length) {
        const terms = q.split(/\s+/);
        const match = (hay) => terms.every((t) => hay.includes(t));
        catalog.components = catalog.components.filter((c) =>
          match(`${c.name} ${c.slug} ${c.group} ${c.description}`.toLowerCase()),
        );
        catalog.guides = (catalog.guides || []).filter((g) =>
          match(`${g.name} ${g.slug} ${g.group} ${g.description}`.toLowerCase()),
        );
        catalog.totals = { components: catalog.components.length, guides: catalog.guides.length };
      }
      return json(res, 200, catalog);
    }
    const mHeroDoc = p.match(/^\/api\/heroui\/doc\/([\w./-]+\.md|llms\.txt)$/);
    if (mHeroDoc) {
      const content = await readHeroUiDoc(decodeURIComponent(mHeroDoc[1]));
      if (content === null) return json(res, 404, { error: "heroui doc not in cache" });
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(content);
    }
    const mHeroSource = p.match(/^\/api\/heroui\/source\/([a-z0-9-]+)$/);
    if (mHeroSource) {
      const src = await readHeroUiSource(mHeroSource[1]);
      if (!src) return json(res, 404, { error: "heroui source not in cache" });
      return json(res, 200, src);
    }
    const mHeroStyles = p.match(/^\/api\/heroui\/styles\/([a-z0-9-]+)\.css$/);
    if (mHeroStyles) {
      const css = await readHeroUiStyles(mHeroStyles[1]);
      if (css === null) return json(res, 404, { error: "heroui styles not in cache" });
      res.writeHead(200, { "content-type": "text/css; charset=utf-8" });
      return res.end(css);
    }
    if (p === "/api/heroui/theme.json") {
      const theme = await readHeroUiTheme();
      if (!theme) return json(res, 404, { error: "heroui theme not in cache" });
      return json(res, 200, theme);
    }
    if (p === "/api/heroui/migration/index.json") {
      const index = await readHeroUiMigrationIndex();
      if (!index) return json(res, 404, { error: "heroui migration index not in cache" });
      return json(res, 200, index);
    }
    const mHeroMig = p.match(/^\/api\/heroui\/migration\/([\w-]+)(?:\.mdx)?$/);
    if (mHeroMig) {
      const content = await readHeroUiMigrationDoc(mHeroMig[1]);
      if (content === null) return json(res, 404, { error: "heroui migration guide not in cache" });
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(content);
    }
    const mHeroComp = p.match(/^\/heroui\/component\/([a-z0-9-]+)$/);
    if (mHeroComp) {
      const catalog = await readHeroUiCatalog();
      const entry = (catalog.components || []).find((c) => c.slug === mHeroComp[1]);
      if (!entry) return json(res, 404, { error: "heroui component not in catalog", slug: mHeroComp[1] });
      const content = await readHeroUiDoc(entry.path);
      if (content === null) return json(res, 404, { error: "heroui doc not in cache", path: entry.path });
      return sendHtml(res, herouiDocHtml(catalog, entry, "component", content));
    }
    const mHeroGuide = p.match(/^\/heroui\/guide\/([a-z0-9-]+)$/);
    if (mHeroGuide) {
      const catalog = await readHeroUiCatalog();
      const entry = (catalog.guides || []).find((g) => g.slug === mHeroGuide[1]);
      if (!entry) return json(res, 404, { error: "heroui guide not in catalog", slug: mHeroGuide[1] });
      const content = await readHeroUiDoc(entry.path);
      if (content === null) return json(res, 404, { error: "heroui doc not in cache", path: entry.path });
      return sendHtml(res, herouiDocHtml(catalog, entry, "guide", content));
    }

    // ------------------------------------------------------ Base UI docs
    // Base UI is headless, so this section is a docs browser with
    // cross-links to the ReUI gallery, which renders Base UI variants live.
    const baseUiReuiSlugs = () =>
      readReuiIndex().then((idx) => new Set((idx.categories || []).map((c) => c.slug)));
    if (p === "/baseui" || p === "/baseui/") {
      const [catalog, reuiSlugs] = await Promise.all([readBaseUiCatalog(), baseUiReuiSlugs()]);
      return sendHtml(res, baseUiCatalogHtml(catalog, { reuiSlugs }));
    }
    if (p === "/api/baseui") {
      const q = (url.searchParams.get("q") || "").trim();
      if (q) {
        return json(
          res,
          200,
          await searchBaseUiDocs({ query: q, kind: url.searchParams.get("kind") || "", limit: url.searchParams.get("limit") || 20 }),
        );
      }
      return json(res, 200, await readBaseUiCatalog());
    }
    const mBaseApiDoc = p.match(/^\/api\/baseui\/doc\/([\w./-]+\.md)$/);
    if (mBaseApiDoc) {
      const content = await readBaseUiDoc(decodeURIComponent(mBaseApiDoc[1]));
      if (content === null) return json(res, 404, { error: "baseui doc not in cache" });
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(content);
    }
    const mBaseDoc = p.match(/^\/baseui\/doc\/(components|overview|handbook|utils)\/([a-z0-9-]+)$/);
    if (mBaseDoc) {
      const catalog = await readBaseUiCatalog();
      const pool = mBaseDoc[1] === "components" ? catalog.components : catalog.guides;
      const entry = pool.find((e) => e.section === mBaseDoc[1] && e.slug === mBaseDoc[2]);
      if (!entry) {
        return json(res, 404, { error: "baseui doc not in catalog", section: mBaseDoc[1], slug: mBaseDoc[2] });
      }
      const content = await readBaseUiDoc(entry.path);
      if (content === null) return json(res, 404, { error: "baseui doc not in cache", path: entry.path });
      const reuiSlugs = await baseUiReuiSlugs();
      return sendHtml(res, baseUiDocHtml(catalog, entry, content, { reuiSlugs }));
    }

    // ---------------------------------------------------- Mantine UI catalog
    const mantineHelpers = () => ({
      previewPath: (slug) => frontend.mantinePreviewPath(slug),
      thumbnailPath: (slug) => frontend.mantineThumbnailPath(slug),
    });
    if (p === "/mantine" || p === "/mantine/") {
      const [catalog, provenance] = await Promise.all([readMantineCatalog(), readMantineProvenance()]);
      return sendHtml(res, mantineCatalogHtml(catalog, { ...mantineHelpers(), provenance }));
    }
    const mMantineAsset = p.match(/^\/mantine\/asset\/([\w.-]+)$/);
    if (mMantineAsset) {
      const buf = await readMantineAsset(`images/${mMantineAsset[1]}`) ??
        await readMantineAsset(`assets/${mMantineAsset[1]}`);
      if (!buf) return json(res, 404, { error: "mantine asset not in cache", file: mMantineAsset[1] });
      res.writeHead(200, {
        "content-type": contentTypeFor(mMantineAsset[1]),
        "content-length": buf.length,
        "cache-control": "public, max-age=86400",
      });
      return res.end(buf);
    }
    const mMantinePreview = p.match(/^\/mantine\/preview\/([a-z0-9-]+)$/);
    if (mMantinePreview) {
      const doc = frontend.mantinePreviewDocument(mMantinePreview[1]);
      return doc
        ? sendHtml(res, doc, "mantine")
        : json(res, 404, { error: "mantine preview not built", slug: mMantinePreview[1] });
    }
    const mMantineApi = p.match(/^\/api\/mantine\/component\/([a-z0-9-]+)$/);
    if (mMantineApi) {
      const detail = await readMantineComponent(mMantineApi[1]);
      if (!detail) return json(res, 404, { error: "mantine component not in cache", slug: mMantineApi[1] });
      return json(res, 200, detail);
    }
    if (p === "/api/mantine") {
      const q = (url.searchParams.get("q") || "").trim();
      if (q) return json(res, 200, await searchMantine({ query: q, category: url.searchParams.get("category"), limit: url.searchParams.get("limit") }));
      const [catalog, provenance] = await Promise.all([readMantineCatalog(), readMantineProvenance()]);
      return json(res, 200, {
        ...catalog,
        vendor: provenance?.packages
          ? Object.fromEntries(Object.entries(provenance.packages).map(([name, rec]) => [name, rec.version]))
          : {},
      });
    }
    const mMantineCat = p.match(/^\/mantine\/category\/([a-z0-9-]+)$/);
    if (mMantineCat) {
      const catalog = await readMantineCatalog();
      const category = (catalog.groups || []).flatMap((g) => g.categories).find((c) => c.slug === mMantineCat[1]);
      if (!category) return json(res, 404, { error: "mantine category not in cache", category: mMantineCat[1] });
      const group = (catalog.groups || []).find((g) => g.categories.some((c) => c.slug === category.slug));
      return sendHtml(res, mantineCategoryHtml(catalog, { ...category, group: group?.name }, mantineHelpers()));
    }
    const mMantineComp = p.match(/^\/mantine\/component\/([a-z0-9-]+)$/);
    if (mMantineComp) {
      const [catalog, detail] = await Promise.all([readMantineCatalog(), readMantineComponent(mMantineComp[1])]);
      if (!detail) return json(res, 404, { error: "mantine component not in cache", slug: mMantineComp[1] });
      const category = (catalog.groups || []).flatMap((g) => g.categories).find((c) => c.slug === detail.category);
      return sendHtml(res, mantineComponentHtml(catalog, detail, { ...mantineHelpers(), category }));
    }

    // ---------------------------------------------------- daisyUI catalog
    // Native HTML previews keyed off the baked layer: the documents come from
    // the frontend build (with the shared compiled css beside them), the ?theme=
    // query swaps the data-theme attribute against the baked theme list.
    const daisyuiHelpers = () => ({
      previewPath: (slug) => frontend.daisyuiPreviewPath(slug),
      thumbnailPath: (slug) => frontend.daisyuiThumbnailPath(slug),
    });
    if (p === "/daisyui" || p === "/daisyui/") {
      const [catalog, provenance] = await Promise.all([readDaisyuiCatalog(), readDaisyuiProvenance()]);
      return sendHtml(res, daisyuiCatalogHtml(catalog, { ...daisyuiHelpers(), provenance }));
    }
    const mDaisyPreview = p.match(/^\/daisyui\/preview\/([a-z0-9-]+)$/);
    if (mDaisyPreview) {
      const doc = frontend.daisyuiPreviewDocument(mDaisyPreview[1], url.searchParams.get("theme"));
      return doc
        ? sendHtml(res, doc, "native")
        : json(res, 404, { error: "daisyui preview not built", slug: mDaisyPreview[1] });
    }
    const mDaisyCss = p.match(/^\/daisyui\/css\/([a-z0-9-]+)\.css$/);
    if (mDaisyCss) {
      const css = await readDaisyuiCss(mDaisyCss[1]);
      if (css === null) return json(res, 404, { error: "daisyui css not in cache", name: mDaisyCss[1] });
      res.writeHead(200, {
        "content-type": "text/css; charset=utf-8",
        "cache-control": "public, max-age=86400",
      });
      return res.end(css);
    }
    const mDaisyApi = p.match(/^\/api\/daisyui\/component\/([a-z0-9-]+)$/);
    if (mDaisyApi) {
      const detail = await readDaisyuiComponent(mDaisyApi[1]);
      if (!detail) return json(res, 404, { error: "daisyui component not in cache", slug: mDaisyApi[1] });
      return json(res, 200, detail);
    }
    if (p === "/api/daisyui") {
      const q = (url.searchParams.get("q") || "").trim();
      if (q) return json(res, 200, await searchDaisyui({ query: q, group: url.searchParams.get("group"), limit: url.searchParams.get("limit") }));
      const [catalog, provenance] = await Promise.all([readDaisyuiCatalog(), readDaisyuiProvenance()]);
      return json(res, 200, {
        ...catalog,
        records: provenance?.records
          ? Object.fromEntries(Object.entries(provenance.records).map(([name, note]) => [name, note]))
          : {},
      });
    }
    const mDaisyComp = p.match(/^\/daisyui\/component\/([a-z0-9-]+)$/);
    if (mDaisyComp) {
      const [catalog, detail] = await Promise.all([readDaisyuiCatalog(), readDaisyuiComponent(mDaisyComp[1])]);
      if (!detail) return json(res, 404, { error: "daisyui component not in cache", slug: mDaisyComp[1] });
      return sendHtml(res, daisyuiComponentHtml(catalog, detail, daisyuiHelpers()));
    }

    // ---------------------------------------------------- Dashboards
    if (p === "/dashboards" || p === "/dashboards/") {
      return sendHtml(res, dashboardsHtml(await readDashboardsIndex()));
    }
    if (p === "/api/dashboards") {
      return json(res, 200, await readDashboardsIndex());
    }
    const mDashCover = p.match(/^\/dashboard\/([a-z0-9-]+)\/cover$/);
    if (mDashCover) {
      const buf = await readDashboardCover(mDashCover[1]);
      if (!buf) return json(res, 404, { error: "dashboard cover not in cache" });
      res.writeHead(200, { "content-type": "image/png", "content-length": buf.length, "cache-control": "public, max-age=86400" });
      return res.end(buf);
    }
    const mDashDownload = p.match(/^\/dashboard\/([a-z0-9-]+)\/(download|fonts\.zip)$/);
    if (mDashDownload) {
      const [, slug, what] = mDashDownload;
      const kind = what === "fonts.zip" ? "fonts" : "template";
      const buf = await readDashboardArchive(slug, kind);
      if (!buf) return json(res, 404, { error: "dashboard archive not in cache" });
      const filename = kind === "fonts" ? `${slug}-fonts.zip` : `${slug}-offline.zip`;
      res.writeHead(200, {
        "content-type": "application/zip",
        "content-length": buf.length,
        "content-disposition": `attachment; filename="${filename}"`,
      });
      return res.end(buf);
    }
    const mDashFileApi = p.match(/^\/api\/dashboard\/([a-z0-9-]+)\/file$/);
    if (mDashFileApi) {
      const rel = url.searchParams.get("path") || "";
      const buf = await readDashboardFile(mDashFileApi[1], rel);
      if (!buf) return json(res, 404, { error: "dashboard file not in cache" });
      res.writeHead(200, { "content-type": contentTypeFor(rel), "content-length": buf.length });
      return res.end(buf);
    }
    const mDashApi = p.match(/^\/api\/dashboard\/([a-z0-9-]+)$/);
    if (mDashApi) {
      const rec = await readDashboard(mDashApi[1]);
      if (!rec) return json(res, 404, { error: "dashboard not in cache", slug: mDashApi[1] });
      return json(res, 200, rec);
    }
    const mDashDetail = p.match(/^\/dashboard\/([a-z0-9-]+)$/);
    if (mDashDetail) {
      const rec = await readDashboard(mDashDetail[1]);
      if (!rec) return json(res, 404, { error: "dashboard not in cache", slug: mDashDetail[1] });
      return sendHtml(res, dashboardDetailHtml(rec));
    }

    // ---------------------------------------------------- component library
    if (p === "/components" || p === "/components/") {
      return sendHtml(res, componentsHtml(await readComponentsIndex(), frontend.thumbnailPath));
    }

    if (["/tailwind", "/tailwind/", "/tailwind/hyperui", "/tailwind/shadcn"].includes(p)) {
      const source = p.endsWith("/shadcn") ? "shadcn" : "hyperui";
      return sendHtml(res, tailwindCatalogHtml(source, frontend.tailwindGroups(source)));
    }
    const tailwindDetail = /^\/tailwind\/(hyperui|shadcn)\/([a-z0-9-]+)$/.exec(p);
    if (tailwindDetail) {
      const [, source, slug] = tailwindDetail;
      const group = frontend.tailwindGroups(source).find((item) => item.slug === slug);
      const selected = url.searchParams.get("variant");
      const item = selected ? group?.variants.find(({ id }) => id === selected) : group?.variants[0];
      const example = item && await frontend.tailwindExample(item);
      return example ? sendHtml(res, tailwindExampleHtml(source, group, item.id, example)) :
        json(res, 404, { error: "Tailwind component example not in cache" });
    }

    if (p === "/api/components") {
      const index = await readComponentsIndex();
      const q = (url.searchParams.get("q") || "").toLowerCase();
      const cat = url.searchParams.get("category");
      let list = index.components || [];
      if (cat) list = list.filter((c) => c.category === cat);
      if (q) {
        list = list.filter((c) =>
          `${c.name} ${c.description || ""} ${c.category || ""} ${(c.variants || [])
            .map((v) => `${v.name} ${v.id}`)
            .join(" ")}`
            .toLowerCase()
            .includes(q),
        );
      }
      return json(res, 200, { total: list.length, components: list });
    }

    const mThumbnail = p.match(/^\/component\/([a-z0-9-]+)\/thumbnail\/([a-z0-9-]+)$/);
    if (mThumbnail) {
      const [, slug, id] = mThumbnail;
      const component = await readComponent(slug);
      const item = component?.variants?.find((variant) => variant.id === id);
      const file = item && frontend.thumbnailAsset(slug, item);
      if (file && await frontend.asset(req, res, file, "no-cache")) return;
      return json(res, 404, { error: "matching component thumbnail not built" });
    }

    const mPreview = p.match(/^\/component\/([a-z0-9-]+)\/preview\/([a-z0-9-]+)$/);
    if (mPreview) {
      const [, slug, id] = mPreview;
      const component = await readComponent(slug);
      const item = component?.variants?.find((variant) => variant.id === id);
      const kind = item && frontend.previewKind(slug, item);
      const document = kind && frontend.previewDocument(slug, item);
      return document ? sendHtml(res, document, kind) : json(res, 404, { error: "matching component preview not built" });
    }

    const mComponent = p.match(/^\/component\/([^/]+)$/);
    if (mComponent) {
      const slug = decodeURIComponent(mComponent[1]);
      const component = await readComponent(slug);
      if (!component) return json(res, 404, { error: "component not in cache", slug });
      return sendHtml(res, componentDetailHtml(component, component.variants?.map((item) => frontend.previewPath(slug, item))));
    }

    const mComponentApi = p.match(/^\/api\/component\/([^/]+)$/);
    if (mComponentApi) {
      const slug = decodeURIComponent(mComponentApi[1]);
      const component = await readComponent(slug);
      if (!component) return json(res, 404, { error: "component not in cache", slug });
      return json(res, 200, component);
    }

    // ---------------------------------------------------- preset catalogs
    if (p === "/presets" || p === "/presets/") {
      return sendHtml(res, presetsHtml(await readPresetsIndex()));
    }

    if (p === "/api/presets") {
      return json(res, 200, await readPresetsIndex());
    }

    const mPreset = p.match(/^\/presets\/([^/]+)$/);
    if (mPreset) {
      const kind = decodeURIComponent(mPreset[1]);
      const catalog = await readPresetCatalog(kind);
      if (!catalog) return json(res, 404, { error: "preset catalog not in cache", kind });
      return sendHtml(res, presetDetailHtml(catalog));
    }

    const mPresetApi = p.match(/^\/api\/presets\/([^/]+)$/);
    if (mPresetApi) {
      const kind = decodeURIComponent(mPresetApi[1]);
      const catalog = await readPresetCatalog(kind);
      if (!catalog) return json(res, 404, { error: "preset catalog not in cache", kind });
      return json(res, 200, catalog);
    }

    // --------------------------------------------------- library catalog
    // JSON only: the library layer is for agents picking install manifests,
    // there is no gallery page. Serves from the cache like everything else.
    if (p === "/api/libraries") {
      return json(res, 200, await readLibrariesIndex());
    }

    const mLibraryApi = p.match(/^\/api\/library\/([^/]+)$/);
    if (mLibraryApi) {
      const id = decodeURIComponent(mLibraryApi[1]);
      const entry = await readLibraryEntry(id);
      if (!entry) return json(res, 404, { error: "library not in catalog", id });
      return json(res, 200, entry);
    }

    // --------------------------------------------- design-system templates
    if (p === "/templates" || p === "/templates/") {
      return sendHtml(res, templatesHtml(await readDesignSystemsIndex()));
    }

    if (p === "/api/templates") {
      return json(res, 200, await readDesignSystemsIndex());
    }

    // Covers are the vendored thumbnailImage files, served as local bytes.
    // No redirect, no CDN: the gallery works with no network at all.
    const mTemplateThumb = p.match(/^\/template\/([^/]+)\/thumb$/);
    if (mTemplateThumb) {
      const slug = decodeURIComponent(mTemplateThumb[1]);
      const record = await readDesignSystem(slug);
      const rel = record?.thumbnailImage;
      if (record && rel && !rel.includes("..")) {
        const img = join(CACHE_DIR, "design-systems", rel);
        if (existsSync(img)) {
          const buf = await readFile(img);
          const ext = /\.(jpe?g|png|webp)$/i.exec(rel)?.[1]?.toLowerCase();
          const mime =
            ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/webp";
          res.writeHead(200, {
            "content-type": mime,
            "content-length": buf.length,
            "cache-control": "public, max-age=31536000, immutable",
          });
          return res.end(buf);
        }
      }
      return json(res, 404, { error: "no template cover", slug });
    }

    const mTemplate = p.match(/^\/template\/([^/]+)$/);
    if (mTemplate) {
      const slug = decodeURIComponent(mTemplate[1]);
      const record = await readDesignSystem(slug);
      if (!record) return json(res, 404, { error: "template not in cache", slug });
      return sendHtml(res, templateDetailHtml(record, frontend.templateLinks(slug)));
    }

    const mTemplateApi = p.match(/^\/api\/template\/([^/]+)$/);
    if (mTemplateApi) {
      const slug = decodeURIComponent(mTemplateApi[1]);
      const record = await readDesignSystem(slug);
      if (!record) return json(res, 404, { error: "template not in cache", slug });
      return json(res, 200, record);
    }

    if (p === "/api/search") {
      const q = url.searchParams.get("q") || "";
      return json(res, 200, {
        query: q,
        results: search(q, Number(url.searchParams.get("limit") || 40)),
      });
    }

    // Ids are UUIDs (refero) or slugs (opendesign), so the pattern is
    // deliberately permissive but still excludes path separators.
    // A file from a system's Open Design package, for download.
    const mPkgFile = p.match(/^\/api\/designs\/([^/]+)\/file\/(.+)$/);
    if (mPkgFile) {
      const id = decodeURIComponent(mPkgFile[1]);
      const rel = decodeURIComponent(mPkgFile[2]);
      const pkg = await readOpenDesignPackage(id);
      const file = pkg?.files?.find((f) => f.path === rel);
      if (!file) return json(res, 404, { error: "file not in package", id, path: rel });
      const bytes = file.encoding === "base64"
        ? Buffer.from(file.content, "base64")
        : Buffer.from(file.content, "utf8");
      res.writeHead(200, {
        "content-type": contentTypeFor(rel),
        "content-length": bytes.length,
        "content-disposition": `attachment; filename="${rel.split("/").pop()}"`,
      });
      return res.end(bytes);
    }

    const mDesign = p.match(/^\/(?:api\/designs|api\/styles)\/([^/]+?)(\/design\.md)?$/);
    if (mDesign) {
      const id = decodeURIComponent(mDesign[1]);
      const full = await loadFull(id);
      if (!full) return json(res, 404, { error: "design not in cache", id });
      if (mDesign[2]) {
        const md = designMarkdown(full);
        res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
        return res.end(md);
      }
      return json(res, 200, full);
    }

    const mPage = p.match(/^\/(?:design|style)\/([^/]+)$/);
    if (mPage) {
      const id = decodeURIComponent(mPage[1]);
      const full = await loadFull(id);
      if (!full) return json(res, 404, { error: "design not in cache", id });
      return sendHtml(res, await detailHtml(full));
    }

    // ------------------------------------------------ the cached kit artifacts
    // The Agent Kit's rendered preview, the Claude Design view and its
    // cover. All three are cached local bytes, served with the kit policy.
    const mKit = p.match(/^\/preview\/([^/]+)\/(open-design|claude|claude\/cover\.html)$/);
    if (mKit) {
      const id = decodeURIComponent(mKit[1]);
      const kind = mKit[2];
      const rel = kind === "claude" ? "claude/view.html" : kind === "claude/cover.html" ? "claude/cover.html" : "preview.html";
      const bytes = await readGalleryArtifact(id, rel);
      if (!bytes) return json(res, 404, { error: "artifact not cached", id, rel });
      let body = bytes.toString("utf8");
      if (rel === "claude/view.html") {
        // The cover is referenced relatively; point it at its served route.
        body = body.replace(/src="cover\.html"/g, `src="/preview/${encodeURIComponent(id)}/claude/cover.html"`);
      }
      res.writeHead(200, {
        ...htmlHeaders("kit"),
        "content-length": Buffer.byteLength(body),
        "cache-control": "public, max-age=31536000, immutable",
      });
      return res.end(body);
    }

    // A file from a system's Claude Design package, for download.
    const mKitFile = p.match(/^\/preview\/([^/]+)\/claude\/file\/(.+)$/);
    if (mKitFile) {
      const id = decodeURIComponent(mKitFile[1]);
      const rel = decodeURIComponent(mKitFile[2]);
      const pkg = await readClaudePackage(id);
      const file = pkg?.files?.find((f) => f.path === rel);
      if (!file) return json(res, 404, { error: "file not in package", id, path: rel });
      const bytes = file.encoding === "base64"
        ? Buffer.from(file.content, "base64")
        : Buffer.from(file.content, "utf8");
      res.writeHead(200, {
        "content-type": contentTypeFor(rel),
        "content-length": bytes.length,
        "content-disposition": `attachment; filename="${rel.split("/").pop()}"`,
      });
      return res.end(bytes);
    }

    // Thumbnails are served from the LOCAL cache. No redirect to a CDN, so
    // the gallery works with no network at all.
    const mThumb = p.match(/^\/thumb\/([^/]+)$/);
    if (mThumb) {
      const id = decodeURIComponent(mThumb[1]);
      const thumb = await loadThumb(id);
      if (thumb) {
        res.writeHead(200, {
          "content-type": thumb.type,
          "content-length": thumb.buf.length,
          "cache-control": "public, max-age=31536000, immutable",
        });
        return res.end(thumb.buf);
      }
      // The Agent Kit's rendered cover, for the OpenDesign systems.
      const cover = await readGalleryThumb(id);
      if (cover) {
        res.writeHead(200, {
          "content-type": "image/webp",
          "content-length": cover.length,
          "cache-control": "public, max-age=31536000, immutable",
        });
        return res.end(cover);
      }
      // No bitmap for this entry — render a generated swatch.
      const d = byId.get(id);
      if (d) {
        const svg = swatchSvg(d);
        res.writeHead(200, {
          "content-type": "image/svg+xml; charset=utf-8",
          "content-length": Buffer.byteLength(svg),
          "cache-control": "public, max-age=3600",
        });
        return res.end(svg);
      }
      return json(res, 404, { error: "no thumbnail", id });
    }

    // The plugin as a local marketplace: the offline `claude plugin
    // marketplace add <dir>` path. Same three locations as the skill zip.
    if (p === "/skill/marketplace.zip" || p === "/skill/designer-mcp-marketplace.zip") {
      for (const zip of [
        join(SKILLS_ROOT, "designer-mcp-marketplace.zip"),
        join(dirname(SKILLS_ROOT), "designer-mcp-marketplace.zip"),
        join(HERE, "..", "dist", "designer-mcp-marketplace.zip"),
      ]) {
        if (!existsSync(zip)) continue;
        const buf = await readFile(zip);
        res.writeHead(200, {
          "content-type": "application/zip",
          "content-length": buf.length,
          "content-disposition": 'attachment; filename="designer-mcp-marketplace.zip"',
        });
        return res.end(buf);
      }
      return json(res, 404, { error: "marketplace zip not built", hint: "npm run package:skill" });
    }

    // The skills are served from the container so a container-only deployment
    // can hand them out without needing the repo.
    if (p === "/skill" || p === "/skill/" || p === "/skill.zip") {
      // In the image the zip sits beside the skills root; in a checkout it may
      // be inside it or under dist/ after `npm run package:skill`. Try all three.
      const zipCandidates = [
        join(SKILLS_ROOT, "designer-mcp-skill.zip"),
        join(dirname(SKILLS_ROOT), "designer-mcp-skill.zip"),
        join(HERE, "..", "dist", "designer-mcp-skill.zip"),
      ];
      for (const zip of zipCandidates) {
        if (!existsSync(zip)) continue;
        const buf = await readFile(zip);
        res.writeHead(200, {
          "content-type": "application/zip",
          "content-length": buf.length,
          "content-disposition": 'attachment; filename="designer-mcp-skill.zip"',
        });
        return res.end(buf);
      }
      // No prebuilt zip — offer the skills root as a tarball.
      const tar = spawnSync(
        "tar",
        [
          "--exclude=skills/tmp",
          "--exclude=.DS_Store",
          "--exclude=__pycache__",
          "--exclude=*.pyc",
          "-czf", "-", "-C", dirname(SKILLS_ROOT), "skills",
        ],
        { maxBuffer: 64 * 1024 * 1024 },
      );
      if (tar.status === 0 && tar.stdout?.length) {
        res.writeHead(200, {
          "content-type": "application/gzip",
          "content-length": tar.stdout.length,
          "content-disposition": 'attachment; filename="designer-mcp-skill.tar.gz"',
        });
        return res.end(tar.stdout);
      }
      return json(res, 404, { error: "skills not found in image", skillsRoot: SKILLS_ROOT });
    }

    if (p === "/skill/SKILL.md") {
      const md = join(SKILLS_ROOT, "design-system", "SKILL.md");
      if (!existsSync(md)) return json(res, 404, { error: "SKILL.md not found" });
      const body = await readFile(md, "utf8");
      res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
      return res.end(body);
    }

    return json(res, 404, { error: "not found", path: p });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
});

// Wait for the catalog rather than dying. The cache is often populated by a
// separate fetch container that may still be running when the gallery starts,
// so a missing catalog here is normal, not fatal. Without this the container
// crash-loops until the fetch finishes.
const CATALOG_WAIT_MS = Number(process.env.DESIGN_CATALOG_WAIT_MS || 300000);
const CATALOG_POLL_MS = Number(process.env.DESIGN_CATALOG_POLL_MS || 2000);

async function waitForCatalog() {
  const deadline = Date.now() + CATALOG_WAIT_MS;
  let announced = false;
  while (Date.now() < deadline) {
    if (existsSync(join(CACHE_DIR, "catalog.json"))) {
      try {
        await loadCatalog();
        return true;
      } catch {
        // Written but not yet complete — fall through and retry.
      }
    }
    if (!announced) {
      console.log(
        `design-preview waiting for a catalog at ${join(CACHE_DIR, "catalog.json")} ` +
          `(up to ${Math.round(CATALOG_WAIT_MS / 1000)}s). ` +
          `Populate it with: node scripts/refero-public-fetch.js --limit 0`,
      );
      announced = true;
    }
    await new Promise((r) => setTimeout(r, CATALOG_POLL_MS));
  }
  return false;
}

if (!(await waitForCatalog())) {
  console.error(
    `design-preview: no catalog at ${join(CACHE_DIR, "catalog.json")} after ` +
      `${Math.round(CATALOG_WAIT_MS / 1000)}s. Populate it with: ` +
      `node scripts/refero-public-fetch.js --limit 0`,
  );
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  const bySource = {};
  for (const d of catalog) {
    const s = d.source || "refero";
    bySource[s] = (bySource[s] || 0) + 1;
  }
  console.log(
    `design-preview on http://${HOST}:${server.address().port} — ${catalog.length} designs ` +
      `(${Object.entries(bySource).map(([k, v]) => `${k}: ${v}`).join(", ")})`,
  );
});
