# Changelog

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
