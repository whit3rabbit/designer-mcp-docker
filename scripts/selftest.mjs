#!/usr/bin/env node
/**
 * Self-test for designer-mcp.
 *
 * Checks the things that actually broke during development:
 *   1. the cache exists, is complete, and both sources are tagged
 *      (plus the vendored design-system template layer)
 *   2. the upstream renderer is importable and produces a DESIGN.md
 *   3. thumbnails are cached locally (the gallery must not need the network)
 *   4. the preview server starts, serves the gallery, and answers the API
 *   5. the upstream MCP server exposes its tools over stdio
 *   6. the generic MCP server exposes `design_*` tools over both sources
 *   7. the offline HeroUI layer: baked catalog, gallery endpoints, and the
 *      `design_heroui_*` tools
 *   8. the offline Mantine UI layer: baked catalog, live previews, and the
 *      `design_mantine_*` tools
 *   9. the offline daisyUI layer: baked catalog, native HTML previews, and
 *      the `design_daisyui_*` tools
 *  10. the offline Base UI docs layer: baked catalog, gallery endpoints, and
 *      the `design_baseui_*` tools
 *
 * Usage: node scripts/selftest.mjs [--cache <dir>]
 * Defaults to the baked catalog when available so npm test checks the image inputs.
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import http from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const argv = process.argv.slice(2);
const cacheArg = argv.indexOf("--cache");
const bakedCache = join(ROOT, "bake");
const CACHE_DIR =
  cacheArg >= 0 && argv[cacheArg + 1]
    ? resolve(argv[cacheArg + 1])
    : process.env.DESIGN_CACHE_DIR ||
      process.env.REFERO_CACHE_DIR ||
      (existsSync(join(bakedCache, "catalog.json")) ? bakedCache : join(ROOT, "cache"));

let failures = 0;
const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const bad = (msg) => {
  failures++;
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
};
const section = (msg) => console.log(`\n\x1b[1m${msg}\x1b[0m`);

// A server that never answers would hang the whole run. Fail the call instead.
const RPC_TIMEOUT_MS = 30_000;
const rpcDeadline = (reject, method) => {
  const timer = setTimeout(
    () => reject(new Error(`no reply to ${method} within ${RPC_TIMEOUT_MS / 1000}s`)),
    RPC_TIMEOUT_MS,
  );
  timer.unref();
};

// A tool result as JSON. A tool error is plain text ("Error: ..."), and a bare
// JSON.parse on it would throw and skip every check after it in the section.
const toolJson = (res) => {
  const text = res?.result?.content?.[0]?.text ?? "";
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || "empty tool result" };
  }
};
const toolFailed = (res) => res?.result?.isError === true;

console.log(`cache: ${CACHE_DIR}`);

// ------------------------------------------------------------ 1. cache
section("1. Cache");
const catalogPath = join(CACHE_DIR, "catalog.json");
let designs = [];
if (!existsSync(catalogPath)) {
  bad(`no catalog at ${catalogPath} — run: node scripts/refero-public-fetch.js --limit 0`);
} else {
  const cat = JSON.parse(readFileSync(catalogPath, "utf8"));
  designs = cat.designs || cat.styles || [];
  ok(`catalog has ${designs.length} designs`);

  const unique = new Set(designs.map((s) => s.id));
  unique.size === designs.length
    ? ok("all design ids unique")
    : bad(`duplicate ids: ${designs.length - unique.size}`);

  const bySource = {};
  for (const d of designs) {
    const s = d.source || "refero";
    bySource[s] = (bySource[s] || 0) + 1;
  }
  ok(`sources: ${Object.entries(bySource).map(([k, v]) => `${k}=${v}`).join(", ")}`);

  const noFonts = designs.filter((s) => !s.fonts?.length).length;
  const noColors = designs.filter((s) => !s.colors?.length).length;
  noFonts === 0 ? ok("every design has fonts") : bad(`${noFonts} designs have no fonts`);
  noColors === 0 ? ok("every design has colors") : bad(`${noColors} designs have no colors`);

  const untagged = designs.filter((s) => !s.source).length;
  untagged === 0 ? ok("every design carries a source tag") : bad(`${untagged} designs have no source tag`);

  // The vendored design-system template layer.
  const dsIndexPath = join(CACHE_DIR, "design-systems.json");
  if (!existsSync(dsIndexPath)) {
    bad(`no design-systems index at ${dsIndexPath} — run: npm run templates`);
  } else {
    const ds = JSON.parse(readFileSync(dsIndexPath, "utf8"));
    ds.total === 7
      ? ok(`design-systems index has ${ds.total} templates`)
      : bad(`design-systems index has ${ds.total} templates, expected 7`);
    let dsOk = true;
    for (const entry of ds.systems) {
      const record = JSON.parse(
        readFileSync(join(CACHE_DIR, "design-systems", `${entry.slug}.json`), "utf8"),
      );
      if (record.manifest?.schemaVersion !== "design-system-manifest/v1") {
        bad(`template ${entry.slug} has no filled manifest`);
        dsOk = false;
      }
      if (!(record.tokens?.length >= 48)) {
        bad(`template ${entry.slug} has ${record.tokens?.length} tokens, expected 48+`);
        dsOk = false;
      }
    }
    if (!existsSync(join(CACHE_DIR, "design-systems", "manifest-template.json"))) {
      bad("manifest-template.json missing from the design-systems layer");
      dsOk = false;
    }
    dsOk && ok("all seven template records carry the manifest schema and 48+ tokens");
  }
}

// The vendored library catalog layer (hand-authored in data/libraries/).
const libsIndexPath = join(CACHE_DIR, "libraries.json");
if (!existsSync(libsIndexPath)) {
  bad(`no libraries index at ${libsIndexPath} — run: npm run bake`);
} else {
  const libs = JSON.parse(readFileSync(libsIndexPath, "utf8"));
  libs.total >= 9 && (libs.libraries?.length || 0) === libs.total
    ? ok(`libraries index has ${libs.total} entries`)
    : bad(`libraries index has ${libs.total} entries, expected 9+`);
  let libsOk = true;
  for (const entry of libs.libraries || []) {
    let record;
    try {
      record = JSON.parse(readFileSync(join(CACHE_DIR, "libraries", `${entry.id}.json`), "utf8"));
    } catch {
      bad(`library entry file missing for ${entry.id}`);
      libsOk = false;
      continue;
    }
    if (!record.id || !record.name || !record.category || !record.install || !record.files?.length) {
      bad(`library ${entry.id} is missing required fields (id/name/category/install/files)`);
      libsOk = false;
    }
    for (const file of record.files || []) {
      if (!file.path || !file.role || typeof file.content !== "string" || !file.content.trim()) {
        bad(`library ${entry.id} file '${file.path}' is missing path, role, or content`);
        libsOk = false;
      }
    }
  }
  libsOk && ok("all library entries carry install steps and non-empty setup files");
}

// ------------------------------------------------------- 2. renderer
section("2. DESIGN.md renderer");
try {
  const { renderDesignMd } = await import(
    `file://${join(ROOT, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js")}`
  );
  const refero = designs.find((d) => (d.source || "refero") === "refero");
  if (!refero) {
    bad("no Refero design in the catalog");
  } else {
    const full = JSON.parse(
      readFileSync(join(CACHE_DIR, "styles", `${refero.id}.json`), "utf8"),
    ).style;
    const md = renderDesignMd(full);
    md.startsWith("---")
      ? ok(`renders DESIGN.md (${md.length} bytes) for ${refero.siteName}`)
      : bad("rendered markdown has no frontmatter");
  }
} catch (e) {
  bad(`renderer failed: ${e.message}`);
}

// ------------------------------------------------------- 3. thumbnails
section("3. Local thumbnails (offline)");
const thumbsDir = join(CACHE_DIR, "thumbs");
if (!existsSync(thumbsDir)) {
  bad(`no thumbs directory at ${thumbsDir} — run: node scripts/fetch-thumbs.mjs`);
} else {
  const refero = designs.filter((d) => (d.source || "refero") === "refero");
  const withUrl = refero.filter((d) => d.screenshotUrl || d.thumbnailUrl);
  let cached = 0;
  for (const d of withUrl) {
    if (
      existsSync(join(thumbsDir, `${d.id}.jpg`)) ||
      existsSync(join(thumbsDir, `${d.id}.jpeg`)) ||
      existsSync(join(thumbsDir, `${d.id}.png`)) ||
      existsSync(join(thumbsDir, `${d.id}.webp`))
    ) {
      cached++;
    }
  }
  cached === withUrl.length
    ? ok(`all ${cached} Refero thumbnails cached locally`)
    : bad(`${withUrl.length - cached} of ${withUrl.length} thumbnails are not cached`);

  // Report the compression state — a WebP cache should be much smaller.
  const files = readdirSync(thumbsDir);
  const webp = files.filter((f) => f.endsWith(".webp"));
  const jpg = files.filter((f) => /\.jpe?g$/i.test(f));
  const bytes = files.reduce((a, f) => a + statSync(join(thumbsDir, f)).size, 0);
  ok(
    `thumb cache: ${(bytes / 1048576).toFixed(1)} MB ` +
      `(${webp.length} webp, ${jpg.length} jpg, ${files.length} total)`,
  );
}

// ------------------------------------------------------- 4. preview
section("4. Preview server");
const PORT = 8799;
const preview = spawn("node", [join(HERE, "preview.mjs")], {
  env: {
    ...process.env,
    DESIGN_CACHE_DIR: CACHE_DIR,
    REFERO_CACHE_DIR: CACHE_DIR,
    PORT: String(PORT),
    HOST: "127.0.0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let previewErr = "";
preview.stderr.on("data", (d) => (previewErr += d.toString()));
let galleryTheme;

await new Promise((r) => setTimeout(r, 2500));
try {
  const health = await fetch(`http://127.0.0.1:${PORT}/healthz`).then((r) => r.json());
  health.ok ? ok(`healthz reports ${health.styles} designs`) : bad("healthz not ok");

  const list = await fetch(`http://127.0.0.1:${PORT}/api/designs?limit=2`).then((r) => r.json());
  list.designs?.length === 2 ? ok("api/designs returns rows") : bad("api/designs empty");

  const legacy = await fetch(`http://127.0.0.1:${PORT}/api/styles?limit=2`).then((r) => r.json());
  legacy.styles?.length === 2 ? ok("api/styles alias still works") : bad("api/styles alias broken");

  const facets = await fetch(`http://127.0.0.1:${PORT}/api/facets`).then((r) => r.json());
  facets.fonts?.length ? ok(`api/facets reports ${facets.fonts.length} fonts`) : bad("facets has no fonts");
  facets.sources?.length ? ok(`api/facets reports ${facets.sources.length} sources`) : bad("facets has no sources");

  const html = await fetch(`http://127.0.0.1:${PORT}/`).then((r) => r.text());
  html.includes("Design Systems") ? ok("gallery HTML served") : bad("gallery HTML wrong");

  // ------------------------------------- asset CDN: import map and revalidation
  const importmap = await fetch(`http://127.0.0.1:${PORT}/assets/importmap.json`).then((r) => r.json());
  importmap.imports?.react?.includes("/assets/") && importmap.imports["react-dom/client"]
    ? ok(`importmap serves ${Object.keys(importmap.imports).length} specifiers against the request origin`)
    : bad("importmap route wrong or missing");

  const assetPage = await fetch(`http://127.0.0.1:${PORT}/assets`).then((r) => r.text());
  assetPage.includes("The offline import map") ? ok("assets page renders the import map section") : bad("assets page missing import map");

  // Immutable assets must revalidate: If-None-Match with the manifest sha256
  // etag answers 304 before any disk read.
  const assetUrl = `http://127.0.0.1:${PORT}/assets/${importmap.version}/starter/import-map.json`;
  const firstAsset = await fetch(assetUrl);
  const etag = firstAsset.headers.get("etag");
  if (etag) {
    const revalidated = await fetch(assetUrl, { headers: { "if-none-match": etag } });
    revalidated.status === 304 ? ok("asset revalidation answers 304 on If-None-Match") : bad(`asset revalidation returned ${revalidated.status}, expected 304`);
  } else {
    bad("asset response carries no etag");
  }

  // The thumbnail must be served as local bytes, NOT redirected to a CDN —
  // that redirect is what made the gallery need the internet.
  const refero = list.designs.find((d) => (d.source || "refero") === "refero");
  if (refero) {
    const th = await fetch(`http://127.0.0.1:${PORT}/thumb/${refero.id}`, { redirect: "manual" });
    if (th.status === 200) {
      const type = th.headers.get("content-type");
      const bytes = (await th.arrayBuffer()).byteLength;
      ok(`thumb route serves local bytes (${type}, ${bytes} bytes)`);
    } else if (th.status === 302) {
      bad("thumb route redirects to a CDN — the gallery needs the network");
    } else {
      bad(`thumb returned ${th.status}`);
    }
  }

  const md = await fetch(`http://127.0.0.1:${PORT}/api/designs/${refero.id}/design.md`).then((r) => r.text());
  md.startsWith("---") ? ok("design.md route serves markdown") : bad("design.md route wrong");

  const detail = await fetch(`http://127.0.0.1:${PORT}/design/${refero.id}`).then((r) => r.text());
  detail.includes("Color tokens") ? ok("detail page renders") : bad("detail page wrong");
  galleryTheme = { reference: `designer:refero:${refero.id}`, md };
  detail.includes(`value="${galleryTheme.reference}"`) && detail.includes("Copy theme reference") &&
    detail.includes(`href="/api/designs/${refero.id}/design.md"`)
    ? ok("detail page provides the exact reference and raw Markdown link")
    : bad("detail page is missing the theme handoff");

  // ------------------------------------------------- AI component library
  const comps = await fetch(`http://127.0.0.1:${PORT}/api/components`).then((r) => r.json());
  if (comps.total) {
    ok(`api/components reports ${comps.total} components`);

    const compHtml = await fetch(`http://127.0.0.1:${PORT}/components`).then((r) => r.text());
    compHtml.includes("Components") ? ok("component library page renders") : bad("component page wrong");

    const first = comps.components[0];
    const one = await fetch(`http://127.0.0.1:${PORT}/api/component/${first.slug}`).then((r) => r.json());
    const variant = one.variants?.[0];
    if (variant?.code) {
      // Real TSX, not a description of it.
      const looksLikeTsx =
        variant.code.includes("export function") || variant.code.includes("export default");
      looksLikeTsx
        ? ok(`component source is real TSX (${variant.filename}, ${variant.code.length} bytes)`)
        : bad(`component source for ${variant.filename} is not TSX`);
    } else {
      bad(`component ${first.slug} has no source code`);
    }

    const detailHtml = await fetch(`http://127.0.0.1:${PORT}/component/${first.slug}`).then((r) => r.text());
    detailHtml.includes("Copy") ? ok("component detail page renders") : bad("component detail wrong");
  } else {
    bad("no components in the cache — run: node scripts/fetch-gradientdeck.mjs");
  }

  // ------------------------------------------------------ vendored slopstrap
  // The joke framework rides in the components catalog (previewable: false,
  // native HTML previews instead of React demos), serves a live examples
  // page, and ships its zip through the /assets file server.
  const slop = await fetch(`http://127.0.0.1:${PORT}/api/component/slopstrap`).then((r) => r.json());
  slop.slug === "slopstrap" && slop.previewable === false && (slop.variants || []).length === 4
    ? ok("slopstrap catalog record serves with 4 example variants and no React demo")
    : bad("slopstrap catalog record is missing or malformed — run: npm run slopstrap");
  const slopPage = await fetch(`http://127.0.0.1:${PORT}/slopstrap`).then((r) => r.text());
  slopPage.includes("slopstrap.css") && slopPage.includes("slopstrap.js")
    ? ok("slopstrap examples page loads the vendored css and js")
    : bad("slopstrap examples page does not link the vendored files");
  const slopDetail = await fetch(`http://127.0.0.1:${PORT}/component/slopstrap`).then((r) => r.text());
  slopDetail.includes("slopstrap.mikelacher.com") &&
  slopDetail.includes("/component/slopstrap/preview/slopstrap-landing")
    ? ok("slopstrap component page renders with homepage link and a native preview frame")
    : bad("slopstrap component page is missing the homepage link or preview frame");
  const slopPreview = await fetch(`http://127.0.0.1:${PORT}/component/slopstrap/preview/slopstrap-landing`).then((r) => r.text());
  slopPreview.includes("slop-body") && slopPreview.includes("data-preview=\"loading\"") &&
  slopPreview.includes('id="preview-root"') && !slopPreview.includes("./dist/slopstrap.css")
    ? ok("slopstrap native preview is self-contained and honors the preview contract")
    : bad("slopstrap native preview is missing, unflagged, or still references ./dist assets");
  const slopManifest = await fetch(`http://127.0.0.1:${PORT}/assets/manifest.json`).then((r) => r.json());
  const zipUrl = slopManifest?.slopstrap?.zip?.url;
  if (zipUrl) {
    const zipBytes = Buffer.from(await fetch(`http://127.0.0.1:${PORT}${zipUrl}`).then((r) => r.arrayBuffer()));
    const vendored = readFileSync(join(HERE, "..", "data", "slopstrap", "slopstrap.zip"));
    zipBytes.equals(vendored) ? ok("slopstrap zip serves byte-identical to the vendored copy")
      : bad("served slopstrap zip differs from data/slopstrap/slopstrap.zip");
  } else {
    bad("assets manifest has no slopstrap layer — run: npm run frontend:build");
  }
  const slopThumbRes = await fetch(`http://127.0.0.1:${PORT}/component/slopstrap/thumbnail/slopstrap-landing`);
  if (slopThumbRes.status === 200) {
    const thumbBytes = Buffer.from(await slopThumbRes.arrayBuffer());
    thumbBytes.length > 1000 && thumbBytes[0] === 0xff
      ? ok(`slopstrap thumbnail captured (${(thumbBytes.length / 1024).toFixed(0)} KB jpeg)`)
      : bad(`slopstrap thumbnail bytes look wrong (${thumbBytes.length} bytes)`);
    const listHtml = await fetch(`http://127.0.0.1:${PORT}/components`).then((r) => r.text());
    listHtml.includes("/component/slopstrap/thumbnail/")
      ? ok("components listing shows the slopstrap card image")
      : bad("components listing has no slopstrap thumbnail");
  } else {
    bad("no slopstrap thumbnail built — run: npm run frontend:build");
  }

  // ---------------------------------------------------------- preset catalogs
  const presets = await fetch(`http://127.0.0.1:${PORT}/api/presets`).then((r) => r.json());
  if (presets.total) {
    ok(`api/presets reports ${presets.total} presets across ${presets.catalogs.length} catalogs`);
    const kind = presets.catalogs[0].kind;
    const cat = await fetch(`http://127.0.0.1:${PORT}/api/presets/${kind}`).then((r) => r.json());
    const p0 = cat.presets?.[0];
    p0?.style || p0?.code
      ? ok(`preset catalog "${kind}" carries real CSS (${cat.presets.length} presets)`)
      : bad(`preset catalog "${kind}" has no style or code`);
    const pHtml = await fetch(`http://127.0.0.1:${PORT}/presets/${kind}`).then((r) => r.text());
    pHtml.includes("preset") ? ok("preset page renders") : bad("preset page wrong");
  } else {
    bad("no presets in the cache — run: node scripts/fetch-presets.mjs");
  }

  // ----------------------------------------------------------------- ReUI
  const reui = await fetch(`http://127.0.0.1:${PORT}/api/reui`).then((r) => r.json());
  if (reui.total && reui.categories?.length) {
    ok(`api/reui reports ${reui.total} components across ${reui.categories.length} categories`);
    const reuiHtml = await fetch(`http://127.0.0.1:${PORT}/reui`).then((r) => r.text());
    reuiHtml.includes("ReUI Components") ? ok("reui gallery page renders") : bad("reui gallery wrong");
    const catSlug = reui.categories[0].slug;
    const catHtml = await fetch(`http://127.0.0.1:${PORT}/reui/${catSlug}`).then((r) => r.text());
    catHtml.includes("reui-card") ? ok(`reui category page renders (${catSlug})`) : bad("reui category wrong");
    const firstItem = reui.categories[0].items?.[0]?.name;
    if (firstItem) {
      const prevRes = await fetch(`http://127.0.0.1:${PORT}/reui/preview/${catSlug}/${firstItem}`);
      prevRes.status === 200 ? ok(`reui preview HTML served (${catSlug}/${firstItem})`) : bad(`reui preview returned ${prevRes.status}`);
    }
  } else {
    bad("no ReUI components in the cache — run: npm run reui");
  }

  // ------------------------------------------------------------- Dashboards
  const dash = await fetch(`http://127.0.0.1:${PORT}/api/dashboards`).then((r) => r.json());
  if (dash.total && dash.dashboards?.length) {
    ok(`api/dashboards reports ${dash.total} dashboard(s)`);
    const dSlug = dash.dashboards[0].slug;
    const dListHtml = await fetch(`http://127.0.0.1:${PORT}/dashboards`).then((r) => r.text());
    dListHtml.includes("Dashboards") ? ok("dashboards gallery page renders") : bad("dashboards gallery wrong");
    const dDetailHtml = await fetch(`http://127.0.0.1:${PORT}/dashboard/${dSlug}`).then((r) => r.text());
    dDetailHtml.includes("Quick Offline Setup") ? ok(`dashboard detail page renders (${dSlug})`) : bad("dashboard detail wrong");
    const zipRes = await fetch(`http://127.0.0.1:${PORT}/dashboard/${dSlug}/download`);
    zipRes.status === 200 && zipRes.headers.get("content-type") === "application/zip"
      ? ok(`dashboard offline ZIP served (${dSlug})`)
      : bad(`dashboard ZIP returned ${zipRes.status}`);
    const fontsRes = await fetch(`http://127.0.0.1:${PORT}/dashboard/${dSlug}/fonts.zip`);
    fontsRes.status === 200 && fontsRes.headers.get("content-type") === "application/zip"
      ? ok(`dashboard offline fonts ZIP served (${dSlug})`)
      : bad(`dashboard fonts ZIP returned ${fontsRes.status}`);
  } else {
    bad("no dashboards in the cache — run: npm run dashboards");
  }

  // ------------------------------------------------- design-system templates
  const tmpl = await fetch(`http://127.0.0.1:${PORT}/api/templates`).then((r) => r.json());
  if (tmpl.total) {
    ok(`api/templates reports ${tmpl.total} templates`);
    const slug = tmpl.systems[0].slug;

    const tHtml = await fetch(`http://127.0.0.1:${PORT}/templates`).then((r) => r.text());
    tHtml.includes("System templates") ? ok("template gallery page renders") : bad("template gallery wrong");

    const tOne = await fetch(`http://127.0.0.1:${PORT}/api/template/${slug}`).then((r) => r.json());
    tOne.manifest?.schemaVersion === "design-system-manifest/v1"
      ? ok(`api/template/${slug} carries the filled manifest`)
      : bad(`api/template/${slug} has no filled manifest`);

    const cover = await fetch(`http://127.0.0.1:${PORT}/template/${slug}/thumb`, { redirect: "manual" });
    cover.status === 200 && (cover.headers.get("content-type") || "").startsWith("image/")
      ? ok(`template cover serves local bytes (${cover.headers.get("content-type")})`)
      : bad(`template cover returned ${cover.status}`);

    const tDetail = await fetch(`http://127.0.0.1:${PORT}/template/${slug}`).then((r) => r.text());
    tDetail.includes("Color roles") ? ok("template detail page renders") : bad("template detail wrong");
  } else {
    bad("no design-system templates in the cache — run: npm run templates");
  }

  // An OpenDesign entry, if present.
  const od = designs.find((d) => d.source === "opendesign");
  if (od) {
    const odMd = await fetch(`http://127.0.0.1:${PORT}/api/designs/${od.id}/design.md`).then((r) => r.text());
    odMd.includes("Design System") ? ok(`opendesign design.md served (${od.id})`) : bad("opendesign design.md wrong");

    const odThumb = await fetch(`http://127.0.0.1:${PORT}/thumb/${od.id}`, { redirect: "manual" });
    odThumb.status === 200
      ? ok("opendesign thumbnail served (generated swatch)")
      : bad(`opendesign thumb returned ${odThumb.status}`);
  }

  // ------------------------------------------------------- the Agent Kit layer
  // The gallery shows each design system two ways: as an Open Design
  // preview and as a Claude Design package. Both come from the local cache.
  const kit = designs.find((d) => d.source === "opendesign" && existsSync(join(CACHE_DIR, "gallery", d.id, "preview.html")));
  if (kit) {
    const detail = await fetch(`http://127.0.0.1:${PORT}/design/${kit.id}`).then((r) => r.text());
    detail.includes("/open-design") && detail.includes("/claude")
      ? ok(`design-system page shows both tabs (${kit.id})`)
      : bad("design-system page is missing a tab");

    const open = await fetch(`http://127.0.0.1:${PORT}/preview/${kit.id}/open-design`);
    const openBody = await open.text();
    open.status === 200 && openBody.includes("<!doctype html>")
      ? ok(`Open Design preview served (${kit.id})`)
      : bad(`open-design preview returned ${open.status}`);

    const claude = await fetch(`http://127.0.0.1:${PORT}/preview/${kit.id}/claude`);
    claude.status === 200 && (await claude.text()).includes("<!doctype html>")
      ? ok(`Claude Design view served (${kit.id})`)
      : bad(`claude view returned ${claude.status}`);

    const claudeFile = await fetch(`http://127.0.0.1:${PORT}/preview/${kit.id}/claude/file/README.md`);
    claudeFile.status === 200
      ? ok(`Claude Design file served (${kit.id})`)
      : bad(`claude file returned ${claudeFile.status}`);

    const pkgFile = await fetch(`http://127.0.0.1:${PORT}/api/designs/${kit.id}/file/tokens.css`);
    pkgFile.status === 200 && (await pkgFile.text()).includes(":root")
      ? ok(`Open Design package file served (${kit.id})`)
      : bad(`package file returned ${pkgFile.status}`);

    // The cached artifacts must be self-contained: no page may reach out.
    const artifacts = [openBody, await (await fetch(`http://127.0.0.1:${PORT}/preview/${kit.id}/claude`)).text()];
    const external = artifacts.filter((t) => /https?:\/\/[^\s"']+\.(?:css|js|png|jpg|webp|woff2?)/i.test(t));
    external.length === 0
      ? ok("cached kit artifacts reference no external assets")
      : bad(`cached kit artifacts reach out: ${external[0].match(/https?:\/\/[^\s"']+/)?.[0]}`);
  } else {
    console.log("  (no Agent Kit gallery artifacts cached — skipping the kit checks)");
  }
} catch (e) {
  bad(`preview server failed: ${e.message}${previewErr ? ` | ${previewErr.slice(0, 200)}` : ""}`);
} finally {
  preview.kill();
}

// ------------------------------------------------------------ 5. MCP
section("5. Upstream MCP server (stdio, refero_* tools)");
await new Promise((r) => setTimeout(r, 800));
const mcp = spawn("node", [join(HERE, "mcp-entry.mjs")], {
  env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
  stdio: ["pipe", "pipe", "pipe"],
});
let buf = "";
const pending = new Map();
mcp.stdout.on("data", (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    try {
      const m = JSON.parse(line);
      const p = pending.get(m.id);
      if (p) {
        pending.delete(m.id);
        p(m);
      }
    } catch {}
  }
});
let id = 0;
const call = (method, params) =>
  new Promise((resolve, reject) => {
    rpcDeadline(reject, method);
    const myId = ++id;
    pending.set(myId, resolve);
    mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
  });

try {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "selftest", version: "1" },
  });
  const tools = await call("tools/list", {});
  const n = tools.result?.tools?.length ?? 0;
  n === 7 ? ok(`exposes ${n} tools`) : bad(`expected 7 tools, got ${n}`);

  const res = await call("tools/call", {
    name: "refero_search",
    arguments: { query: "dark developer tool", limit: 3 },
  });
  const parsed = JSON.parse(res.result.content[0].text);
  parsed.count > 0 ? ok(`refero_search returns ${parsed.count} hits`) : bad("refero_search empty");

  const facets = await call("tools/call", { name: "refero_facets", arguments: {} });
  const f = JSON.parse(facets.result.content[0].text);
  f.total > 0 ? ok(`refero_facets reports ${f.total} styles`) : bad("refero_facets empty");
} catch (e) {
  bad(`MCP server failed: ${e.message}`);
} finally {
  mcp.kill();
}

// ------------------------------------------------------- 6. generic MCP
section("6. Generic MCP server (stdio, design_* tools)");
await new Promise((r) => setTimeout(r, 800));
const designMcp = spawn("node", [join(HERE, "mcp-server.mjs")], {
  env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
  stdio: ["pipe", "pipe", "pipe"],
});
let dbuf = "";
const dpending = new Map();
designMcp.stdout.on("data", (d) => {
  dbuf += d.toString();
  let i;
  while ((i = dbuf.indexOf("\n")) >= 0) {
    const line = dbuf.slice(0, i).trim();
    dbuf = dbuf.slice(i + 1);
    if (!line) continue;
    try {
      const m = JSON.parse(line);
      const p = dpending.get(m.id);
      if (p) {
        dpending.delete(m.id);
        p(m);
      }
    } catch {}
  }
});
let did = 0;
const dcall = (method, params) =>
  new Promise((resolve, reject) => {
    rpcDeadline(reject, method);
    const myId = ++did;
    dpending.set(myId, resolve);
    designMcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
  });

try {
  await dcall("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "selftest", version: "1" },
  });
  const dtools = await dcall("tools/list", {});
  const names = (dtools.result?.tools || []).map((t) => t.name);
  const expected = [
    "design_search", "design_get", "design_package_file", "design_list", "design_facets", "design_markdown",
    "design_component_search", "design_component_get", "design_component_code",
    "design_preset_search", "design_preset_get",
    "design_template_list", "design_template_get", "design_template_file",
    "design_manifest_template", "design_markdown_parse", "design_manifest_from",
    "design_markdown_render", "design_markdown_validate",
  ];
  const missing = expected.filter((t) => !names.includes(t));
  missing.length === 0
    ? ok(`exposes ${names.length} tools: ${names.join(", ")}`)
    : bad(`missing tools: ${missing.join(", ")}`);

  const sres = await dcall("tools/call", {
    name: "design_search",
    arguments: { query: "dark developer tool", limit: 5 },
  });
  const sParsed = JSON.parse(sres.result.content[0].text);
  sParsed.count > 0
    ? ok(`design_search returns ${sParsed.count} hits`)
    : bad("design_search empty");

  const dFacets = await dcall("tools/call", { name: "design_facets", arguments: {} });
  const df = JSON.parse(dFacets.result.content[0].text);
  df.total === designs.length
    ? ok(`design_facets reports ${df.total} designs`)
    : bad(`design_facets reports ${df.total}, expected ${designs.length}`);
  df.sources?.length > 1
    ? ok(`design_facets reports ${df.sources.length} sources`)
    : bad("design_facets reports fewer than 2 sources");

  // Strict tool-schema validators reject a top-level oneOf/anyOf/allOf, and
  // one rejected schema can fail the client's whole tool list.
  const unionTools = (dtools.result?.tools || []).filter(
    (t) => t.inputSchema?.type !== "object" || t.inputSchema.oneOf || t.inputSchema.anyOf || t.inputSchema.allOf,
  );
  unionTools.length === 0
    ? ok("every inputSchema is a plain object schema (no top-level oneOf/anyOf/allOf)")
    : bad(`tools with a top-level union or non-object schema: ${unionTools.map((t) => t.name).join(", ")}`);

  const dl = await dcall("tools/call", { name: "design_list", arguments: { limit: 5 } });
  const dlr = toolJson(dl);
  dlr.total === designs.length && dlr.count === Math.min(5, designs.length) && dlr.designs?.[0]?.id
    ? ok(`design_list pages the catalog (${dlr.count} of ${dlr.total})`)
    : bad(`design_list returned count=${dlr.count}, total=${dlr.total}: ${dlr.error || ""}`);
  const dlEnd = toolJson(await dcall("tools/call", { name: "design_list", arguments: { offset: designs.length } }));
  dlEnd.count === 0
    ? ok("design_list returns an empty page past the end")
    : bad(`design_list past the end returned ${dlEnd.count} rows`);

  // An identifier that names nothing must fail. It used to resolve to
  // whichever site name happened to be contained in it.
  for (const junk of ["not-a-real-design-xyz", "zz"]) {
    const jr = await dcall("tools/call", { name: "design_get", arguments: { identifier: junk } });
    toolFailed(jr)
      ? ok(`design_get rejects the unknown identifier '${junk}'`)
      : bad(`design_get resolved '${junk}' to '${toolJson(jr).siteName}'`);
  }
  // A partial site name still resolves, and the reply says it was a guess.
  const otherNames = new Set(designs.map((d) => String(d.siteName).toLowerCase()));
  const partial = designs
    .map((d) => String(d.siteName).toLowerCase())
    .filter((n) => /^[a-z0-9 ]{7,}$/.test(n))
    .map((n) => n.slice(0, -1))
    .find((n) => !otherNames.has(n));
  if (partial) {
    const gr = toolJson(await dcall("tools/call", { name: "design_get", arguments: { identifier: partial } }));
    gr.matchedBy === "substring" && gr.matchNote
      ? ok(`design_get flags a guessed match ('${partial}' -> '${gr.siteName}', matchedBy=${gr.matchedBy})`)
      : bad(`design_get did not flag the guessed match for '${partial}': matchedBy=${gr.matchedBy}, ${gr.error || ""}`);
  }

  // An unknown filter value is a bad argument, not "nothing cached".
  const badTheme = await dcall("tools/call", {
    name: "design_search",
    arguments: { query: "dashboard", theme: "purple" },
  });
  toolFailed(badTheme) && /theme must be one of/.test(badTheme.result.content[0].text)
    ? ok("design_search rejects an unknown theme instead of returning zero hits")
    : bad(`design_search accepted theme 'purple': ${badTheme.result?.content?.[0]?.text?.slice(0, 80)}`);

  // ---- Reply-size budgets. Every reply lands in the calling model's
  // context, so the defaults are held to a budget here. Raise a number only
  // on purpose: a bigger default is a cost every caller pays.
  const replyBytes = (res) => Buffer.byteLength(res?.result?.content?.[0]?.text ?? "");
  const manifestBytes = Buffer.byteLength(JSON.stringify(dtools.result));
  manifestBytes <= 36_000
    ? ok(`tools/list is ${manifestBytes} bytes (budget 36000)`)
    : bad(`tools/list grew to ${manifestBytes} bytes (budget 36000): trim descriptions or drop parameters`);

  const budgetChecks = [
    ["design_search", { query: "dark developer tool" }, 14_000],
    ["design_list", {}, 32_000],
    ["design_get", { identifier: designs.find((d) => (d.source || "refero") === "refero")?.id }, 70_000],
    ["design_component_search", {}, 14_000],
    ["design_preset_search", {}, 6_000],
    ["design_heroui_list_components", {}, 24_000],
    ["design_mantine_list_components", {}, 40_000],
    ["design_daisyui_list_components", {}, 24_000],
    ["design_baseui_list_components", {}, 32_000],
  ];
  const overBudget = [];
  for (const [tool, args, budget] of budgetChecks) {
    const res = await dcall("tools/call", { name: tool, arguments: args });
    const size = replyBytes(res);
    if (toolFailed(res) || size > budget) overBudget.push(`${tool} ${toolFailed(res) ? "failed" : `${size} > ${budget}`}`);
  }
  overBudget.length === 0
    ? ok(`default replies stay inside their byte budgets (${budgetChecks.length} tools)`)
    : bad(`default replies over budget: ${overBudget.join("; ")}`);

  // Slim rows keep a short palette; detail: "full" restores the v1.8.0 row.
  const slimRow = toolJson(await dcall("tools/call", {
    name: "design_search", arguments: { query: "dark developer tool", limit: 1 },
  })).results?.[0];
  const fullRow = toolJson(await dcall("tools/call", {
    name: "design_search", arguments: { query: "dark developer tool", limit: 1, detail: "full" },
  })).results?.[0];
  slimRow?.colors?.length > 0 && slimRow.colors.length <= 8 && !("role" in slimRow.colors[0]) && !("screenshotUrl" in slimRow) &&
    fullRow?.colors?.length >= slimRow.colors.length && "screenshotUrl" in fullRow
    ? ok(`design_search rows are slim by default (${slimRow.colors.length} swatches) and full on request (${fullRow.colors.length})`)
    : bad("design_search summary/full rows do not have the expected shapes");

  // The reply limit rejects, with advice, rather than truncating JSON.
  const tooBig = await dcall("tools/call", { name: "design_list", arguments: { limit: 100, detail: "full" } });
  toolFailed(tooBig) && /reply limit/.test(tooBig.result.content[0].text) && /limit|offset/.test(tooBig.result.content[0].text)
    ? ok("an over-limit reply is refused with a hint, not truncated")
    : bad(`design_list limit 100 detail full was not refused: ${replyBytes(tooBig)} bytes`);

  // Paging: walk the largest ui-sdk doc and check the pages add up to it.
  const docIndex = toolJson(await dcall("tools/call", { name: "design_docs_search", arguments: { limit: 100 } }));
  const bigDoc = (docIndex.docs || []).slice().sort((a, b) => (b.bytes || 0) - (a.bytes || 0))[0];
  if (bigDoc?.bytes > 40_000) {
    let offset = 0;
    let pages = 0;
    let bytes = 0;
    let largest = 0;
    let failure = "";
    while (offset !== undefined && pages < 60) {
      const res = await dcall("tools/call", { name: "design_docs_get", arguments: { path: bigDoc.path, offset } });
      const page = toolJson(res);
      if (toolFailed(res) || typeof page.content !== "string") {
        failure = page.error || "no content";
        break;
      }
      pages++;
      bytes += Buffer.byteLength(page.content);
      largest = Math.max(largest, replyBytes(res));
      offset = page.nextOffset;
    }
    !failure && bytes === bigDoc.bytes && pages > 1 && largest <= 50_000
      ? ok(`design_docs_get pages '${bigDoc.path}' (${bigDoc.bytes} bytes in ${pages} pages, largest reply ${largest})`)
      : bad(`design_docs_get paging wrong for '${bigDoc.path}': ${failure || `${bytes} of ${bigDoc.bytes} bytes in ${pages} pages, largest ${largest}`}`);
  }

  // The component library must return real source, not a description.
  const cs = await dcall("tools/call", {
    name: "design_component_search",
    arguments: { query: "prompt", limit: 5 },
  });
  const csr = JSON.parse(cs.result.content[0].text);
  if (csr.total > 0) {
    ok(`design_component_search reports ${csr.total} components`);

    const cg = await dcall("tools/call", {
      name: "design_component_get",
      arguments: { slug: csr.components[0].slug },
    });
    const cgr = JSON.parse(cg.result.content[0].text);
    cgr.variants?.length
      ? ok(`design_component_get returns ${cgr.variants.length} variants for '${cgr.slug}'`)
      : bad(`design_component_get returned no variants for '${cgr.slug}'`);
    cgr.variants?.every((v) => !("code" in v) && v.codeBytes > 0)
      ? ok("design_component_get lists variants without inlining their source")
      : bad("design_component_get still inlines variant source by default");

    const cc = await dcall("tools/call", {
      name: "design_component_code",
      arguments: { slug: cgr.slug, variant: cgr.variants[0].id },
    });
    const ccr = JSON.parse(cc.result.content[0].text);
    const isTsx = /export (function|default)/.test(ccr.code || "");
    isTsx
      ? ok(`design_component_code returns real TSX (${ccr.variant.filename})`)
      : bad(`design_component_code did not return TSX for '${cgr.slug}'`);
  } else {
    bad("design_component_search found no components");
  }

  // The preset catalogs must carry real CSS.
  const ps = await dcall("tools/call", {
    name: "design_preset_search",
    arguments: { limit: 5 },
  });
  const psr = JSON.parse(ps.result.content[0].text);
  if (psr.total > 0) {
    ok(`design_preset_search reports ${psr.total} presets`);
    const pg = await dcall("tools/call", {
      name: "design_preset_get",
      arguments: { kind: psr.kinds[0] },
    });
    const pgr = JSON.parse(pg.result.content[0].text);
    const p0 = pgr.presets?.[0];
    p0?.style || p0?.code
      ? ok(`design_preset_get returns ${pgr.presets.length} presets with CSS`)
      : bad("design_preset_get returned presets with no style or code");
  } else {
    bad("design_preset_search found no presets");
  }

  // The design-system template layer and the manifest templating.
  const tl = await dcall("tools/call", { name: "design_template_list", arguments: {} });
  const tlr = JSON.parse(tl.result.content[0].text);
  if (tlr.total > 0) {
    ok(`design_template_list reports ${tlr.total} templates`);
    const tslug = tlr.templates[0].slug;

    const tg = await dcall("tools/call", {
      name: "design_template_get",
      arguments: { slug: tslug },
    });
    const tgr = JSON.parse(tg.result.content[0].text);
    tgr.manifest?.schemaVersion === "design-system-manifest/v1" && tgr.tokens?.length >= 48
      ? ok(`design_template_get returns '${tslug}' with ${tgr.tokens.length} tokens and a filled manifest`)
      : bad(`design_template_get wrong for '${tslug}'`);

    const tf = await dcall("tools/call", {
      name: "design_template_file",
      arguments: { slug: tslug, path: "styles.css" },
    });
    const tfr = JSON.parse(tf.result.content[0].text);
    tfr.content?.includes(":root")
      ? ok(`design_template_file returns the token sheet (${tfr.bytes} bytes)`)
      : bad("design_template_file did not return the token sheet");

    // The deck stage script is bigger than one reply may be. It must still be
    // readable, in parts that add up to exactly the size the tool reports.
    // (files[] carries no sizes, so the file is picked by name.)
    const bigFile = (tgr.files || []).find((f) => !f.binary && /deck-stage\.js$/.test(f.path));
    if (bigFile) {
      let offset = 0;
      let parts = 0;
      let bytes = 0;
      let total = 0;
      let failure = "";
      while (offset !== undefined && parts < 20) {
        const res = await dcall("tools/call", {
          name: "design_template_file",
          arguments: { slug: tslug, path: bigFile.path, offset },
        });
        const part = toolJson(res);
        if (toolFailed(res) || typeof part.content !== "string") {
          failure = part.error || "no content";
          break;
        }
        parts++;
        total = part.bytes;
        bytes += Buffer.byteLength(part.content);
        offset = part.nextOffset;
      }
      !failure && bytes === total && (total <= 100_000 || parts > 1)
        ? ok(`design_template_file serves '${bigFile.path}' whole (${bytes} bytes in ${parts} part${parts === 1 ? "" : "s"})`)
        : bad(`design_template_file cannot serve '${bigFile.path}': ${failure || `${bytes} of ${total} bytes in ${parts} parts`}`);
    }

    const dm = await dcall("tools/call", {
      name: "design_manifest_template",
      arguments: { slug: tslug },
    });
    const dmr = JSON.parse(dm.result.content[0].text);
    dmr.colors?.roles && dmr.components?.classes?.length
      ? ok(`design_manifest_template fills the manifest for '${tslug}'`)
      : bad("design_manifest_template did not fill the manifest");

    const blank = await dcall("tools/call", {
      name: "design_manifest_template",
      arguments: {},
    });
    const br = JSON.parse(blank.result.content[0].text);
    br.schemaVersion === "design-system-manifest/v1" && !br.name
      ? ok("design_manifest_template returns the blank template")
      : bad("blank manifest template wrong");
  } else {
    bad("no design-system templates in the cache — run: npm run templates");
  }

  // The library catalog: search, keyword match, and a full entry.
  const ls = await dcall("tools/call", { name: "design_library_search", arguments: {} });
  const lsr = JSON.parse(ls.result.content[0].text);
  if (lsr.total > 0) {
    ok(`design_library_search reports ${lsr.total} libraries`);
    const lq = await dcall("tools/call", {
      name: "design_library_search",
      arguments: { query: "shadcn" },
    });
    const lqr = JSON.parse(lq.result.content[0].text);
    lqr.libraries?.some((l) => l.id === "shadcn")
      ? ok("design_library_search matches 'shadcn'")
      : bad("design_library_search query 'shadcn' missed");

    const lg = await dcall("tools/call", {
      name: "design_library_get",
      arguments: { id: "shadcn" },
    });
    const lgr = JSON.parse(lg.result.content[0].text);
    lgr.install?.cli?.length && lgr.files?.length && lgr.files.every((f) => typeof f.content === "string" && f.content.trim())
      ? ok(`design_library_get returns '${lgr.id}' with ${lgr.files.length} setup files`)
      : bad("design_library_get returned no install steps or empty file contents");
  } else {
    bad("no libraries in the cache — run: npm run bake");
  }

  // The asset CDN tools: inventory plus an origin-composed import map.
  const al = await dcall("tools/call", { name: "design_asset_list", arguments: {} });
  const alr = toolJson(al);
  alr.available && alr.groups?.previews
    ? ok(`design_asset_list reports version ${alr.version} across ${Object.keys(alr.groups).length} groups`)
    : bad("design_asset_list did not report the built frontend assets");

  const ai = await dcall("tools/call", {
    name: "design_asset_importmap",
    arguments: { origin: "http://127.0.0.1:8787" },
  });
  const air = toolJson(ai);
  air.imports?.react?.startsWith("http://127.0.0.1:8787/assets/")
    ? ok(`design_asset_importmap resolves ${Object.keys(air.imports).length} specifiers against the origin`)
    : bad("design_asset_importmap did not compose absolute URLs");

  // DESIGN.md parsing and manifest seeding, on both sources.
  const referoDoc = designs.find((d) => (d.source || "refero") === "refero");
  const odDoc = designs.find((d) => d.source === "opendesign");

  if (referoDoc) {
    const pr = await dcall("tools/call", {
      name: "design_markdown_parse",
      arguments: { identifier: referoDoc.id },
    });
    const prr = JSON.parse(pr.result.content[0].text);
    prr.format === "refero" && prr.parsed?.colors?.length > 0 && prr.parsed?.do?.length > 0
      ? ok(`design_markdown_parse renders '${prr.siteName}' (${prr.parsed.colors.length} swatches, ${prr.parsed.do.length} do rules)`)
      : bad(`design_markdown_parse wrong for refero: format=${prr.format}, colors=${prr.parsed?.colors?.length}`);

    // The content escape hatch: parse markdown the agent already has.
    const pc = await dcall("tools/call", {
      name: "design_markdown_parse",
      arguments: {
        content: "---\nsource_url: https://x.test\nsite_name: Pasted Doc\n---\n\n# Pasted Doc\n\n> A pasted reference.\n\n## Colors\n\n| Hex | Name | Role | Group |\n| --- | --- | --- | --- |\n| `#101010` | Ink | copy | neutral |\n",
      },
    });
    const pcr = JSON.parse(pc.result.content[0].text);
    pcr.format === "refero" && pcr.parsed?.name === "Pasted Doc" && pcr.parsed?.colors?.[0]?.hex === "#101010"
      ? ok("design_markdown_parse handles pasted content")
      : bad(`design_markdown_parse content path wrong: ${pcr.format}/${pcr.parsed?.name}`);
  } else {
    bad("no refero designs in the cache");
  }

  if (odDoc) {
    const po = await dcall("tools/call", {
      name: "design_markdown_parse",
      arguments: { identifier: odDoc.id },
    });
    const por = JSON.parse(po.result.content[0].text);
    ["opendesign", "stitch", "webdesignhot"].includes(por.format) && Object.keys(por.parsed?.sections ?? {}).length > 0
      ? ok(`design_markdown_parse renders opendesign '${por.siteName}' (${Object.keys(por.parsed.sections).length} sections, ${por.parsed.colors.length} swatches)`)
      : bad(`design_markdown_parse wrong for opendesign: format=${por.format}`);

    const mf = await dcall("tools/call", {
      name: "design_manifest_from",
      arguments: { identifier: odDoc.id },
    });
    const mfr = JSON.parse(mf.result.content[0].text);
    mfr.manifest?.schemaVersion === "design-system-manifest/v1" &&
    mfr.manifest?.provenance?.format === por.format && mfr.manifest?.tokens?.all?.length > 0
      ? ok(`design_manifest_from seeds a manifest for '${mfr.siteName}' (provenance: ${mfr.manifest.provenance.filled.length} filled)`)
      : bad(`design_manifest_from wrong for opendesign: ${JSON.stringify(mfr.manifest?.provenance || mfr.error || "?").slice(0, 120)}`);
  } else {
    bad("no opendesign designs in the cache");
  }

  // Author, import, and check a local document through the normal stdio entry point.
  const render = await dcall("tools/call", {
    name: "design_markdown_render",
    arguments: {
      name: "Stdio fixture",
      tokens: {
        colors: { primary: "#264739" },
        components: { button: { backgroundColor: "{colors.primary}" } },
      },
      body: "## Overview\n\nSample the primary button.",
    },
  });
  const draft = JSON.parse(render.result.content[0].text);
  draft.format === "stitch" && draft.designMd && draft.diagnostics.length === 0
    ? ok("design_markdown_render emits a clean Stitch document")
    : bad("design_markdown_render failed to author the fixture");

  const pastedArgs = {
    content: draft.designMd,
    css: ':root { --font-body: Inter, sans-serif; --space-2: 8px; --radius-sm: 2px; }',
  };
  const pastedManifest = await dcall("tools/call", {
    name: "design_manifest_from", arguments: pastedArgs,
  });
  const pasted = JSON.parse(pastedManifest.result.content[0].text).manifest;
  pasted.name === "Stdio fixture" && pasted.typography.body.family === "Inter, sans-serif" &&
    pasted.radius.sm === "2px" && pasted.spacing.scale.length === 1
    ? ok("design_manifest_from accepts pasted content and CSS companions")
    : bad("design_manifest_from did not merge the pasted document and CSS");

  const validated = await dcall("tools/call", {
    name: "design_markdown_validate",
    arguments: {
      ...pastedArgs,
      observations: [
        { location: ".button background-color", token: "components.button.backgroundColor", value: "rgb(38, 71, 57)" },
        { location: "main gap", token: "spacing.2", value: "10px" },
        { location: "main font-family", token: "typography.body.fontFamily", value: null },
      ],
    },
  });
  const validation = JSON.parse(validated.result.content[0].text);
  validation.documentValid && !validation.conforms && validation.summary.pass === 1 &&
    validation.summary.fail === 1 && validation.summary.unverified === 1
    ? ok("design_markdown_validate distinguishes pass, fail, and unverified")
    : bad("design_markdown_validate returned the wrong observation statuses");

  const coverageResult = await dcall("tools/call", {
    name: "design_markdown_validate",
    arguments: {
      content: draft.designMd,
      requiredTokens: ["components.button.backgroundColor", "colors.primary"],
      observations: [{ location: "button", token: "components.button.backgroundColor", value: "#264739" }],
    },
  });
  const coverage = JSON.parse(coverageResult.result.content[0].text);
  coverage.documentValid && !coverage.conforms && coverage.coverage.pass === 1 && coverage.coverage.missing === 1
    ? ok("required coverage fails when a declared role is unsampled")
    : bad("required coverage missed an unsampled role");

  if (galleryTheme) {
    const theme = await dcall("tools/call", {
      name: "design_markdown", arguments: { identifier: galleryTheme.reference },
    });
    const exactDesign = await dcall("tools/call", {
      name: "design_get", arguments: { identifier: galleryTheme.reference },
    });
    const wrongSource = await dcall("tools/call", {
      name: "design_get", arguments: { identifier: "designer:refero:agentic" },
    });
    const exactRecord = JSON.parse(exactDesign.result.content[0].text);
    `designer:${exactRecord.source}:${exactRecord.id}` === galleryTheme.reference && wrongSource.result?.isError
      ? ok("design_get resolves gallery references exactly and rejects a missing source/id pair")
      : bad("design_get did not respect the exact gallery reference");
    const missing = await dcall("tools/call", {
      name: "design_markdown_parse", arguments: { identifier: "designer:refero:agentic" },
    });
    const downloaded = await dcall("tools/call", {
      name: "design_markdown_parse", arguments: { content: galleryTheme.md },
    });
    JSON.parse(theme.result.content[0].text).designMd === galleryTheme.md &&
      missing.result?.isError && missing.result.content[0].text.includes("pass the Markdown as content") &&
      JSON.parse(downloaded.result.content[0].text).format === "refero"
      ? ok("exact theme matches gallery bytes and missing references have a working content fallback")
      : bad("exact theme lookup or raw Markdown fallback failed");
  }

  const invalidMarkdownInput = await dcall("tools/call", {
    name: "design_markdown_parse", arguments: { content: "é".repeat(100_001) },
  });
  invalidMarkdownInput.result?.isError && invalidMarkdownInput.result.content[0].text.includes("UTF-8 bytes")
    ? ok("design_markdown_parse enforces the UTF-8 byte limit")
    : bad("design_markdown_parse accepted oversized UTF-8 input");

  // A Refero entry and an OpenDesign entry must both resolve and render.
  const referoEntry = designs.find((d) => (d.source || "refero") === "refero");
  const odEntry = designs.find((d) => d.source === "opendesign");

  if (referoEntry) {
    const g = await dcall("tools/call", {
      name: "design_get",
      arguments: { identifier: referoEntry.siteName },
    });
    const gr = JSON.parse(g.result.content[0].text);
    gr.id === referoEntry.id
      ? ok(`design_get resolves '${referoEntry.siteName}'`)
      : bad(`design_get returned ${gr.id}, expected ${referoEntry.id}`);

    const m = await dcall("tools/call", {
      name: "design_markdown",
      arguments: { identifier: referoEntry.id },
    });
    const mr = JSON.parse(m.result.content[0].text);
    mr.designMd?.startsWith("---")
      ? ok("design_markdown renders Refero DESIGN.md")
      : bad("design_markdown wrong for Refero");
  }

  if (odEntry) {
    const g = await dcall("tools/call", {
      name: "design_get",
      arguments: { identifier: odEntry.id, source: "opendesign" },
    });
    const gr = JSON.parse(g.result.content[0].text);
    gr.id === odEntry.id
      ? ok(`design_get resolves opendesign '${odEntry.id}'`)
      : bad(`design_get returned ${gr.id}, expected ${odEntry.id}`);

    const m = await dcall("tools/call", {
      name: "design_markdown",
      arguments: { identifier: odEntry.id },
    });
    const mr = JSON.parse(m.result.content[0].text);
    mr.designMd?.length > 500
      ? ok(`design_markdown serves the original opendesign document (${mr.designMd.length} bytes)`)
      : bad(`design_markdown too short for opendesign: ${mr.designMd?.length}`);
  }

  const arc = designs.find((d) => d.source === "opendesign" && d.id === "arc");
  if (arc) {
    const identifier = "designer:opendesign:arc";
    const call = async (name, args = {}) => (await dcall("tools/call", {
      name, arguments: { identifier, ...args },
    })).result;
    const data = (result) => JSON.parse(result.content[0].text);
    const record = data(await call("design_get"));
    const fromUrl = data(await call("design_get", {
      identifier: "https://github.com/nexu-io/open-design/tree/main/design-systems/arc",
    }));
    const markdown = data(await call("design_markdown"));
    const parsed = data(await call("design_markdown_parse"));
    const manifest = data(await call("design_manifest_from"));
    const css = data(await call("design_package_file", { path: "tokens.css" }));
    const source = data(await call("design_package_file", { path: "DESIGN.md" }));
    const payload = JSON.parse(readFileSync(join(CACHE_DIR, "systems", "arc.json"), "utf8")).system;
    record.package?.reference === identifier && record.package.manifest.id === "arc" &&
      [record, fromUrl, markdown, parsed, manifest, css, source].every((d) => d.id === "arc" && d.source === "opendesign") &&
      parsed.format === "opendesign" && manifest.manifest.tokens.all.length > 0 &&
      css.content === payload.tokensCss && source.content === markdown.designMd
      ? ok("Arc resolves by exact reference and package URL, with its original Markdown and CSS")
      : bad("Arc resolved to the wrong design, or its package files changed");

    const extra = await call("design_package_file", { path: "components.html" });
    const listed = record.package?.files.find((file) => file.path === "components.html");
    (record.package?.legacyCache ? !listed && extra.isError :
      listed?.bytes > 0 && data(extra).bytes === listed.bytes && data(extra).content.includes("<"))
      ? ok("OpenDesign package file reads match the available inventory")
      : bad("OpenDesign package file inventory disagrees with the cache");

    const mismatched = await call("design_get", { source: "refero" });
    const unknown = await call("design_get", { identifier: "designer:opendesign:arcc" });
    const outside = await call("design_package_file", { path: "../arc.json" });
    mismatched.isError && unknown.isError && outside.isError
      ? ok("OpenDesign rejects a conflicting source, mistyped reference, and invalid file path")
      : bad("OpenDesign accepted an invalid source, reference, or file path");

    // The Claude Design layer, when the Agent Kit has been fetched.
    const claudeSystem = designs.find(
      (d) => d.source === "opendesign" && existsSync(join(CACHE_DIR, "claude", `${d.id}.json`)),
    );
    if (claudeSystem) {
      const ref = `designer:opendesign:${claudeSystem.id}`;
      const got = await call("design_get", { identifier: ref });
      const info = data(got);
      const claudeFiles = info.package?.claudeFiles ?? [];
      const readme = claudeFiles.find((f) => f.path === "README.md");
      const claudeRead = await call("design_claude_package", { identifier: ref, path: "README.md" });
      const claudeBody = data(claudeRead);
      const descriptor = info.package?.descriptor;

      claudeFiles.length > 0 && readme && claudeBody.path === "README.md" &&
        claudeBody.bytes === readme.bytes && claudeBody.content.includes("#")
        ? ok(`Claude Design package reads for ${claudeSystem.id} (${claudeFiles.length} files)`)
        : bad("Claude Design package reads disagree with the inventory");

      descriptor && Array.isArray(descriptor.moods) && Array.isArray(descriptor.industries)
        ? ok(`design_get carries the curated descriptor for ${claudeSystem.id}`)
        : bad("design_get is missing the curated descriptor");

      const badPath = await call("design_claude_package", { identifier: ref, path: "../escape.md" });
      badPath.isError ? ok("Claude Design reads reject an invalid file path") : bad("Claude Design read accepted an invalid file path");
    } else {
      console.log("  (no Claude Design packages cached — skipping the kit checks)");
    }

    // Offline @ui-sdk/* documentation layer (moved to skills/designer-ui/ui-sdk).
    const docsSearch = await call("design_docs_search", { query: "select", limit: 5 });
    const docsIndex = data(docsSearch);
    if (docsIndex.total > 0 && docsIndex.docs?.length > 0) {
      ok(`design_docs_search returns ${docsIndex.total} matching ui-sdk docs`);
      const firstDoc = docsIndex.docs[0].path;
      const docRead = await call("design_docs_get", { path: firstDoc });
      const docData = data(docRead);
      docData?.path === firstDoc && (docData.content || "").length > 0
        ? ok(`design_docs_get reads '${firstDoc}' (${docData.bytes} bytes)`)
        : bad(`design_docs_get failed to read '${firstDoc}'`);
    } else {
      bad("design_docs_search returned 0 docs — check ui-sdk path in scripts/lib/ui-sdk-docs.mjs");
    }
  }
} catch (e) {
  bad(`generic MCP server failed: ${e.message}`);
} finally {
  designMcp.kill();
}

// ------------------------------------------------------- 7. heroui layer
section("7. HeroUI layer (offline)");
const heroDir = join(CACHE_DIR, "heroui");
const heroCatPath = join(heroDir, "catalog.json");
if (!existsSync(heroCatPath)) {
  bad(`no heroui catalog at ${heroCatPath} — run: npm run heroui && npm run bake`);
} else {
  const heroCat = JSON.parse(readFileSync(heroCatPath, "utf8"));
  (heroCat.components?.length || 0) >= 70
    ? ok(`heroui catalog has ${heroCat.components.length} components`)
    : bad(`heroui catalog has ${heroCat.components?.length || 0} components, expected 70+ — re-run: npm run heroui`);
  (heroCat.guides?.length || 0) >= 15
    ? ok(`heroui catalog has ${heroCat.guides.length} guides`)
    : bad(`heroui catalog has ${heroCat.guides?.length || 0} guides, expected 15+ — re-run: npm run heroui`);
  heroCat.version?.react
    ? ok(`heroui catalog pins @heroui/react ${heroCat.version.react}`)
    : bad("heroui catalog carries no version.react — re-run: npm run heroui");

  // Provenance must record sha256 checksums for every fetched file.
  const provPath = join(heroDir, "provenance.json");
  if (!existsSync(provPath)) {
    bad(`no heroui provenance at ${provPath} — re-run: npm run heroui`);
  } else {
    const prov = JSON.parse(readFileSync(provPath, "utf8"));
    Object.keys(prov.checksums || {}).length > 0
      ? ok(`heroui provenance records ${Object.keys(prov.checksums).length} sha256 checksums`)
      : bad("heroui provenance records no checksums — re-run: npm run heroui");
  }

  // The v2-to-v3 migration guides ride along from the same pinned tag.
  const migPath = join(heroDir, "migration", "index.json");
  if (!existsSync(migPath)) {
    bad(`no heroui migration index at ${migPath} — re-run: npm run heroui`);
  } else {
    const mig = JSON.parse(readFileSync(migPath, "utf8"));
    (mig.total || 0) > 0 && (mig.files?.length || 0) === mig.total
      ? ok(`heroui migration index lists ${mig.total} guides`)
      : bad(`heroui migration index lists ${mig.total} guides for ${mig.files?.length} files`);
  }

  // -------------------------------------- gallery endpoints, section 4 idiom
  const HERO_PORT = 8798;
  const heroPreview = spawn("node", [join(HERE, "preview.mjs")], {
    env: {
      ...process.env,
      DESIGN_CACHE_DIR: CACHE_DIR,
      REFERO_CACHE_DIR: CACHE_DIR,
      PORT: String(HERO_PORT),
      HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let heroPreviewErr = "";
  heroPreview.stderr.on("data", (d) => (heroPreviewErr += d.toString()));

  await new Promise((r) => setTimeout(r, 2500));
  try {
    const api = await fetch(`http://127.0.0.1:${HERO_PORT}/api/heroui`).then((r) => r.json());
    (api.totals?.components || 0) >= 70
      ? ok(`api/heroui reports ${api.totals.components} components`)
      : bad(`api/heroui reports ${api.totals?.components ?? 0} components, expected 70+`);
    (api.totals?.guides || 0) >= 15
      ? ok(`api/heroui reports ${api.totals.guides} guides`)
      : bad(`api/heroui reports ${api.totals?.guides ?? 0} guides, expected 15+`);
    api.version?.react
      ? ok(`api/heroui reports version ${api.version.react}`)
      : bad("api/heroui carries no version");

    const heroListHtml = await fetch(`http://127.0.0.1:${HERO_PORT}/heroui`).then((r) => r.text());
    heroListHtml.includes("HeroUI v3") && heroListHtml.includes("heroui-card")
      ? ok("heroui gallery page renders")
      : bad("heroui gallery wrong");

    const heroCompHtml = await fetch(`http://127.0.0.1:${HERO_PORT}/heroui/component/button`).then((r) => r.text());
    heroCompHtml.includes("heroui-doc-body") && heroCompHtml.includes("<h1>Button</h1>")
      ? ok("heroui component page renders (button)")
      : bad("heroui component page wrong");

    const heroGuideHtml = await fetch(`http://127.0.0.1:${HERO_PORT}/heroui/guide/theming`).then((r) => r.text());
    heroGuideHtml.includes("heroui-doc-body")
      ? ok("heroui guide page renders (theming)")
      : bad("heroui guide page wrong");

    // The gallery must not load remote resources — same rule as the Agent
    // Kit artifacts. (Upstream doc links stay: they are anchors, not assets.)
    const heroPages = [heroListHtml, heroCompHtml, heroGuideHtml];
    const heroRemote = heroPages.filter((t) =>
      /(?:src="https?:\/\/|<link[^>]+href="https?:\/\/|url\(["']?https?:\/\/)/i.test(t),
    );
    heroRemote.length === 0
      ? ok("heroui pages load no remote resources")
      : bad("heroui pages load a remote resource");
  } catch (e) {
    bad(`heroui preview failed: ${e.message}${heroPreviewErr ? ` | ${heroPreviewErr.slice(0, 200)}` : ""}`);
  } finally {
    heroPreview.kill();
  }

  // ------------------------------------------ MCP smoke, section 6 idiom
  await new Promise((r) => setTimeout(r, 800));
  const heroMcp = spawn("node", [join(HERE, "mcp-server.mjs")], {
    env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let hbuf = "";
  const hpending = new Map();
  heroMcp.stdout.on("data", (d) => {
    hbuf += d.toString();
    let i;
    while ((i = hbuf.indexOf("\n")) >= 0) {
      const line = hbuf.slice(0, i).trim();
      hbuf = hbuf.slice(i + 1);
      if (!line) continue;
      try {
        const m = JSON.parse(line);
        const p = hpending.get(m.id);
        if (p) {
          hpending.delete(m.id);
          p(m);
        }
      } catch {}
    }
  });
  let hid = 0;
  const hcall = (method, params) =>
    new Promise((resolve, reject) => {
      rpcDeadline(reject, method);
      const myId = ++hid;
      hpending.set(myId, resolve);
      heroMcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
    });

  try {
    await hcall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "selftest", version: "1" },
    });
    const heroTools = await hcall("tools/list", {});
    const heroNames = [
      "design_heroui_list_components", "design_heroui_search", "design_heroui_get_docs",
      "design_heroui_get_guide", "design_heroui_get_source", "design_heroui_get_styles",
      "design_heroui_get_theme_variables", "design_heroui_migration_guide",
    ];
    const heroMissing = heroNames.filter((t) => !(heroTools.result?.tools || []).some((x) => x.name === t));
    heroMissing.length === 0
      ? ok(`exposes all ${heroNames.length} design_heroui_* tools`)
      : bad(`missing heroui tools: ${heroMissing.join(", ")}`);

    const heroList = await hcall("tools/call", { name: "design_heroui_list_components", arguments: {} });
    const heroListParsed = JSON.parse(heroList.result.content[0].text);
    (heroListParsed.totals?.components || 0) >= 70
      ? ok(`design_heroui_list_components returns ${heroListParsed.totals.components} components`)
      : bad(`design_heroui_list_components returned ${heroListParsed.available === false ? "available: false" : heroListParsed.totals?.components ?? 0} components, expected 70+`);

    const heroDocs = await hcall("tools/call", {
      name: "design_heroui_get_docs",
      arguments: { components: ["Button"] },
    });
    const button = JSON.parse(heroDocs.result.content[0].text).results?.[0];
    button?.content?.includes("Button") && !button.error
      ? ok(`design_heroui_get_docs returns Button content (${button.content.length} bytes)`)
      : bad(`design_heroui_get_docs did not return Button content: ${button?.error || "empty"}`);

    const heroTool = async (name, args) => {
      const res = await hcall("tools/call", { name, arguments: args });
      return { failed: toolFailed(res), body: toolJson(res) };
    };

    const tooMany = await heroTool("design_heroui_get_docs", {
      components: ["Button", "Card", "Modal", "Table", "Tabs", "Toast"],
    });
    tooMany.failed
      ? ok("design_heroui_get_docs caps the number of components per call")
      : bad("design_heroui_get_docs accepted six components in one call");

    const heroSearch = await heroTool("design_heroui_search", { query: "button", limit: 5 });
    heroSearch.body.total > 0 && heroSearch.body.results?.[0]?.slug
      ? ok(`design_heroui_search finds ${heroSearch.body.total} matches for 'button'`)
      : bad(`design_heroui_search found nothing for 'button': ${heroSearch.body.error || ""}`);

    // Every guide must be readable by the slug AND the path the catalog
    // advertises. A slug that differs from its file name used to fail.
    const guideMisses = [];
    for (const guide of heroListParsed.guides || []) {
      for (const key of [guide.slug, guide.path]) {
        const got = await heroTool("design_heroui_get_guide", { path: key });
        if (got.failed || got.body.path !== guide.path || !got.body.content) guideMisses.push(key);
      }
    }
    guideMisses.length === 0
      ? ok(`design_heroui_get_guide resolves all ${(heroListParsed.guides || []).length} guides by slug and by path`)
      : bad(`design_heroui_get_guide failed for: ${guideMisses.join(", ")}`);

    // Source must resolve from the catalog's own name and slug for every
    // component: 'TextField' is filed upstream as 'textfield'.
    if (heroListParsed.hasSource) {
      const sourceMisses = [];
      for (const comp of heroListParsed.components || []) {
        for (const key of [comp.name, comp.slug]) {
          const got = await heroTool("design_heroui_get_source", { component: key });
          if (got.failed || !got.body.files?.length) sourceMisses.push(key);
        }
      }
      sourceMisses.length === 0
        ? ok(`design_heroui_get_source resolves all ${heroListParsed.components.length} components by name and by slug`)
        : bad(`design_heroui_get_source failed for: ${sourceMisses.join(", ")}`);
    }

    if (heroListParsed.hasStyles) {
      // Not every component ships css (Form has none), so check known ones.
      const styleMisses = [];
      for (const key of ["Button", "TextField", "text-area"]) {
        const got = await heroTool("design_heroui_get_styles", { component: key });
        if (got.failed || !got.body.css) styleMisses.push(key);
      }
      styleMisses.length === 0
        ? ok("design_heroui_get_styles returns css for Button, TextField and text-area")
        : bad(`design_heroui_get_styles failed for: ${styleMisses.join(", ")}`);
    }

    const heroTheme = await heroTool("design_heroui_get_theme_variables", {});
    heroTheme.body.variables?.includes("--") || heroTheme.body.available === false
      ? ok(heroTheme.body.variables ? "design_heroui_get_theme_variables returns the theme css" : "theme css not baked (skipped)")
      : bad(`design_heroui_get_theme_variables returned no variables: ${heroTheme.body.error || ""}`);

    if (heroListParsed.hasMigration) {
      const migIndex = await heroTool("design_heroui_migration_guide", { name: "index" });
      const migButton = await heroTool("design_heroui_migration_guide", { name: "button" });
      (migIndex.body.total || 0) > 0 && migButton.body.content
        ? ok(`design_heroui_migration_guide lists ${migIndex.body.total} guides and reads 'button'`)
        : bad(`design_heroui_migration_guide failed: ${migIndex.body.error || migButton.body.error || "empty"}`);
    }
  } catch (e) {
    bad(`heroui MCP smoke failed: ${e.message}`);
  } finally {
    heroMcp.kill();
  }
}

// ------------------------------------------------------- 8. mantine layer
section("8. Mantine UI layer (offline)");
const mantineDir = join(CACHE_DIR, "mantine");
const mantineCatPath = join(mantineDir, "index.json");
if (!existsSync(mantineCatPath)) {
  bad(`no mantine catalog at ${mantineCatPath} — run: npm run mantine && npm run bake`);
} else {
  const mantineCat = JSON.parse(readFileSync(mantineCatPath, "utf8"));
  (mantineCat.components?.length || 0) >= 120
    ? ok(`mantine catalog has ${mantineCat.components.length} components`)
    : bad(`mantine catalog has ${mantineCat.components?.length || 0} components, expected 120+ — re-run: npm run mantine`);
  const mantineCategories = (mantineCat.groups || []).flatMap((g) => g.categories);
  mantineCategories.length >= 20 && mantineCategories.every((c) => c.count > 0)
    ? ok(`mantine catalog serves ${mantineCategories.length} categories with counts`)
    : bad(`mantine category tree is thin or broken (${mantineCategories.length} entries)`);
  existsSync(join(mantineDir, "LICENCE"))
    ? ok("mantine LICENCE travels with the cache")
    : bad("mantine LICENCE missing from the cache");
  for (const category of mantineCategories.slice(0, 3)) {
    const illustration = category.image?.light;
    existsSync(illustration ? join(mantineDir, illustration) : "")
      ? ok(`mantine illustration cached for '${category.slug}'`)
      : bad(`mantine illustration missing for '${category.slug}' (${illustration || "none referenced"})`);
  }

  // Provenance records the vendored npm tarballs with their registry checksums.
  const mantineProvPath = join(mantineDir, "provenance.json");
  if (!existsSync(mantineProvPath)) {
    bad(`no mantine provenance at ${mantineProvPath} — re-run: npm run mantine`);
  } else {
    const prov = JSON.parse(readFileSync(mantineProvPath, "utf8"));
    const packages = Object.values(prov.packages || {});
    packages.length >= 20 && packages.every((p) => p.version && p.integrity)
      ? ok(`mantine provenance records ${packages.length} vendored packages with sha512 integrity`)
      : bad(`mantine provenance is thin (${packages.length} packages, integrity ${packages.filter((p) => p.integrity).length})`);
    existsSync(join(mantineDir, "vendor", "@mantine", "core", String(prov.packages?.["@mantine/core"]?.version || "x"), "package.json"))
      ? ok(`mantine vendor tree carries @mantine/core ${prov.packages?.["@mantine/core"]?.version}`)
      : bad("mantine vendor tree is missing @mantine/core — re-run: npm run mantine");
  }

  // -------------------------------------- gallery endpoints, section 4 idiom
  const MANT_PORT = 8799;
  const mantPreview = spawn("node", [join(HERE, "preview.mjs")], {
    env: {
      ...process.env,
      DESIGN_CACHE_DIR: CACHE_DIR,
      REFERO_CACHE_DIR: CACHE_DIR,
      PORT: String(MANT_PORT),
      HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let mantPreviewErr = "";
  mantPreview.stderr.on("data", (d) => (mantPreviewErr += d.toString()));

  await new Promise((r) => setTimeout(r, 2500));
  let mantPreviewSlugs = [];
  try {
    const api = await fetch(`http://127.0.0.1:${MANT_PORT}/api/mantine`).then((r) => r.json());
    (api.total || 0) >= 120
      ? ok(`api/mantine reports ${api.total} components`)
      : bad(`api/mantine reports ${api.total ?? 0} components, expected 120+`);
    Object.keys(api.vendor || {}).length >= 20
      ? ok(`api/mantine carries ${Object.keys(api.vendor).length} vendored package versions`)
      : bad("api/mantine carries no vendor versions");

    const searched = await fetch(`http://127.0.0.1:${MANT_PORT}/api/mantine?q=navbar`).then((r) => r.json());
    (searched.total || 0) >= 5
      ? ok(`api/mantine?q=navbar finds ${searched.total} components`)
      : bad(`api/mantine search for 'navbar' found ${searched.total ?? 0}`);

    const mantListHtml = await fetch(`http://127.0.0.1:${MANT_PORT}/mantine`).then((r) => r.text());
    mantListHtml.includes("Mantine UI") && mantListHtml.includes("mant-cat-card")
      ? ok("mantine gallery page renders")
      : bad("mantine gallery wrong");

    const mantCompHtml = await fetch(`http://127.0.0.1:8799/mantine/component/article-card`).then((r) => r.text());
    mantCompHtml.includes("<h1>ArticleCard</h1>") && mantCompHtml.includes("mant-panel")
      ? ok("mantine component page renders (article-card)")
      : bad("mantine component page wrong");

    // Live previews: the build must have produced the documents, the server
    // must answer them, and none of them may load a remote resource.
    const manifest = JSON.parse(readFileSync(join(HERE, "..", "dist", "frontend", "manifest.json"), "utf8"));
    mantPreviewSlugs = Object.keys(manifest.mantinePreviews?.previews || {});
    mantPreviewSlugs.length >= 60
      ? ok(`frontend build produced ${mantPreviewSlugs.length} mantine preview documents`)
      : bad(`frontend build produced ${mantPreviewSlugs.length} mantine previews, expected 60+`);
    const sample = mantPreviewSlugs.slice(0, 60);
    const codes = await Promise.all(
      sample.map((slug) => fetch(`http://127.0.0.1:${MANT_PORT}/mantine/preview/${slug}`).then((r) => r.status)),
    );
    codes.every((code) => code === 200)
      ? ok(`${sample.length} mantine preview documents serve 200`)
      : bad(`some mantine previews do not serve: ${codes.filter((c) => c !== 200).length} of ${sample.length} failed`);
    const remotePreviews = [];
    for (const slug of mantPreviewSlugs) {
      const doc = await fetch(`http://127.0.0.1:${MANT_PORT}/mantine/preview/${slug}`).then((r) => r.text());
      if (/(?:src="https?:\/\/|<link[^>]+href="https?:\/\/|url\(["']?https?:\/\/|import\s+["']https?:\/\/)/i.test(doc)) remotePreviews.push(slug);
    }
    remotePreviews.length === 0
      ? ok(`all ${mantPreviewSlugs.length} mantine previews load no remote resources`)
      : bad(`mantine previews load remote resources: ${remotePreviews.slice(0, 5).join(", ")}`);

    // Thumbnails: the capturer screenshots every rendered preview.
    const thumbOk = (manifest.mantinePreviews?.previews?.["article-card"]?.thumbnail || "") &&
      Object.hasOwn(manifest.files, manifest.mantinePreviews.previews["article-card"].thumbnail);
    thumbOk
      ? ok("mantine thumbnails captured (article-card)")
      : bad("mantine thumbnails missing (article-card)");
    const thumbBytes = await fetch(
      `http://127.0.0.1:${MANT_PORT}/assets/${manifest.version}/${manifest.mantinePreviews.previews["article-card"].thumbnail}`,
    ).then((r) => r.status);
    thumbBytes === 200
      ? ok("mantine thumbnail serves from the asset CDN")
      : bad(`mantine thumbnail does not serve (HTTP ${thumbBytes})`);
  } catch (e) {
    bad(`mantine preview failed: ${e.message}${mantPreviewErr ? ` | ${mantPreviewErr.slice(0, 200)}` : ""}`);
  } finally {
    mantPreview.kill();
  }

  // ------------------------------------------ MCP smoke, section 6 idiom
  await new Promise((r) => setTimeout(r, 800));
  const mantMcp = spawn("node", [join(HERE, "mcp-server.mjs")], {
    env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let mbuf = "";
  const mpending = new Map();
  mantMcp.stdout.on("data", (d) => {
    mbuf += d.toString();
    let i;
    while ((i = mbuf.indexOf("\n")) >= 0) {
      const line = mbuf.slice(0, i).trim();
      mbuf = mbuf.slice(i + 1);
      if (!line) continue;
      try {
        const m = JSON.parse(line);
        const p = mpending.get(m.id);
        if (p) {
          mpending.delete(m.id);
          p(m);
        }
      } catch {}
    }
  });
  let mid = 0;
  const mcall = (method, params) =>
    new Promise((resolve, reject) => {
      rpcDeadline(reject, method);
      const myId = ++mid;
      mpending.set(myId, resolve);
      mantMcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
    });

  try {
    await mcall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "selftest", version: "1" },
    });
    const mantTools = await mcall("tools/list", {});
    const mantNames = ["design_mantine_list_components", "design_mantine_search", "design_mantine_get_component"];
    const mantMissing = mantNames.filter((t) => !(mantTools.result?.tools || []).some((x) => x.name === t));
    mantMissing.length === 0
      ? ok(`exposes all ${mantNames.length} design_mantine_* tools`)
      : bad(`missing mantine tools: ${mantMissing.join(", ")}`);

    const mantList = await mcall("tools/call", { name: "design_mantine_list_components", arguments: {} });
    const mantListParsed = JSON.parse(mantList.result.content[0].text);
    (mantListParsed.total || 0) >= 120 && Object.keys(mantListParsed.vendor || {}).length >= 20
      ? ok(`design_mantine_list_components returns ${mantListParsed.total} components and ${Object.keys(mantListParsed.vendor).length} vendor versions`)
      : bad(`design_mantine_list_components returned ${mantListParsed.available === false ? "available: false" : mantListParsed.total ?? 0} components`);

    const mantSearch = await mcall("tools/call", {
      name: "design_mantine_search", arguments: { query: "table", limit: 5 },
    });
    const mantSearchParsed = JSON.parse(mantSearch.result.content[0].text);
    (mantSearchParsed.total || 0) >= 1 && mantSearchParsed.results?.length
      ? ok(`design_mantine_search finds ${mantSearchParsed.total} matches for 'table'`)
      : bad(`design_mantine_search found ${mantSearchParsed.total ?? 0} matches for 'table'`);

    const mantGet = await mcall("tools/call", {
      name: "design_mantine_get_component", arguments: { slug: "article-card" },
    });
    const article = JSON.parse(mantGet.result.content[0].text);
    (article.files || []).some((f) => f.language === "tsx" && f.code.includes("export")) && article.livePreview === true
      ? ok(`design_mantine_get_component returns ${article.files.length} source files for article-card (${article.files.reduce((t, f) => t + f.code.length, 0)} bytes)`)
      : bad(`design_mantine_get_component did not return TSX content: ${article.error || "empty"}`);
  } catch (e) {
    bad(`mantine MCP smoke failed: ${e.message}`);
  } finally {
    mantMcp.kill();
  }
}

// ------------------------------------------------------- 9. daisyui layer
section("9. daisyUI layer (offline)");
const daisyuiDir = join(CACHE_DIR, "daisyui");
const daisyuiCatPath = join(daisyuiDir, "catalog.json");
if (!existsSync(daisyuiCatPath)) {
  bad(`no daisyui catalog at ${daisyuiCatPath} — run: npm run daisyui && npm run bake`);
} else {
  const daisyuiCat = JSON.parse(readFileSync(daisyuiCatPath, "utf8"));
  (daisyuiCat.components?.length || 0) >= 50
    ? ok(`daisyui catalog has ${daisyuiCat.components.length} components`)
    : bad(`daisyui catalog has ${daisyuiCat.components?.length || 0} components, expected 50+ — re-run: npm run daisyui`);
  (daisyuiCat.themes?.length || 0) >= 5
    ? ok(`daisyui catalog lists ${daisyuiCat.themes.length} themes`)
    : bad(`daisyui catalog lists ${daisyuiCat.themes?.length || 0} themes, expected 5+ — re-run: npm run daisyui`);
  daisyuiCat.version?.css
    ? ok(`daisyui catalog pins daisyUI ${daisyuiCat.version.css}`)
    : bad("daisyui catalog carries no version.css — re-run: npm run daisyui");
  existsSync(join(daisyuiDir, "css", "daisyui.css"))
    ? ok("daisyui compiled css is baked")
    : bad("daisyui compiled css missing — re-run: npm run daisyui");
  existsSync(join(daisyuiDir, "LICENSE"))
    ? ok("daisyui MIT licence travels with the cache")
    : bad("daisyui LICENSE missing from the cache");

  // One component record must carry the docs payload the MCP tool returns.
  const buttonRecord = existsSync(join(daisyuiDir, "components", "button.json"))
    ? JSON.parse(readFileSync(join(daisyuiDir, "components", "button.json"), "utf8"))
    : null;
  buttonRecord?.syntax && buttonRecord?.example && (buttonRecord.classes?.length || 0) >= 5
    ? ok(`daisyui component records carry docs, classes and an example (button: ${buttonRecord.classes.length} class groups, ${buttonRecord.example.length}-byte example)`)
    : bad("daisyui component record (button) lacks syntax/example/class groups — re-run: npm run daisyui");

  // Provenance records sha256 checksums for every fetched file.
  const daisyuiProvPath = join(daisyuiDir, "provenance.json");
  if (!existsSync(daisyuiProvPath)) {
    bad(`no daisyui provenance at ${daisyuiProvPath} — re-run: npm run daisyui`);
  } else {
    const prov = JSON.parse(readFileSync(daisyuiProvPath, "utf8"));
    Object.keys(prov.checksums || {}).length > 0 && prov.npm?.integrity
      ? ok(`daisyui provenance records ${Object.keys(prov.checksums).length} sha256 checksums and the registry integrity`)
      : bad("daisyui provenance is thin (checksums/integrity missing) — re-run: npm run daisyui");
  }

  // -------------------------------------- gallery endpoints, section 4 idiom
  const DAISY_PORT = 8801;
  const daisyPreview = spawn("node", [join(HERE, "preview.mjs")], {
    env: {
      ...process.env,
      DESIGN_CACHE_DIR: CACHE_DIR,
      REFERO_CACHE_DIR: CACHE_DIR,
      PORT: String(DAISY_PORT),
      HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let daisyPreviewErr = "";
  daisyPreview.stderr.on("data", (d) => (daisyPreviewErr += d.toString()));

  await new Promise((r) => setTimeout(r, 2500));
  let daisyPreviewSlugs = [];
  try {
    const api = await fetch(`http://127.0.0.1:${DAISY_PORT}/api/daisyui`).then((r) => r.json());
    (api.totals?.components || 0) >= 50
      ? ok(`api/daisyui reports ${api.totals.components} components`)
      : bad(`api/daisyui reports ${api.totals?.components ?? 0} components, expected 50+`);
    (api.themes?.length || 0) >= 5
      ? ok(`api/daisyui carries ${api.themes.length} themes`)
      : bad("api/daisyui carries no theme list");

    const searched = await fetch(`http://127.0.0.1:${DAISY_PORT}/api/daisyui?q=modal`).then((r) => r.json());
    (searched.total || 0) >= 1
      ? ok(`api/daisyui?q=modal finds ${searched.total} components`)
      : bad(`api/daisyui search for 'modal' found ${searched.total ?? 0}`);

    const daisyListHtml = await fetch(`http://127.0.0.1:${DAISY_PORT}/daisyui`).then((r) => r.text());
    daisyListHtml.includes("daisyUI") && daisyListHtml.includes("dai-card")
      ? ok("daisyui gallery page renders")
      : bad("daisyui gallery wrong");

    const daisyCompHtml = await fetch(`http://127.0.0.1:${DAISY_PORT}/daisyui/component/button`).then((r) => r.text());
    daisyCompHtml.includes("<h1>Button</h1>") && daisyCompHtml.includes("dai-preview")
      ? ok("daisyui component page renders (button)")
      : bad("daisyui component page wrong");

    const cssBytes = await fetch(`http://127.0.0.1:${DAISY_PORT}/daisyui/css/daisyui.css`).then((r) => r.text());
    cssBytes.includes("daisyUI") && cssBytes.length > 500000
      ? ok(`daisyui css route serves the compiled stylesheet (${Math.round(cssBytes.length / 1024)} KB)`)
      : bad("daisyui css route does not serve the compiled stylesheet");

    // Native previews: the build must have produced the documents, the server
    // must answer them plus a themed variant, and none may load a remote
    // resource. The theme variant must swap the data-theme attribute.
    const manifest = JSON.parse(readFileSync(join(HERE, "..", "dist", "frontend", "manifest.json"), "utf8"));
    daisyPreviewSlugs = Object.keys(manifest.daisyuiPreviews?.previews || {});
    daisyPreviewSlugs.length >= 40
      ? ok(`frontend build produced ${daisyPreviewSlugs.length} daisyui preview documents`)
      : bad(`frontend build produced ${daisyPreviewSlugs.length} daisyui previews, expected 40+`);
    const sample = daisyPreviewSlugs.slice(0, 40);
    const codes = await Promise.all(
      sample.map((slug) => fetch(`http://127.0.0.1:${DAISY_PORT}/daisyui/preview/${slug}`).then((r) => r.status)),
    );
    codes.every((code) => code === 200)
      ? ok(`${sample.length} daisyui preview documents serve 200`)
      : bad(`some daisyui previews do not serve: ${codes.filter((c) => c !== 200).length} of ${sample.length} failed`);
    const themedDoc = await fetch(
      `http://127.0.0.1:${DAISY_PORT}/daisyui/preview/button?theme=${(api.themes || ["dim"])[Math.min(1, (api.themes || []).length - 1)]}`,
    ).then((r) => r.text());
    /data-theme="(?!light")[^"]+"/.test(themedDoc)
      ? ok("daisyui preview swaps the theme via ?theme=")
      : bad("daisyui preview ignored the ?theme= query");
    const remotePreviews = [];
    for (const slug of daisyPreviewSlugs) {
      const doc = await fetch(`http://127.0.0.1:${DAISY_PORT}/daisyui/preview/${slug}`).then((r) => r.text());
      if (/(?:src="https?:\/\/|<link[^>]+href="https?:\/\/|url\(["']?https?:\/\/|import\s+["']https?:\/\/)/i.test(doc)) remotePreviews.push(slug);
    }
    remotePreviews.length === 0
      ? ok(`all ${daisyPreviewSlugs.length} daisyui previews load no remote resources`)
      : bad(`daisyui previews load remote resources: ${remotePreviews.slice(0, 5).join(", ")}`);

    // Thumbnails: the capturer screenshots every preview document.
    const thumbSlug = daisyPreviewSlugs[0];
    const thumbFile = manifest.daisyuiPreviews.previews[thumbSlug]?.thumbnail;
    const thumbOk = thumbFile && Object.hasOwn(manifest.files, thumbFile);
    thumbOk
      ? ok(`daisyui thumbnails captured (${thumbSlug})`)
      : bad(`daisyui thumbnails missing (${thumbSlug})`);
    const thumbBytes = thumbOk
      ? await fetch(`http://127.0.0.1:${DAISY_PORT}/assets/${manifest.version}/${thumbFile}`).then((r) => r.status)
      : 0;
    thumbBytes === 200
      ? ok("daisyui thumbnail serves from the asset CDN")
      : bad(`daisyui thumbnail does not serve (HTTP ${thumbBytes})`);
  } catch (e) {
    bad(`daisyui preview failed: ${e.message}${daisyPreviewErr ? ` | ${daisyPreviewErr.slice(0, 200)}` : ""}`);
  } finally {
    daisyPreview.kill();
  }

  // ------------------------------------------ MCP smoke, section 6 idiom
  await new Promise((r) => setTimeout(r, 800));
  const daisyMcp = spawn("node", [join(HERE, "mcp-server.mjs")], {
    env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let dbuf = "";
  const dpending = new Map();
  daisyMcp.stdout.on("data", (d) => {
    dbuf += d.toString();
    let i;
    while ((i = dbuf.indexOf("\n")) >= 0) {
      const line = dbuf.slice(0, i).trim();
      dbuf = dbuf.slice(i + 1);
      if (!line) continue;
      try {
        const m = JSON.parse(line);
        const p = dpending.get(m.id);
        if (p) {
          dpending.delete(m.id);
          p(m);
        }
      } catch {}
    }
  });
  let did = 0;
  const dcall = (method, params) =>
    new Promise((resolve, reject) => {
      rpcDeadline(reject, method);
      const myId = ++did;
      dpending.set(myId, resolve);
      daisyMcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
    });

  try {
    await dcall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "selftest", version: "1" },
    });
    const daisyTools = await dcall("tools/list", {});
    const daisyNames = ["design_daisyui_list_components", "design_daisyui_search", "design_daisyui_get_component"];
    const daisyMissing = daisyNames.filter((t) => !(daisyTools.result?.tools || []).some((x) => x.name === t));
    daisyMissing.length === 0
      ? ok(`exposes all ${daisyNames.length} design_daisyui_* tools`)
      : bad(`missing daisyui tools: ${daisyMissing.join(", ")}`);

    const daisyList = await dcall("tools/call", { name: "design_daisyui_list_components", arguments: {} });
    const daisyListParsed = JSON.parse(daisyList.result.content[0].text);
    (daisyListParsed.totals?.components || 0) >= 50 && (daisyListParsed.themes || []).length >= 5
      ? ok(`design_daisyui_list_components returns ${daisyListParsed.totals.components} components and ${daisyListParsed.themes.length} themes`)
      : bad(`design_daisyui_list_components returned ${daisyListParsed.available === false ? "available: false" : daisyListParsed.totals?.components ?? 0} components`);

    const daisySearch = await dcall("tools/call", {
      name: "design_daisyui_search", arguments: { query: "chat", limit: 5 },
    });
    const daisySearchParsed = JSON.parse(daisySearch.result.content[0].text);
    (daisySearchParsed.total || 0) >= 1 && daisySearchParsed.results?.length
      ? ok(`design_daisyui_search finds ${daisySearchParsed.total} matches for 'chat'`)
      : bad(`design_daisyui_search found ${daisySearchParsed.total ?? 0} matches for 'chat'`);

    const daisyGet = await dcall("tools/call", {
      name: "design_daisyui_get_component", arguments: { slug: "button" },
    });
    const button = JSON.parse(daisyGet.result.content[0].text);
    button.example?.includes("btn") && (button.classes || []).length >= 5 && button.livePreview === true
      ? ok(`design_daisyui_get_component returns button: ${button.classes.length} class groups, ${button.example.length}-byte example HTML`)
      : bad(`design_daisyui_get_component did not return example HTML: ${button.error || "empty"}`);
  } catch (e) {
    bad(`daisyui MCP smoke failed: ${e.message}`);
  } finally {
    daisyMcp.kill();
  }
}

// ------------------------------------------------------- 10. baseui layer
section("10. Base UI docs layer (offline)");
const baseuiDir = join(CACHE_DIR, "baseui");
const baseuiCatPath = join(baseuiDir, "catalog.json");
if (!existsSync(baseuiCatPath)) {
  bad(`no baseui catalog at ${baseuiCatPath} — run: npm run baseui && npm run bake`);
} else {
  const baseuiCat = JSON.parse(readFileSync(baseuiCatPath, "utf8"));
  (baseuiCat.components?.length || 0) >= 35
    ? ok(`baseui catalog has ${baseuiCat.components.length} components`)
    : bad(`baseui catalog has ${baseuiCat.components?.length || 0} components, expected 35+ — re-run: npm run baseui`);
  const baseuiHandbook = (baseuiCat.guides || []).filter((g) => g.section === "handbook");
  baseuiHandbook.length >= 6
    ? ok(`baseui catalog carries ${baseuiHandbook.length} handbook guides`)
    : bad(`baseui catalog carries ${baseuiHandbook.length} handbook guides, expected 6+ — re-run: npm run baseui`);
  (baseuiCat.guides?.length || 0) >= 10
    ? ok(`baseui catalog has ${baseuiCat.guides.length} guides (overview, handbook, utilities)`)
    : bad(`baseui catalog has ${baseuiCat.guides?.length || 0} guides, expected 10+ — re-run: npm run baseui`);
  baseuiCat.version
    ? ok(`baseui catalog records latest release ${baseuiCat.version}`)
    : bad("baseui catalog carries no version — re-run: npm run baseui");
  existsSync(join(baseuiDir, "LICENSE"))
    ? ok("baseui MIT license travels with the cache")
    : bad("baseui LICENSE missing from the cache");

  // Provenance must record the robots gate and the licence checksum.
  const baseuiProvPath = join(baseuiDir, "provenance.json");
  if (!existsSync(baseuiProvPath)) {
    bad(`no baseui provenance at ${baseuiProvPath} — re-run: npm run baseui`);
  } else {
    const prov = JSON.parse(readFileSync(baseuiProvPath, "utf8"));
    prov.robots?.checked && prov.robots?.url
      ? ok(`baseui provenance records the robots.txt check (${prov.robots.url})`)
      : bad("baseui provenance records no robots.txt check — re-run: npm run baseui");
    prov.license?.sha256 && prov.docs?.llmsUrl
      ? ok(`baseui provenance records the MIT license sha256 (${prov.license.sha256.slice(0, 12)}…) and the doc source`)
      : bad("baseui provenance is thin (license sha256 / llms source missing) — re-run: npm run baseui");
    Object.keys(prov.checksums || {}).length > 0
      ? ok(`baseui provenance records ${Object.keys(prov.checksums).length} sha256 checksums`)
      : bad("baseui provenance records no checksums — re-run: npm run baseui");
  }

  // The dialog doc the MCP smoke below reads must exist on disk.
  existsSync(join(baseuiDir, "docs", "components", "dialog.md"))
    ? ok("baseui docs tree carries components/dialog.md")
    : bad("baseui docs/components/dialog.md missing — re-run: npm run baseui");

  // -------------------------------------- gallery endpoints, section 4 idiom
  const BASEUI_PORT = 8802;
  const basePreview = spawn("node", [join(HERE, "preview.mjs")], {
    env: {
      ...process.env,
      DESIGN_CACHE_DIR: CACHE_DIR,
      REFERO_CACHE_DIR: CACHE_DIR,
      PORT: String(BASEUI_PORT),
      HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let basePreviewErr = "";
  basePreview.stderr.on("data", (d) => (basePreviewErr += d.toString()));

  await new Promise((r) => setTimeout(r, 2500));
  try {
    const api = await fetch(`http://127.0.0.1:${BASEUI_PORT}/api/baseui`).then((r) => r.json());
    (api.totals?.components || 0) >= 35
      ? ok(`api/baseui reports ${api.totals.components} components`)
      : bad(`api/baseui reports ${api.totals?.components ?? 0} components, expected 35+`);
    api.version
      ? ok(`api/baseui reports version ${api.version}`)
      : bad("api/baseui carries no version");

    const searched = await fetch(`http://127.0.0.1:${BASEUI_PORT}/api/baseui?q=dialog`).then((r) => r.json());
    (searched.total || 0) >= 1 && searched.results?.length
      ? ok(`api/baseui?q=dialog finds ${searched.total} matches`)
      : bad(`api/baseui search for 'dialog' found ${searched.total ?? 0}`);

    const baseListHtml = await fetch(`http://127.0.0.1:${BASEUI_PORT}/baseui`).then((r) => r.text());
    baseListHtml.includes("Base UI") && baseListHtml.includes("baseui-card")
      ? ok("baseui gallery page renders")
      : bad("baseui gallery wrong");

    const baseCompHtml = await fetch(`http://127.0.0.1:${BASEUI_PORT}/baseui/doc/components/dialog`).then((r) => r.text());
    baseCompHtml.includes("baseui-doc-body") && baseCompHtml.includes("<h1>Dialog</h1>")
      ? ok("baseui component page renders (dialog)")
      : bad("baseui component page wrong");
    baseCompHtml.includes("/reui/dialog")
      ? ok("baseui component page cross-links the ReUI gallery")
      : bad("baseui component page carries no ReUI cross-link");

    const baseGuideHtml = await fetch(`http://127.0.0.1:${BASEUI_PORT}/baseui/doc/handbook/styling`).then((r) => r.text());
    baseGuideHtml.includes("baseui-doc-body")
      ? ok("baseui guide page renders (handbook/styling)")
      : bad("baseui guide page wrong");

    const rawDoc = await fetch(`http://127.0.0.1:${BASEUI_PORT}/api/baseui/doc/components/dialog.md`).then((r) => r.text());
    rawDoc.includes("base-ui")
      ? ok(`raw doc endpoint serves markdown (${rawDoc.length} bytes for dialog)`)
      : bad("raw doc endpoint did not serve dialog markdown");

    // The gallery must not load remote resources — same rule as section 7.
    // (Upstream doc links stay: they are anchors, not assets.)
    const basePages = [baseListHtml, baseCompHtml, baseGuideHtml];
    const baseRemote = basePages.filter((t) =>
      /(?:src="https?:\/\/|<link[^>]+href="https?:\/\/|url\(["']?https?:\/\/)/i.test(t),
    );
    baseRemote.length === 0
      ? ok("baseui pages load no remote resources")
      : bad("baseui pages load a remote resource");
  } catch (e) {
    bad(`baseui preview failed: ${e.message}${basePreviewErr ? ` | ${basePreviewErr.slice(0, 200)}` : ""}`);
  } finally {
    basePreview.kill();
  }

  // ------------------------------------------ MCP smoke, section 6 idiom
  await new Promise((r) => setTimeout(r, 800));
  const baseMcp = spawn("node", [join(HERE, "mcp-server.mjs")], {
    env: { ...process.env, DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let bbuf = "";
  const bpending = new Map();
  baseMcp.stdout.on("data", (d) => {
    bbuf += d.toString();
    let i;
    while ((i = bbuf.indexOf("\n")) >= 0) {
      const line = bbuf.slice(0, i).trim();
      bbuf = bbuf.slice(i + 1);
      if (!line) continue;
      try {
        const m = JSON.parse(line);
        const p = bpending.get(m.id);
        if (p) {
          bpending.delete(m.id);
          p(m);
        }
      } catch {}
    }
  });
  let bid = 0;
  const bcall = (method, params) =>
    new Promise((resolve, reject) => {
      rpcDeadline(reject, method);
      const myId = ++bid;
      bpending.set(myId, resolve);
      baseMcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
    });

  try {
    await bcall("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "selftest", version: "1" },
    });
    const baseTools = await bcall("tools/list", {});
    const baseNames = [
      "design_baseui_list_components", "design_baseui_search", "design_baseui_get_docs", "design_baseui_get_guide",
    ];
    const baseMissing = baseNames.filter((t) => !(baseTools.result?.tools || []).some((x) => x.name === t));
    baseMissing.length === 0
      ? ok(`exposes all ${baseNames.length} design_baseui_* tools`)
      : bad(`missing baseui tools: ${baseMissing.join(", ")}`);

    const baseList = await bcall("tools/call", { name: "design_baseui_list_components", arguments: {} });
    const baseListParsed = JSON.parse(baseList.result.content[0].text);
    (baseListParsed.totals?.components || 0) >= 35 && baseListParsed.version
      ? ok(`design_baseui_list_components returns ${baseListParsed.totals.components} components (v${baseListParsed.version})`)
      : bad(`design_baseui_list_components returned ${baseListParsed.available === false ? "available: false" : baseListParsed.totals?.components ?? 0} components, expected 35+`);

    const baseDocs = await bcall("tools/call", {
      name: "design_baseui_get_docs",
      arguments: { components: ["Dialog"] },
    });
    const dialog = JSON.parse(baseDocs.result.content[0].text).results?.[0];
    dialog?.content?.includes("base-ui") && !dialog.error
      ? ok(`design_baseui_get_docs returns Dialog content (${dialog.content.length} bytes)`)
      : bad(`design_baseui_get_docs did not return Dialog content: ${dialog?.error || "empty"}`);

    const baseSearch = await bcall("tools/call", {
      name: "design_baseui_search", arguments: { query: "form", limit: 5 },
    });
    const baseSearchParsed = JSON.parse(baseSearch.result.content[0].text);
    (baseSearchParsed.total || 0) >= 1 && baseSearchParsed.results?.length
      ? ok(`design_baseui_search finds ${baseSearchParsed.total} matches for 'form'`)
      : bad(`design_baseui_search found ${baseSearchParsed.total ?? 0} matches for 'form'`);

    const baseGuide = await bcall("tools/call", {
      name: "design_baseui_get_guide", arguments: { path: "handbook/styling" },
    });
    const styling = JSON.parse(baseGuide.result.content[0].text);
    styling.content?.includes("base-ui")
      ? ok(`design_baseui_get_guide returns handbook/styling (${styling.content.length} bytes)`)
      : bad(`design_baseui_get_guide did not return handbook/styling: ${styling.error || "empty"}`);

    // A guide's catalog path must return that guide. Release notes sit three
    // segments deep and used to come back as 'overview/releases.md'.
    const wrongGuides = [];
    for (const guide of baseListParsed.guides || []) {
      const got = toolJson(await bcall("tools/call", {
        name: "design_baseui_get_guide", arguments: { path: guide.path },
      }));
      if (got.path !== guide.path) wrongGuides.push(`${guide.path} -> ${got.path || got.error}`);
    }
    wrongGuides.length === 0
      ? ok(`design_baseui_get_guide returns the right page for all ${(baseListParsed.guides || []).length} catalog paths`)
      : bad(`design_baseui_get_guide returned the wrong page: ${wrongGuides.slice(0, 5).join("; ")}`);
  } catch (e) {
    bad(`baseui MCP smoke failed: ${e.message}`);
  } finally {
    baseMcp.kill();
  }
}

// ------------------------------------------------- 11. docs drift check
section("11. Docs and skills stay in sync with the server");
{
  // Static on purpose: this compares files, so it runs without a cache and
  // fails the moment a tool is added or renamed without its docs.
  const serverSource = readFileSync(join(HERE, "mcp-server.mjs"), "utf8");
  const toolNames = [...new Set([...serverSource.matchAll(/^\s+name: "(design_[a-z_]+)",$/gm)].map((m) => m[1]))];
  const skillsDir = join(ROOT, "plugins", "designer-mcp", "skills");
  const toolsDoc = join(skillsDir, "designer-mcp", "references", "mcp-tools.md");

  toolNames.length >= 40
    ? ok(`found ${toolNames.length} registered design_* tools in mcp-server.mjs`)
    : bad(`only ${toolNames.length} tool names parsed from mcp-server.mjs; the parser or the file changed`);

  // 1. Every registered tool is documented in the full reference.
  const reference = existsSync(toolsDoc) ? readFileSync(toolsDoc, "utf8") : "";
  const undocumented = toolNames.filter((name) => !reference.includes(`\`${name}\``));
  undocumented.length === 0
    ? ok("every registered tool is documented in mcp-tools.md")
    : bad(`tools missing from mcp-tools.md: ${undocumented.join(", ")}`);

  // 2. Every design_* name written in the skills and docs is a real tool, or
  //    a prefix of one (design_heroui_*, design_{heroui,mantine}_search).
  const markdownUnder = (dir) => {
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      // The vendored ui-sdk docs and scratch space are not ours to check.
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "tmp" || full.endsWith(join("ui-sdk", "docs"))) continue;
        out.push(...markdownUnder(full));
      } else if (entry.name.endsWith(".md")) {
        out.push(full);
      }
    }
    return out;
  };
  const docFiles = [
    ...markdownUnder(join(ROOT, "plugins", "designer-mcp")),
    ...markdownUnder(join(ROOT, "docs")),
    join(ROOT, "README.md"),
    join(ROOT, "AGENTS.md"),
  ].filter((file) => existsSync(file));
  const isToolOrPrefix = (token) => toolNames.some((name) => name === token || name.startsWith(`${token}_`));
  const ghosts = new Map();
  for (const file of docFiles) {
    const text = readFileSync(file, "utf8");
    // The lookbehind keeps refero_design_md and my_design_tokens out.
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])design_[a-z_]*[a-z]/g)) {
      if (isToolOrPrefix(m[0])) continue;
      if (!ghosts.has(m[0])) ghosts.set(m[0], file.slice(ROOT.length + 1));
    }
  }
  ghosts.size === 0
    ? ok(`no doc or skill names a design_* tool that does not exist (${docFiles.length} files)`)
    : bad(`docs name tools the server does not have: ${[...ghosts].map(([t, f]) => `${t} (${f})`).join(", ")}`);

  // 3. Stated tool counts match. CHANGELOG is history and is not checked.
  const countFiles = [
    join(ROOT, "README.md"),
    join(ROOT, "docs", "ARCHITECTURE.md"),
    join(skillsDir, "designer-mcp", "install", "README.md"),
  ].filter((file) => existsSync(file));
  const wrongCounts = [];
  for (const file of countFiles) {
    const text = readFileSync(file, "utf8");
    const patterns = [/(\d+) `design_\*` tools/g, /(\d+) tools in total/g, /`design_\*` server: (\d+) tools/g];
    for (const pattern of patterns) {
      for (const m of text.matchAll(pattern)) {
        if (Number(m[1]) !== toolNames.length) wrongCounts.push(`${file.slice(ROOT.length + 1)} says ${m[1]}`);
      }
    }
  }
  wrongCounts.length === 0
    ? ok(`stated tool counts match the server (${toolNames.length})`)
    : bad(`stale tool counts (server has ${toolNames.length}): ${wrongCounts.join("; ")}`);

  // 4. The plugin registers the image that matches its own version, so an
  //    installed plugin never runs a server older than its skills.
  const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
  const pinFiles = [
    join(ROOT, "plugins", "designer-mcp", ".mcp.json"),
    join(ROOT, ".agents", "plugins", "designer-mcp", "mcp_config.json"),
  ].filter((file) => existsSync(file));
  const wrongPins = pinFiles.filter(
    (file) => !readFileSync(file, "utf8").includes(`ghcr.io/whit3rabbit/designer-mcp:v${version}"`),
  );
  wrongPins.length === 0
    ? ok(`plugin MCP registrations pin the image to v${version}`)
    : bad(`image tag is not pinned to v${version} in: ${wrongPins.map((f) => f.slice(ROOT.length + 1)).join(", ")}`);
}

// ------------------------------------------- 12. degraded-mode behavior
section("12. Missing catalog, unreachable remote host, bad input");
{
  // One stdio client per case: each case needs its own environment.
  const startServer = (script, env) => {
    const child = spawn("node", [join(HERE, script)], {
      env: { ...process.env, DESIGN_REMOTE_URL: "", ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    let nextId = 0;
    const waiting = new Map();
    child.stderr.on("data", (d) => (err += d.toString()));
    child.stdout.on("data", (d) => {
      out += d.toString();
      let i;
      while ((i = out.indexOf("\n")) >= 0) {
        const line = out.slice(0, i).trim();
        out = out.slice(i + 1);
        if (!line) continue;
        try {
          const m = JSON.parse(line);
          waiting.get(m.id)?.(m);
          waiting.delete(m.id);
        } catch {}
      }
    });
    const rpc = (method, params) =>
      new Promise((resolve, reject) => {
        rpcDeadline(reject, method);
        const myId = ++nextId;
        waiting.set(myId, resolve);
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
      });
    return {
      rpc,
      init: () => rpc("initialize", {
        protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "selftest", version: "1" },
      }),
      tool: async (name, args) => {
        const res = await rpc("tools/call", { name, arguments: args });
        return { failed: toolFailed(res), text: res?.result?.content?.[0]?.text ?? "", body: toolJson(res) };
      },
      raw: (line) => child.stdin.write(line + "\n"),
      stderr: () => err,
      kill: () => child.kill(),
    };
  };
  const emptyCache = mkdtempSync(join(tmpdir(), "designer-empty-cache-"));
  const noCache = { DESIGN_CACHE_DIR: emptyCache, REFERO_CACHE_DIR: emptyCache };
  const withCache = { DESIGN_CACHE_DIR: CACHE_DIR, REFERO_CACHE_DIR: CACHE_DIR };

  // ---- a. No catalog: the server starts, and says why instead of "0 results".
  let server = startServer("mcp-server.mjs", noCache);
  try {
    await server.init();
    const listed = (await server.rpc("tools/list", {})).result?.tools?.length || 0;
    const search = await server.tool("design_search", { query: "dark" });
    const docs = await server.tool("design_docs_search", { query: "dialog" });
    const pasted = await server.tool("design_markdown_parse", { content: "# Pasted\n\n## Colors\n- #101010" });
    listed >= 40 && search.failed && /catalog/i.test(search.text) && /npm run fetch/.test(search.text)
      ? ok("with no catalog the server still starts, and a catalog tool explains what to run")
      : bad(`no-catalog start is wrong: ${listed} tools, design_search -> ${search.text.slice(0, 100)}`);
    !docs.failed && docs.body.total > 0 && !pasted.failed && pasted.body.parsed
      ? ok("tools that need no catalog keep working without one (docs search, pasted DESIGN.md)")
      : bad(`tools that need no catalog failed without one: ${docs.text.slice(0, 80)} / ${pasted.text.slice(0, 80)}`);
  } catch (e) {
    bad(`no-catalog start failed: ${e.message}`);
  } finally {
    server.kill();
  }

  // ---- b. Remote host that refuses connections: answer from disk, and say so.
  const closedPort = await new Promise((resolve) => {
    const probe = http.createServer();
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
  server = startServer("mcp-server.mjs", { ...withCache, DESIGN_REMOTE_URL: `http://127.0.0.1:${closedPort}` });
  try {
    await server.init();
    const search = await server.tool("design_search", { query: "dark developer tool" });
    const record = await server.tool("design_get", { identifier: `designer:${designs[0].source || "refero"}:${designs[0].id}` });
    !search.failed && search.body.count > 0 && /local cache/.test(search.body.remoteNote || "")
      ? ok("an unreachable remote host falls back to the local catalog, with a remoteNote")
      : bad(`remote fallback wrong for design_search: ${search.text.slice(0, 120)}`);
    !record.failed && record.body.id === designs[0].id && record.body.remoteNote
      ? ok("a record read through the fallback also carries the remoteNote")
      : bad(`remote fallback wrong for design_get: ${record.text.slice(0, 120)}`);
  } catch (e) {
    bad(`remote fallback failed: ${e.message}`);
  } finally {
    server.kill();
  }

  // ---- c. Tool arguments must not steer a remote request outside api/.
  // A loopback host records every request. It serves a small HeroUI catalog
  // so the guide and migration readers actually run; everything else is 404.
  const requested = [];
  const fakeCatalog = {
    version: { react: "0", styles: "0", source: "0" },
    totals: { components: 1, guides: 1 },
    components: [{ name: "Button", slug: "button", group: "Buttons", description: "", path: "components/button.md" }],
    guides: [{ name: "Theming", slug: "theming", group: "Handbook", description: "", path: "guides/theming.md" }],
    hasSource: true, hasStyles: true, hasMigration: true,
  };
  const host = http.createServer((req, res) => {
    requested.push(req.url);
    if (req.url === "/site/api/heroui.json") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(fakeCatalog));
    } else if (req.url === "/site/api/heroui/doc/guides/theming.md") {
      res.end("# Theming\n");
    } else {
      res.statusCode = 404;
      res.end("not found");
    }
  });
  await new Promise((resolve) => host.listen(0, "127.0.0.1", resolve));
  server = startServer("mcp-server.mjs", {
    ...noCache, DESIGN_REMOTE_URL: `http://127.0.0.1:${host.address().port}/site`,
  });
  try {
    await server.init();
    const guide = await server.tool("design_heroui_get_guide", { path: "theming" });
    const attempts = [
      ["design_heroui_get_guide", { path: "../../../secret" }],
      ["design_heroui_get_guide", { path: "../../../../../../secret.md" }],
      ["design_heroui_get_guide", { path: "x/../../../secret.md" }],
      ["design_heroui_get_guide", { path: "%2e%2e/%2e%2e/secret.md" }],
      ["design_heroui_migration_guide", { name: "../../secret" }],
      ["design_heroui_migration_guide", { name: "button?x=1#frag" }],
      ["design_heroui_get_source", { component: "../../secret" }],
      ["design_docs_get", { path: "../../secret.md" }],
    ];
    for (const [name, args] of attempts) await server.tool(name, args);
    // The HTTP client resolves dot segments before sending, so an escape
    // does not show up as ".." on the wire: "guides/../../../secret.md"
    // arrives as a plain /site/api/secret.md. Hence the name check: every
    // attempt asks for "secret", and the only place that name may appear is
    // the source lookup, where the component name is slugified first.
    const escaped = requested.filter(
      (url) =>
        !url.startsWith("/site/api/") || /[?#]/.test(url) || /%2e/i.test(url) ||
        (url.includes("secret") && url !== "/site/api/heroui/source/secret.json"),
    );
    guide.body.content === "# Theming\n" && requested.includes("/site/api/heroui/doc/guides/theming.md")
      ? ok("remote mode reads a guide from the configured host")
      : bad(`remote guide read failed: ${guide.text.slice(0, 100)}`);
    escaped.length === 0
      ? ok(`traversal and query arguments send no request outside api/ (${attempts.length} attempts, ${requested.length} requests seen)`)
      : bad(`tool arguments reached the remote host as: ${escaped.join(", ")}`);
  } catch (e) {
    bad(`remote path check failed: ${e.message}`);
  } finally {
    server.kill();
    host.close();
  }

  // ---- c2. A 404 from the host is its answer for layer items too. The
  // host publishes a HeroUI catalog but not the Button doc; disk has it.
  // Reading disk here would pair the host's catalog with a local bake and
  // say nothing. An unreachable host is the only case that reads disk.
  const layerHost = http.createServer((req, res) => {
    if (req.url === "/site/api/heroui.json") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(fakeCatalog));
    } else {
      res.statusCode = 404;
      res.end("not found");
    }
  });
  await new Promise((resolve) => layerHost.listen(0, "127.0.0.1", resolve));
  const diskButton = existsSync(join(CACHE_DIR, "heroui", "docs", "components", "button.md"));
  server = startServer("mcp-server.mjs", {
    ...withCache, DESIGN_REMOTE_URL: `http://127.0.0.1:${layerHost.address().port}/site`,
  });
  try {
    await server.init();
    const doc = await server.tool("design_heroui_get_docs", { components: ["Button"] });
    const row = doc.body.results?.[0];
    !diskButton
      ? bad("no baked heroui Button doc on disk to test the remote 404 rule against")
      : !doc.failed && !row?.content && !("remoteNote" in doc.body)
        ? ok("remote 404 for a layer item is the answer: the doc on disk is not served in its place")
        : bad(`remote 404 fell back to disk: ${doc.text.slice(0, 120)}`);
  } catch (e) {
    bad(`remote 404 layer check failed: ${e.message}`);
  } finally {
    server.kill();
    layerHost.close();
  }
  server = startServer("mcp-server.mjs", { ...withCache, DESIGN_REMOTE_URL: `http://127.0.0.1:${closedPort}` });
  try {
    await server.init();
    const doc = await server.tool("design_heroui_get_docs", { components: ["Button"] });
    const row = doc.body.results?.[0];
    row?.content?.includes("Button") && /local cache/.test(doc.body.remoteNote || "")
      ? ok("an unreachable host serves layer items from disk, with a remoteNote")
      : bad(`unreachable-host layer fallback wrong: ${doc.text.slice(0, 120)}`);
  } catch (e) {
    bad(`unreachable-host layer check failed: ${e.message}`);
  } finally {
    server.kill();
  }

  // ---- d. A remote URL that is not http(s) is ignored, loudly.
  server = startServer("mcp-server.mjs", { ...withCache, DESIGN_REMOTE_URL: "file:///etc/hosts" });
  try {
    await server.init();
    const facets = await server.tool("design_facets", {});
    facets.body.total === designs.length && /not an http/.test(facets.body.remoteNote || "") && /not an http/.test(server.stderr())
      ? ok("a non-http remote URL is ignored: local catalog, with a note in the reply and on stderr")
      : bad(`non-http remote URL was not handled: ${facets.text.slice(0, 120)}`);
  } catch (e) {
    bad(`non-http remote URL check failed: ${e.message}`);
  } finally {
    server.kill();
  }

  // ---- e. A line that is not JSON-RPC is logged, and the server keeps going.
  server = startServer("mcp-server.mjs", withCache);
  try {
    await server.init();
    server.raw("this is not json");
    const pong = await server.rpc("ping", {});
    const plain = await server.tool("design_facets", {});
    pong.result && /transport error/.test(server.stderr())
      ? ok("a malformed input line is logged to stderr and the server keeps answering")
      : bad("a malformed input line was dropped silently or stopped the server");
    !("remoteNote" in plain.body)
      ? ok("offline replies carry no remoteNote")
      : bad("a reply carries a remoteNote with no remote configured");
  } catch (e) {
    bad(`malformed-input check failed: ${e.message}`);
  } finally {
    server.kill();
  }

  // ---- f. The upstream wrapper reads the cache named by DESIGN_CACHE_DIR
  // alone. It used to check /cache and let upstream read ~/.refero-cache.
  const { REFERO_CACHE_DIR: _unset, ...withoutRefero } = process.env;
  const wrapper = spawn("node", [join(HERE, "mcp-entry.mjs")], {
    env: { ...withoutRefero, DESIGN_CACHE_DIR: CACHE_DIR },
    stdio: ["pipe", "pipe", "pipe"],
  });
  try {
    const reply = await new Promise((resolve, reject) => {
      rpcDeadline(reject, "refero tools/call");
      let out = "";
      wrapper.stdout.on("data", (d) => {
        out += d.toString();
        for (const line of out.split("\n")) {
          try {
            const m = JSON.parse(line);
            if (m.id === 2) resolve(m);
          } catch {}
        }
      });
      wrapper.on("exit", (code) => reject(new Error(`mcp-entry exited with code ${code}`)));
      wrapper.stdin.write(JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "selftest", version: "1" } },
      }) + "\n");
      wrapper.stdin.write(JSON.stringify({
        jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "refero_list", arguments: { limit: 1 } },
      }) + "\n");
    });
    const listed = toolJson(reply);
    (listed.total ?? 0) > 0
      ? ok(`mcp-entry.mjs serves the cache named by DESIGN_CACHE_DIR alone (${listed.total} entries)`)
      : bad(`mcp-entry.mjs did not read DESIGN_CACHE_DIR: ${JSON.stringify(listed).slice(0, 120)}`);
  } catch (e) {
    bad(`mcp-entry.mjs with DESIGN_CACHE_DIR only failed: ${e.message}`);
  } finally {
    wrapper.kill();
  }

  rmSync(emptyCache, { recursive: true, force: true });
}

// ----------------------------------------- 13. offline install archives
section("13. Offline install archives (skill zip, local marketplace)");
{
  // Package into a temp dir and serve it through the gallery's /skill
  // routes, which look beside SKILLS_ROOT. Needs the `zip` binary.
  const out = mkdtempSync(join(tmpdir(), "designer-skill-zip-"));
  const packed = spawnSync("node", [join(HERE, "package-skill.mjs"), "--out", out], { encoding: "utf8" });
  const list = (zip) => spawnSync("unzip", ["-Z1", join(out, zip)], { encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  if (packed.status !== 0) {
    bad(`package-skill.mjs failed: ${(packed.stderr || packed.stdout).slice(0, 200)}`);
  } else {
    const skillEntries = list("designer-mcp-skill.zip");
    const skillTops = ["design-system", "designer-mcp", "designer-documents", "designer-ui"];
    // The README's install command copies skills/. out of an extracted
    // copy; this keeps that command true to the real layout.
    skillTops.every((t) => skillEntries.includes(`skills/${t}/SKILL.md`)) &&
    !skillEntries.some((e) => /^[^/]+\/SKILL\.md$/.test(e))
      ? ok("skill zip keeps the four skills under skills/ (matches the documented copy command)")
      : bad("skill zip layout changed: update the README install command");
    const mEntries = list("designer-mcp-marketplace.zip");
    const mRequired = [
      ".claude-plugin/marketplace.json",
      "plugins/designer-mcp/.claude-plugin/plugin.json",
      "plugins/designer-mcp/.mcp.json",
      ...skillTops.map((t) => `plugins/designer-mcp/skills/${t}/SKILL.md`),
    ];
    const mMissing = mRequired.filter((r) => !mEntries.includes(r));
    mMissing.length === 0 && !mEntries.some((e) => e.endsWith(".zip"))
      ? ok(`marketplace zip is a local marketplace (${mEntries.length} entries, no nested zip)`)
      : bad(`marketplace zip is missing: ${mMissing.join(", ") || "(has a nested zip)"}`);

    const SKILL_PORT = 8797;
    const gallery = spawn("node", [join(HERE, "preview.mjs")], {
      env: {
        ...process.env,
        DESIGN_CACHE_DIR: CACHE_DIR,
        REFERO_CACHE_DIR: CACHE_DIR,
        SKILLS_ROOT: join(out, "skills"),
        PORT: String(SKILL_PORT),
        HOST: "127.0.0.1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((r) => setTimeout(r, 2500));
    try {
      for (const route of ["/skill", "/skill/marketplace.zip"]) {
        const res = await fetch(`http://127.0.0.1:${SKILL_PORT}${route}`);
        const head = Buffer.from(await res.arrayBuffer()).subarray(0, 2).toString("latin1");
        res.status === 200 && res.headers.get("content-type") === "application/zip" && head === "PK"
          ? ok(`gallery ${route} serves a zip`)
          : bad(`gallery ${route} returned ${res.status} ${res.headers.get("content-type")}`);
      }
    } catch (e) {
      bad(`gallery /skill routes failed: ${e.message}`);
    } finally {
      gallery.kill();
    }
  }
  rmSync(out, { recursive: true, force: true });
}

// ------------------------------------------------------------ done
console.log(
  failures === 0
    ? `\n\x1b[32m\x1b[1mAll checks passed.\x1b[0m\n`
    : `\n\x1b[31m\x1b[1m${failures} check(s) failed.\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
