# Changelog

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
