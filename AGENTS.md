# AGENTS.md: rules for agents working in this repo

One Node image, three surfaces over one on-disk cache:

- **Gallery** (`scripts/preview.mjs`), the HTTP server on `:8787` where a human
  browses and picks assets (design systems, components, gradients/presets).
- **Generic MCP** (`scripts/mcp-server.mjs`): stdio JSON-RPC, `design_*` tools
  across every source. The recommended integration path.
- **Upstream MCP** (`scripts/mcp-entry.mjs`): stdio, `refero_*` tools from the
  vendored `fidgetcoding-refero-mcp` package.

## Rule 1: the image runs fully offline

This is the core invariant. Every change is measured against it.

- The runtime surfaces (`scripts/preview.mjs`, `scripts/mcp-server.mjs`,
  `scripts/mcp-entry.mjs`) make **zero outbound network requests**. Every byte
  they serve comes from the cache directory (`/cache` in the image).
- All assets are **baked into the image**: catalog, thumbnails, components,
  presets and the skill zip (`COPY bake/ /cache/`, `COPY skills/ ./skills/`).
  A plain `docker run` with no volume and no network serves the complete
  catalog. Verify exactly that way:

  ```bash
  docker run --rm --network none -p 127.0.0.1:8787:8787 \
    ghcr.io/whit3rabbit/designer-mcp:latest
  curl http://127.0.0.1:8787/healthz
  ```

- Network access is allowed **only** in the fetchers (`scripts/fetch-*.mjs`,
  `scripts/refero-public-fetch.js`, `scripts/compress-thumbs.mjs`) and at
  image build time. A runtime feature that wants the network must degrade
  gracefully to cached data and say so in its response.
- Never introduce remote URLs into gallery HTML: no CDN fonts, scripts,
  images, or analytics. Thumbnails, styles and references all resolve locally.

## Rule 2: the gallery is the pick-and-choose webserver

`scripts/preview.mjs` is the only webserver. A user picks assets from it at
these routes, all served from the local cache:

| Route | What a user picks from |
|---|---|
| `/` and `/design/:id` | 1,494 design systems: screenshot, tokens, type scale, DESIGN.md |
| `/components` and `/component/:slug` | 109 AI components with full TSX source |
| `/presets` and `/presets/:kind` | gradients, patterns, glass effects with real CSS |
| `/templates` and `/template/:slug` | 6 vendored design-system templates: tokens, theme knobs, manifest, files |
| `/api/designs`, `/api/search?q=`, `/api/facets` | JSON for programmatic picking |
| `/thumb/:id` | local WebP thumbnail bytes (jpg/png also accepted) |
| `/skill` | the skill zip for offline download |

- New pages/routes must be answerable from the cache alone (Rule 1).
- Keep the DESIGN.md output byte-identical to what `refero_design_md` returns;
  both must call the upstream package's own `renderDesignMd`.

## Rule 3: MCP and skill integration

- Both MCP servers read the same cache and speak stdio JSON-RPC; neither
  listens on a port. Register with an agent via a `docker run -i` command.
- Prefer the `design_*` server for new work: it covers both sources plus the
  component and preset layers and works fully offline. Two upstream tools
  (`refero_similar`, `refero_refresh`) need network and are the documented
  exceptions.
- The upstream package is vendored **unmodified**. Never patch
  `node_modules/fidgetcoding-refero-mcp`; adapt in `scripts/` so upstream
  updates drop in cleanly.
- The skill (`skills/designer-mcp/`) ships inside the image, is zipped at
  build time (`scripts/package-skill.mjs`) and served at `/skill`. Keep its
  tool names in sync with the actual servers (`design_*` / `refero_*`) and its
  scope honest: there is no screens/flows layer, so route those questions to
  the craft references and never invent precedent.
- The skill bundles six sub-skills (`docx/`, `pptx/`, `xlsx/`, `pdf/`,
  `pdf-reading/`, `frontend-design/`) with dependency manifests
  (`requirements.txt`, `package.json`) and a per-directory Apache-2.0
  `LICENSE.txt` copied verbatim from upstream (`anthropics/skills`). The image
  serves these files but does not install their dependencies: the consuming
  agent runs the scripts and installs what its task needs (check-then-install).
- Anything under `skills/` is COPY'd into the image. Treat it as
  distributable: no secrets, no scratch material. Scratch goes in
  `skills/tmp/`, which is dockerignored.

## Rule 4: data-source compliance

- Fetchers read only the **public** style pages that robots.txt permits for
  generic agents. `/api/` is never requested. Preserve this in any new
  fetcher; the rationale lives in `docs/DATA-SOURCE.md`.
- Design data belongs to Refero and the depicted sites; this project caches
  publicly available pages locally and does not redistribute them.

## Cache and build workflow

| Path | Role |
|---|---|
| `cache/` | working cache: gitignored, mounted read-only at runtime, **overrides** the baked catalog |
| `bake/` | build output copied into the image: gitignored but kept in the Docker build context |
| `data/design-systems/` | vendored source of the 6 design-system templates; `npm run bake` copies it into `bake/design-systems/`, `npm run templates` stages it into a live cache |
| `dist/` | built skill zip |

- Changing cache format or fetchers: run `npm run bake`, then `npm test`
  (self-test across cache, renderer, preview and MCP). Keep it green.
- Local dev against a live cache: run `npm run templates` once to stage the
  design-system layer (additive, idempotent).
- The cache TTL is deliberately huge (`REFERO_CACHE_TTL_MS=315360000000`):
  refresh by re-running fetchers, never by letting the package hit the live
  API on expiry.
- Search without `OPENAI_API_KEY` falls back to a keyword scorer: expected,
  not a bug.
