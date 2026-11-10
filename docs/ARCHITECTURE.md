# Architecture

Four pieces over one cache directory.

```
                  public pages (robots-allowed)
                            │
                            ▼
            scripts/refero-public-fetch.js
              · decodes the Next.js RSC flight stream
              · writes the upstream cache format
                            │
                            ▼
        cache/  catalog.json + styles/<uuid>.json
            │                              │
            ▼                              ▼
   scripts/mcp-entry.mjs            scripts/preview.mjs
   (stdio MCP server)               (HTTP gallery)
   7 tools                          /, /style/:id, /api/*
            │                              │
            ▼                              ▼
        your agent                     your browser
```

## 1. The fetcher

`scripts/refero-public-fetch.js` — the only component that touches the
network.

- Reads `sitemaps/styles.xml` for the canonical id list.
- Fetches each public style page.
- Decodes the RSC flight stream (`self.__next_f.push([1,"..."])`), unescaping
  the JS string bodies.
- Scans for balanced JSON objects and picks out the detail payload.
- Writes `styles/<uuid>.json` and merges `catalog.json`.

Two transports, both producing byte-identical output:

- **Plain HTTP** — the default. Refero's CDN currently serves these pages to
  any client.
- **Camoufox** — the fallback, used when plain fetch is refused. It drives a
  real Firefox through the local Camoufox MCP server. Three details make it
  work:

  1. The pages are ~300KB, above Camoufox's 200KB response cap, and the
     flight payload starts at ~byte 128KB — so reading the rendered HTML
     truncates it. The fallback decodes the chunks *inside* the page.
  2. Camoufox caps each action result at ~30KB, and the payload is full of
     quotes and backslashes, so JSON encoding inflates it further. The
     fallback base64-encodes in-page and reads it back in 24KB slices.
  3. `evaluate` requires `CAMOUFOX_MCP_ALLOW_EVALUATE=1`. The fetcher sets it
     on its own private subprocess, not on your global camoufox config.

Set `REFERO_FETCH_NO_BROWSER=1` to disable the fallback entirely.

### The fonts trap

The upstream `DesignSystem` type declares `fonts?: string[]`, but the live
payload does not populate that key. Fonts live as objects in
`designSystem.typography[].family` and `raw.typography.fonts[].family`.

Falling back to `designSystem.fonts` yields **empty fonts for every style**,
silently, and then `refero_facets` reports zero fonts across the whole
catalog. The extractor reads `typography[].family` first.

Also: a style's own page carries ~20 list projections, but they are the
"similar styles" rail — **not** a projection of the page's own item. The
extractor must reconstruct the list fields from the detail payload.

## 2. The MCP server

`scripts/mcp-entry.mjs` → the upstream package's `cli.js`, unmodified.

The upstream package reads the cache and serves all 7 tools. Two of them —
`refero_refresh` and `refero_similar` — call the blocked `/api/` endpoint and
therefore fail here. The other five work fully offline.

The wrapper exists to fail loudly when the cache is missing: an MCP server
that starts and serves an empty catalog looks like a working server with no
data. The error goes to **stderr**, because stdout is the MCP transport.

## 3. The gallery

`scripts/preview.mjs` — a dependency-free HTTP server.

It reuses the upstream package's own `renderDesignMd`, so the DESIGN.md it
serves is byte-identical to what `refero_design_md` returns. Same renderer,
same input, same output.

Thumbnails are 302 redirects to `images.refero.design` — nothing is mirrored.

The skill is also served from the container at `/skill`, so a container-only
deployment can hand out the skill without the repo.

## 4. The skill

`skills/designer-mcp/` — research-first design methodology plus 11 reference
files, adapted from Refero's MIT-licensed `refero_skill`.

Two adaptations matter:

- **Tool names.** The upstream skill documents `refero_search_styles`,
  `refero_get_style`, `refero_search_screens`, `refero_get_screen`,
  `refero_search_flows`, `refero_get_flow`. This deployment has
  `refero_search` / `refero_get` and **no screens or flows layer**. The skill
  says so explicitly and routes screen/journey questions to the craft
  references rather than pretending to have precedent it does not have.
- **Honest provenance.** The skill documents which tools fail and why, so an
  agent does not interpret a `refero_refresh` failure as a broken install.

## Cache format

The upstream package's own format, so upgrades stay safe:

```
cache/catalog.json       { updatedAt: <ms epoch>, styles: [StyleListItem] }
cache/styles/<uuid>.json  { updatedAt: <ms epoch>, style: FullStyle }
cache/embeddings.json    { model, vectors }   (only with OPENAI_API_KEY)
```

`updatedAt` must be the real fetch time — the package's `isFresh()` compares
it against `REFERO_CACHE_TTL_MS`.

## TTL

`REFERO_CACHE_TTL_MS` is set long (24h) deliberately. With a short TTL the
package tries the live API on expiry, fails, and serves a stale copy with a
warning banner. Refresh by re-running the fetcher instead.

## Why one image, two entrypoints

The MCP server speaks stdio and must never write to stdout. The gallery is a
normal HTTP server that logs freely. Running them in one image but two
processes keeps the MCP transport clean and lets either run alone.

```bash
docker run ... designer-mcp:latest                              # gallery
docker run ... designer-mcp:latest node scripts/mcp-entry.mjs   # MCP
```

## Cache is mounted, not baked

117MB and it changes on every refresh. Baking it in would make the image stale
the moment a style is updated, and rebuilding would cost more than a volume
mount. The compose file mounts it read-only.

## Self-test

`scripts/selftest.mjs` checks all four surfaces: cache integrity, the
renderer, the gallery's routes, and the MCP server's tools over stdio. It is
what caught the empty-fonts bug — the fetcher wrote 1,342 "valid" files that
were all missing a required field.
