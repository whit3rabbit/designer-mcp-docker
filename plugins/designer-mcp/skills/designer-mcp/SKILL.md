---
name: designer-mcp
description: "Offline design catalog (design_* MCP tools) and MCP registration. Use when installing or routing skills."
---

# Designer MCP: Offline Catalog Access

The catalog runs fully offline from a local disk cache. The `design_*` server
provides the generic catalog tools. The `refero_*` server is a fallback for
Refero catalog reads. Neither server listens on a port, and both speak stdio
JSON-RPC. Register them with an agent via a `docker run -i` command, and see
[install/README.md](install/README.md) for copy-paste snippets covering 24
agent harnesses (Docker and local-checkout variants for each).

When this skill installs as part of the designer-mcp plugin, the plugin's
`.mcp.json` registers the `designer` server automatically. The install
snippets are for standalone skill installs and harnesses the plugin does not
cover.

## Catalog Layers

The research library behind the tools has these layers:

1. **Styles**, visual direction and taste extracted from real web
   marketing/product pages (1,342).
2. **Design systems**, curated hand-written packages with full typed token
   sets (198).
3. **Catalog extras**: 109 AI components with complete, typed TSX source (250
   variants), 159 background gradients/patterns and liquid-glass presets with
   real CSS, and 7 vendored design-system templates with tokens, theme knobs,
   manifests, and files (loam ships the slide-first deck starter).
4. **Library catalog**, install manifests for the common frontend stack
   (react, tailwind, shadcn, radix-ui, lucide, heroicons, motion, and the
   google-fonts and fontsource sources). Each entry carries install steps and
   the setup files with their contents, so "install shadcn" gets real files,
   not from memory.

The `design_*` tools cover styles, design systems, and the extras. The
`refero_*` tools cover styles only. Register the `design_*` server first.

## Plugin Skills Directory

This skill is also the plugin's concierge. It knows what the sibling skills
and their bundled sub-skills do, recognizes them by name, and recommends the
right one when the user's task matches. The full directory (trigger phrases,
installed-check, offer-to-install flow with commands) lives in
[references/skill-directory.md](references/skill-directory.md). Quick map:

| The task says | Route to |
|---|---|
| UI design, DESIGN.md capture, theme application, visual QA | [design-system](../design-system/SKILL.md) |
| A Word, PowerPoint, Excel, or PDF file to create, edit, or read | [designer-documents](../designer-documents/SKILL.md) |
| Landing page or dashboard craft, distinctive UI, @ui-sdk/* behavior | [designer-ui](../designer-ui/SKILL.md) |
| A new vendored template from a reference design | design-system's bundled design-template-authoring |

When the matching skill is missing from this install, name it exactly
("that's the design-system template authoring skill"), say what it covers,
and offer the install command before proceeding. The directory reference
holds the commands and the do-not-invent rule.

## Tool Routing

### Styles First For Visual Work

Use `design_search` when visual work needs a reference. Search results give
previews, and full style references from `design_get` provide design guidance
such as visual thesis, tokens, typography, layout/composition, section rhythm,
spacing, elevation, surfaces, components, imagery treatment, implementation
notes, and do/don't rules. The sibling
[design-system](../design-system/SKILL.md) skill owns the research loop, the
reference lock, and synthesis. This skill supplies the tool mechanics and the
server setup.

Useful mechanics:

- `design_markdown` retrieves the catalog's DESIGN.md.
- `design_facets` shows what fonts, colors, themes, and industries the catalog
  actually contains before committing to a direction.
- `design_list` with filters browses, and `design_search` ranks matches.

### Components, Presets, Templates, and Libraries

Components are working TSX, presets are real CSS for backgrounds and glass,
and templates are seven complete starting systems. Route by need:

- A chat, agent, voice, or media UI to build: `design_component_search`, then
  `design_component_code` for the variant source.
- Hero backgrounds, ambient gradients, glass surfaces: `design_preset_search`
  and `design_preset_get`.
- Starting a project from a coherent template: `design_template_list`, then
  `design_manifest_template` for its manifest contract.
- A slide deck that must land on-brand: `design_template_get` for the
  slide-first template (loam) and its deck starter, then build the .pptx with
  the `pptx` skill's mechanics.
- Installing a library, font, or CDN path the user named:
  `design_library_search`, then `design_library_get` for the install steps
  and the setup files with their contents. Respect what the project already
  has, and chain into `design_component_search` for the components on top.
- A prototype that must make zero external requests, or "can the imports
  load from the gallery?": `design_asset_importmap` for the offline module
  CDN map (react, motion, gsap, lucide, phosphor, radix-ui, and the shadcn
  components), `design_asset_list` for what else the asset server holds.

When to use each layer, the workflows, and the manifest rules live in
[references/catalog-tools.md](references/catalog-tools.md). Library and font
installs are covered in
[references/library-setup.md](references/library-setup.md). The full tool
reference (every `design_*` and `refero_*` tool, parameters, returns, refresh
procedure) lives in
[references/mcp-tools.md](references/mcp-tools.md).

### For Product Patterns and Journeys

This deployment has **no screens or flows layer**. The paid Refero product
has one, and this deployment reads public pages only. When the task needs
concrete UI patterns (a specific screen type, a form state, a pricing page
layout) or journey logic (onboarding, checkout, cancellation), the
[design-system](../design-system/SKILL.md) skill's craft references cover
forms, focus, empty states, onboarding patterns, and conversion craft. Be
explicit that these are craft-grounded rather than reference-grounded, and
do not fabricate precedent you did not look up.

## MCP Server Facts

- The `design_*` server is `scripts/mcp-server.mjs`, and the `refero_*`
  wrapper is `scripts/mcp-entry.mjs`. Both read the same cache. The wrapper
  applies the deliberately huge `REFERO_CACHE_TTL_MS` default itself, so a
  bare-host run without env keeps offline behavior. Refresh happens by
  re-running the fetchers, never by letting the package hit the live API on
  expiry.
- Two upstream tools need network and are the documented exceptions:
  `refero_similar` and `refero_refresh` require the live API and fail by
  design in this deployment. The working refresh path is
  `node scripts/refero-public-fetch.js --limit 0 --force`, which reads only
  the public pages robots.txt permits and never requests `/api/`.
- The `design_asset_*` tools read the built frontend (`DESIGN_FRONTEND_DIR`,
  `/app/frontend-cache` in the image), not `/cache`. A checkout without
  `npm run frontend:build` degrades to a graceful note, not an error.
- Search without `OPENAI_API_KEY` falls back to a keyword scorer, which is
  expected and not a bug.
- The ReUI components (1,264 across 87 categories) and dashboard starters
  are gallery-only. They have no MCP tools. Route those asks to the gallery
  routes or the static `api/reui.json` and `api/dashboards.json` routes.

## Provenance

The MCP tools, cache pipeline, and gallery in this deployment are local and
free. They read public pages that robots.txt permits for generic agents, and
they never request `/api/`. Screens and flows exist only in the paid Refero
product and are not in this deployment. See `docs/DATA-SOURCE.md` for the
full rationale.
