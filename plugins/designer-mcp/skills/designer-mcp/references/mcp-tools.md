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
- [Reply sizes and paging](#reply-sizes-and-paging)
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
  - [`design_library_search`](#design_library_search)
  - [`design_library_get`](#design_library_get)
  - [`design_asset_list`](#design_asset_list)
  - [`design_asset_importmap`](#design_asset_importmap)
  - [`design_template_list`](#design_template_list)
  - [`design_template_get`](#design_template_get)
  - [`design_template_file`](#design_template_file)
  - [`design_manifest_template`](#design_manifest_template)
  - [`design_markdown_parse`](#design_markdown_parse)
  - [`design_manifest_from`](#design_manifest_from)
  - [`design_markdown_render`](#design_markdown_render)
  - [`design_markdown_validate`](#design_markdown_validate)
  - [`design_docs_search`](#design_docs_search)
  - [`design_docs_get`](#design_docs_get)
- [HeroUI v3 tools — `design_heroui_*`](#heroui-v3-tools--design_heroui_)
- [Mantine UI tools — `design_mantine_*`](#mantine-ui-tools--design_mantine_)
- [daisyUI 5 tools — `design_daisyui_*`](#daisyui-5-tools--design_daisyui_)
- [Base UI tools — `design_baseui_*`](#base-ui-tools--design_baseui_)
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

Register a server with any stdio MCP client, e.g.:

```bash
# Register the generic server (Hermes / any stdio MCP client)
hermes mcp add designer \
  --command docker \
  --args run --rm -i --network none \
         ghcr.io/whit3rabbit/designer-mcp:latest node scripts/mcp-server.mjs
```

Restart the gateway (or `/reload-mcp`) so the tools register. For a browser
gallery of the same data — thumbnails, swatches, type scales:

```bash
cd designer-mcp-docker && docker compose up -d   # http://127.0.0.1:8787
```

Copy-paste snippets for 24 agent harnesses, each with a Docker and a
local-checkout variant, live in [../install/README.md](../install/README.md).

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
| `theme` | string | No | `light` or `dark`. |
| `tags` | string[] | No | Keep styles whose name or north star mentions any of these terms. |
| `limit` | number | No | Number of results (default 10, max 50). |

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
| `save_to_project` | string | No | Vault project folder name. Writes the file there instead of only returning it. |

The markdown comes back in-conversation. To also write it to disk, set
`REFERO_MCP_VAULT_DIR` and pass `save_to_project`.

The gallery's `/api/styles/:id/design.md` route returns **byte-identical**
output — both call the upstream package's own `renderDesignMd`.

### `refero_list`

Browse the catalog directly, with optional filters.

Parameters:

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `theme` | string | No | `light` or `dark`. |
| `tags` | string[] | No | Filter by terms matched against site name and north star. |
| `page` | number | No | 1-indexed page number (default 1). |
| `limit` | number | No | Page size (default 20, max 50). |

**Caveat:** upstream's `theme` accepts only `light` and `dark`, so the 133
`mixed` styles cannot be selected by theme here. Use `design_list` with
`theme: "mixed"` for those.

### `refero_facets`

Discover what the catalog actually contains: ranked font statistics, color
groups, themes, industries.

Use it before promising a design direction — it tells you which fonts and
colors are actually available as precedent, rather than what you assume.

Parameters: `theme` (`light` or `dark`, optional) restricts the counts, and
`limit` (default 25, max 100) sets how many font and color values come back.

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

## Reply sizes and paging

Every reply lands in your context, so the server keeps replies small by
default and refuses any reply over 120,000 bytes with a message naming the
argument to change. It never truncates silently. One vocabulary covers every
tool:

| Argument | Meaning |
|---|---|
| `detail` | `"summary"` (default) or `"full"`. On `design_search`, `design_list`, `design_get`, `design_component_get`. |
| `limit` + `offset` | Page through rows (`design_list`, `design_preset_get`). |
| `maxBytes` + `offset` | Page through one long document, in UTF-8 bytes. |
| `ids` | Fetch named items (`design_preset_get`). |

**Long documents.** `design_docs_get`, `design_template_file`, the HeroUI and
Base UI `*_get_docs` and `*_get_guide` tools, and
`design_heroui_migration_guide` return `content` plus `totalBytes`. When a
document is longer than one page (default 40,000 bytes; 100,000 for template
files), the reply also carries `nextOffset`. Call again with
`offset: <nextOffset>` to continue, and repeat until a reply has no
`nextOffset`. Pages end on a line break and concatenate to the exact
document. No `nextOffset` means you have all of it.

Do not stop at the first page when the section you need is not in it: props
tables and "CSS Classes" sections sit near the end of long component docs.

**When the catalog is missing.** The server starts without one. `design_search`,
`design_get`, `design_list`, `design_facets`, `design_markdown`, and the
package tools then return an error that names the cache path and the command
to run. Relay that to the user instead of retrying: the component, preset,
template, and UI library tools still work. Once the cache is populated the
same call succeeds, with no restart.

**`remoteNote` and `warning`.** A reply with `remoteNote` was read from the
local cache because the configured remote host did not answer, so it may be
older than the hosted copy. A `warning` on search, list, or facets means the
catalog on disk has lost its OpenDesign half. Tell the user about either
before relying on the result.

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
| `theme` | `"light"` \| `"dark"` \| `"mixed"` | optional filter |
| `source` | `"refero"` \| `"opendesign"` | optional filter |
| `limit` | number | default 10, max 50 |
| `detail` | `"summary"` \| `"full"` | default `summary` |

Each result carries `id`, `source`, `siteName`, `url`, `northStar`, `theme`,
`industry`, `colors`, `fonts`, `thumbnailUrl`, and a relevance `score`.

A row is for choosing a design, so `colors` is a short palette: up to eight
swatches as `{ hex, name, group }`, accents before neutrals, with `colorCount`
when the design has more. Read the whole palette, with each swatch's role,
from `design_get`. `detail: "full"` puts the complete palette in every row,
about three times the size.

An unknown `theme`, `source`, or `detail` value is an error, not an empty
result.

### `design_get`

Resolve an identifier to the full record. Accepts the exact
`designer:<source>:<id>` reference copied from the gallery, a cached id,
a site name, a hostname, or a URL.

| Argument | Type | Notes |
|---|---|---|
| `identifier` | string | **required** |
| `source` | string | optional — restrict the lookup to one source |
| `detail` | `"summary"` \| `"full"` | default `summary` |

The record carries every color (hex, name, role, group), the fonts, and
`fullResult.designSystem`: type scale, spacing, surfaces, components, do and
don't rules. The default leaves out `fullResult.raw`, the extractor's token
dump, which restates the design system and is about half the record. `omitted`
lists what was left out; `detail: "full"` returns it.

**Guessed matches.** An exact id, hostname, or site name resolves silently. A
partial or misspelled site name still resolves, and the reply then starts with
`matchedBy` (`"substring"` or `"fuzzy"`), a `matchNote`, and `otherCandidates`
(id, site name, source) when more than one design matched. Check those before
building on the result. An identifier under three characters, or one that
matches nothing, is an error: run `design_search` instead.

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
max 100), `offset`, and `detail` (`summary` by default, `full` for complete
palettes). Rows have the same shape as `design_search` rows. `industry` is an
exact label from `design_facets`. Page with `offset`: the reply carries
`total`.

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
| `category` | string | optional — `chat`, `voice`, `agent setup`, `agent activity`, `output & artifacts`, `usage & limits`, `media generation`, `writing`, `CSS framework` (Slopstrap) |
| `limit` | number | default 20, max 100 |

Returns the matching components with their variant ids, display names and
filenames, plus the full list of categories.

### `design_component_get`

One component's record: description, install command, FAQ, and each variant's
`id`, `name`, `filename`, `dependencies`, and `codeBytes`. The source itself
comes from `design_component_code`, one variant at a time.

| Argument | Type | Notes |
|---|---|---|
| `slug` | string | **required** — e.g. `prompt-input` |
| `detail` | `"summary"` \| `"full"` | default `summary`. `full` inlines every variant's source and is refused for the largest components: use `design_component_code` |

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

Presets from one catalog. Each preset has `id`, `name`, `category`,
`textColor`, a `style` object of real CSS, and a `code` React template.

| Argument | Type | Notes |
|---|---|---|
| `kind` | string | **required** — e.g. `patterns` |
| `ids` | string[] | optional — up to 20 preset ids from `design_preset_search` |
| `limit` | number | default 20, max 100 |
| `offset` | number | default 0 |

The usual path is search, then `ids` for the presets you picked. Without
`ids` the tool pages through the catalog: `total` is the catalog size,
`returned` the page size, and `nextOffset` is present while more remain.
Unknown ids come back in `missing`.

### `design_library_search`

Search the **library catalog**, the vendored install manifests for the
common frontend stack: react, tailwind, shadcn, radix-ui, lucide, heroicons,
motion, and the google-fonts and fontsource sources. Categories: framework,
css, components, primitives, icons, animation, fonts.

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional: matches name, id, category, summary, keywords |
| `category` | string | optional: e.g. `components`, `fonts`, `icons` |
| `limit` | number | default 20, max 50 |

### `design_library_get`

One library entry in full. This answers "what files would I need to install
X": `install.cli` / `install.npm` / `install.cdn` plus ordered steps, and
`files[]` with complete setup-file contents (`components.json`, the `cn`
helper, the neutral theme CSS, font wiring). `requires` names the entries to
install first.

| Argument | Type | Notes |
|---|---|---|
| `id` | string | **required**, e.g. `shadcn`, `tailwind` |

Workflow and worked examples live in
[library-setup.md](library-setup.md).

### `design_asset_list`

Inventory the **built frontend assets** the gallery serves as a local CDN.
Returns the content-hash `version`, per-group `groups` counts (previews,
starter, tailwind, templates, thumbnails, fonts), the starter page and zip,
the vendored packages with licenses, and whether the import map is
published. Reads `DESIGN_FRONTEND_DIR` (`/app/frontend-cache` in the image),
not the style cache.

| Argument | Type | Notes |
|---|---|---|
| (none) | | |

### `design_asset_importmap`

The **offline module CDN map**: bare specifiers resolved to
content-addressed module URLs. Specifiers: `react`, `react-dom`,
`react-dom/client`, `react/jsx-runtime`, `motion`, `motion/react`, `gsap`,
`@gsap/react`, `lucide-react`, `@phosphor-icons/react`, `radix-ui`, `cn`,
`class-variance-authority`, and `shadcn/*`. Embed the returned map as
`<script type="importmap">` and those imports load from the running gallery
instead of a public CDN, with zero outbound network. Modules carry CORS `*`.

| Argument | Type | Notes |
|---|---|---|
| `origin` | string | optional: compose absolute URLs against it, e.g. `http://127.0.0.1:8787` |

Without `origin` the URLs stay origin-relative under `base` (composed
against `DESIGN_REMOTE_URL` when that is set). The same map is served at
`/assets/importmap.json` with URLs already absolute against the serving
origin.

### `design_template_list`

The seven vendored design-system templates: complete, generic systems with a
token sheet, written rules, demo cards, and starter pages. Offline.

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional: matches slug, name, description, heading font |
| `limit` | number | default 20, max 50 |

Each template entry: `slug`, `name`, `description`, `ground`/`text`/`accent`
hex swatches, `headingFont`, `tokensCount`, `filesCount`, and
`starterTemplates` (a landing page and a deck for every system). Current
slugs: `modernist`, `classical`, `nocturne`, `organic`, `broadsheet`,
`industry`, `loam` (slide-first: its deck starter is the layout contract for
generated decks).

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
| `offset`, `maxBytes` | integer | optional paging, see [Reply sizes and paging](#reply-sizes-and-paging) |

Returns `{ slug, path, bytes, content, totalBytes }`. Files are meant to be
copied verbatim, so a file comes back whole unless it is over 100,000 bytes
(only `templates/deck/deck-stage.js` today). That one adds `nextOffset`:
fetch every part and join them before writing the file.

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

See the [DESIGN.md workflow](../../design-system/references/design-md-workflow.md) for capture, application,
and verification examples.

### `design_docs_search`

`@ui-sdk/*` only — search offline `@ui-sdk/core`, `@ui-sdk/react`, and
`@ui-sdk/web` documentation and skill references by keyword or section. Not for
HeroUI, Mantine, daisyUI, or Base UI (use `design_{heroui,mantine,daisyui,baseui}_search`).

| Argument | Type | Notes |
|---|---|---|
| `query` | string | optional: keywords (e.g. `'select'`, `'dialog'`, `'webmcp'`); omit to list |
| `section` | string | optional: `core`, `react`, `web`, `references`, `skill` |
| `limit` | integer | default 20, max 100 |

### `design_docs_get`

Read one offline `@ui-sdk/*` documentation page or skill reference by `path`
from `design_docs_search` (e.g. `docs/react/components/select.md`).

| Argument | Type | Notes |
|---|---|---|
| `path` | string | **required** |
| `offset`, `maxBytes` | integer | optional paging, see [Reply sizes and paging](#reply-sizes-and-paging) |

Returns `{ path, bytes, content, totalBytes }`, plus `nextOffset` when the
page is not the end. Nearly half of these docs are longer than one page; the
`core.md` references are about ten.

---

## HeroUI v3 tools — `design_heroui_*`

The baked HeroUI layer: the official docs of the HeroUI v3 React library
(`@heroui/react` + `@heroui/styles`, Tailwind CSS v4 + React Aria), shipped
inside the npm packages and baked from the pinned upstream tag. 73 components,
16 guides, per-component CSS, oklch theme variables, component TSX source, and
the v2-to-v3 migration guides, all served offline. The gallery browses the
same catalog at `/heroui` and `/api/heroui`.

| Tool | Arguments | Notes |
|---|---|---|
| `design_heroui_list_components` | none | The whole catalog: components (name, slug, group, description), guides, and the baked versions (`react`, `styles`, source tag). |
| `design_heroui_search` | `query`, `kind` (`component` or `guide`), `limit` | Term search over names, slugs, groups, and descriptions. |
| `design_heroui_get_docs` | `components` (array, up to 5), `offset`, `maxBytes` | Component docs (usage, variants, props, accessibility). Accepts PascalCase or kebab-case. Always read these before implementing a HeroUI component. `maxBytes` is the budget for the whole reply, split across the components; each result has its own `nextOffset`. `offset` continues one doc, so pass a single component with it. |
| `design_heroui_get_guide` | `path`, `offset`, `maxBytes` | One guide, by slug (`theming`), or catalog path (`guides/theming.md`): `quick-start`, `frameworks`, `composition`, `styling`, `theming`, `theming-for-agents`, `colors`, `dark-mode`, `design-principles`, `animation`, and more. |
| `design_heroui_get_source` | `component`, `includeStories` | The component's TSX from the pinned upstream tag (recorded in `heroui/provenance.json`). Storybook files are left out and named in `storiesOmitted`; `includeStories: true` adds them (they are large). Degrades to a note when source was not baked. |
| `design_heroui_get_styles` | `component` | The `@heroui/styles` CSS for one component: BEM blocks, variants, states. A few components (`Form`) ship no css. |
| `design_heroui_get_theme_variables` | none | The default oklch theme variables (light and dark) plus the Tailwind mapping css. |
| `design_heroui_migration_guide` | `name`, `offset`, `maxBytes` | `index` lists the guides; `agent-guide-full`, `agent-guide-incremental`, `styling`, `hooks`, or a component slug reads one. |

Component names resolve from the catalog's name or slug (`TextField`,
`text-field`), whichever form upstream files the source under.

Pair them with the bundled `heroui-react` and `heroui-theming` sub-skills
(under designer-ui) for the working method: read docs before implementing,
semantic variants over raw colors, theming through tokens and BEM overrides.

---

## Mantine UI tools — `design_mantine_*`

The baked Mantine UI layer (`ui.mantine.dev`): 123 ready-made React components
with full TSX and CSS module source, category tree, and vendored `@mantine/*`
package versions. The gallery browses the same catalog at `/mantine` and
`/api/mantine`.

| Tool | Arguments | Notes |
|---|---|---|
| `design_mantine_list_components` | none | Every ready-made component with title and category, the category tree, and vendored `@mantine/*` versions. |
| `design_mantine_search` | `query`, `category`, `limit` | Term search over component titles, slugs, categories, and descriptions. |
| `design_mantine_get_component` | `slug` | Full component record: TSX + CSS module `files[]`, required `packages[]`, sibling `requires[]`, and `livePreview` flag. |

---

## daisyUI 5 tools — `design_daisyui_*`

The baked daisyUI 5 layer: 68 plain-HTML CSS components with upstream agent
docs, class tables, syntax templates, rendered offline-safe example HTML, and
35 themes (no React or Tailwind install required). The gallery browses the same
catalog at `/daisyui` and `/api/daisyui`.

| Tool | Arguments | Notes |
|---|---|---|
| `design_daisyui_list_components` | none | Every component with group and description, baked CSS version, and the 35-theme list. Class names are not in the list: search matches them, and `design_daisyui_get_component` returns them. |
| `design_daisyui_search` | `query`, `group`, `limit` | Term search over names, slugs, groups, descriptions, and class names (e.g. `'table zebra'`, `'btn-primary'`). |
| `design_daisyui_get_component` | `slug` | Full component record: `classes[]`, `syntax`, `example` HTML, `docs`, and `livePreview` flag. |

---

## Base UI tools — `design_baseui_*`

The baked Base UI (`@base-ui/react`) docs layer: headless component docs
(usage, anatomy, props, accessibility) and guides (overview, handbook,
utilities). Pair with the ReUI gallery's Base UI variants for styled examples.

| Tool | Arguments | Notes |
|---|---|---|
| `design_baseui_list_components` | none | Every headless component, guide index, release version, and licence checksum. |
| `design_baseui_search` | `query`, `kind` (`component` or `guide`), `limit` | Term search over Base UI components and guides. |
| `design_baseui_get_docs` | `components` (array, up to 5), `offset`, `maxBytes` | Component docs for `@base-ui/react` components (PascalCase, kebab-case, or plain English). These are long (median 52 KB, Combobox 342 KB), so expect `nextOffset` and page through. `maxBytes` is the budget for the whole reply; `offset` needs a single component. |
| `design_baseui_get_guide` | `path`, `offset`, `maxBytes` | A handbook, utilities, or overview guide by slug (`styling`), section path (`handbook/styling`), or the catalog path (`overview/releases/v1-0-0.md`). |

---

## Gallery API (optional, for visual inspection)

When the preview container is running (`docker compose up -d`), the same data
is available over HTTP — useful for pulling actual screenshots and swatches
into a visual workflow.

The gallery's top bar has one tab per layer: Designs, Components, ReUI,
Base UI, HeroUI, Mantine, daisyUI, Tailwind, Gradients & Patterns, System
templates, Dashboards, Slop, UI SDK Docs, and Assets.

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

## Designer Dashboards Tools (`design_dashboards_*`)

Served offline from `plugins/designer-mcp/skills/designer-dashboards/`:

- `design_dashboards_list` — list or keyword-search (`query`, `limit`) the offline `designer-dashboards` skill: `all`, `stacks` (26 profiles), `starters` (24 templates), `presets` (21 OpenDesign themes), `verticals` (16 industry recipes), `frameworks` (20 UI/CSS framework kits), `references` (10 docs), or `subskills` (6 subskills).
- `design_dashboards_get` — read a `stack`, `starter`, `preset`, `vertical`, `framework`, `reference`, or `skill` artifact (`kind`, `id`, `path`, `offset`, `maxBytes`). Omit `path` on `framework` or `starter` to list files.

---

## Common Mistakes

- Do not use the official tool names (`refero_search_styles`, `refero_get_style`)
  against this server — they do not exist here. Use `refero_search` / `refero_get`.
- Do not expect screens or flows. This deployment is styles-only.
- Do not call `refero_refresh` and interpret its failure as a broken install —
  it needs the paid API by design.
- Do not filter `refero_*` tools by `mixed`: upstream accepts only `light` and
  `dark`. `design_search` and `design_list` accept all three.
- Do not treat a `design_get` reply that carries `matchedBy` as confirmed. It
  was a guess from a partial name: check the site name before using it.
- Do not read only the first page of a long doc. A reply with `nextOffset`
  has more.
- Do not copy a single style directly.

## If Results Are Weak

- Broaden the query.
- Remove extra adjectives or constraints.
- Search adjacent categories.
- Try a known-product or best-brand query.
- Check `refero_facets` for the vocabulary actually present in the catalog.
- For screen-level or journey-level questions, this deployment cannot help —
  say so, and use the bundled craft references instead.
