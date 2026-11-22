---
name: design-system
description: "Capture pages and documents as DESIGN.md, research an offline design catalog, and verify builds. Use for UI design and themes."
---

# Design System: Research-First Design

## Start with the user's source

- **Capture.** For a webpage or document, inspect it on the host. Save `DESIGN.md`
  and `DESIGN.evidence.json` in a reproducible design-system package with a
  shared stylesheet, preview, and starter for the target medium.
- **Build from a theme.** Use the selected gallery reference or supplied
  DESIGN.md for appearance. If an artifact is also supplied, preserve its
  section order and content hierarchy. Explicit user overrides take precedence.
  For `designer:opendesign:*`, start with `design_get` to discover the selected
  package's local files, then follow the OpenDesign steps in the linked workflow.
- **Verify a build.** Render the target, resample the applied roles, and check
  coverage and visual fidelity against the selected design.

A user-selected source is sufficient grounding. Follow the
[DESIGN.md workflow](references/design-md-workflow.md) for these requests.
Use catalog research when the task needs a reference.

Ground every design in real product evidence before implementation. This skill
is a research-first methodology over a **local, free** library of 1,540
extracted design systems. The library has these layers:

1. **Styles**, visual direction and taste extracted from real web
   marketing/product pages (1,342).
2. **Design systems**, curated hand-written packages with full typed token
   sets (198).
3. **Components and presets**, 109 AI components with complete, typed TSX
   source (250 variants), plus 159 background gradients/patterns and
   liquid-glass effects with real CSS.
4. **Library catalog**: install manifests for the common frontend stack
   (react, tailwind, shadcn, radix-ui, lucide, heroicons, motion, and the
   google-fonts and fontsource sources). Each entry carries install steps and
   the setup files with their contents, so "install shadcn" gets real files,
   not from memory.

Each design system also ships a **Claude Design package** (the files Claude
itself uses) and a rendered preview. `design_claude_package` reads them, so
a system can be handed to Claude directly rather than re-described.

Layers 1 and 2 are reachable through the same tools. Where the `design_*`
tools are available they cover both layers plus the component layer. The
`refero_*` tools cover styles only. The sibling
[designer-mcp](../designer-mcp/SKILL.md) skill owns the MCP setup, the full
tool reference, the catalog routing, and copy-paste registration snippets for
24 agent harnesses.

Screens and flows exist in the paid Refero product but are **not** in this
deployment. For screen-level or journey-level questions, use the craft
references below and the user's own material, and say so plainly rather than
inventing precedent.

## Non-Negotiables

- **Research before design work.** Every design must be grounded in references
  before implementation. Do not rely on the model's generic design taste.
- **Use styles first for open-ended visual research.** If the MCP server is
  unavailable, use the craft references for gaps in the brief.
- **Synthesize when exploring a new direction.** Study several strong references
  when the user has left the visual direction open.
- **Do not average references into a safe middle.** When references conflict,
  choose one dominant direction and preserve its sharp traits. Secondary
  references may add narrow details only.
- **Do not change token meanings.** If a reference says a color, font, radius,
  shadow, gradient, or component is for a specific role, use it only for that
  role or omit it.
- **Respect imagery guidance.** If a style depends on photography, illustration,
  product shots, or graphics, preserve the media role. Use real/generated/stock
  assets when available. Otherwise create an intentional placeholder with art
  direction. Do not fake complex imagery with weak CSS, text, or decorative
  boxes.
- **Do not use generic frontend/product design skills as a parallel design
  authority** when this skill is available. This skill is the design
  methodology, and generic design skills tend to pull work back toward generic
  AI design. The `frontend-design` and `ui-sdk` sub-skills under the sibling
  `designer-ui` skill are the sanctioned implementation-craft and headless
  behavior layers (`@ui-sdk/core`, `@ui-sdk/react`, `@ui-sdk/web`, also
  searchable via `design_docs_search` / `design_docs_get`).
- **Research output must be specific.** Name the references, describe concrete
  choices, and explain what will be adapted.
- **No design from vibe memory.** Every major visual, layout, content, or
  interaction decision must trace to research, the user's brief, or a craft
  reference.
- **Synthesize before implementation.** Turn research into a concept, token
  direction, and concrete decision ledger before drawing or coding.
- **A brief is not a build target.** Before implementation, lock either a
  user-provided visual source, an existing product/design-system target, a
  selected generated mockup, or an explicit reference-locked direction approved
  for direct build.
- **Use image generation only when it changes the outcome.** Image generation
  can be slow and may not exist in every coding environment. Use it for visual
  exploration, mockups, imagery, illustrations, textures, and difficult assets.
  Skip it for small fixes, obvious production edits, or code-native UI work.
- **Validate after building visual work.** Compare the rendered implementation
  against the locked target/reference before handoff. Fix concrete design
  drift instead of treating research as sufficient.

## Discovery

Before researching, form a short design brief. Ask only for missing information
that would materially change the result. Otherwise make reasonable assumptions
and proceed.

Clarify:

- what is being designed
- platform: web, iOS, or both
- audience and technical level
- primary user goal
- desired feeling or brand direction
- business/user objections to overcome
- constraints: existing brand, framework, deadline, accessibility, content
- whether the task needs visual direction, concrete UI patterns, journey logic, or a mix
- whether the task should go directly to code, produce visual options first, or
  create generated assets during implementation

Brief format:

```text
Designing [WHAT] for [WHO] on [PLATFORM].
Goal: [PRIMARY USER GOAL].
Tone: [DESIRED FEELING].
Main objection/risk: [OBJECTION].
Must remember: [HOOK OR DISTINCTIVE IDEA].
Constraints: [CONSTRAINTS].
Research needed: [styles/screens/flows].
Path: [direct build / visual exploration / audit / asset generation].
```

## Workflow Routing

Choose the lightest workflow that can produce a high-quality result.

- **Direct build:** use for small UI fixes, clear production edits, existing
  design-system work, or tasks with a concrete source to match. Research and
  lock the direction, then code.
- **Visual exploration:** use when the user asks for variants, a new visual
  language, a major redesign, a landing page, or another high-visibility surface
  with several plausible directions. Default to three reference-locked options
  and ask the user to choose. See
  [references/visual-workflow.md](references/visual-workflow.md).
- **Audit:** use captured screenshots or style references as evidence before
  critique.
- **Asset generation:** use generated imagery only when the reference lock
  requires bitmap media that code, icons, or existing assets cannot faithfully
  provide. See [references/visual-workflow.md](references/visual-workflow.md).

For image generation, visual options, generated assets, and visual QA, read
[references/visual-workflow.md](references/visual-workflow.md) when the task
needs it.

## Design Deliverable Skills

When the task requires producing, reading, editing, or converting an actual
file deliverable, or building on the UI craft or SDK layers, read the
matching skill and follow it:

| Deliverable | Where |
|---|---|
| Word documents (.docx, .dotx) | [../designer-documents/docx/SKILL.md](../designer-documents/docx/SKILL.md) |
| Slide decks (.pptx, .potx) | [../designer-documents/pptx/SKILL.md](../designer-documents/pptx/SKILL.md) |
| Spreadsheets (.xlsx, .xlsm, .csv) | [../designer-documents/xlsx/SKILL.md](../designer-documents/xlsx/SKILL.md) |
| PDF creation, forms, merging, OCR | [../designer-documents/pdf/SKILL.md](../designer-documents/pdf/SKILL.md) |
| Reading PDFs from disk | [../designer-documents/pdf-reading/SKILL.md](../designer-documents/pdf-reading/SKILL.md) |
| Implementation craft for UI work | [../designer-ui/frontend-design/SKILL.md](../designer-ui/frontend-design/SKILL.md) |
| Headless UI behavior, accessibility, agent-ready interfaces (@ui-sdk/*) | [../designer-ui/ui-sdk/SKILL.md](../designer-ui/ui-sdk/SKILL.md) |
| A new vendored design-system template, or cloning a reference design (slides, website, brand) into the structured template format | [design-template-authoring/SKILL.md](design-template-authoring/SKILL.md) |

The division of authority is fixed. This skill's research workflow and
reference lock own every design decision: palette, type, layout, imagery, copy.
The document sub-skills (bundled under the sibling designer-documents skill)
supply the file mechanics and the render-and-inspect QA loop. The
frontend-design sub-skill (under designer-ui) supplies implementation craft
inside this workflow, and design-template-authoring (bundled here) scaffolds
new vendored templates.

When a deliverable is a design artifact (brand
guidelines, spec deck, token workbook), style it from the locked reference
instead of falling back to default document styling. Script paths inside each
sub-skill are relative to that sub-skill's own directory.

Runtimes and dependency manifests for the document sub-skills are listed in
the [designer-documents](../designer-documents/SKILL.md) skill. Python
packages install from the plugin root's
[requirements.txt](../../requirements.txt), npm packages from the plugin
root's [package.json](../../package.json), plus the system tools
(`soffice`, `pdftoppm`, `pandoc`) named in the sub-skills that use them.
Check what is available before relying on any of it, and install only what
is missing.

## Research Workflow

### 1. Research Visual Direction With Styles

For any visual design task, start here.

A style is a semantic design reference extracted from a real web
marketing/product page. It is not a screenshot and not a component library.
Search results give previews. Full style references from `design_get` provide
design guidance such as visual thesis, tokens, typography, layout/composition,
section rhythm, spacing, elevation, surfaces, components, imagery treatment,
implementation notes, and do/don't rules.

Coverage: web marketing/product pages. Landing pages, pricing pages, product
marketing sites, editorial brand sites, and SaaS websites. In-app dashboards,
auth screens, settings screens, and iOS app screens are not covered as style
systems. For product UI tasks, establish visual language from styles, then use
the craft references for the product logic.

Use styles for:

- look and feel
- brand direction
- landing pages and marketing pages
- typography, palette, layout, section structure, spacing, radius, elevation, surfaces
- component treatments and sometimes component/code examples
- imagery and product screenshot treatment
- design-system inspiration
- making a generic interface feel more tasteful

Recommended loop:

1. Search 3-5 different visual angles with `design_search`.
2. Include one broad aesthetic query.
3. Include one domain/category query.
4. Include one known-brand or strong-product query when relevant.
5. Retrieve 3-4 strong styles with `design_get`. Full styles are large, so
   split larger research into multiple batches.
6. Compare what each style contributes.
7. Choose one primary foundation and borrow 1-2 specific details from other styles.
8. Lock the primary reference's signature traits before implementation.

After finding strong styles, also reach for:

- `design_markdown` to retrieve the catalog's DESIGN.md
- `design_facets` to see what fonts, colors, themes, and industries the
  catalog actually contains before committing to a direction

Good style queries and the full extraction checklist (what to pull from each
style: thesis, type, color roles, spacing, layout, components, imagery, media
strategy, do/don't rules) are listed in
[references/research-playbook.md](references/research-playbook.md).

Synthesis rule:

- Primary style: overall mood, density, and structure.
- Secondary styles: specific borrowed details.
- User context: adapt everything to the product, audience, and task.
- Do not use the average/intersection of all references. If one reference is
  dark, one is acid, and one is serif, the answer is not warm cream + muted
  orange + polite serif.

Never present the result as "copying X". Present it as a new direction inspired
by several references.

Before implementation, create a reference lock:

```text
Primary reference/direction: [one dominant source]
Preserve: [3-5 traits that must survive: canvas, type, accent, layout, density, media]
Borrow only: [1-2 specific secondary details]
Role rules: [source token/component meanings to preserve, e.g. CTA-only, code-only, decorative-only]
Media strategy: [real/generated/stock/code-native/placeholder, with aspect ratio and art direction]
Reject: [defaults/averages that would collapse the direction]
Token commitments: [background, type, accent, radius, border/shadow, imagery treatment, with roles]
```

If implementation drifts from the lock, stop and correct it. Do not soften
distinctive traits into safer colors, safer fonts, softer radius, or generic
section layouts. Reference lock is not cloning, and it preserves selected
traits while adapting content, brand, and interaction details to the user's
product.

When combining styles, assign each source a bounded job. For example: one
source may own canvas/type, another may own code-window treatment, and another
may own primary CTA. Never move a token outside its source role: CTA colors stay
CTA-only, syntax colors stay inside code, decorative gradients stay decorative,
and card/button rules keep their specified radius, shadow, and state behavior.

If the primary style is image-led, do not replace it with text-only layout. If
you cannot produce the needed image or graphic, preserve the slot with stable
dimensions, aspect ratio, caption/alt text, and a short art-direction note.
Build simple diagrams, icons, code windows, or geometric primitives only when
they match the source style.

For substantial visual exploration, generated mockups, bitmap assets, or
post-build visual QA, follow
[references/visual-workflow.md](references/visual-workflow.md).

### 2. Product Patterns Without a Screens Layer

Use the craft references when the task needs to know what an interface should
contain or how real products solve a specific UI problem. This deployment has
**no screens or flows layer**.

| Need | Reference |
|---|---|
| Form design, focus states, empty states, tables, onboarding patterns | [references/craft-details.md](references/craft-details.md) |
| CTA copy, trust signals, objection handling, conversion structure | [references/copywriting.md](references/copywriting.md) |
| Component/icon selection | [references/icons.md](references/icons.md) |
| Type roles and hierarchy decisions | [references/typography.md](references/typography.md) |
| Color roles, contrast, palette discipline | [references/color.md](references/color.md) |

Extract from these:

- layout structure
- information hierarchy
- component choices
- CTA patterns
- content/copy patterns
- states and edge cases
- trust or conversion tactics
- concrete details worth adapting

### 3. Journey Logic Without a Flows Layer

When the task has multiple steps or a user changes state over time, reason from
the interaction pattern rather than claiming precedent:

- entry point and exit state
- step count
- decisions the user makes
- friction reducers
- required confirmations
- save/recovery states
- error handling
- retention or persuasion moments
- system response at each step

## Research Depth and Synthesis

Match depth to task risk, then separate findings into three buckets: visual
direction (from styles), product pattern (from craft references and user
material), and journey logic (from interaction reasoning).

For the depth ladder per task type, the output formats for each bucket, the
research-summary template, and the decision-ledger table, read
[references/research-playbook.md](references/research-playbook.md).

## Design Craft

After research, execute like a senior product designer. Use the bundled
references only when relevant. Do not load every file by default.

- Typography: [references/typography.md](references/typography.md)
- Color: [references/color.md](references/color.md)
- Motion: [references/motion.md](references/motion.md)
- Icons: [references/icons.md](references/icons.md)
- Forms, focus, images, touch, performance, accessibility: [references/craft-details.md](references/craft-details.md)
- Copywriting and persuasion: [references/copywriting.md](references/copywriting.md)
- Anti-AI-slop checks: [references/anti-ai-slop.md](references/anti-ai-slop.md)

Core craft rules:

- Define tokens before implementation: type scale, colors, spacing, radius, shadows.
- Preserve the primary reference's strongest traits instead of normalizing them.
- Preserve token roles from references. Do not turn a CTA accent into a
  background, a code-only color into UI chrome, or a decorative gradient into an
  interface surface.
- Preserve imagery roles from references. Use capable assets when available.
  Otherwise prefer an honest, well-sized placeholder over a poor fake
  illustration or photo.
- Use brand-appropriate colors from research. Do not default to indigo/violet
  unless the user explicitly asks for it.
- Treat "calm editorial" as a current AI-slop risk. Do not default to decorative
  headline word swaps: one word or short phrase set in a different
  display/serif/script/italic style or accent color, warm ivory/cream canvases,
  or olive/clay/terracotta palettes unless research and product context
  justify them.
- Avoid generic hero -> features grid -> pricing -> FAQ -> CTA unless research
  supports it.
- Use real product evidence for copy, trust signals, objection handling, and
  section order.
- Create at least one memorable detail: a visual move, interaction, layout
  choice, or copy detail users would remember.
- Balance headings and short display text with `text-wrap: balance`, and use
  `text-wrap: pretty` selectively for prose. Check key breakpoints for orphan
  words and awkward final lines.
- Keep accessibility and responsive behavior in the design, not as a late pass.

## Quality Gate

Before final delivery, run the quality-gate checklist in
[references/research-playbook.md](references/research-playbook.md): every
major choice must trace to a reference, user constraint, or craft rule, and
no reference's signature traits, token roles, or media roles may be lost. If
the gate fails, research or refine more before delivering. For substantial
visual work, also run the visual QA pass in
[references/visual-workflow.md](references/visual-workflow.md) before handoff.

## Example

For a complete walkthrough, see
[references/example-workflow.md](references/example-workflow.md).

## Provenance

The methodology and the craft references are adapted from Refero's
MIT-licensed [`refero_skill`](https://github.com/referodesign/refero_skill)
(Copyright (c) 2026 Refero). The MCP tools, cache pipeline, and gallery in
this deployment are local and free. They read public pages rather than the
paid Refero API, so the screens and flows layers are not available here.
