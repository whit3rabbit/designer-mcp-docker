#!/usr/bin/env node
/**
 * Entry point for the containerised MCP server.
 *
 * The upstream package's cli.js is the stdio MCP server. The container runs it
 * directly, but this wrapper exists so the image has ONE entrypoint shape and
 * so we can fail loudly if the cache is missing — an MCP server that starts
 * and then serves an empty catalog looks like a working server with no data.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = process.env.REFERO_CACHE_DIR || "/cache";
const catalog = join(CACHE_DIR, "catalog.json");

if (!existsSync(catalog)) {
  // stdout is the MCP transport, so this must go to stderr.
  console.error(
    `[refero-mcp] no catalog at ${catalog}\n` +
      `[refero-mcp] populate it first — the image ships the fetcher:\n` +
      `[refero-mcp]   docker run --rm -v refero-cache:/cache \\\n` +
      `[refero-mcp]     ghcr.io/whit3rabbit/designer-mcp:v1.0.1 \\\n` +
      `[refero-mcp]     node scripts/refero-public-fetch.js --limit 0\n` +
      `[refero-mcp] then run the MCP server against the same volume.`,
  );
  process.exit(1);
}

// Resolve the upstream CLI regardless of where this script sits.
function resolveCli() {
  const candidates = [];
  let dir = HERE;
  for (let i = 0; i < 5; i++) {
    candidates.push(join(dir, "node_modules/fidgetcoding-refero-mcp/dist/cli.js"));
    dir = dirname(dir);
  }
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  const require = createRequire(join(process.cwd(), "index.js"));
  return require.resolve("fidgetcoding-refero-mcp/dist/cli.js");
}

const cli = resolveCli();
await import(`file://${cli}`);
