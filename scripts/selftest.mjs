#!/usr/bin/env node
/**
 * Self-test for designer-mcp.
 *
 * Checks the things that actually broke during development:
 *   1. the cache exists, is complete, and both sources are tagged
 *   2. the upstream renderer is importable and produces a DESIGN.md
 *   3. thumbnails are cached locally (the gallery must not need the network)
 *   4. the preview server starts, serves the gallery, and answers the API
 *   5. the upstream MCP server exposes its tools over stdio
 *   6. the generic MCP server exposes `design_*` tools over both sources
 *
 * Usage: node scripts/selftest.mjs [--cache <dir>]
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
const CACHE_DIR =
  cacheArg >= 0 && argv[cacheArg + 1]
    ? resolve(argv[cacheArg + 1])
    : process.env.DESIGN_CACHE_DIR ||
      process.env.REFERO_CACHE_DIR ||
      join(ROOT, "cache");

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
    "design_search", "design_get", "design_list", "design_facets", "design_markdown",
    "design_component_search", "design_component_get", "design_component_code",
    "design_preset_search", "design_preset_get",
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