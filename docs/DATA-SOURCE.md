# Data Source & Permissions

Why this project reads public pages instead of the Refero API, and what that
decision does and does not cover.

## The surfaces, classified

| Path | robots.txt | HTTP | Verdict |
|---|---|---|---|
| `styles.refero.design/api/styles` | `Disallow: /api/` | 403 | **Never requested** |
| `styles.refero.design/style/<uuid>` | allowed for generic agents | 200 | **Read** |
| `styles.refero.design/sitemaps/styles.xml` | allowed | 200 | **Read** |
| `styles.refero.design/sitemaps/collections.xml` | allowed | 200 | **Read** |
| `styles.refero.design/<collection>` | allowed | 200 | **Read** |
| `refero.design/<page>` | allowed for generic agents (only `GPTBot` disallowed) | 200 | **Read** (SPA shell only, no data embedded) |
| `api.refero.design/v1/styles` | allowed (robots.txt is empty) | 200 | **Read** (Refero Styles layer) |
| `api.refero.design/v1/search/styles` | allowed | 200 | Not fetched (the layer bakes all records; search is local) |
| `images.refero.design/...` | allowed (only `GPTBot` disallowed) | 200 | **Read** (Refero Styles: mirrored, compressed previews) and **Linked** (classic-catalog thumbnails) |
| `api.refero.design/mcp` | — | OAuth + paid plan | Optional, separate server |

### The wall, not a bug

`styles.refero.design/api/styles` is an undocumented JSON endpoint that
robots.txt disallows and that answers **HTTP 403** to every client. The
upstream author of `fidgetcoding-refero-mcp` deliberately stopped supporting it
and says so in their README.

Refero's Terms of Use forbid "automated extraction outside documented
features". Routing around a 403 on a disallowed path would violate that. So
this project does not do it.

### The permitted path

The public style pages are the same pages a browser renders, and robots.txt
permits them for generic agents. The structured data is embedded in the served
HTML (Next.js RSC flight stream) — no special access required. Each public page
also ships a **"Download DESIGN.md"** button, so the export is a first-class
product feature, not an extraction loophole.

### The Refero Styles layer

`refero.design/styles` is Refero's curated per-site design-system product:
788 profiles (Cursor, Linear, Notion, teenage engineering, …) with a written
intent, essentials, named color tokens with usage notes, surfaces,
component recipes with CSS and declared states, typography recipes, font
substitutes, dos and donts, and a Refero-authored DESIGN.md (~35 KB) the
public page lets anyone download.

The pages are a client-side React SPA. The structured data is not embedded in
the HTML. It is served by the same public, unauthenticated REST API the page
itself calls, with `Access-Control-Allow-Origin: *`:

- `GET /v1/styles?page=N` lists the catalog, 24 records per page.
- `GET /v1/styles/<uuid>` returns one full record.
- `GET /v1/search/styles?query=` powers the site's filter chips. This fetcher
  bakes all records and searches locally, so it is not requested.

The compliance case, and how it differs from the blocked endpoint:

- **robots.txt permits it.** `refero.design/robots.txt` allows every agent
  except GPTBot, `api.refero.design/robots.txt` is empty (allow-all), and
  `images.refero.design` allows generic agents. The fetcher reads all three
  robots.txt files first and aborts loudly if the paths become disallowed.
- **It is the public backing API of a public page.** No account, no paywall,
  no auth of any kind, CORS-open, and the pages carry `index, follow`, so
  search engines index the same data through the same endpoints.
- **The DESIGN.md download is a first-class export feature.** Every public
  style page offers it. Consuming the export is not extraction.
- **It is throttled and honest.** 400 ms between record fetches, an
  identifying User-Agent, incremental refetches, provenance with per-file
  checksums, and attribution baked as NOTICE.md. Data is cached locally and
  not redistributed, per the Licensing section below.

The paid MCP server (`api.refero.design/mcp`, OAuth) is the sanctioned
automated path and covers much more (screens, flows). This layer takes the
public read of the styles dataset only. The blocked endpoint
(`styles.refero.design/api/styles`, robots-disallowed, 403) is a different
surface and stays never-requested.

## What is read, and how much

- **1,342 styles**, each from one public page.
- **788 Refero Styles**, from the public `/v1/styles` API that backs
  refero.design/styles (see "The Refero Styles layer" below).
- **52 collection pages**, used only to cross-check completeness.
- **2 sitemap XML files**, for the canonical id list.
- **198 OpenDesign design systems**, from two public git repositories under
  permissive licences — see the table below.
- **73 HeroUI components and 16 guides**, from pinned npm registry tarballs
  and the matching GitHub tag — first-party Apache-2.0/MIT packages, no
  scraping involved (see below).
- **123 Mantine UI components**, from a clone of the MIT-licensed
  `mantinedev/ui.mantine.dev` repository, and **68 daisyUI components**,
  from the pinned `daisyui` npm tarball and `saadeghi/daisyui` GitHub tag
  (MIT). No pages are scraped for either.
- **79 Base UI doc pages** (37 components, 42 guides), from the first-party
  `base-ui.com/llms.txt` index and the markdown pages it links (see below).

Completeness was verified by comparing the sitemap against every id found on
all 52 collection pages: **0 style ids appear in collections that are missing
from the sitemap.** The sitemap is the complete universe.

## The non-Refero sources

The other sources are public git repositories and package registries, not
scraped pages. The robots.txt reasoning above applies only to Refero: a git
repository has no robots.txt, and its licence is the permission.

| Repository | Licence | What is taken |
|---|---|---|
| `nexu-io/open-design` | Apache-2.0 | 152 design-system packages (`design-systems/` subtree, sparse-cloned — 38 MB, not the 3.6 GB of git history) |
| `feimacode/open-design-agent-kit` | MIT | 46 systems that do not exist upstream, the correction overlay for the 152, the Claude Design packages, and the rendered gallery artifacts |
| `Meliwat/awesome-ios-design-md` | MIT | the 30 iOS systems the kit adapts |
| `bergside/awesome-design-skills` | MIT | the 16 aesthetic systems the kit re-authors |

The kit re-packages the Apache-2.0 OpenDesign content, so the attribution in
the first row covers those systems as well. Its copies of them are stripped
(no `design-tokens.json`, no `USAGE.md`), so this project keeps the upstream
originals and takes only the kit's *corrections*.

The gallery artifacts are published by the kit as static files on a public
host and are fetched once into the cache. They are read, not scraped: a fixed
set of known paths, no page traversal, no rate-limit circumvention.

The HeroUI layer is in the same category: first-party open source, not
Refero data, so the robots.txt reasoning above does not apply to it. The
fetcher (`npm run heroui`) downloads the pinned `@heroui/react` and
`@heroui/styles` tarballs from registry.npmjs.org and the matching
`heroui-inc/heroui` GitHub tag (Apache-2.0/MIT), verifies their published
digests, and bakes the docs, per-component CSS, theme variables, TSX source,
and migration guides they ship. Nothing is scraped from heroui.com.

Full attribution is in `agents-license.txt` at the repository root.

### HeroUI

The HeroUI layer takes no pages at all: it reads the official package
distributions and the source repository at a pinned tag, all first-party
releases of the Apache-2.0 monorepo. The npm registry tarballs carry their
registry `dist.integrity` sha512, which the fetcher verifies, and every baked
file's sha256 lands in `heroui/provenance.json`.

| Source | Licence | What is taken |
|---|---|---|
| npm `@heroui/react` (pinned in `data/heroui/pin.json`) | Apache-2.0 | the agent-facing docs tree the package ships (`docs/`: 73 component pages, 16 guides, `llms.txt`) |
| npm `@heroui/styles` | Apache-2.0 | per-component CSS, the oklch theme variables, and the prebuilt `heroui.min.css` |
| GitHub `heroui-inc/heroui` at the pinned tag | Apache-2.0 | component TSX source (`packages/react/src`) and the v2-to-v3 migration guides (`apps/docs/content/docs/en/react/migration`) |

The pinned HeroUI skills bundled under `plugins/designer-mcp/skills/designer-ui/heroui/`
are likewise Apache-2.0, each shipping the upstream `LICENSE.txt` verbatim.

### Base UI

Base UI is the one non-Refero layer that reads web pages rather than a
package or a repository, so the same care applies as for Refero. The fetcher
(`npm run baseui`) reads `https://base-ui.com/robots.txt` first and stops if
the doc paths are disallowed. It then reads `https://base-ui.com/llms.txt`,
the index the project publishes for agents, and the plain markdown pages
that index links under `/react/`, one at a time with a delay. `/api/` is
never requested. Nothing outside the llms.txt index is crawled.

| Source | Licence | What is taken |
|---|---|---|
| `base-ui.com/llms.txt` and the `/react/**.md` pages it lists | MIT (`mui/base-ui`) | the agent-facing docs: 37 component pages, the handbook, the utilities, and the overview and release notes |
| GitHub `mui/base-ui` at the ref pinned in `data/baseui/pin.json` | MIT | the licence text, checksummed into `baseui/provenance.json` |

A page that fails to fetch is recorded as a gap in `baseui/provenance.json`
and the previous bake is left in place.

## What is not requested

- The blocked API, ever: `styles.refero.design/api/styles`, which robots.txt
  disallows and which answers 403 to every client. The Refero Styles layer's
  public read of `api.refero.design/v1/*` is classified separately above and
  is fetched only while robots.txt keeps permitting it.
- Any named-bot-disallowed path. `styles.refero.design` disallows
  `ClaudeBot`, `GPTBot`, `anthropic-ai`, and others entirely — this project
  identifies as a generic agent and stays on permitted paths.
- Any authenticated endpoint.
- Video preview mp4s: the mirrored keyframes cover the previews.

## Throttling

The fetcher defaults to 4 concurrent workers with a 400ms delay, and skips
styles already cached. A full cold fetch of 1,342 styles takes ~2.5 minutes.
`REFERO_FETCH_CONC` and `REFERO_FETCH_DELAY_MS` tune it.

## Thumbnails

The classic catalog's screenshots are **linked, not downloaded**: the gallery
issues a 302 to `images.refero.design`, whose robots.txt permits generic
agents. Nothing is mirrored, and the images stay on Refero's CDN.

The Refero Styles layer is the exception: its screenshot keyframes, type
preview SVGs and favicons are mirrored into the local cache and the keyframes
are compressed to WebP, because the layer's pages must render with zero
network (Rule 1) and no page shell exists to link against.

## The upstream package

`fidgetcoding-refero-mcp` is vendored **unmodified** and MIT-licensed. This
project writes the cache format it already reads
(`catalog.json`, `styles/<uuid>.json`), so upstream updates drop in without
patching. That is deliberate: the package's own README explains why it stopped
supporting the blocked endpoint, and the fix belongs in the data source, not
in a fork of the consumer.

## Licensing

- This project: MIT.
- `fidgetcoding-refero-mcp`: MIT.
- The craft references in `plugins/designer-mcp/skills/design-system/references/`
  are adapted from
  Refero's MIT-licensed [`refero_skill`](https://github.com/referodesign/refero_skill)
  (Copyright (c) 2026 Refero).
- The design data belongs to Refero and to the sites depicted. This project
  reads publicly available pages and caches them locally for personal use; it
  does not redistribute them.

## If the rules change

Refero can change robots.txt or the ToS at any time. If `/style/<uuid>` starts
403ing or robots.txt starts disallowing it, the fetch fails loudly and the
project needs a new approach — most likely the paid plan with its sanctioned
export, which would add the screens and flows layers that the local cache
cannot provide.
