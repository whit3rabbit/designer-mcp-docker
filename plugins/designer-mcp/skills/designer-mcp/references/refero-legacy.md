# Upstream `refero_*` MCP Server (Legacy / Optional)

`scripts/mcp-entry.mjs` wraps `fidgetcoding-refero-mcp` and exposes 7 `refero_*` tools over the cached Refero styles (1,342 entries). Prefer the `design_*` server (`scripts/mcp-server.mjs`), which covers Refero styles, Refero Styles deep profiles, OpenDesign, templates, UI kits, presets, libraries, dashboards, and picks 100% offline.

## Official Refero MCP vs Local Cache

| Layer | Official tools | Local `mcp-entry.mjs` |
|---|---|---|
| Styles | `refero_search_styles`, `refero_get_style` | `refero_search`, `refero_get`, `refero_design_md`, `refero_list`, `refero_facets` |
| Screens | `refero_search_screens`, `refero_get_screen` | Not available (requires paid Refero API) |
| Flows | `refero_search_flows`, `refero_get_flow` | Not available (requires paid Refero API) |

## Tools (`refero_*`)

| Tool | Parameters | Notes |
|---|---|---|
| `refero_search` | `query`, `theme?`, `tags?`, `limit?` | Natural-language/keyword search over 1,342 Refero styles. |
| `refero_get` | `identifier` | Full style record by UUID, site name, or URL. |
| `refero_design_md` | `identifier` | Render the Refero `DESIGN.md` for one style. |
| `refero_list` | `limit?`, `offset?`, `theme?`, `industry?` | Page through cached Refero styles. |
| `refero_facets` | — | Theme, industry, and font distributions. |
| `refero_similar` | `identifier`, `limit?` | **Requires network** (`styles.refero.design`). |
| `refero_refresh` | — | **Requires network**; rewrites `catalog.json` with Refero rows only. |
