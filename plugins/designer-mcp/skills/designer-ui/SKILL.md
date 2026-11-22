---
name: designer-ui
description: "UI craft (frontend-design) and @ui-sdk/* behavior and accessibility docs (ui-sdk). Use when building or restyling UI."
---

# Designer UI

Two bundled sub-skills, one job each:

| Need | Sub-skill |
|---|---|
| Distinctive, intentional visual craft for web UI: aesthetic direction, typography, color, layout, motion restraint, interface copy that avoids templated AI defaults | [frontend-design/SKILL.md](frontend-design/SKILL.md) |
| Headless behavior and accessibility primitives for `@ui-sdk/core`, `@ui-sdk/react`, `@ui-sdk/web`, searchable offline via `design_docs_search` / `design_docs_get` | [ui-sdk/SKILL.md](ui-sdk/SKILL.md) |

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

Neither sub-skill needs extra dependencies. frontend-design is pure craft
guidance, and ui-sdk reads its offline docs through the `design_docs_*` MCP
tools.
