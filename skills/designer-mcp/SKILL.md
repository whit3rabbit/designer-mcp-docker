---
name: designer-mcp
description: "Capture the design and structure of a webpage or document as DESIGN.md and a companion evidence file. Use for UI design, applying an existing DESIGN.md or a selected gallery theme, and verifying visual implementation. Includes an offline design catalog and bundled skills for Word, PowerPoint, Excel, and PDF."
---

# Designer MCP — Research-First Design

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
combines a research-first methodology with a **local, free** library of 1,494
extracted design systems.

The research library has two layers, plus a component layer:

1. **Styles** — visual direction and taste, extracted from real web
   marketing/product pages (1,342).
2. **Design systems** — curated, hand-written design-system packages with
   full typed token sets (152).
3. **Components and presets** — 109 AI components with complete, typed TSX
   source (250 variants), and 159 background gradients/patterns and
   liquid-glass effects with real CSS.

Layers 1 and 2 are reachable through the same tools. Where the `design_*`
tools are available they cover both layers plus the component layer; the
`refero_*` tools cover styles only.

Screens and flows exist in the paid Refero product but are **not** in this
deployment. For screen-level or journey-level questions, use the bundled craft
references and the user's own material, and say so plainly rather than
inventing precedent.

## Non-Negotiables

- **Research before design work.** Every design must be grounded in references
  before implementation. Do not rely on the model's generic design taste.
- **Use styles first for open-ended visual research.** If the MCP server is
  unavailable, use the bundled craft references for gaps in the brief.
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
  assets when available; otherwise create an intentional placeholder with art
  direction. Do not fake complex imagery with weak CSS, text, or decorative
  boxes.
- **Do not use generic frontend/product design skills as a parallel design
  authority** when this skill is available. This is the design methodology;
  generic design skills tend to pull work back toward generic AI design. The
  bundled `frontend-design/` sub-skill is the sanctioned exception: it is this
  skill's implementation-craft layer, not a parallel authority.
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
  exploration, mockups, imagery, illustrations, textures, and difficult assets;
  skip it for small fixes, obvious production edits, or code-native UI work.
- **Validate after building visual work.** Compare the rendered implementation
  against the locked target/reference before handoff. Fix actionable design
  drift instead of treating research as sufficient.

## MCP Setup

This skill is useful on its own as a research-first design methodology and
craft reference. The generic `design_*` server provides the offline catalog
and Markdown tools. The `refero_*` server is a fallback for Refero catalog reads.

The local server runs in Docker:

```bash
# Register the MCP server (Hermes / any stdio MCP client)
hermes mcp add designer \
  --command docker \
  --args run --rm -i --network none \
         designer-mcp:latest node scripts/mcp-server.mjs
```

Then restart the gateway (or `/reload-mcp`) so the tools register.

For a browser gallery of the same data — thumbnails, swatches, type scales:

```bash
cd designer-mcp-docker && docker compose up -d   # http://127.0.0.1:8787
```

For full tool details, read
[references/mcp-tools.md](references/mcp-tools.md).

## Discovery

Before researching, form a short design brief. Ask only for missing information
that would materially change the result; otherwise make reasonable assumptions
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
  and ask the user to choose; see
  [references/visual-workflow.md](references/visual-workflow.md).
- **Audit:** use captured screenshots or style references as evidence before
  critique.
- **Asset generation:** use generated imagery only when the reference lock
  requires bitmap media that code, icons, or existing assets cannot faithfully
  provide; see [references/visual-workflow.md](references/visual-workflow.md).

## Document and Deliverable Skills

This skill bundles complete document toolchains as sub-skills. When the task
requires producing, reading, editing, or converting an actual file
deliverable, read the matching sub-skill and follow it:

| Deliverable | Sub-skill |
|---|---|
| Word documents (.docx, .dotx) | [docx/SKILL.md](docx/SKILL.md) |
| Slide decks (.pptx, .potx) | [pptx/SKILL.md](pptx/SKILL.md) |
| Spreadsheets (.xlsx, .xlsm, .csv) | [xlsx/SKILL.md](xlsx/SKILL.md) |
| PDF creation, forms, merging, OCR | [pdf/SKILL.md](pdf/SKILL.md) |
| Reading PDFs from disk | [pdf-reading/SKILL.md](pdf-reading/SKILL.md) |
| Implementation craft for UI work | [frontend-design/SKILL.md](frontend-design/SKILL.md) |

The division of authority is fixed. This skill's research workflow and
reference lock own every design decision: palette, type, layout, imagery, copy.
The document sub-skills supply the file mechanics and the render-and-inspect QA
loop; `frontend-design/` supplies implementation craft inside this workflow.
When a deliverable is a design artifact (brand guidelines, spec deck, token
workbook), style it from the locked reference instead of falling back to
default document styling. Script paths inside each sub-skill are relative to
that sub-skill's own directory.

The sub-skills span two runtimes. Match the runtime to the task; do not
install everything for every job.

| Sub-skill | Create (Node.js) | Edit, inspect, validate (Python) |
|---|---|---|
| pptx | `pptxgenjs`; `scripts/apply_theme.js` injects the theme | `python-pptx`, `Pillow`, `defusedxml`, `lxml`; LibreOffice via `scripts/office/soffice.py` |
| docx | `docx` (docx-js) | `lxml`, `defusedxml`, `validators`; LibreOffice via `scripts/office/soffice.py` |
| xlsx | none | `openpyxl`, `pandas`; `scripts/recalc.py` drives LibreOffice |
| pdf | none required (`pdf-lib` is the named JS alternative) | `pypdf`, `pdfplumber`, `pdf2image`, `Pillow` |
| pdf-reading | none | `pypdf`, `pdfplumber` (optional: `pypdfium2`, `pytesseract`) |

Dependencies: Python packages in [requirements.txt](requirements.txt), npm
packages in [package.json](package.json) (`docx`, `pptxgenjs`, `jszip`), plus
the system tools (`soffice`, `pdftoppm`, `pandoc`) named in the sub-skills that
use them. Conditional npm packages are deliberately not in the
manifest: `react-icons`, `react`, `react-dom`, and `sharp` (the pptx icon
recipe) and `pdf-lib` (PDF work in JavaScript) install on demand when a
require fails. Check what is available before relying on any of it and
install only what is missing.

## Tool Routing

### Use Styles First For Visual Work

Use `design_search` when visual work needs a reference.

A style is a semantic design reference extracted from a real web
marketing/product page. It is not a screenshot and not a component library.
Search results give previews. Full style references from `design_get` provide
design guidance such as visual thesis, tokens, typography, layout/composition,
section rhythm, spacing, elevation, surfaces, components, imagery treatment,
implementation notes, and do/don't rules.

Coverage: web marketing/product pages — landing pages, pricing pages, product
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

After finding strong styles:

- use `design_get` for full details
- use `design_markdown` to retrieve the catalog's DESIGN.md
- use `design_facets` to see what fonts, colors, themes, and industries the
  catalog actually contains before committing to a direction

### Use Components For Implementation

Styles tell you what a visual direction should feel like. Components are the
other half: **actual working code**, not a description of it.

The library holds 109 AI components across 250 variants — prompt inputs,
conversations, tool calls, agents, voice, media generation, usage meters,
writing surfaces. Each variant's source is complete, typed TSX: props
declared, `motion/react` and `lucide-react` imported, no elisions.

Use components for:

- building a chat or agent interface rather than describing one
- a prompt box, streaming response, tool-call row, or agent activity feed
- voice input, media generation states, usage and limit meters

Workflow:

- `design_component_search` with a `query` or `category` to find candidates
- `design_component_get` for the full record — variants, FAQ, dependencies
- `design_component_code` to pull the source for a specific variant

These are third-party MIT-licensed components, not your design system. Treat
them as reference implementations: adapt them to the visual direction you
locked from styles, rather than dropping them in unchanged.

### Use Presets For Backgrounds And Effects

`design_preset_search` and `design_preset_get` cover 139 background
gradients and patterns plus 20 liquid-glass effects. Each carries real CSS
and a React template. Use them for hero and section backgrounds, ambient
gradients, and glass surfaces.

### Use Templates For Starting A System

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
  has deliberate extremes (zero radius, dark-only, pill shapes); do not
  soften them toward generic.
- Blend with research: start from the template closest to the locked
  direction, then retune its theme knobs. Or fill a blank manifest from the
  primary style reference.
- Seed a manifest from a catalog design or your own DESIGN.md with
  `design_manifest_from`. Its provenance records available tokens, conflicts,
  and gaps.

### For Product Patterns and Journeys

This deployment has **no screens or flows layer**. When the task needs
concrete UI patterns (a specific screen type, a form state, a pricing page
layout) or journey logic (onboarding, checkout, cancellation):

- use the bundled craft references — they cover forms, focus, empty states,
  onboarding patterns, and conversion craft
- use the user's existing product, screenshots, or design system when provided
- be explicit that these are craft-grounded rather than reference-grounded

Do not fabricate precedent you did not look up.

### Use Visual Workflow For Images And QA

For image generation, visual options, generated assets, and visual QA, read
[references/visual-workflow.md](references/visual-workflow.md) when the task
needs it.

## Research Workflow

### 1. Research Visual Direction With Styles

For any visual design task, start here.

Recommended loop:

1. Search 3-5 different visual angles.
2. Include one broad aesthetic query.
3. Include one domain/category query.
4. Include one known-brand or strong-product query when relevant.
5. Retrieve 3-4 strong styles with `design_get`. Full styles are large, so
   split larger research into multiple batches.
6. Compare what each style contributes.
7. Choose one primary foundation and borrow 1-2 specific details from other styles.
8. Lock the primary reference's signature traits before implementation.

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
section layouts. Reference lock is not cloning; it preserves selected traits
while adapting content, brand, and interaction details to the user's product.

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
contain or how real products solve a specific UI problem.

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
references only when relevant; do not load every file by default.

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
- Preserve imagery roles from references. Use capable assets when available;
  otherwise prefer an honest, well-sized placeholder over a poor fake
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
- Balance headings and short display text with `text-wrap: balance`; use
  `text-wrap: pretty` selectively for prose. Check key breakpoints for orphan
  words and awkward final lines.
- Keep accessibility and responsive behavior in the design, not as a late pass.

## Quality Gate

Before final delivery, confirm:

- Did I use styles for visual taste?
- Did I avoid copying one style directly?
- Did I synthesize multiple references into a unique direction?
- Did I avoid averaging references into a safe centroid?
- Did I preserve the primary reference's signature traits?
- Did I preserve source token/component roles instead of repurposing them?
- Did I preserve required imagery/media roles with real assets, appropriate
  primitives, or intentional placeholders?
- Can I name which references influenced the design and why?
- Can every major design choice be traced to a reference, user constraint, or
  craft rule?
- Did I produce a concept and decision ledger before implementation?
- Does the implementation avoid generic AI design defaults?
- Did I avoid decorative serif/italic/color word swaps unless reference and
  content role justify them?
- Does the result fit the user's product, audience, and constraints?

If the answer is no, research or refine more before delivering.

For substantial visual work, run the visual QA pass in
[references/visual-workflow.md](references/visual-workflow.md) before handoff.

## Example

For a complete walkthrough, see
[references/example-workflow.md](references/example-workflow.md).

## Provenance

The methodology and the bundled craft references are adapted from Refero's
MIT-licensed [`refero_skill`](https://github.com/referodesign/refero_skill)
(Copyright (c) 2026 Refero). The MCP tools, cache pipeline, and gallery in this
deployment are local and free — they read public pages rather than the paid
Refero API, so the screens and flows layers are not available here.
