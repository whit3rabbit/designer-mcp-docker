# Designer MCP Tools Reference

The tools this skill uses. They are exposed with a `refero_` prefix — use the
exact names your client shows, and check for a `designer`/`refero-styles`
server prefix if your client namespaces them.

## Contents

- [What you have vs. the official Refero MCP](#what-you-have-vs-the-official-refero-mcp)
- [Two servers, two tool sets](#two-servers-two-tool-sets)
- [Styles](#styles)
  - [`refero_search`](#refero-search)
  - [`refero_get`](#refero-get)
  - [`refero_design_md`](#refero-design-md)
  - [`refero_list`](#refero-list)
  - [`refero_facets`](#refero-facets)
  - [`refero_similar` — needs the live API](#refero-similar-needs-the-live-api)
  - [`refero_refresh` — needs the live API](#refero-refresh-needs-the-live-api)
- [Generic tools — `design_*`](#generic-tools--design_)
  - [`design_search`](#design_search)
  - [`design_get`](#design_get)
  - [`design_list`](#design_list)
  - [`design_facets`](#design_facets)
  - [`design_markdown`](#design_markdown)
  - [`design_component_search`](#design_component_search)
  - [`design_component_get`](#design_component_get)
  - [`design_component_code`](#design_component_code)
  - [`design_preset_search`](#design_preset_search)
  - [`design_preset_get`](#design_preset_get)
- [Gallery API (optional, for visual inspection)](#gallery-api-optional-for-visual-inspection)
- [Common Mistakes](#common-mistakes)
- [If Results Are Weak](#if-results-are-weak)


This is the **local, free** Refero stack: 1,342 cached style references served
from a container. There is no paid account and no live API behind it.

## What you have vs. the official Refero MCP

The official Refero MCP (`https://api.refero.design/mcp`, OAuth + paid plan)
exposes **three** research layers:

| Layer | Official tools | Available here |
|---|---|---|
| Styles | `refero_search_styles`, `refero_get_style` | **yes** — `refero_search`, `refero_get` |
| Screens | `refero_search_screens`, `refero_get_screen`, `refero_get_similar_screens`, `refero_get_screen_image` | **no** — requires the paid API |
| Flows | `refero_search_flows`, `refero_get_flow` | **no** — requires the paid API |

So: **styles are fully covered**; screens and flows are not. Adjust the
research workflow accordingly — for screen-level and journey-level questions,
fall back to the bundled craft references and the user's own material, and say
so plainly rather than inventing precedent.

If the user has a paid Refero account, the official MCP can be registered
alongside this one and both layers become available.

---

## Two servers, two tool sets

The container ships two stdio MCP servers. Use whichever your client exposes.

| Server | Tools | Scope |
|---|---|---|
| `scripts/mcp-entry.mjs` | `refero_*` (7) | Refero styles only; `refero_similar` and `refero_refresh` need the live API |
| `scripts/mcp-server.mjs` | `design_*` (10) | **All sources**, fully offline |

The `design_*` server also serves **152 OpenDesign design systems**
(`source: "opendesign"`) alongside the Refero styles — Linear, Stripe,
Vercel, Notion, GitHub, Anthropic, and ~146 more, each with a hand-written
DESIGN.md and a full typed token set. Prefer it when it is available: it
searches more, and every tool works offline.

It also serves the **AI component library** (109 components, 250 variants)
and the **preset catalogs** (139 gradients/patterns, 20 liquid-glass
effects) — see [`design_component_search`](#design_component_search) and
[`design_preset_search`](#design_preset_search).

Both tool sets can be registered at once. When a `design_*` tool is present,
use it; fall back to `refero_*` otherwise.

---

## Styles

### `refero_search`

Natural-language search over the cached catalog of 1,342 real design styles.

Use first for any task with visual direction, brand feel, typography, color,
layout, spacing, elevation, components, imagery, art direction,
design-system inspiration, or visual polish.

Each result carries:

- style UUID (`id`)
- site name (`siteName`) and source URL (`url`)
- north star / visual thesis (`northStar`)
- theme (`theme`) — `light`, `dark`, or `mixed`
- industry (`industry`)
- font families (`fonts`)
- color list (`colors`) with hex, name, role, and group
- score and scorer type

Parameters:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `query` | string | Yes | Semantic/keyword query for aesthetic, domain, audience, category, or brand direction. |
| `limit` | number | No | Number of results. |

Good queries:

```text
editorial monochrome SaaS landing page
warm trustworthy healthcare product marketing
premium fintech website with restrained typography
developer tool website with product screenshots
luxury ecommerce editorial product page
productivity SaaS with airy spacing
data infrastructure website dark technical style
Attio editorial SaaS typography
Linear changelog dark developer tool
```

Search method:

- Search 3-5 different visual angles.
- Include one broad aesthetic query.
- Include one domain/category query.
- Include one known-brand or strong-product query when relevant.
- Do not stop at the first good result.

**Scorer matters.** With `OPENAI_API_KEY` set, the server uses semantic
embeddings. Without it, it falls back to a BM25-lite keyword scorer, which
still returns relevant styles but ranks vibe queries worse. If results feel
off, rephrase toward concrete words that appear in the style data
(`siteName`, `northStar`, `fonts`, `industry`).

### `refero_get`

Retrieve the full design system for one style.

Use after `refero_search` to turn promising previews into actionable design
material. Accepts a UUID, a site name, or a URL.

What results contain:

- north star / visual thesis
- colors with hex, name, role, and group
- font families
- type scale (role, size, line height, letter spacing)
- spacing scale, radius, surfaces, elevation, layout, imagery guidance
- component treatments
- do/don't rules
- industry and theme

Parameters:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `identifier` | string | Yes | Style UUID, site name (`linear.app`), or source URL. |

How to use returned styles:

- Treat each style as a reference ingredient, not a template.
- Pick one primary foundation for mood and density.
- Borrow 1-2 specific details from other styles.
- Extract layout, component, spacing, and elevation rules, not only colors and fonts.
- Preserve source token/component roles instead of repurposing them.
- Preserve imagery/media roles. Use real/generated/stock assets when possible;
  use an intentional placeholder with art direction when the needed asset is
  unavailable.
- Translate everything to the user's product, audience, and constraints.

### `refero_design_md`

Render a style as a DESIGN.md — the same document the upstream package
produces for agents.

Use when you want the design system as a portable text artifact: to hand to an
implementer, to paste into a planning doc, or to review in full.

Parameters:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `identifier` | string | Yes | Style UUID, site name, or URL. |

Set `REFERO_MCP_VAULT_DIR` to have it written to disk; otherwise the markdown
comes back in-conversation.

The gallery's `/api/styles/:id/design.md` route returns **byte-identical**
output — both call the upstream package's own `renderDesignMd`.

### `refero_list`

Browse the catalog directly, with optional filters.

Parameters:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `theme` | string | No | `light`, `dark`, or `mixed`. |
| `tag` | string | No | Filter by tag. |
| `limit` | number | No | Page size. |
| `offset` | number | No | Pagination offset. |

**Caveat:** upstream's `ColorScheme` type declares only `light` and `dark`, so
a `theme` filter silently drops the 133 `mixed` styles. If a filter returns
fewer rows than `refero_facets` predicts for that theme, this is why.

### `refero_facets`

Discover what the catalog actually contains: ranked font statistics, color
groups, themes, industries.

Use it before promising a design direction — it tells you which fonts and
colors are actually available as precedent, rather than what you assume.

Parameters: none.

### `refero_similar` — needs the live API

Refero's own "similar styles" ranking for a given style. **Fails in this
deployment** because it calls the undocumented `styles.refero.design/api/styles`
endpoint, which is `Disallow`ed by robots.txt and answers HTTP 403.

For a similar-styles list offline, use `refero_search` with the primary
style's north star or a distinctive phrase from it.

### `refero_refresh` — needs the live API

Forces a full re-fetch from the upstream API. **Fails in this deployment**, for
the same reason.

To refresh, run the fetcher instead:

```bash
node scripts/refero-public-fetch.js --limit 0 --force
```

That reads only the **public** style pages and rewrites the cache. It never
requests `/api/`.

---

## Generic tools — `design_*`

Exposed by the generic server (`scripts/mcp-server.mjs`). These cover **both**
sources and make **no network calls**.

### `design_search`

Natural-language search across the whole catalog (1,342 Refero styles + 152
OpenDesign design systems).

| Argument | Type | Notes |
|---|---|---|
| `query` | string | **required** — e.g. "warm healthcare", "dark developer tools" |
| `theme` | `"light"` \| `"dark"` | optional filter |
| `source` | `"refero"` \| `"opendesign"` | optional filter |
| `limit` | number | default 10, max 50 |

Each result carries `id`, `source`, `siteName`, `url`, `northStar`, `theme`,
`industry`, `colors`, `fonts`, and a relevance `score`.

### `design_get`

Resolve an identifier to the full record. Accepts an id, a site name, a
hostname, or a URL — e.g. `"linear"`, `"linear.app"`, `"linear-app"`.

| Argument | Type | Notes |
|---|---|---|
| `identifier` | string | **required** |
| `source` | string | optional — restrict the lookup to one source |

### `design_list`

Browse with filters: `theme`, `source`, `industry`, `limit` (default 25,
max 200), `offset`.

### `design_facets`

Distributions across the catalog: `total`, plus breakdowns by `themes`,
`sources`, `industries`, and `fonts`. Call this before promising a direction,
so you know what is actually present.

### `design_markdown`

The DESIGN.md for one design — the canonical agent-readable brief. Accepts
the same identifiers as `design_get`.

For Refero entries it is rendered from the cached record (~3.8 KB). For
OpenDesign entries it is the **original hand-written document** (~22 KB) with
the full rationale, so it is worth reading in full.

### `design_component_search`

Search the **AI component library** — 109 real React components, 250
variants, each with complete, typed TSX source. These are shadcn-style
registry exports, so the code is real and complete (not a screenshot or a
description of one).

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional — matches name, description, category and variant names |
| `category` | string | optional — `chat`, `voice`, `agent setup`, `agent activity`, `output & artifacts`, `usage & limits`, `media generation`, `writing` |
| `limit` | number | default 20, max 100 |

Returns the matching components with their variant ids, display names and
filenames, plus the full list of categories.

### `design_component_get`

One component in full: description, install command, FAQ, and every variant's
source code and dependencies.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | **required** — e.g. `prompt-input` |

### `design_component_code`

The source code for one variant — the tool to reach for when you need to
copy an implementation into a project.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | **required** |
| `variant` | string | optional — variant id, short id or display name. Defaults to the first variant |
| `includeCode` | boolean | optional — default `true`; set `false` for metadata only |

The `code` field is the raw TSX: `"use client"`, typed props, `motion/react`
and `lucide-react` imports. The `dependencies` field lists the npm packages
it needs.

### `design_preset_search`

Search the **preset catalogs** — 139 background gradients and patterns, 20
liquid-glass effects, plus Tailwind colour scales. Each preset carries real
CSS and a React template.

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional — matches name, id, category, description |
| `kind` | string | optional — `patterns`, `liquid-glass` |
| `limit` | number | default 20, max 100 |

### `design_preset_get`

One preset catalog in full. Each preset has `id`, `name`, `category`,
`textColor`, a `style` object of real CSS, and a `code` React template.

| Argument | Type | Notes |
|---|---|---|
| `kind` | string | **required** — e.g. `patterns` |

---

## Gallery API (optional, for visual inspection)

When the preview container is running (`docker compose up -d`), the same data
is available over HTTP — useful for pulling actual screenshots and swatches
into a visual workflow.

The gallery has three tabs in its top bar: **Designs**, **Components**, and
**Gradients & Patterns**.

```
GET /                            design systems gallery — thumbnail grid
GET /design/:id                  detail page — screenshot, color tokens, type scale
GET /api/designs?limit=          every design in the catalog
GET /api/facets                  theme/industry/font distributions
GET /thumb/:id                   local thumbnail bytes (no redirect)

GET /components                  component library — 109 components, 250 variants
GET /component/:slug             one component: variants, source, FAQ
GET /api/components?q=&category= component search
GET /api/component/:slug         one component as JSON

GET /presets                     preset catalogs — gradients, patterns, glass
GET /presets/:kind               one catalog in full
GET /api/presets                 preset catalog index
GET /api/presets/:kind           one catalog as JSON
```

Thumbnails are served from the LOCAL cache, so the gallery needs no network
at all.

---

## Common Mistakes

- Do not use the official tool names (`refero_search_styles`, `refero_get_style`)
  against this server — they do not exist here. Use `refero_search` / `refero_get`.
- Do not expect screens or flows. This deployment is styles-only.
- Do not call `refero_refresh` and interpret its failure as a broken install —
  it needs the paid API by design.
- Do not assume a `theme` filter returns every style of that theme; `mixed` is
  dropped by upstream's own filter.
- Do not copy a single style directly.

## If Results Are Weak

- Broaden the query.
- Remove extra adjectives or constraints.
- Search adjacent categories.
- Try a known-product or best-brand query.
- Check `refero_facets` for the vocabulary actually present in the catalog.
- For screen-level or journey-level questions, this deployment cannot help —
  say so, and use the bundled craft references instead.