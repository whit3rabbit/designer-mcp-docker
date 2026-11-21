# Catalog Layers: Components, Presets, and Templates

Usage guidance for the three non-style catalog layers. Tool parameters and
return shapes live in [mcp-tools.md](mcp-tools.md).

## Contents

- [Components](#components)
- [Presets](#presets)
- [Templates](#templates)

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
- `design_component_get` for the full record: variants, FAQ, dependencies
- `design_component_code` to pull the source for a specific variant

These are third-party MIT-licensed components, not your design system. Treat
them as reference implementations: adapt them to the visual direction you
locked from styles, rather than dropping them in unchanged.

## Presets

`design_preset_search` and `design_preset_get` cover 139 background
gradients and patterns plus 20 liquid-glass effects. Each carries real CSS
and a React template. Use them for hero and section backgrounds, ambient
gradients, and glass surfaces.

## Templates

Seven vendored design-system templates ship in the image: modernist, classical,
nocturne, organic, broadsheet, industry, and loam (slide-first: its deck starter
is the flagship). Each is a complete, generic system with a token sheet
(`styles.css`), written rules (`readme.md`), foundation and component demo
cards, and two starter templates (a landing page and a 21-slide deck). Use
them when the task is to start a project or product from a coherent system
rather than from scratch.

Workflow:

- `design_template_list` to see all six (swatches, fonts, token counts)
- `design_manifest_template` with a `slug` to get the design-system manifest:
  a manifest JSON with sections for overview/principles, colors, typography,
  spacing, corner radius, shadows, components, and assets, already filled
  from that system. Call it without `slug` for the blank template when
  building a system from a style reference instead.
- `design_template_get` for the full record: theme parameters, every token,
  the component class table, the file listing
- `design_template_file` to copy an individual file (the token sheet, a
  starter page, the guide). Binary assets are refused.

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
  brand board) into this format: follow the bundled
  `design-template-authoring/SKILL.md` (scaffold, fill, verify, register,
  then generate deliverables from the template).

## Generate a slide deck from a template

The deck starter is the layout contract. For a branded .pptx or a new HTML
deck, work from a vendored template instead of inventing tokens:

1. `design_template_list`, then `design_template_get` for the chosen system
   (loam is the slide-first one): tokens, brand fonts, theme knobs, manifest.
2. `design_template_file` for `styles.css` (the token sheet) and
   `templates/deck/Deck.dc.html` (the slide inventory: variants, motifs,
   wordmark lockup, per-slide markup patterns).
3. Build the deck with the bundled `pptx/SKILL.md` mechanics, mapping the
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
