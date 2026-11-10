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
| `images.refero.design/...` | allowed (only `GPTBot` disallowed) | 200 | **Linked** (thumbnails) |
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

## What is read, and how much

- **1,342 styles**, each from one public page.
- **52 collection pages**, used only to cross-check completeness.
- **2 sitemap XML files**, for the canonical id list.

Completeness was verified by comparing the sitemap against every id found on
all 52 collection pages: **0 style ids appear in collections that are missing
from the sitemap.** The sitemap is the complete universe.

## What is not requested

- The live API, ever.
- Any named-bot-disallowed path. `styles.refero.design` disallows
  `ClaudeBot`, `GPTBot`, `anthropic-ai`, and others entirely — this project
  identifies as a generic agent and stays on permitted paths.
- Any authenticated endpoint.

## Throttling

The fetcher defaults to 4 concurrent workers with a 400ms delay, and skips
styles already cached. A full cold fetch of 1,342 styles takes ~2.5 minutes.
`REFERO_FETCH_CONC` and `REFERO_FETCH_DELAY_MS` tune it.

## Thumbnails

Screenshots are **linked, not downloaded**. The gallery issues a 302 to
`images.refero.design`, whose robots.txt permits generic agents. Nothing is
mirrored, and the images stay on Refero's CDN.

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
- The craft references in `skills/designer-mcp/references/` are adapted from
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
