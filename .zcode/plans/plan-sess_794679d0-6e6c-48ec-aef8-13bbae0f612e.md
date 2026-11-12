# Design-system templates as a first-class cache layer

## Context

Six generic design-system templates (`modernist`, `classical`, `nocturne`, `organic`, `broadsheet`, `industry`) sit at `skills/designer-mcp/tmp/design_systems/`. Each is a complete, self-contained system: a token sheet (`styles.css`, ~48-51 CSS custom properties), a `theme.json` of generation knobs, a `_ds_manifest.json` token/card/template registry, docs (`readme.md` with a fixed 11-heading skeleton), and landing/deck starter templates. The root `manifest.json` index is explicitly designed for "read this instead of globbing."

Today nothing serves them: `tmp/` is scratch-convention, excluded from packaging, and invisible to both MCP servers and the gallery. Goal: make them a baked cache layer with MCP tools built around them, centered on a **canonical design-system manifest JSON template** whose sections mirror a design-system editor (overview/principles, colors, typography, spacing, corner radius, shadows, components, assets) and can be emitted blank or pre-filled from any of the six systems.

The implementation follows the existing components/presets layer pattern end to end (index JSON + detail JSON + readers + TOOLS entries + dispatch cases + gallery routes + selftest).

## 1. Move source data

- Move `skills/designer-mcp/tmp/design_systems/**` to `data/design-systems/` (committed source; ~2.5 MB). Strip all `.DS_Store` files. Keep the root `manifest.json` as the index source. `skills/designer-mcp/tmp/` disappears.
- No package-skill.mjs change needed (its `tmp` exclusion stays; `data/` is not under `skills/`).

## 2. New lib: `scripts/lib/ds-manifest.mjs`

- `blankManifestTemplate()` returns the canonical template object, `schemaVersion: "design-system-manifest/v1"`, with per-section `$comment` docs: `overview {direction, principles[], usingTokens, usingComponents, accessibility}`, `colors {ground, text, accent, roles{}, ramps{}, usage}`, `typography {heading, body, scale[], rules[]}`, `spacing {scale[], density}`, `radius {sm,md,lg}`, `shadows {sm,md,lg}`, `components[] {class, what, demo}`, `assets {imageTreatment, iconSet, photos[]}`, `tokens[] {name, value, kind}`, `files[]`, `starterTemplates[]`, `theme`.
- `buildSystemRecord(indexEntry, systemDir)` parses `theme.json` + `_ds_manifest.json` + the readme's fixed heading skeleton and returns the full record with a filled `manifest`. Bake-time only, so the MCP stays thin.
- Write the blank template verbatim to `data/design-systems/manifest-template.json` (the committed "template around design systems") and bake it through.

## 3. Bake + cache readers

- `scripts/bake-cache.mjs`: new section following the components/presets skip-if-missing pattern. Copies `data/design-systems/` to `bake/design-systems/`, writes index `bake/design-systems.json` (`{updatedAt, total, systems:[{slug,name,description,ground,text,accent,headingFont,thumbnailImage,templates,filesCount}]}`) and per-system detail `bake/design-systems/<slug>.json` (full record incl. `manifest`, `tokens`, `components`, `files[]` with `binary` flags, minus `thumbnailImage` bytes).
- `scripts/lib/cache.mjs`: `readDesignSystemsIndex()` and `readDesignSystem(slug)` (slug regex guard, empty-shape fallback so servers boot without the layer), mirroring `readComponentsIndex`/`readComponent`.

## 4. MCP tools (`scripts/mcp-server.mjs`)

Four entries in the `TOOLS` array + `dispatch` cases + handlers:

- `design_template_list` (optional `query`) → index entries with swatches/fonts/one-line vibe.
- `design_template_get` (`slug`) → full record: theme knobs, tokens by kind, component classes, starter templates, `files[]`, direction/do-don't prose, and the filled manifest.
- `design_template_file` (`slug`, `path`) → one text file's content; guards: path must be listed in `files[]`, not `binary: true`, never `thumbnailImage`.
- `design_manifest_template` (optional `slug`) → the blank canonical manifest template, or pre-filled from the named system.

All offline: reads only the cache.

## 5. Gallery (`scripts/preview.mjs` + `scripts/lib/ui.mjs`)

Routes mirroring components/presets, all served from the cache: `GET /api/templates`, `GET /templates` (card grid with swatch strips + local thumbnails), `GET /template/:slug` (theme parameters, grouped tokens, component table, file list), `GET /api/template/:slug`, `GET /template/:slug/thumb` (local WebP bytes, no redirect). Export `templatesHtml()`/`templateDetailHtml()` from `ui.mjs`, add a nav tab.

## 6. Skill docs

- `skills/designer-mcp/SKILL.md`: new `### Use Templates For Starting A System` under Tool Routing plus a workflow step: pick template → `design_manifest_template` with slug → keep the reference lock → build against the emitted manifest.
- `references/mcp-tools.md`: document the four tools and the manifest schema.
- `evals/evals.json`: one new eval (e.g. "start a landing page from a generic template", asserting manifest emission and no invented tool names).

## 7. Selftest (`scripts/selftest.mjs`)

- Offline check: all six baked records parse; each manifest has ≥48 tokens and the canonical `schemaVersion`.
- Section 4: HTTP checks for `/api/templates`, `/templates`, `/template/modernist`, `/template/modernist/thumb` (200, local bytes).
- Section 6: add the four tool names to the `expected` array; live-call list/get/file/manifest via `dcall()`.

## Verification

1. `npm run bake` then `npm test` (all six sections green).
2. Stdio smoke test: JSON-RPC `tools/call` for `design_manifest_template` with `slug: "modernist"` (expect filled manifest) and without slug (expect blank template).
3. Offline image check per AGENTS.md: `docker run --rm --network none -p 127.0.0.1:8787:8787` then `/healthz`, `/api/templates`, `/template/nocturne`.

## Key files

New: `scripts/lib/ds-manifest.mjs`, `data/design-systems/**` (moved), `data/design-systems/manifest-template.json`.
Modified: `scripts/bake-cache.mjs`, `scripts/lib/cache.mjs`, `scripts/mcp-server.mjs`, `scripts/selftest.mjs`, `scripts/preview.mjs`, `scripts/lib/ui.mjs`, `skills/designer-mcp/SKILL.md`, `skills/designer-mcp/references/mcp-tools.md`, `skills/designer-mcp/evals/evals.json`.