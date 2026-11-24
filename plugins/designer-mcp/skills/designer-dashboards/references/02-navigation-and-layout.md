# Reference 02: Navigation IR, Layout Chrome & Page Composition

Distilled from 17 commercial dashboard templates. For concrete code patterns, latest Web Platform CSS/JS (`popover="auto"`, CSS Anchor Positioning, `<dialog>` scroll-snap drawers, `@starting-style`), and anti-patterns, see [10-navigation-examples-and-patterns.md](10-navigation-examples-and-patterns.md).

## Contents

- [1. Unified Navigation Schema (Primary IR)](#1-unified-navigation-schema-primary-ir)
- [2. Sidebar & Shell Magic Numbers & Breakpoints](#2-sidebar--shell-magic-numbers--breakpoints)
- [3. Attribute-Driven Layout State Machine](#3-attribute-driven-layout-state-machine)
- [4. Standard Dashboard Page Recipe & Shell Chrome](#4-standard-dashboard-page-recipe--shell-chrome)
- [5. App Shells (Non-Dashboard Pages)](#5-app-shells-non-dashboard-pages)
- [6. Print & Invoices](#6-print--invoices)

## 1. Unified Navigation Schema (Primary IR)

One typed navigation config drives sidebar, horizontal nav, mega-menu, breadcrumbs, page title, `<title>`, i18n lookup, `Cmd+K` search index, and RBAC route filtering. Never author separate vertical/horizontal/route/breadcrumb trees:

```ts
export type NavItemType = 'group' | 'title' | 'item' | 'collapse';

export interface NavItem {
  key: string;                                  // Unique stable ID (breadcrumb anchor + aria)
  title: string;                                // Fallback label
  translateKey: string;                         // i18n key from day one (e.g. "nav.analytics")
  icon?: string;                                // String key resolved via IconRegistry (never JSX)
  path?: string;                                // Route href (required on type 'item')
  type: NavItemType;                            // 'title' | 'group' | 'collapse' | 'item'
  children?: NavItem[];                         // Recursive up to 3 levels recommended (5 max)
  badge?: {
    value: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
  authority?: string[];                         // RBAC roles — filters BOTH menu & routes
  description?: string;                         // Tooltip / page header subtitle / directory card
  disabled?: boolean;
  expanded?: boolean;                           // Initial open state of a collapse group
  pinned?: boolean;                             // Static quick-access item
  pinnable?: boolean;                           // User-toggleable bookmark/shortcut
  bottom?: boolean;                             // Bottom-of-sidebar zone (settings/logout)
  isExternalLink?: boolean;
  activeUrl?: string;                           // Base prefix for dynamic detail routes (/orders/details/:id)
  activeOptions?: { exact?: boolean; queryParams?: 'exact' | 'ignored' };
  quickCreate?: { tooltip: string; path: string }; // Inline `+` quick-create action
  collapseLimit?: number;                       // Inline "Show N more / Show less" truncation
  meta?: {
    horizontalMenu?: boolean;                   // false hides from horizontal navbar
    megaMenu?: boolean;                         // Horizontal navbar renders children as columns
    horizontalMenuLayout?: 'dropdown' | 'columns' | 'tabs' | 'thumbnail-grid';
    layout?: LayoutMode;                        // Ephemeral per-route layout override
    container?: 'fluid' | 'boxed';              // Per-page width override
    hideHeader?: boolean;
    hideFooter?: boolean;
    promoSlot?: boolean;                        // Optional panel footer CTA/version slot
  };
}
```

### Derived Helpers (`useMenu`)
Shipped in `templates/components/{react,vue,angular}/menu/useMenu.ts`:
- `isNavActive(item, pathname)`: prefix match by default (using `item.activeUrl ?? item.path`), `activeOptions.exact` forces exact match; emits `aria-current="page"`.
- `isNavSubtreeActive(item, pathname)`: item or any descendant is active; highlights dropdown triggers, horizontal tabs, and two-column rails.
- `getCurrentNavItem(items, pathname)`: longest/most-specific match wins; drives page header, `document.title`, and `aria-current`.
- `getNavBreadcrumb(items, pathname)`: ancestor chain excluding non-clickable `title` headers, for `<Breadcrumb>`.
- `getNavChildrenAtLevel(items, pathname, level)`: extracts the active subtree at a given depth for secondary contextual navbars.
- `filterNavByAuthority(tree, userRoles)`: prunes unauthorized items and groups left empty; drives `AuthorityGuard` route guards, lazy route tables, and sitemap derivation.
- `resolveLabel(item, t)`: resolves `item.translateKey` via the active i18n translator with `item.title` fallback.
- `getHorizontalNav(tree)`: top-level items where `meta.horizontalMenu !== false` (`title` headers hidden).
- `getNavSearchIndex(tree)`: flat index for the `Cmd+K` `<CommandPalette>` (supports tabbed category filtering).
- `getPinnedNavItems(tree)`: leaf items flagged `pinned: true` (or user-bookmarked `pinnable` IDs in `localStorage`) for the sidebar/topbar quick-access section; auto-hide section `title` headers when all children are pinned (`shouldHideNavSection`).

### Horizontal Nav Overflow & Directory Pages
- **Overflow `"More"` Menu & Edge Flip:** Measure horizontal nav items against container width on mount/resize; move overflowing top-level items into a `"More"` (`...`) dropdown or provide scroll arrows, and flip submenus with `.edge` when near `window.innerWidth`.
- **Auto-Generated Category Listing Pages:** Intermediate parent routes (`/ui`, `/pages`, `/apps`) can render a searchable 3-column card grid directly from `currentItem.children` using `title`, `description`, and `icon`.

### Multi-Library Renderer & Generator Parity
| Stack | Nav & Shell Templates | Generator Command |
|---|---|---|
| **React / Next.js** | `templates/components/react/{configs,menu,layouts}/` (`NavMenu.tsx`, `HorizontalNav.tsx`, `AppShell.tsx`, `AppShells.tsx`) | `node <designer-dashboards-root>/scripts/generate.mjs nav --framework react` |
| **Vue 3 + Pinia** | `templates/components/vue/{menu,layouts,theme}/` (`NavMenu.vue`, `HorizontalNav.vue`, `AppShell.vue`, `AppShells.vue`, `themeStore.ts`) | `node <designer-dashboards-root>/scripts/generate.mjs nav --framework vue` |
| **Angular 22+ Signals** | `templates/components/angular/{menu,layouts,theme}/` (`nav-menu.component.ts`, `horizontal-nav.component.ts`, `app-shell.component.ts`, `theme.service.ts`) | `node <designer-dashboards-root>/scripts/generate.mjs nav --framework angular` |
| **Agnostic HTML / Tailwind / SSR** | `templates/components/agnostic/` (`app-shell.html`, `app-shells.html`) | `node <designer-dashboards-root>/scripts/generate.mjs layout --framework agnostic` |
| **Schema Validation** | `templates/starters/nav-ir.schema.json` (`type: 'item'` requires `path`) | `node <designer-dashboards-root>/scripts/verify-dashboard.mjs <project>` |

## 2. Sidebar & Shell Magic Numbers & Breakpoints

| Dimension | Consensus Value | CSS Token |
|---|---|---|
| Expanded sidebar width | `260px`–`280px` (default `272px`) | `--sidebar-width` |
| Compact stacked-icon sidebar | `175px`–`180px` | `--sidebar-compact-width` |
| Collapsed icon rail | `72px`–`80px` (default `76px`) | `--sidebar-collapsed-width` |
| Two-column rail + panel | `72px`–`80px` rail + `220px`–`248px` panel | `--sidebar-rail-width` / `--sidebar-panel-width` |
| Topbar height | `64px` (mobile `56px`–`60px`; sticky-shrink `100px -> 60px` optional) | `--header-height` |
| Boxed / Narrow max width | `1360px`–`1440px` (`narrow: 90%` optional) | `--content-max-width` |
| 3-Tier Responsive Breakpoints | Desktop `>= 1200px` (expanded) -> Tablet `768px`–`1199px` (auto-rail + tooltips) -> Mobile `< 768px` or `< 1024px` (offcanvas drawer) | `--bp-drawer` |
| Ultra-wide density scaling | `2xl` (`1536px`) / `3xl` (`1600px`–`1650px`) | `--bp-3xl` |
| Collapse transition | `240ms cubic-bezier(0.2, 0, 0, 1)` (strip transition briefly on resize to avoid jank) | `--transition-layout` |

## 3. Attribute-Driven Layout State Machine

Never couple layout modes to framework conditional spaghetti. Mirror a single `Settings` store onto `<html>` attributes so CSS handles layout geometry (and wrap Radix/MUI apps in `<DirectionProvider dir={dir}>` / `stylis-plugin-rtl` for RTL parity):
- `data-theme="light|dark"` (with FOUC-free inline pre-paint script in `<head>`)
- `data-layout="vertical|collapsed|hover|horizontal|two-column|frameless|content-overlay|compact-topbar|sidebarless"`
  - `hover`: 76px icon rail that expands on `:hover` with a pin toggle (`hover-active`).
  - `frameless`: dark/mono outer frame with inset `rounded-2xl` scrollable content card.
  - `content-overlay`: transparent-to-sticky header over a `320px–400px` gradient hero banner with negative-margin overlapping container.
  - `compact-topbar`: single-row merged brand + inline nav + utilities `64px` bar.
  - `sidebarless`: focus mode hiding sidebar/rail for embedded or distraction-free views.
- `data-navbar-style="attached|floating|detached|blur|transparent"`
- `data-layout-position="fixed|scrollable"`
- `data-content-width="fluid|boxed|narrow"`
- `data-sidebar-skin="light|dark|brand|gradient"` (with optional `semiDark`: dark sidebar on light canvas)
- `data-card-style="elevated|bordered|flat"`
- `dir="ltr|rtl"`

**Ephemeral Per-Page Overrides:** Support `updatePageSettings(partial)` / `NavItem.meta.layout` so marketing/front-pages or dense apps can temporarily override `layout`, `contentWidth`, or `mode` on mount and restore `previousType` on unmount without mutating the user's persisted cookie/`localStorage`.

## 4. Standard Dashboard Page Recipe & Shell Chrome

Every vertical dashboard composes widgets over one 12-column grid (`gap: 24px`, 6–10 widgets max, `@container` widget shells, and `2xl`/`3xl` density-scaling breakpoints):
1. **Derived Page Header:** Breadcrumb + Title/Description (left) + Date-Range Filter + optional Header Tabs (`Overview | Analytics`) + Primary Action button (right).
2. **KPI Row:** 3–4 equal-width stat cards (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`), each with title, value, delta, optional sparkline, and action dropdown.
3. **Primary Chart Row:** 2-up split (`8+4` or `7+5` or `6+6` columns) pairing trend chart + composition donut or side-column feed (top performers, activity timeline, notifications).
4. **Secondary / Full-Width Block:** Server-mode DataGrid, Activity Timeline, or Geographic Map (`col-span-12`).
5. **Shell Route Groups & App Isolation:** `(dashboard)/(private)` (full chrome + auth guard), `(auth)/(guest-only)` (basic/split/cover/modern shell), and optional `(marketing)` / `front-pages` (public landing/pricing). Root `/` redirects to the default dashboard (or `/login` if unauthenticated). Isolate complex apps under `src/apps/{name}/{routes.ts, data/{model.ts, service.ts}, features/}`.
6. **Shell Chrome Utilities:** Top scroll-progress bar + Back-to-Top FAB, route-transition top progress bar, topbar Quick-Shortcuts / Apps popover, `<WidgetCard>` fullscreen/pin/collapse controls, and `<BottomStickyBar>` for Create/Edit forms.

## 5. App Shells (Non-Dashboard Pages)

| Shell | Use Cases | Anatomy |
|---|---|---|
| **List–Detail** (2-, 3-, or 4-pane) | Mail, File Manager, Orders, Invoices, Todo | Optional `50px` utility rail + folder nav + scrollable list + detail reader + optional `320px` right context/storage inspector + mobile back/drawer nav |
| **Board** (+ End-Drawer Hybrid) | Kanban, Pipeline/Deals, Sprint tasks | Horizontal scrollable columns + drag-handle cards + add-card + keyboard move controls + optional URL-synced slide-over detail drawer |
| **Threaded Stream** | Team Chat, AI Chat, Activity Logs, Notes | Conversation sidebar + message stream + sticky-bottom composer + optional collapsible right profile/media drawer (`.nk-chat-profile`) |
| **Full-Canvas** | Calendar, Tabbed Settings, Profile | Action toolbar + calendar grid (with external draggable event palette) or tabbed form panel (collapsing to `<select>` below `640px`; card-level `card-aside-wrap` optional) |
| **Viewport-Locked (`100dvh`)** | Dense Chat, Kanban, Mail, Fleet | `:has(.rd-shell-fixed)` locks `<main>` to `100dvh` with internal scroll panes |
| **Map + List Split-Pane** | Fleet, Logistics, Real-Estate | Full-height map canvas + collapsible vehicle/listing accordion sidebar |
| **Point of Sale (POS)** | Retail, Restaurant, Kiosk | Category-filtered catalog grid + live order ticket/cart calculator sidebar |
| **AI Generator / Doc Editor** | Text/Code/Image AI, Copywriter | Tabbed prompt/parameters/history sidebar + streamed output / rich-text canvas |
| **3-Column Docs + ScrollSpy** | Developer Docs, Knowledge Base | Sticky left nav sidebar + center article + sticky right "On this page" ScrollSpy TOC |

## 6. Print & Invoices
Generate invoice/report list + detail pages paired with transactional email receipts (`templates/emails/invoice-receipt.html`) and `@media print` rules compiled into `design-system/styles.css`: hide sidebar/topbar/action buttons (`.print:hidden` / `.no-print`), remove shadows, enforce `@page { size: A4; margin: 12mm; }`, and keep `thead { display: table-header-group; }` repeating across pages. For component-scoped printing in React/Next.js, `useReactToPrint` (`contentRef`) is an acceptable alternative; never swap `document.body.innerHTML` imperatively.
