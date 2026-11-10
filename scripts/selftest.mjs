#!/usr/bin/env node
/**
 * Self-test for designer-mcp.
 *
 * Checks the things that actually broke during development:
 *   1. the cache exists and is complete
 *   2. the upstream renderer is importable and produces a DESIGN.md
 *   3. the preview server starts, serves the gallery, and answers the API
 *   4. the MCP server exposes its tools over stdio and returns real data
 *
 * Usage: node scripts/selftest.mjs [--cache <dir>]
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
    : process.env.REFERO_CACHE_DIR || join(ROOT, "cache");

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
if (!existsSync(catalogPath)) {
  bad(`no catalog at ${catalogPath} — run: node scripts/refero-public-fetch.js --limit 0`);
} else {
  const cat = JSON.parse(readFileSync(catalogPath, "utf8"));
  const styles = cat.styles || [];
  ok(`catalog has ${styles.length} styles`);
  const unique = new Set(styles.map((s) => s.id));
  unique.size === styles.length
    ? ok("all style ids unique")
    : bad(`duplicate ids: ${styles.length - unique.size}`);
  const noFonts = styles.filter((s) => !s.fonts?.length).length;
  const noColors = styles.filter((s) => !s.colors?.length).length;
  noFonts === 0 ? ok("every style has fonts") : bad(`${noFonts} styles have no fonts`);
  noColors === 0 ? ok("every style has colors") : bad(`${noColors} styles have no colors`);
}

// ------------------------------------------------------- 2. renderer
section("2. DESIGN.md renderer");
try {
  const { renderDesignMd } = await import(
    `file://${join(ROOT, "node_modules/fidgetcoding-refero-mcp/dist/design-md.js")}`
  );
  const cat = JSON.parse(readFileSync(catalogPath, "utf8"));
  const first = cat.styles[0];
  const full = JSON.parse(
    readFileSync(join(CACHE_DIR, "styles", `${first.id}.json`), "utf8"),
  ).style;
  const md = renderDesignMd(full);
  md.startsWith("---")
    ? ok(`renders DESIGN.md (${md.length} bytes) for ${first.siteName}`)
    : bad("rendered markdown has no frontmatter");
} catch (e) {
  bad(`renderer failed: ${e.message}`);
}

// ------------------------------------------------------- 3. preview
section("3. Preview server");
const PORT = 8799;
const preview = spawn("node", [join(HERE, "preview.mjs")], {
  env: { ...process.env, REFERO_CACHE_DIR: CACHE_DIR, PORT: String(PORT), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let previewErr = "";
preview.stderr.on("data", (d) => (previewErr += d.toString()));

await new Promise((r) => setTimeout(r, 2500));
try {
  const health = await fetch(`http://127.0.0.1:${PORT}/healthz`).then((r) => r.json());
  health.ok ? ok(`healthz reports ${health.styles} styles`) : bad("healthz not ok");

  const list = await fetch(`http://127.0.0.1:${PORT}/api/styles?limit=2`).then((r) => r.json());
  list.styles?.length === 2 ? ok("api/styles returns rows") : bad("api/styles empty");

  const facets = await fetch(`http://127.0.0.1:${PORT}/api/facets`).then((r) => r.json());
  facets.fonts?.length ? ok(`api/facets reports ${facets.fonts.length} fonts`) : bad("facets has no fonts");

  const html = await fetch(`http://127.0.0.1:${PORT}/`).then((r) => r.text());
  html.includes("Refero Styles") ? ok("gallery HTML served") : bad("gallery HTML wrong");

  const id = list.styles[0].id;
  const th = await fetch(`http://127.0.0.1:${PORT}/thumb/${id}`, { redirect: "manual" });
  th.status === 302 ? ok("thumb route redirects to the CDN") : bad(`thumb returned ${th.status}`);

  const md = await fetch(`http://127.0.0.1:${PORT}/api/styles/${id}/design.md`).then((r) => r.text());
  md.startsWith("---") ? ok("design.md route serves markdown") : bad("design.md route wrong");

  const detail = await fetch(`http://127.0.0.1:${PORT}/style/${id}`).then((r) => r.text());
  detail.includes("Color tokens") ? ok("detail page renders") : bad("detail page wrong");
} catch (e) {
  bad(`preview server failed: ${e.message}${previewErr ? ` | ${previewErr.slice(0, 200)}` : ""}`);
} finally {
  preview.kill();
}

// ------------------------------------------------------------ 4. MCP
section("4. MCP server (stdio)");
await new Promise((r) => setTimeout(r, 800));
const mcp = spawn("node", [join(HERE, "mcp-entry.mjs")], {
  env: { ...process.env, REFERO_CACHE_DIR: CACHE_DIR },
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

// ------------------------------------------------------------ done
console.log(
  failures === 0
    ? `\n\x1b[32m\x1b[1mAll checks passed.\x1b[0m\n`
    : `\n\x1b[31m\x1b[1m${failures} check(s) failed.\x1b[0m\n`,
);
process.exit(failures === 0 ? 0 : 1);
