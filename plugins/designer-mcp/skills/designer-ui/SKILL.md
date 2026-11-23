---
name: designer-ui
description: "UI craft (frontend-design), @ui-sdk/* behavior and accessibility docs (ui-sdk), HeroUI v3 (heroui), and Mantine, daisyUI, Base UI routing. Use when building or restyling UI."
---

# Designer UI

Bundled sub-skills, one job each:

| Need | Sub-skill |
|---|---|
| Distinctive, intentional visual craft for web UI: aesthetic direction, typography, color, layout, motion restraint, interface copy that avoids templated AI defaults | [frontend-design/SKILL.md](frontend-design/SKILL.md) |
| Headless behavior and accessibility primitives for `@ui-sdk/core`, `@ui-sdk/react`, `@ui-sdk/web`, searchable offline via `design_docs_search` / `design_docs_get` | [ui-sdk/SKILL.md](ui-sdk/SKILL.md) |
| HeroUI v3 web components (Tailwind v4 + React Aria): building UIs with `@heroui/react`, offline docs via the `design_heroui_*` tools and bundled scripts | [heroui/heroui-react/SKILL.md](heroui/heroui-react/SKILL.md) |
| Global HeroUI restyling and complete custom themes with CSS only: tokens, BEM overrides, named light/dark themes | [heroui/heroui-theming/SKILL.md](heroui/heroui-theming/SKILL.md) |
| HeroUI Native for React Native (Uniwind): docs come from the project's own install, never the network | [heroui/heroui-native/SKILL.md](heroui/heroui-native/SKILL.md) |
| HeroUI v2 to v3 migrations: workflows, per-component guides, styling and hooks, from the baked layer | [heroui/heroui-migration/SKILL.md](heroui/heroui-migration/SKILL.md) |

## Other UI libraries in the catalog

Three more libraries are baked into the offline catalog. They have MCP tools
and gallery pages but no sub-skill here: the tool replies carry the source
and docs to work from.

| Project uses | Tools | Start with |
|---|---|---|
| Mantine (`@mantine/core`) | `design_mantine_*` | `design_mantine_search`, then `design_mantine_get_component` for the full TSX and CSS module |
| daisyUI 5 (plain HTML classes) | `design_daisyui_*` | `design_daisyui_search`, then `design_daisyui_get_component` for classes and example HTML |
| Base UI (`@base-ui/react`, headless) | `design_baseui_*` | `design_baseui_get_docs` for a component, `design_baseui_get_guide` for the handbook |

Use the library the project already depends on. Tool parameters are in the
designer-mcp skill's
[mcp-tools.md](../designer-mcp/references/mcp-tools.md). If a tool named here
is missing from your client, the MCP image is older than this skill: see the
designer-mcp skill's install notes.

## Authority

This skill is the sanctioned implementation-craft layer and the sanctioned
headless behavior layer of the designer-mcp plugin. It is not a parallel
design authority. The [design-system](../design-system/SKILL.md) skill owns
the research workflow, the reference lock, and every design decision. Run its
research and produce its reference lock first, then execute inside this
skill's craft guidance. Self-critique uses design-system's visual QA pass
rather than a homegrown one.

Route other needs: file deliverables (deck, document, spreadsheet, PDF) go to
the [designer-documents](../designer-documents/SKILL.md) skill, and catalog
references or MCP setup go to the
[designer-mcp](../designer-mcp/SKILL.md) skill.

frontend-design is pure craft guidance. ui-sdk reads its offline docs through
the `design_docs_*` MCP tools. The heroui sub-skills read the baked HeroUI
layer (npm-package docs, per-component CSS, theme variables, TSX source,
migration guides) through the `design_heroui_*` MCP tools and their own
scripts, with no network access. None needs extra dependencies beyond what
its task installs.
