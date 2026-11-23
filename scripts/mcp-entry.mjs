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
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
// One cache directory, for the check below AND for the upstream package.
//
// Upstream reads only REFERO_CACHE_DIR and defaults to ~/.refero-cache, so the
// directory resolved here is exported back into the environment. Without that
// this wrapper checked one directory and the server read another whenever the
// variable was unset. DESIGN_CACHE_DIR is the name the fetchers and the
// generic server use, so it is honored too. With neither set: /cache inside
// the image, else ~/.design-cache, where the fetchers write by default.
// resolve() because upstream rejects a relative path, and only after startup.
function defaultCacheDir() {
  return existsSync("/cache/catalog.json") ? "/cache" : join(homedir(), ".design-cache");
}
const CACHE_DIR = resolve(
  process.env.REFERO_CACHE_DIR || process.env.DESIGN_CACHE_DIR || defaultCacheDir(),
);
process.env.REFERO_CACHE_DIR = CACHE_DIR;
// The upstream package defaults its cache TTL to 24 hours and re-fetches from
// the live API when the mirror looks stale. The image sets a deliberate 10-year
// TTL (Dockerfile) so reads always come from the cache and refresh happens by
// re-running the fetcher. Apply the same default here so a bare-host run
// without the env keeps that offline behavior. An explicit env still wins.
process.env.REFERO_CACHE_TTL_MS ||= "315360000000";
const catalog = join(CACHE_DIR, "catalog.json");

if (!existsSync(catalog)) {
  // stdout is the MCP transport, so this must go to stderr.
  // The image reference is deliberately not spelled out here: the version
  // baked into this string would go stale on the next release. Use whatever
  // tag you actually ran.
  // The image bakes the catalog at /cache, so inside a container the usual
  // cause is a volume mounted over /cache that shadows it. Lead with that:
  // the fetcher needs network, which an offline install does not have.
  console.error(
    `[refero-mcp] no catalog at ${catalog}\n` +
      `[refero-mcp] the image already bakes one at /cache. If you mounted a volume\n` +
      `[refero-mcp] over /cache, drop the -v flag or mount a populated cache, and\n` +
      `[refero-mcp] check REFERO_CACHE_DIR / DESIGN_CACHE_DIR.\n` +
      `[refero-mcp] to build your own cache instead (needs network):\n` +
      `[refero-mcp]   docker run --rm -v refero-cache:/cache <this-image> \\\n` +
      `[refero-mcp]     node scripts/refero-public-fetch.js --limit 0`,
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
