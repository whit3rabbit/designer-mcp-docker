---
name: pages
description: >-
  Dashboard information architecture, navigation IR, vertical page recipes, app shells,
  and AI surfaces (designer-dashboards:pages). Generates typed navigation.config.ts, derived
  breadcrumbs/titles, 16 industry-vertical dashboards (with colocated *.charts.ts presets),
  11 app shells (list-detail, board, stream, full-canvas, pos, map-split, docs-toc,
  workspace-rail, affix-form, masonry, resizable-split), print invoices, and an always-on
  AI assistant side panel. Use when adding dashboard pages, navigation config, app shells,
  or vertical dashboards (analytics, CRM, POS, mail, kanban, finance, helpdesk, real-estate).
---

# `designer-dashboards:pages` — Nav IR, Vertical Dashboards & App Shells

Use this skill when adding dashboard pages, structuring navigation, composing industry verticals, or adding app modules (mail, chat, kanban, calendar, invoices, AI assistant).

Consult [02-navigation-and-layout.md](../references/02-navigation-and-layout.md), [10-navigation-examples-and-patterns.md](../references/10-navigation-examples-and-patterns.md), and [07-state-data-ai.md](../references/07-state-data-ai.md).

## Step 1: Update the Primary Nav IR (`navigation.config.ts`)

Every new page or app starts in `src/configs/navigation.config.ts` (conforming to [nav-ir.schema.json](../templates/starters/nav-ir.schema.json); canonical exemplar shipped at `templates/components/react/configs/navigation.config.ts`):
- Provide `key`, `title`, `translateKey`, `icon` (string registry key), `path`, `type` (`title | group | collapse | item`), optional `badge`, `authority`, `pinned` (static quick-access), `pinnable` (user-toggleable bookmark), `bottom` (bottom-of-sidebar zone), `activeUrl`, `activeOptions`, `quickCreate`, `collapseLimit`, and `meta` (`container`, `horizontalMenu`, `megaMenu`, `horizontalMenuLayout`, `layout`, `hideHeader`, `hideFooter`, `promoSlot`).
- Render with the shipped components for your stack (`react`, `vue`, `angular`, or `agnostic`): `NavMenu` (vertical sidebar + collapsed rail flyouts), `HorizontalNav` (dropdowns, `meta.megaMenu` columns/tabs, overflow "More" menu), `AppShell` (composes both, plus mobile drawer, two-column, hover, frameless, content-overlay, and compact-topbar modes). Generate via `node <designer-dashboards-root>/scripts/generate.mjs nav --framework <react|vue|angular|agnostic> --out <project>` and `layout --framework <...> --out <project>`. Never duplicate the tree for a second layout.
- Derive routes, lazy boundaries, breadcrumbs, `<title>`, and page headers from `navigation.config.ts` via `useMenu()`; never author separate route/breadcrumb trees.
- Add matching translation keys to `locales/{en,es,fr,de,ar}.json` immediately. `verify-dashboard.mjs` fails if an item's `translateKey` is missing from `en.json` or a `type: 'item'` entry has no `path`.

## Step 2: Compose Vertical Dashboards Over the One Recipe

Load a premade vertical recipe from `templates/verticals/` (`analytics`, `ecommerce`, `crm`, `ai-ops`, `crypto`, `saas-projects`, `pos`, `hrm`, `lms`, `logistics`, `medical`, `finance`, `helpdesk`, `real-estate`, `social-media`, `nft-gaming`) via `node <designer-dashboards-root>/scripts/generate.mjs vertical <slug> --framework <react|vue|angular> --out <project>` (which also emits colocated `<slug>.charts.ts` using `getChartPreset()`, wires `<FilterBar>` `dateRange` + `<RegionMap>`, and wraps `rightRail` verticals in `<WorkspaceRailShell>`) or compose using the 12-column page recipe (`gap-6`, `@container` widget shells, `2xl`/`3xl` density breakpoints, 6–10 widgets max):
1. **Derived Page Header:** Breadcrumb + Title/Description + Date-Range Filter + Primary Action.
2. **KPI Row:** 3–4 `<KpiCard>` widgets (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`).
3. **Chart Row:** 2-up (`8+4` or `7+5` split) pairing trend chart + composition donut or side-column activity/timeline feed.
4. **Full-Width Block:** Server-mode `<DataGrid>`, Activity `<Timeline>`, or `<RegionMap>` (`col-span-12`).

## Step 3: Build App Pages & Packaging Pages

Isolate each app under `src/apps/<name>/{routes.ts, data/{model.ts, mock.ts, service.ts}, store/<name>Store.ts, features/}` and generate via `<designer-dashboards-root>/scripts/generate.mjs`:
- **Production-Shaped Data Layer (`generate.mjs data-layer <name> --framework <react|vue|angular> --out <project>`):** Emits typed `model.ts`, `mock.ts`, `service.ts` (over `httpClient` + `DATA_MODE=mock|live`), `routes.ts`, and scoped Zustand/Pinia/Signals store (`<name>Store.ts`) so zero mock arrays live inside UI components.
- **Multi-Framework App Shells (`generate.mjs app-shell <kind> --framework <react|vue|angular|agnostic> --name <app> --out <project>`):**
  - **List–Detail Shell** (`list-detail`): Mail, File Manager, Orders, Invoices (2-, 3-, or 4-pane responsive split + optional right `inspector` + `fixedHeight` viewport lock).
  - **Board Shell** (`board`): Kanban / Deals Pipeline (columns + cards + pointer DnD AND keyboard move controls).
  - **Threaded Stream Shell** (`stream`): Team Chat, AI Chat (`/apps/ai-chat`), Activity Logs (conversation list + stream + sticky composer + optional right `inspector` + `fixedHeight`).
  - **Full-Canvas Shell** (`full-canvas`): Calendar (`FullCalendar`), Tabbed Settings (`Profile | Security | Notifications | Billing | Roles`).
  - **Extended Shells (`pos`, `map-split`, `docs-toc`, `workspace-rail`, `affix-form`, `masonry`, `resizable-split`):** Point of Sale (`PosSplitShell`), Fleet/Property Map Split (`MapSplitShell`), 3-Column Docs + ScrollSpy TOC (`DocsTocShell`), 9+3 Asymmetric Dashboard + Right Rail (`WorkspaceRailShell`), Sticky Section Nav Form (`AffixFormShell`), CSS Multi-Column Masonry (`MasonryGridShell`), and Keyboard/Pointer Split-Pane (`ResizableSplitShell`).
- **On-Demand Pages (`generate.mjs page <kind> --framework <react|vue|angular> --out <project>`):** `invoice` (print-ready A4 `@media print` in `styles.css`, paired with `templates/emails/invoice-receipt.html`), `orders`, `catalog`, `checkout`, `blog`, `gallery`, `chat`, `help-center`, `timeline`, `status` (`maintenance | coming-soon | system-status`), `integrations`, `notes`, `directory`, `settings`, `wizard`, `error` (`401/403/404/500`), `landing` (`(marketing)` route group with Pricing/FAQ), `form-inputs`, `form-layouts`, `form-validation`, `ai-chat`, `roles`, `calendar`, `docs` (`/guide`), `mail`, `file-manager`, `kanban`, `pos`, `pricing`, `profile`, `api-keys`, `charts-gallery`.
- **AI Surfaces & Assistant Chrome (Optional):**
  - **Assistant Chrome:** Wire one root `aiStore` / `AIProvider` (server env-key + deterministic mock `ReadableStream` fallback) powering BOTH `/apps/ai-chat` (date-grouped thread sidebar, prompt starter cards, model selector, `AbortController` Stop, `streamdown`/sanitized markdown) AND an always-on `<AiAssistantDrawer>` (or floating FAB) with `aria-live="polite"` streaming and `"Open in full chat"` handoff.
  - **Embedded Vertical AI & Suites:** Add contextual `AI Summary` / `Ask AI` / `AI Insights` cards to vertical dashboards (`ai-ops`, `analytics`, `finance`, `saas-projects`), a DataGrid NLQ filter bar, or optional **AI Copywriter** (quota KPIs + template library + split-pane `Tiptap` writer) and **Multi-Modal Generator** (text/code/image with parameter controls + selectable multi-output grid) pages.

## Step 4: Verify Layout & Responsiveness

1. Confirm sidebar collapses to an offcanvas drawer below `1024px`, header condenses cleanly on mobile, and KPI rows stack `4 -> 2 -> 1`.
2. Confirm `data-layout` (`vertical | collapsed | hover | horizontal | two-column | frameless | content-overlay | compact-topbar | sidebarless`), `data-navbar-style` (`attached | floating | detached | blur`), `data-layout-position` (`fixed | scrollable`), and `data-content-width` (`fluid | boxed | narrow`, with per-page `NavItem.meta.container` / `meta.layout` overrides) work via CSS attributes without duplicating page views.
3. Run `node <designer-dashboards-root>/scripts/lint-nav.mjs <project>` (and `node <designer-dashboards-root>/scripts/verify-dashboard.mjs <project>`, which invokes it automatically) to validate `navigation.config.ts` (unique keys, string icons, `item` -> `path`), modern web rules (`popover`, `position-area`, `allow-discrete`), locale keys, and token adherence.
