---
name: design-system
description: "Capture pages and documents as DESIGN.md, research an offline design catalog, and verify builds. Use for UI design and themes."
---

# Design System: Research-First Design

Ground every visual decision in real product evidence before implementation—never design from generic vibe memory.

## Start With the User's Source

| User Intent | Workflow | Reference |
|---|---|---|
| **Capture** a webpage or document as `DESIGN.md` + `DESIGN.evidence.json` | Inspect on host, extract tokens, build reproducible package | [references/design-md-workflow.md](references/design-md-workflow.md) |
| **Build from a theme** (`designer:*` ref or supplied `DESIGN.md`) | `design_get` (use `design_file` for `opendesign`/`claude` files), preserve hierarchy | [references/design-md-workflow.md](references/design-md-workflow.md) |
| **Explore / design from scratch** | Research 3–5 angles → synthesize 1 dominant direction → lock target → build | [references/research-playbook.md](references/research-playbook.md) |
| **Visual QA / Verify a build** | Render target, resample applied roles, check coverage & visual fidelity | [references/visual-workflow.md](references/visual-workflow.md) |

> **Scope note:** This offline deployment covers **1,747 `DESIGN.md` systems** (1,342 Refero, 788 Refero Styles deep profiles, 198 OpenDesign, 7 System Templates), UI kits, presets, and library manifests via `design_*` tools ([designer-mcp](../designer-mcp/SKILL.md)). Paid Refero **Screens** and **Flows** are not included—for screen/journey questions, use the craft references below and the user's material, and say so plainly rather than inventing precedent.

## Non-Negotiables

1. **Research before designing.** Ground open-ended work in real styles (`design_search` / `design_get`). If MCP is unavailable, use the craft references below.
2. **One dominant direction.** When references conflict, commit to one primary direction and preserve its sharp traits—never average references into a safe middle.
3. **Preserve token roles & media.** Use colors, fonts, radii, and shadows only for their stated roles. Preserve photography/illustration roles; never fake complex imagery with weak CSS boxes.
4. **Lock before building.** A brief is not a build target—lock a user source, existing system, selected mockup, or explicit reference-locked direction first.
5. **Single design authority.** Do not use generic external design skills as a parallel authority. Use `designer-ui` (`frontend-design`, `ui-sdk`, `heroui-*`) as the implementation-craft layer.
6. **Verify after building.** Compare the rendered output against the locked target before handoff and fix concrete defects.

## Deliverable Routing

| Deliverable | Skill |
|---|---|
| Admin dashboards, SaaS consoles, internal tools | [../designer-dashboards/SKILL.md](../designer-dashboards/SKILL.md) |
| Word documents (`.docx`, `.dotx`) | [../designer-documents/docx/SKILL.md](../designer-documents/docx/SKILL.md) |
| Slide decks (`.pptx`, `.potx`) | [../designer-documents/pptx/SKILL.md](../designer-documents/pptx/SKILL.md) |
| Spreadsheets (`.xlsx`, `.xlsm`, `.csv`) | [../designer-documents/xlsx/SKILL.md](../designer-documents/xlsx/SKILL.md) |
| PDFs (`.pdf`) | [../designer-documents/pdf/SKILL.md](../designer-documents/pdf/SKILL.md) |
| New vendored design-system template | [design-template-authoring/SKILL.md](design-template-authoring/SKILL.md) |
| Web UI craft, `@ui-sdk/*`, HeroUI v3 | [../designer-ui/SKILL.md](../designer-ui/SKILL.md) |

## Craft & Workflow References (Load On Demand)

- **Workflows:** [design-md-workflow.md](references/design-md-workflow.md) · [research-playbook.md](references/research-playbook.md) · [visual-workflow.md](references/visual-workflow.md) · [example-workflow.md](references/example-workflow.md)
- **Craft:** [anti-ai-slop.md](references/anti-ai-slop.md) · [typography.md](references/typography.md) · [color.md](references/color.md) · [craft-details.md](references/craft-details.md) · [motion.md](references/motion.md) · [copywriting.md](references/copywriting.md) · [icons.md](references/icons.md)

## Provenance

Adapted from Refero's MIT-licensed `refero_skill` for offline `design_*` and `refero_*` catalog workflows.
