# Designer MCP Tools Reference

The tools this skill uses. They are exposed with a `refero_` prefix — use the
exact names your client shows, and check for a `designer`/`refero-styles`
server prefix if your client namespaces them.

## Contents

- [What you have vs. the official Refero MCP](#what-you-have-vs-the-official-refero-mcp)
- [Styles](#styles)
  - [`refero_search`](#refero-search)
  - [`refero_get`](#refero-get)
  - [`refero_design_md`](#refero-design-md)
  - [`refero_list`](#refero-list)
  - [`refero_facets`](#refero-facets)
  - [`refero_similar` — needs the live API](#refero-similar-needs-the-live-api)
  - [`refero_refresh` — needs the live API](#refero-refresh-needs-the-live-api)
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

## Gallery API (optional, for visual inspection)

When the preview container is running (`docker compose up -d`), the same data
is available over HTTP — useful for pulling actual screenshots and swatches
into a visual workflow.

```
GET /                            gallery UI — thumbnail grid
GET /style/:id                   detail page — live screenshot, color tokens, type scale
GET /api/styles?q=&theme=&industry=&limit=&offset=
GET /api/styles/:id              full style JSON
GET /api/styles/:id/design.md    rendered DESIGN.md
GET /api/facets                  theme/industry/font distributions
GET /thumb/:id                   302 → the site's screenshot on the CDN
```

Thumbnails redirect to `images.refero.design`, whose robots.txt permits generic
agents (only `GPTBot` is disallowed).

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
