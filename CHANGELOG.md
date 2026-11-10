# Changelog

## v1.2.0 — 2026-11-10

- **Thumbnail compression.** The cached screenshots are 1440×900 JPEGs —
  150.6 MB for the catalog, more than the JSON catalog itself — but the
  gallery only ever renders them at 349 CSS px (grid) and 716 CSS px
  (detail). `scripts/compress-thumbs.mjs` re-encodes them to WebP at
  1000px: **150.6 MB → 55.9 MB (37%)**, mean PSNR 42.5 dB / SSIM 0.990
  against a Lanczos reference. A gallery page load drops from 25.3 MB to
  9.3 MB.
- `fetch-thumbs.mjs --compress` re-encodes before the bytes touch the
  disk, so a fresh install never stores the full-size JPEGs at all.
  The `thumbs` compose service uses it by default.
- New `compress` compose service re-encodes an existing cache:
  `docker compose run --rm compress --replace`.
- The resize uses sharp's **Lanczos3** kernel, not the encoder's own
  scaler. `cwebp -resize` uses a fast box filter and costs ~3.8 dB of
  PSNR on a 1440→1000 downscale, which is visible on text-heavy
  screenshots.
- `sharp` is an optional dependency — the plain fetch path does not need
  it, and it ships prebuilt binaries for linux-x64, linux-arm64 and
  darwin, so the same script runs on the host and in the multi-arch image.
- The preview server now prefers `.webp` over `.jpg` when both are
  present, so a cache can be compressed in place without a restart.

## v1.1.1 — 2026-11-10

- **Compose services accept trailing arguments.** `docker compose run --rm
  thumbs --limit 5 --force` used to fail with `node: bad option: --limit`,
  because compose's `command:` key REPLACES the container command rather
  than appending to it. The fetch services now use `entrypoint:` instead,
  so trailing args append as expected. Verified for all three: `fetch`,
  `opendesign`, `thumbs`.
- **Argument parsing takes the last occurrence.** The `--limit 0` default
  baked into the compose `command:` would have overridden a user's
  `--limit 20`. `argVal` now returns the last match, so a trailing
  argument always wins.
- **`fetch` defaults to the whole catalog.** With the `--limit 0` default
  moved out of the compose file, the script's own default changed from 40
  to 0 (all). A partial fetch from the `fetch` service would otherwise
  have silently produced an incomplete cache.
- **The cache directory default is now consistent.** `refero-public-fetch.js`
  defaulted to `~/.refero-cache` while every other script used
  `~/.design-cache`. It now uses `DESIGN_CACHE_DIR`, falls back to the
  legacy `REFERO_CACHE_DIR`, and only then to `~/.design-cache`.
- The compose image is overridable with `DESIGNER_MCP_IMAGE`, so a local
  build can be tested through the same compose services without retagging.

## v1.1.0 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.1.0`
- **Offline thumbnails.** `/thumb/:id` no longer 302-redirects to the CDN.
  `scripts/fetch-thumbs.mjs` caches all 1,342 screenshots locally
  (~150 MB) and the gallery serves the bytes. The gallery now makes zero
  outbound requests. Verified against a container run with `--network none`.
- **OpenDesign as a second source.** 152 curated design-system packages from
  [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0)
  are imported by `scripts/fetch-opendesign.mjs` into the same catalog, with
  a `source` tag on every entry. Imported via sparse clone of the
  `design-systems/` subtree — 38 MB, not the 3.6 GB full repo.
- **Generic MCP server.** `scripts/mcp-server.mjs` exposes five source-neutral
  tools — `design_search`, `design_get`, `design_list`, `design_facets`,
  `design_markdown` — across both sources, with no network calls. The
  upstream package stays unmodified with its seven `refero_*` tools.
- **Generic naming.** The cache dir is `DESIGN_CACHE_DIR` (default
  `~/.design-cache`); `REFERO_CACHE_DIR` is still honoured. Routes are
  `/api/designs` and `/design/:id`, with `/api/styles` and `/style/:id`
  kept as aliases. `catalog.json` carries both `styles` and `designs` keys
  pointing at the same array.
- OpenDesign entries render their original hand-written DESIGN.md (~22 KB)
  rather than a synthesised one; Refero entries keep the upstream renderer,
  so their output stays byte-identical.

## v1.0.4 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.4`
- The gallery now waits for `catalog.json` instead of dying at startup.
  Previously, starting the gallery while a fetch was still running produced
  an endless restart loop until the fetch finished. The preview server polls
  for up to `REFERO_CATALOG_WAIT_MS` (default 5 minutes), logs why it is
  waiting, and starts serving as soon as the catalog lands — no restart.

## v1.0.3 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.3`
- The missing-cache error message no longer hardcodes a version string — the
  reference baked into v1.0.2 pointed at `v1.0.1` and would go stale on every
  release. It now says `<this-image>`.

## v1.0.2 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.2`
- Fixed the compose file so a fresh clone works with no local build:
  - `image:` now points at the published tag, so `docker compose pull`
    succeeds (it referenced a local-only tag and failed with "pull access
    denied").
  - Removed the hardcoded `container_name`, so two checkouts no longer
    collide.
  - The host port is now `${GALLERY_PORT:-8787}`, so a second instance can
    run alongside the first.
- Added a `fetch` compose service. The image ships the fetcher, so
  `docker compose run --rm fetch` populates the cache with no repo checkout
  and no host-side node.
- Verified end to end from a clean clone against the published image:
  fetch (1,342 styles, 0 failures) → serve → query over MCP.

## v1.0.1 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.1`
- Security: overrode `zod` to `^4.6.6`, clearing GHSA-mrhx-c7xc-m3w5
  (high — memory exhaustion while validating oversized constrained
  collections). zod is a transitive dependency of the upstream MCP SDK, which
  accepts `^3.25 || ^4.0`, so the bump applies without patching upstream.
- Verified: `npm audit` 0 vulnerabilities, selftest 17/17, all 7 MCP tools
  respond, zod validation still rejects bad arguments, server stays up after a
  rejected call.

## v1.0.0 — 2026-11-10

- Image: `ghcr.io/whit3rabbit/designer-mcp:v1.0.0`
- First published release. Multi-arch (`linux/amd64`, `linux/arm64`).
- MCP server with 7 tools over a 1,342-style local cache.
- HTTP preview gallery with live thumbnails, colour swatches, and type scales.
- Agent skill (`skills/designer-mcp`) bundled in the image and served at
  `/skill`. Passes the `rabbit-skills-audit` linter: 0 errors, 0 warnings.
