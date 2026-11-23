# Catalog Layers: Components, Presets, and Templates

Usage guidance for the catalog layers beyond styles: components, presets,
templates, and the UI library docs. Tool parameters and return shapes live in
[mcp-tools.md](mcp-tools.md), which covers every tool.

## Contents

- [Components](#components)
- [Presets](#presets)
- [Templates](#templates)
- [HeroUI component docs](#heroui-component-docs)
- [Mantine, daisyUI, and Base UI](#mantine-daisyui-and-base-ui)

## Components

Styles tell you what a visual direction should feel like. Components are the
other half: **actual working code**, not a description of it.

The library holds 109 AI components across 250 variants: prompt inputs,
conversations, tool calls, agents, voice, media generation, usage meters,
writing surfaces. Each variant's source is complete, typed TSX: props
declared, `motion/react` and `lucide-react` imported, no elisions.

Use components for:

- building a chat or agent interface rather than describing one
- a prompt box, streaming response, tool-call row, or agent activity feed
- voice input, media generation states, usage and limit meters

Workflow:

- `design_component_search` with a `query` or `category` to find candidates
- `design_component_get` for the record: variants (id, file, dependencies,
  code size), FAQ, install command
- `design_component_code` to pull the source for a specific variant

These are third-party MIT-licensed components, not your design system. Treat
them as reference implementations: adapt them to the visual direction you
locked from styles, rather than dropping them in unchanged.

## HeroUI component docs

A fourth reference layer: the official docs of the HeroUI v3 React library,
73 components and 16 guides baked offline from the pinned npm packages. The
`design_heroui_*` tools serve them (see
[mcp-tools.md](mcp-tools.md#heroui-v3-tools--design_heroui_) for the table),
and the gallery browses the same pages at `/heroui`. Use HeroUI when the task
is to build UI in that specific library: `design_heroui_get_docs` before
writing any component, `design_heroui_get_theme_variables` plus the
`heroui-theming` sub-skill when the ask is to theme or restyle it, and
`design_heroui_migration_guide` when the project is still on HeroUI v2.

## Mantine, daisyUI, and Base UI

Three more library layers, each baked offline with its own tools (tables in
[mcp-tools.md](mcp-tools.md)) and a gallery tab:

- **Mantine UI** (`design_mantine_*`, `/mantine`): 123 ready-made components
  from ui.mantine.dev with their full TSX and CSS module source. Read a
  component with `design_mantine_get_component` before writing Mantine code.
- **daisyUI 5** (`design_daisyui_*`, `/daisyui`): 68 plain-HTML components
  and 35 themes. No React or Tailwind install: the example HTML works with
  the vendored css. `design_daisyui_search` matches class names.
- **Base UI** (`design_baseui_*`, `/baseui`): docs and guides for the
  headless `@base-ui/react` primitives. The docs are long, so page through
  them (see "Reply sizes and paging" in mcp-tools.md). For a styled version
  of a Base UI component, the ReUI gallery (`/reui`) has Base UI variants.

Pick the layer the project already uses. Do not mix two component libraries
in one build because both happen to be available.

## Presets

`design_preset_search` and `design_preset_get` cover 139 background
gradients and patterns plus 20 liquid-glass effects. Each carries real CSS
and a React template. Use them for hero and section backgrounds, ambient
gradients, and glass surfaces.

Search first, then fetch what you picked: `design_preset_search` returns ids,
and `design_preset_get` with `kind` and `ids` returns those presets' CSS and
code. Without `ids` it pages through the catalog 20 at a time.

## Templates

Seven vendored design-system templates ship in the image: modernist, classical,
nocturne, organic, broadsheet, industry, and loam (slide-first: its deck starter
is the flagship). Each is a complete, generic system with a token sheet
(`styles.css`), written rules (`readme.md`), foundation and component demo
cards, and two starter templates (a landing page and a 21-slide deck). Use
them when the task is to start a project or product from a coherent system
rather than from scratch.

Workflow:

- `design_template_list` to see all seven (swatches, fonts, token counts)
- `design_manifest_template` with a `slug` to get the design-system manifest:
  a manifest JSON with sections for overview/principles, colors, typography,
  spacing, corner radius, shadows, components, and assets, already filled
  from that system. Call it without `slug` for the blank template when
  building a system from a style reference instead.
- `design_template_get` for the full record: theme parameters, every token,
  the component class table, the file listing
- `design_template_file` to copy an individual file (the token sheet, a
  starter page, the guide). Binary assets are refused. A file over 100 KB
  (the deck stage script) comes back with `nextOffset`: fetch every part and
  join them before writing it.

Rules:

- Treat the manifest as a contract, not documentation. Keep it beside the
  work and design against it. No color outside roles and ramps. No raw px
  where a token exists. No font family outside the two roles.
- Keep the system's anti-patterns (`overview.antiPatterns`). Each template
  has deliberate extremes (zero radius, dark-only, pill shapes). Do not
  soften them toward generic.
- Blend with research: start from the template closest to the locked
  direction, then retune its theme knobs. Or fill a blank manifest from the
  primary style reference.
- Seed a manifest from a catalog design or your own DESIGN.md with
  `design_manifest_from`. Its provenance records available tokens, conflicts,
  and gaps.
- Authoring a new template, or cloning a reference design (slides, website,
  brand board) into this format: follow the `design-template-authoring`
  sub-skill (scaffold, fill, verify, register, then generate deliverables
  from the template). It lives inside the design-system skill
  ([../../design-system/design-template-authoring/SKILL.md](../../design-system/design-template-authoring/SKILL.md)).

## Generate a slide deck from a template

The deck starter is the layout contract. For a branded .pptx or a new HTML
deck, work from a vendored template instead of inventing tokens:

1. `design_template_list`, then `design_template_get` for the chosen system
   (loam is the slide-first one): tokens, brand fonts, theme knobs, manifest.
2. `design_template_file` for `styles.css` (the token sheet) and
   `templates/deck/Deck.dc.html` (the slide inventory: variants, motifs,
   wordmark lockup, per-slide markup patterns).
3. Build the deck with the `pptx` skill's mechanics, mapping the
   template's token roles to theme colors and honoring its motifs (for loam:
   the lowercase wordmark with the accent period, diamond chips, one dark
   slate panel per light slide, pill and arch photo masks).
4. Run the deck's render-and-inspect QA, then keep the manifest beside the
   work as the contract. To make the deck unique, retune the template's theme
   knobs first and derive new values from its ramps, not from new hues.

Rules: do not soften the template's deliberate extremes, and do not introduce
a hue outside its ramps. If the deliverable is a restyled HTML deck instead
of a .pptx, copy the starter folder and edit the markup against the same
tokens.
