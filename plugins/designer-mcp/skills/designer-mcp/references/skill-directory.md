# Plugin skill directory

Knowledge of the designer-mcp plugin's skills, for routing and install
recommendations. This skill does not bundle the others. When the user's task
matches an entry below, name the skill exactly, say one line about what it
covers, and follow it. If its files are missing from this install, offer to
install it before proceeding.

## The five skills

Paths resolve relative to this skill's own directory, the same convention as
script paths elsewhere in the plugin.

| Skill | Covers | Path from here |
|---|---|---|
| design-system | The research-first design methodology: capture DESIGN.md from a page or document, research references from the offline catalog, lock a direction, craft references (typography, color, motion, icons, copy), quality gate, visual QA | [../../design-system/SKILL.md](../../design-system/SKILL.md) |
| designer-documents | Document toolchains, one bundled sub-skill per format, with render-and-inspect QA loops | [../../designer-documents/SKILL.md](../../designer-documents/SKILL.md) |
| designer-ui | Implementation craft for web UI plus headless behavior and accessibility primitives | [../../designer-ui/SKILL.md](../../designer-ui/SKILL.md) |
| designer-dashboards | Multi-framework dashboard builder & scaffolder (24 starters, 26 tech stacks, 20 UI/CSS framework kits, 21 presets, 16 verticals, `design_dashboards` MCP tools) | [../../designer-dashboards/SKILL.md](../../designer-dashboards/SKILL.md) |
| designer-mcp | This skill: catalog tools, MCP setup, install snippets | [SKILL.md](../SKILL.md) |

## Bundled sub-skills

| Sub-skill | Bundled under | Triggers | Path from here |
|---|---|---|---|
| design-template-authoring | design-system | "author a new template", "clone this site/deck/brand into a template", vendored design-system format (theme.json, styles.css, foundations, components, starters) | [../../design-system/design-template-authoring/SKILL.md](../../design-system/design-template-authoring/SKILL.md) |
| docx | designer-documents | Word documents: .docx/.dotx create, edit, validate, convert | [../../designer-documents/docx/SKILL.md](../../designer-documents/docx/SKILL.md) |
| pptx | designer-documents | Slide decks: .pptx/.potx create, theme injection via apply_theme.js, deck QA | [../../designer-documents/pptx/SKILL.md](../../designer-documents/pptx/SKILL.md) |
| xlsx | designer-documents | Spreadsheets: .xlsx/.xlsm/.csv create, edit, recalculate, validate | [../../designer-documents/xlsx/SKILL.md](../../designer-documents/xlsx/SKILL.md) |
| pdf | designer-documents | PDF creation, form filling, merge, split, watermark, OCR | [../../designer-documents/pdf/SKILL.md](../../designer-documents/pdf/SKILL.md) |
| pdf-reading | designer-documents | Reading and extracting content from PDFs on disk (text, tables, images, page rasterization) | [../../designer-documents/pdf-reading/SKILL.md](../../designer-documents/pdf-reading/SKILL.md) |
| frontend-design | designer-ui | Distinctive UI implementation craft: aesthetic direction, typography, color, layout, motion restraint, avoiding templated AI defaults | [../../designer-ui/frontend-design/SKILL.md](../../designer-ui/frontend-design/SKILL.md) |
| ui-sdk | designer-ui | Headless behavior and accessibility for @ui-sdk/core, @ui-sdk/react, @ui-sdk/web, with offline docs via design_kit_search / design_kit_docs | [../../designer-ui/ui-sdk/SKILL.md](../../designer-ui/ui-sdk/SKILL.md) |
| heroui-react | designer-ui | HeroUI v3 (@heroui/react) UI building: component usage, offline docs, project setup, oklch dark/light basics, via design_kit_* (kit: "heroui") tools | [../../designer-ui/heroui/heroui-react/SKILL.md](../../designer-ui/heroui/heroui-react/SKILL.md) |
| heroui-theming | designer-ui | HeroUI theming: custom themes, design tokens, BEM class overrides, @heroui/styles on plain HTML and non-React stacks | [../../designer-ui/heroui/heroui-theming/SKILL.md](../../designer-ui/heroui/heroui-theming/SKILL.md) |
| heroui-native | designer-ui | HeroUI Native for React Native (Uniwind): mobile components, install, dark/light themes | [../../designer-ui/heroui/heroui-native/SKILL.md](../../designer-ui/heroui/heroui-native/SKILL.md) |
| heroui-migration | designer-ui | HeroUI v2-to-v3 migration: provider removal, compound components, styling, hooks, per-component changes | [../../designer-ui/heroui/heroui-migration/SKILL.md](../../designer-ui/heroui/heroui-migration/SKILL.md) |
| init | designer-dashboards | Interactive dashboard stack wizard & scaffolder (24 starters, 26 tech stacks, 20 UI/CSS framework kits) | [../../designer-dashboards/init/SKILL.md](../../designer-dashboards/init/SKILL.md) |
| design | designer-dashboards | OpenDesign token compiler, soft/tonal ladders, FOUC-free dark mode, `_adherence.oxlintrc.json` | [../../designer-dashboards/design/SKILL.md](../../designer-dashboards/design/SKILL.md) |
| ui | designer-dashboards | Dashboard UI primitives, ApexCharts/Recharts, TanStack DataGrid, KPI cards, forms, overlays | [../../designer-dashboards/ui/SKILL.md](../../designer-dashboards/ui/SKILL.md) |
| login | designer-dashboards | 7-page auth suite, RBAC `authority` guards, NextAuth/Supabase/Better Auth/Clerk adapters | [../../designer-dashboards/login/SKILL.md](../../designer-dashboards/login/SKILL.md) |
| pages | designer-dashboards | Unified Nav IR, derived breadcrumbs/titles, 16 industry verticals, 11 app shells, print invoices | [../../designer-dashboards/pages/SKILL.md](../../designer-dashboards/pages/SKILL.md) |
| audit | designer-dashboards | Token parity, WCAG 2.1 AA 18-point gate, RTL logical properties, dep & secret hygiene | [../../designer-dashboards/audit/SKILL.md](../../designer-dashboards/audit/SKILL.md) |

The Mantine, daisyUI, Base UI, Refero Styles, and UI Kits catalog layers have MCP
tools (`design_kit_* (kit: "mantine")`, `design_kit_* (kit: "daisyui")`, `design_kit_* (kit: "baseui")`,
`design_search / design_get`, `design_kit_*`) but no sub-skill. Route those asks to
designer-ui or designer-mcp, which name the tools to start with.

## How to tell what is installed

Test whether the path exists on disk. From a shell:
`test -f ../design-system/SKILL.md`, resolved against this skill's
directory. Present means installed and usable: read it and follow it.
Missing means this copy of designer-mcp is standalone (installed alone or
copied out), and the sibling needs an install.

Whether a harness auto-triggers an installed skill varies by harness.
Reading and following the SKILL.md works everywhere.

### Leftovers from before v1.8.0

Up to v1.7.0 the plugin was one skill, also named `designer-mcp`, with the
document and UI sub-skills (`docx/`, `pptx/`, `pdf/`, `frontend-design/`, ...)
directly inside it. v1.8.0 split it into the four skills above. An install
made from the old zip is not replaced by installing the new ones: the old
folder keeps the name and can shadow this skill.

To check, look inside the installed `designer-mcp` folder. If it contains
`docx/` or `pptx/` at its top level, it is the old layout. Tell the user,
and on their go-ahead remove that folder and install the current skills.
Do not delete it without asking.

## Recommend and offer install

When the task matches a skill that is missing:

1. Name it exactly. "That's the design-system template authoring skill."
2. One line on what it covers for this task.
3. Ask before installing: "Want me to install it?" Then use the matching
   command:

   ```bash
   # Full plugin: all five skills, and the .mcp.json registers the MCP server
   claude plugin marketplace add whit3rabbit/designer-mcp-docker
   claude plugin install designer-mcp@designer-mcp-docker

   # One skill via the skills CLI (ZCode, Codex, and most others)
   npx -y skills add whit3rabbit/designer-mcp-docker --skill design-system

   # From a checkout of this repo
   npx -y skills add <repo>/plugins/designer-mcp/skills --skill design-system
   ```

   On ZCode the full plugin also installs through the Plugin Marketplace UI:
   Add, paste the repo, install Designer MCP. The zip from the `/skill`
   route installs all five skills at once.

4. After installing, read the new skill's SKILL.md and follow it for the
   task.

Rules:

- Do not install without asking.
- Do not bundle the sibling skills here, and do not duplicate their content.
  The directory is metadata only.
- Do not invent skills outside this plugin. If nothing above covers the
  task, say so plainly, fall back to the craft references in design-system
  or the user's own material, and only mention the skills CLI
  (`npx -y skills add <repo>` for any GitHub skill repo) if the user asks
  where else to look.

## Example routings

- "Design a PowerPoint" → designer-documents pptx for the deck mechanics,
  with design-system's research loop and reference lock for the visual
  direction, and `design_template` (loam) when the deck must land
  on-brand.
- "Turn this website into a reusable template" → design-system's
  design-template-authoring.
- "Make this landing page less generic" → design-system's research loop,
  then designer-ui's frontend-design for execution craft.
- "Install shadcn / tailwind / react" → this skill's `design_library`
  and `design_library`.
- "Build this in Mantine / daisyUI / Base UI" → designer-ui, which routes to
  the `design_kit_* (kit: "mantine")`, `design_kit_* (kit: "daisyui")`, or `design_kit_* (kit: "baseui")` tools.
- "Imitate this product's design language" → the `design_search / design_get` tools for
  the Refero Styles profile of that site.
- "What skills do I have for documents?" → walk the directory above and
  report the five skills and their sub-skills with install status.
