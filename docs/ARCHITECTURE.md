# Architecture

Three sources over one cache directory, three surfaces over that cache.

```
        public pages (robots-allowed)      git clones (public repos)
                        │                              │
                        ▼                              ▼
       scripts/refero-public-fetch.js       scripts/fetch-opendesign.mjs
       scripts/fetch-gradientdeck.mjs       scripts/fetch-agentkit.mjs
       scripts/fetch-presets.mjs            scripts/fetch-thumbs.mjs
                        │                              │
                        └──────────────┬───────────────┘
                                       ▼
                  cache/  catalog.json + styles/ + systems/
                          + claude/ + gallery/ + descriptors.json
                          + components/ + presets/ + thumbs/
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
   scripts/mcp-entry.mjs      scripts/mcp-server.mjs     scripts/preview.mjs
   (stdio, refero_* × 7)      (stdio, design_* × 20)      (HTTP gallery)
              │                        │                        │
              ▼                        ▼                        ▼
          your agent                your agent              your browser
```

## 1. The fetchers

Only the fetchers touch the network. Everything downstream reads the cache.

| Fetcher | Source | Writes |
|---|---|---|
| `scripts/refero-public-fetch.js` | `styles.refero.design` public pages | `catalog.json`, `styles/<uuid>.json` |
| `scripts/fetch-opendesign.mjs` | `nexu-io/open-design` (sparse clone) | `systems/<slug>.json`, `styles/` |
| `scripts/fetch-agentkit.mjs` | `feimacode/open-design-agent-kit` (sparse clone) | `claude/<slug>.json`, `gallery/<slug>/`, `descriptors.json` |
| `scripts/fetch-gradientdeck.mjs` | GradientDeck's public shadcn registry | `components.json`, `components/` |
| `scripts/fetch-presets.mjs` | GradientDeck's public preset exports | `presets.json`, `presets/` |
| `scripts/fetch-thumbs.mjs` | screenshot hosts, cached locally | `thumbs/<id>.webp` |

### The Refero fetcher

`scripts/refero-public-fetch.js` — reads `sitemaps/styles.xml` for the
canonical id list, fetches each public style page, and decodes the Next.js
RSC flight stream (`self.__next_f.push([1,"..."])`), unescaping the JS string
bodies. It scans for balanced JSON objects and picks out the detail payload.

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

### The Agent Kit fetcher

`scripts/fetch-agentkit.mjs` — a third source that re-packages OpenDesign for
agents. It contributes three layers the other sources do not have:

- **46 systems that do not exist upstream** — 30 iOS systems adapted from
  `Meliwat/awesome-ios-design-md` and 16 aesthetic concepts re-authored from
  `bergside/awesome-design-skills`.
- **A correction layer** for the 152 systems already cached. The upstream
  packages contradict themselves — agentic's prose says "Playfair Display" and
  `#FF5701` while its CSS says "Inter" and `#60a5fa`. The kit's overlay tree
  resolves each conflict, keeping the value that renders. The corrected
  files are restored from the kit's pristine tree before the overlay is
  applied, so re-running the fetcher never stacks a second override.
- **A Claude Design package for every system** — `tokens.json`,
  `design-system.json`, `README.md` and a cover preview, in Claude's own
  file format.

The rendered gallery artifacts (`preview.html`, `claude/view.html`,
`claude/cover.html`, `thumbs/<slug>.webp`) are published by the kit as static
files and fetched once into the cache, so the server serves them offline and
never reaches the network.

## 2. The MCP servers

`scripts/mcp-entry.mjs` → the upstream package's `cli.js`, unmodified. It
serves all 7 `refero_*` tools. Two of them — `refero_refresh` and
`refero_similar` — call the blocked `/api/` endpoint and therefore fail here.
The other five work fully offline.

The wrapper exists to fail loudly when the cache is missing: an MCP server
that starts and serves an empty catalog looks like a working server with no
data. The error goes to **stderr**, because stdout is the MCP transport.

`scripts/mcp-server.mjs` is the generic server: 20 `design_*` tools across
every source, fully offline. It is the recommended integration path.

Both read the same cache. Neither listens on a port.

## 3. The gallery

`scripts/preview.mjs` — a dependency-free HTTP server.

It reuses the upstream package's own `renderDesignMd`, so the DESIGN.md it
serves is byte-identical to what `refero_design_md` returns. Same renderer,
same input, same output.

It serves three surfaces from the cache:

- the **index** — 1,540 design systems with tag chips and search,
- the **detail page** — tokens, type scale, do/don't, DESIGN.md, and for the
  design systems the Open Design and Claude Design views side by side,
- the **component and preset catalogs**.

The cached kit artifacts are served under a stricter CSP than the gallery's
own pages: they are static documents with no external references, so they get
`connect-src 'none'` and their own framing rules.

The skill is also served from the container at `/skill`, so a container-only
deployment can hand out the skill without the repo.

## 4. The skill

`skills/designer-mcp/` — research-first design methodology plus reference
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

The layers this project adds sit alongside it:

```
cache/systems/<slug>.json     the OpenDesign package payload
cache/claude/<slug>.json       the Claude Design package files
cache/gallery/<slug>/          the rendered previews and covers
cache/descriptors.json         the curated mood/industry/surface descriptors
cache/components.json          the AI component index
cache/presets.json             the preset catalog index
```

## TTL

`REFERO_CACHE_TTL_MS` is set long (10 years in the image) deliberately. With
a short TTL the package tries the live API on expiry, fails, and serves a
stale copy with a warning banner. Refresh by re-running the fetcher instead.

## Why one image, two entrypoints

The MCP servers speak stdio and must never write to stdout. The gallery is a
normal HTTP server that logs freely. Running them in one image but two
processes keeps the MCP transport clean and lets either run alone.

```bash
docker run ... designer-mcp:latest                              # gallery
docker run ... designer-mcp:latest node scripts/mcp-entry.mjs   # upstream MCP
docker run ... designer-mcp:latest node scripts/mcp-server.mjs   # generic MCP
```

## The catalog is baked, not mounted

Since v1.3.0 the catalog is baked into the image (`npm run bake` →
`scripts/bake-cache.mjs` → `COPY bake/ /cache/`). A bare `docker run` with no
volume and no network serves the complete catalog — that is the property the
image exists for, and the publish workflow verifies it with `--network none`.

A mounted `/cache` still overrides the baked catalog, so a deployment can
refresh without rebuilding.

## Self-test

`scripts/selftest.mjs` checks every surface: cache integrity, the renderer,
the gallery's routes, and both MCP servers' tools over stdio. It is what
caught the empty-fonts bug — the fetcher wrote 1,342 "valid" files that were
all missing a required field.

The Agent Kit checks are conditional: a cache that predates the kit has no
Claude Design packages, so those checks are skipped rather than failed.
