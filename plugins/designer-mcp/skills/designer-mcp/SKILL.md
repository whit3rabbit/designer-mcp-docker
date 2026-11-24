---
name: designer-mcp
description: "Install, register, and troubleshoot the offline designer-mcp server and route to sibling plugin skills."
---

# Designer MCP: Setup & Concierge

The `design_*` MCP server (`scripts/mcp-server.mjs`) runs 100% offline over the baked local cache (or against a hosted static site via `DESIGN_REMOTE_URL` / `--url`). Neither server listens on a port; both speak stdio JSON-RPC.

- **Plugin install:** `.mcp.json` registers the `designer` server automatically, pinned to the matching image tag.
- **Manual / standalone install:** Copy-paste snippets for 24 agent harnesses (Docker and local-checkout variants) live in [install/README.md](install/README.md).
- **Missing tool error:** A hand-pinned `:latest` Docker tag does not auto-update. Run `docker pull ghcr.io/whit3rabbit/designer-mcp:latest` and restart your client. Do not fabricate tool output.
- **Token-saving options:** Pass `--toolsets core,kits` (or `DESIGN_TOOLSETS`) to expose a subset of tools, and use `outline: true` + `section` on `design_kit_docs` / `design_get` (`include: "markdown"`) to avoid paging huge docs. Pass `--legacy-tools` only if an older workflow requires the 50 pre-v2 tool names.

## Sibling Skills Router

Check [references/skill-directory.md](references/skill-directory.md) for install commands and trigger phrases when a sibling skill is missing.

| Task | Skill |
|---|---|
| Design systems, `DESIGN.md` capture, visual research, QA | [design-system](../design-system/SKILL.md) |
| Multi-framework admin dashboard, SaaS console, internal tool | [designer-dashboards](../designer-dashboards/SKILL.md) |
| Word (`.docx`), PowerPoint (`.pptx`), Excel (`.xlsx`), or PDF | [designer-documents](../designer-documents/SKILL.md) |
| Frontend UI craft, `@ui-sdk/*`, HeroUI v3 | [designer-ui](../designer-ui/SKILL.md) |

## References

- [references/mcp-tools.md](references/mcp-tools.md) — All 17 `design_*` tools, arguments, toolsets, and `outline`/`section` paging
- [references/catalog-tools.md](references/catalog-tools.md) — Quick task-to-tool routing recipes
- [references/refero-legacy.md](references/refero-legacy.md) — Legacy `refero_*` server (`scripts/mcp-entry.mjs`)
- [references/library-setup.md](references/library-setup.md) — Installing libraries and offline CDN assets
- [references/skill-directory.md](references/skill-directory.md) — Full plugin skill catalog and install commands
