# Designer MCP Tools Reference

Use the exact tool names your client shows. The generic tools use the
`design_` prefix and the upstream tools use `refero_`. Some clients also
include the server name in the displayed tool name.

## Contents

- [What you have vs. the official Refero MCP](#what-you-have-vs-the-official-refero-mcp)
- [Two servers, two tool sets](#two-servers-two-tool-sets)
- [Styles](#styles)
  - [`refero_search`](#refero_search)
  - [`refero_get`](#refero_get)
  - [`refero_design_md`](#refero_design_md)
  - [`refero_list`](#refero_list)
  - [`refero_facets`](#refero_facets)
  - [`refero_similar` — needs the live API](#refero_similar--needs-the-live-api)
  - [`refero_refresh` — needs the live API](#refero_refresh--needs-the-live-api)
- [Generic tools — `design_*`](#generic-tools--design_)
  - [`design_search`](#design_search)
  - [`design_get`](#design_get)
  - [`design_package_file`](#design_package_file)
  - [`design_claude_package`](#design_claude_package)
  - [`design_list`](#design_list)
  - [`design_facets`](#design_facets)
  - [`design_markdown`](#design_markdown)
  - [`design_component_search`](#design_component_search)
  - [`design_component_get`](#design_component_get)
  - [`design_component_code`](#design_component_code)
  - [`design_preset_search`](#design_preset_search)
  - [`design_preset_get`](#design_preset_get)
  - [`design_markdown_parse`](#design_markdown_parse)
  - [`design_manifest_from`](#design_manifest_from)
  - [`design_markdown_render`](#design_markdown_render)
  - [`design_markdown_validate`](#design_markdown_validate)
- [Gallery API (optional, for visual inspection)](#gallery-api-optional-for-visual-inspection)
- [Common Mistakes](#common-mistakes)
- [If Results Are Weak](#if-results-are-weak)


This is the **local, free** Refero stack: 1,342 cached style references served
from a container (catalog counts are as of the current cache bake). There is
no paid account and no live API behind it.

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
The `scripts/` paths in the table are rooted at the image's repository root,
not this skill directory.

| Server | Tools | Scope |
|---|---|---|
| `scripts/mcp-entry.mjs` | `refero_*` (7) | Refero styles only; `refero_similar` and `refero_refresh` need the live API |
| `scripts/mcp-server.mjs` | `design_*` | **All sources**, fully offline |

The `design_*` server also serves **198 OpenDesign design systems**
(`source: "opendesign"`) alongside the Refero styles — Linear, Stripe,
Vercel, Notion, GitHub, Anthropic, and ~194 more, each with a hand-written
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

Natural-language search across the whole catalog (1,342 Refero styles + 198
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

Resolve an identifier to the full record. Accepts the exact
`designer:<source>:<id>` reference copied from the gallery, a cached id,
a site name, a hostname, or a URL.

| Argument | Type | Notes |
|---|---|---|
| `identifier` | string | **required** |
| `source` | string | optional — restrict the lookup to one source |

OpenDesign results also include `package.reference`, the original manifest
(or `null` for a legacy DESIGN.md-only package), and `package.files` with
cached paths, byte sizes, and encodings. `package.legacyCache` is true if
only core fields from a pre-upgrade cache are available.

Two more fields appear when the Agent Kit layer is cached:
`package.descriptor` carries the curated `moods`, `industries` and
`surfaces` — what the tokens cannot say — and `package.claudeFiles` lists
the Claude Design package files for that system.

### `design_package_file`

Read one OpenDesign package file offline, using a path from `design_get`:

```json
{ "identifier": "designer:opendesign:arc", "path": "tokens.css" }
```

The response includes `content` (UTF-8 text or base64), `encoding`, and
the original byte count. New imports preserve the original file bytes;
old caches reconstruct `manifest.json` and `design-tokens.json` from JSON.
To fill in the missing files, refresh the cache with
`npm run opendesign -- --slug arc` and rebuild if using the baked catalog.

### `design_claude_package`

Read one file from a system's **Claude Design** package — the same files
Claude's own Design System format uses (`README.md`, `tokens.json`,
`design-system.json`, `components/…`):

```json
{ "identifier": "designer:opendesign:arc", "path": "README.md" }
```

Get the available paths from `package.claudeFiles` in `design_get`. This is
how you hand a system to Claude: read the files, then write them into a
Claude Design System artifact. Refresh the layer with `npm run agentkit`
if the cache has none.

### `design_list`

Browse with filters: `theme`, `source`, `industry`, `limit` (default 25,
max 200), `offset`.

### `design_facets`

Distributions across the catalog: `total`, plus breakdowns by `themes`,
`sources`, `industries`, and `fonts`. Call this before promising a direction,
so you know what is actually present.

### `design_markdown`

The DESIGN.md for one design. Accepts the same identifiers as `design_get`.
An exact reference missing from the cache returns an error. The gallery's
**Open DESIGN.md** link provides the raw Markdown for the host to read.

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

### `design_template_list`

The six vendored design-system templates: complete, generic systems with a
token sheet, written rules, demo cards, and starter pages. Offline.

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional: matches slug, name, description, heading font |
| `limit` | number | default 20, max 50 |

Each template entry: `slug`, `name`, `description`, `ground`/`text`/`accent`
hex swatches, `headingFont`, `tokensCount`, `filesCount`, and
`starterTemplates` (a landing page and a deck for every system). Current
slugs: `modernist`, `classical`, `nocturne`, `organic`, `broadsheet`,
`industry`.

### `design_template_get`

One template in full: theme parameters (`theme`), every token
(`tokens[]` with `name`/`value`/`kind`), brand fonts, demo card registry,
the complete `files[]` listing, and `manifest` (the design-system manifest
(schema `design-system-manifest/v1`) filled from this system.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | **required**, e.g. `nocturne` |

### `design_template_file`

One text file from a template: the token sheet (`styles.css`), a starter
landing page, the written guide, a foundation or component card, the theme
seed. The path must be listed in the template's `files[]`. Binary assets are
refused.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | **required** |
| `path` | string | **required** (folder-relative, from `files[]`) |

Returns `{ slug, path, bytes, content }`.

### `design_manifest_template`

The design-system manifest JSON: the machine-readable contract for one
system, with sections mirroring a design-system editor.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | optional: omit for the blank template |

Sections (schema `design-system-manifest/v1`):

- `overview`: direction, principles, antiPatterns, usingTokens,
  usingComponents, accessibility
- `colors`: ground/text/accent, `roles` (bg, surface, text, accent, accent2,
  divider), `ramps` (neutral/accent/accent-2, steps 100-900), usage notes
- `typography`: heading/body roles with family tokens and weight, the fixed
  px `scale` (h1-h6, body), usage notes
- `spacing`: density multiplier plus the `--space-*` scale
- `radius` and `shadows`: the sm/md/lg tokens
- `components`: the class table (`class`, `what`, `demo`)
- `assets`: imageTreatment, iconSet, photo paths
- `tokens`: the full flat list `{ name, value, kind }`
- `files`, `starterTemplates`, `theme`: the source system's listing,
  starters, and generation knobs

Use the blank template when building a system from a style reference; use a
filled one when starting from a vendored system. Keep the manifest beside the
work and design against it.

### `design_markdown_parse`

Import a catalog design or a local DESIGN.md. Recognized formats are Refero,
OpenDesign, Google Stitch, and WebDesignHot. Other Markdown retains its prose
and any recognizable colors, fonts, and rules. The result includes `format`
and `parsed`, with `body`, `sections`, raw `tokenTree`, normalized `tokens`
(`path`, `kind`, `value`, `source`), and `diagnostics`. Stitch YAML can be
in frontmatter or interleaved fences. Explicit keys identify WebDesignHot,
including documents with `source_url`.

Use the same document arguments for parse, manifest seeding, and validation.

| Argument | Type | Notes |
|---|---|---|
| `identifier` | string | Exact `designer:<source>:<id>`, cached design id, site name, hostname, or URL |
| `content` | string | Pasted Markdown, up to 200,000 UTF-8 bytes |
| `source` | string | Optional `refero` or `opendesign` for an identifier |
| `tokens` | array | Optional companion rows with `name`, `value`, and optional `type` |
| `css` | string | Optional companion CSS text. Reads unconditional `:root` custom properties and resolves simple aliases |

Pass exactly one of `identifier` and `content`. Token precedence at the same
path is document, supplied rows, supplied CSS, then cached companion tokens.
Differing values are reported. Conditional CSS belongs in host browser
observations so the check can account for viewport, theme, and state.

### `design_manifest_from`

Seed `design-system-manifest/v1` from the same input. It carries rules,
swatches, typography, spacing, radii, shadows, and the available named
tokens. `provenance` records filled and open fields plus diagnostics. Review
open fields before relying on a partial manifest as an implementation contract.

### `design_markdown_render`

Generate a Google Stitch-style DESIGN.md from `name`, `tokens`, optional
`description`, and optional Markdown `body`. `tokens` is an object whose
groups can include `colors`, `typography`, `spacing`, `rounded`, and
`components`. Returns `designMd` and diagnostics. Use the original dialect
when editing a document whose format-specific fields need to be preserved.

### `design_markdown_validate`

Check parser and token-reference diagnostics. Optionally pass `observations`
as rows with a `location`, expected `token` path, and observed `value` (string,
number, or null). For web observations, include `rootFontSize` in CSS px to
compare rem values against pixels. The response reports `pass`, `fail`, or
`unverified` for each row. `conforms` is true when at least one check ran,
every observation matched, and the document produced zero parse errors. Supply
a nonempty `requiredTokens` array of distinct paths to require coverage of the
applied roles. The returned `coverage` includes totals and one entry per path.
`missing` means a defined token has zero observations. `unverified` includes
unknown paths, null values, and incomparable values. A mismatch at any sampled
location takes precedence for that path. With coverage enabled, `conforms`
also requires every required path to pass.

See the [DESIGN.md workflow](design-md-workflow.md) for capture, application,
and verification examples.

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
