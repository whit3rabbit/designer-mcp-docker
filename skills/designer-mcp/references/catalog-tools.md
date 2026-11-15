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

Six vendored design-system templates ship in the image: modernist, classical,
nocturne, organic, broadsheet, industry. Each is a complete, generic system
with a token sheet (`styles.css`), written rules (`readme.md`), foundation and
component demo cards, and two starter templates (a landing page and a 21-slide
deck). Use them when the task is to start a project or product from a coherent
system rather than from scratch.

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
