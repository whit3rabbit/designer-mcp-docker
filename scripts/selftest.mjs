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
 *
 * Usage: node scripts/selftest.mjs [--cache <dir>]
 * Defaults to the baked catalog when available so npm test checks the image inputs.
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
    ds.total === 6
      ? ok(`design-systems index has ${ds.total} templates`)
      : bad(`design-systems index has ${ds.total} templates, expected 6`);
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
    dsOk && ok("all six template records carry the manifest schema and 48+ tokens");
  }
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
  new Promise((resolve) => {
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
  new Promise((resolve) => {
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
  }
} catch (e) {
  bad(`generic MCP server failed: ${e.message}`);
} finally {
  designMcp.kill();
}

// ------------------------------------------------------------ done
console.log(
  failures === 0
    ? `\n\x1b[32m\x1b[1mAll checks passed.\x1b[0m\n`
    : `\n\x1b[31m\x1b[1m${failures} check(s) failed.\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
