# Catalog Tool Workflows

Quick task-to-tool routing over the **17 consolidated `design_*` tools** ([mcp-tools.md](mcp-tools.md)).

## Design Systems & Refero Styles

- **Visual direction / inspiration:** `design_search` (`query`, optional `source`, `theme`, `hue`, `ground`, `industry`, `mood`, `surface`, `limit`), then `design_get` (`identifier`, `include: "style"` for the domain-matched Refero Style deep profile, or `include: "markdown"` for `DESIGN.md`).
- **Imitate a specific product (Cursor, Linear, Notion...):** `design_search` with `source: "style"` and `query`, then `design_get` (`identifier: "designer:style:<uuid>"` or `source: "style"`).
- **OpenDesign / Claude Design package files:** `design_get` lists `files[]` / `claudeFiles[]`; `design_file` (`kind: "opendesign"` | `"claude"`) reads one file.
- **Filter distributions:** `design_facets` returns counts for themes, sources, hues, grounds, industries, moods, surfaces, and fonts.

## UI Kits & Components

- **Discover kits:** `design_kit_list` (no `kit`) lists all 24+ kits (`heroui`, `mantine`, `daisyui`, `baseui`, `ui-sdk`, `gradientdeck`, `reui`, `hyperui`, `shadcn`, `slopstrap`, plus 16 `uikits`). Pass `kit` to page items (default 40).
- **Search across or inside kits:** `design_kit_search` (`query`, optional `kit`, `kind`, `section`, `limit`; accepts aliases like `magic-ui`, `21st-dev`, `ui-sdk`).
- **Read docs / guides (with `outline` & `section`):** `design_kit_docs` (`kit`: `ui-sdk` | `heroui` | `baseui` | uikit id, `item`, `kind`: `component` | `guide` | `migration`). Pass `outline: true` first on large docs, then `section: "<heading>"`.
- **Read component source / CSS / theme:** `design_kit_code` (`kit`: `gradientdeck` | `heroui` | `mantine` | `daisyui` | `reui` | `hyperui` | `shadcn` | uikit id, `item`, `variant?`, `path?`, `kind?`: `source` | `styles` | `theme`).

## Presets, Templates, Dashboards, Assets & Picks

- **Backgrounds / gradients / glass:** `design_preset` (`query`, `kind`), then `design_preset` with `kind` + `ids`.
- **Vendored templates:** `design_template` (no `slug` → list; `slug` → get; `manifest: true` → blank/preset manifest), then `design_file` (`kind: "template"`).
- **Parse / manifest / validate `DESIGN.md`:** `design_markdown_check` (`mode`: `parse` | `manifest` | `validate`, `identifier` or `content`), and `design_markdown_render` to render a draft.
- **Libraries & offline CDN:** `design_library` (search or get by `id`), `design_assets` (`view`: `summary` | `packages` | `importmap`).
- **Admin dashboards:** `design_dashboards` (`kind`, `query` to list/search; `kind` + `id` + optional `path` to read).
- **Gallery picks:** `design_picks` (`action: "list"`, `resolve: true`) and `design_resolve` (`ref: "designer:..."`).
