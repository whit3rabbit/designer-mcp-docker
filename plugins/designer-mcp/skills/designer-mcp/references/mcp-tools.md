# Designer MCP Tools Reference

`scripts/mcp-server.mjs` exposes **17 `design_*` tools** over the offline local cache (or a hosted static site via `DESIGN_REMOTE_URL` / `--url`).

For the upstream `refero_*` server (`scripts/mcp-entry.mjs`), see [refero-legacy.md](refero-legacy.md).

## Runtime Options

- **Toolset filtering (`--toolsets` / `DESIGN_TOOLSETS`):** Enable only specific toolsets to shrink `tools/list`:
  - `core` (`design_search`, `design_facets`, `design_get`, `design_file`, `design_template`, `design_markdown_check`, `design_markdown_render`)
  - `kits` (`design_kit_list`, `design_kit_search`, `design_kit_docs`, `design_kit_code`)
  - `extras` (`design_preset`, `design_library`, `design_assets`)
  - `dashboards` (`design_dashboards`)
  - `picks` (`design_picks`, `design_resolve`)
- **Legacy compatibility (`--legacy-tools` / `DESIGN_LEGACY_TOOLS=1`):** Re-exposes the 50 pre-v2 granular `design_*` tool names alongside the 17 consolidated tools.
- **Heading-based doc navigation (`outline` & `section`):** On `design_get` (`include: "markdown"`) and `design_kit_docs`, pass `outline: true` to list headings with byte offsets, then `section: "<heading>"` to read a single section instead of paging a 100–380 KB doc.
- **Reply size limit:** Default 120,000 bytes (`DESIGN_MCP_MAX_RESPONSE_BYTES`). Large text/file replies page via `offset` and `maxBytes` (default 40,000, max 100,000).

---

## Design Systems & Refero Styles (7 tools)

### `design_search`
Search or browse design systems across Refero (1,342), Refero Styles (788), OpenDesign (198), and System Templates (7). Omit `query` to list/filter.
- `query?`, `source?` (`all` | `refero` | `opendesign` | `style` | `template`), `theme?` (`light` | `dark` | `mixed`), `hue?`, `ground?`, `industry?`, `mood?`, `surface?`, `offset?`, `limit?` (1–100), `detail?` (`summary` | `full`).
- Summary rows omit external `thumbnailUrl`/`screenshotUrl` unless `detail: "full"`.

### `design_facets`
Return distributions for `themes`, `sources`, `hues`, `grounds`, `industries`, `moods`, `surfaces`, and `fonts`.

### `design_get`
Resolve one design system or Refero Style by `identifier` (`designer:<source>:<id>`, UUID, slug, hostname, or site name).
- `identifier` (required), `source?` (`refero` | `opendesign` | `style`), `include?` (`summary` | `style` | `markdown` | `full`), `detail?`, `outline?`, `section?`, `offset?`, `maxBytes?`.
- `include: "style"` attaches the domain-matched Refero Style deep profile (named tokens, component CSS recipes, dos/donts). `include: "markdown"` returns `DESIGN.md` with `outline`/`section` support.

### `design_file`
Read one file from an OpenDesign package, Claude Design export, or vendored template.
- `kind` (`opendesign` | `claude` | `template`), `identifier` (required), `path` (required), `offset?`, `maxBytes?`.

### `design_template`
List the 7 vendored design-system templates, get one by `slug` (omits duplicate `manifest` unless `detail: "full"`), or generate a blank/preset-filled manifest (`manifest: true`, `name?`, `preset?`).
- `slug?`, `query?`, `limit?`, `detail?`, `manifest?`, `name?`, `preset?`.

### `design_markdown_check`
Parse, extract a normalized manifest from, or validate a `DESIGN.md` document. Pass **either** `identifier` or `content` (plus optional `css` or `tokens`).
- `mode?` (`parse` | `manifest` | `validate`, default `parse`), `identifier?`, `content?`, `source?`, `css?`, `tokens?`, `slug?`, `name?`, `observed?`, `required?`.

### `design_markdown_render`
Render a `DESIGN.md` draft from `name` (required), `tokens?`, and `body?`.

---

## UI Kits & Components (4 tools)

### `design_kit_list`
List all 24+ UI kits and component libraries, or page items inside one `kit` (`offset`, `limit` default 40, max 500).
- Kits: `heroui`, `mantine`, `daisyui`, `baseui`, `ui-sdk`, `gradientdeck`, `reui`, `hyperui`, `shadcn`, `slopstrap`, plus 16 `uikits` (`chakra`, `mui`, `antd`, `primereact`, `coss`, `magicui`, `motion`, `unocss`, `panda`, `vanilla-extract`, `stylex`, `openprops`, `ark`, `reactbits`, `aceternity`, `twentyfirst`).

### `design_kit_search`
Search components, guides, and docs across all kits or within one `kit` (accepts aliases like `magic-ui`, `21st-dev`, `open-props`, `ui-sdk`).
- `query?`, `kit?`, `kind?` (`component` | `guide` | `topic` | `tokens` | `index`), `section?`, `limit?`.

### `design_kit_docs`
Read offline component docs, guides, or migration guides for `ui-sdk`, `heroui`, `baseui`, or any `uikit`. Supports `outline: true` and `section: "<heading>"`.
- `kit` (required), `item` (required), `kind?` (`component` | `guide` | `migration`), `outline?`, `section?`, `offset?`, `maxBytes?`.

### `design_kit_code`
Read component source, CSS, or theme variables for `gradientdeck`, `heroui`, `mantine`, `daisyui`, `reui`, `hyperui`, `shadcn`, or any `uikit`.
- `kit` (required), `item` (required), `variant?`, `path?`, `kind?` (`source` | `styles` | `theme`), `detail?`, `offset?`, `maxBytes?`.

---

## Presets, Libraries, Assets, Dashboards & Picks (6 tools)

### `design_preset`
Search background patterns, gradients, and liquid-glass presets (`query?`, `kind?`, `limit?`), or fetch their CSS by `kind` + `ids`.

### `design_library`
Search vendored library install manifests (`query?`, `limit?`), or fetch one by `id` (`react`, `tailwind`, `shadcn`, `radix-ui`, `lucide`, `heroicons`, `motion`, etc.) for install steps and setup files.

### `design_assets`
Inspect built offline frontend CDN assets: `view: "summary"` (default, omits 200+ transitive packages), `"packages"` (full list), or `"importmap"`.

### `design_dashboards`
List/search offline `designer-dashboards` artifacts (`kind`: `all` | `stacks` | `starters` | `presets` | `verticals` | `frameworks` | `references` | `subskills`, `query?`, `limit?`) or read one (`kind` + `id` + optional `path`, `offset?`, `maxBytes?`).

### `design_picks`
Read or manage the user's queued gallery picks (`action`: `list` | `add` | `remove` | `clear`, `ref?`, `label?`, `note?`, `resolve?`). Reads from `DESIGN_GALLERY_URL/api/picks` or `DESIGN_PICKS_FILE`. Also exposed as MCP resource `designer://picks`.

### `design_resolve`
Resolve any canonical `designer:<kind>:<id>` URI into a compact structured summary + `nextTools` hints.
