# Reference 10: Dashboard Navigation Patterns & Modern Web Baselines

Synthesized from audits of 17 commercial dashboard templates and `modern-web-guidance` (current Web Platform baselines).

## Contents

- [1. Navigation Architecture Patterns](#1-navigation-architecture-patterns)
- [2. Standout Concrete Patterns](#2-standout-concrete-patterns)
- [3. Latest CSS / JS & Web Platform Best Practices](#3-latest-css--js--web-platform-best-practices)
- [4. Anti-Patterns to Avoid](#4-anti-patterns-to-avoid)
- [5. Prebuilt Components & Generators in Designer Dashboards](#5-prebuilt-components--generators-in-designer-dashboards)

---

## 1. Navigation Architecture Patterns

Across the 17-template audit, **12 are data-driven** (single config array/tree) and **5 are static/partial HTML**. Every data-driven schema converges on the unified IR in `templates/starters/nav-ir.schema.json`:

| Pattern | Stack | Key Commonalities & Standout Features |
|---|---|---|
| **Twin-Rail + Static HTML** | Gulp + Tailwind + Flowbite | Twin-rail (`72px` rail + `248px` panel via `data-menu`), decoupled topbar collapse trigger, offline Iconify bundle, dark-mode icon sync |
| **Dynamic Pinned Menu** | Angular / Next.js / React | Reactive dynamic menu, `pinned` quick-access + `shouldHideNavSection()`, horizontal arrow scrolling, SVG sprite |
| **Hover-Peek Compact Sidebar** | HTML + SCSS + Bootstrap | Hover-peek without content reflow, `scrollIntoView` on active item, responsive master/detail, collapsible header bar |
| **Typed Config + Dual RBAC** | React + TS + Zustand + Tailwind | `translateKey` zero-config fallback, `authority[]` dual-layer RBAC (`AuthorityGuard` + `AuthorityCheck`), `meta.horizontalMenu` (`default`/`columns`/`tabs`), ephemeral layout reassembly |
| **ARIA Tree + Shortcuts** | Angular + `@angular/aria` + Tailwind | `@angular/aria/tree` (`ngTree`, `ngTreeItem`), `activeOptions` (`exact`), `expandActiveRoute()`, topbar `Shortcuts` pinning/search derived from config |
| **Segment-Safe Prefix + Auto-Grid** | Next.js App Router + MUI + Tailwind | Segment-safe `isPathMatch()`, auto-generated category card grid from `children`, 3-state menu show/hide, `outlined` -> `contained` active icon swap |
| **Layered `@core/@layouts/@menu`** | Next.js / Vue / Nuxt + MUI | `@core/@layouts/@menu` layering, discriminated `exactMatch`/`activeUrl` union, `updatePageSettings()` cleanup return, CASL/RBAC group pruning |
| **Single-Tree 5-Surface Chrome** | React / Next.js + Radix + Tailwind | Single tree drives 5 surfaces (sidebar, sub-navbar `getChildren`, mega-menu, `getBreadcrumb`, `PageTitle`, `<title>`), CSS-only collapse toggle |
| **Frameless Inset Shell** | Server-rendered + Tailwind | Server-side associative arrays, 3-level active menu resolver, frameless gradient + `rounded-[30px]` inset shell |
| **CSS Layer + Mega-Popover** | Next.js + React + MUI | `AppRouterCacheProvider({ enableCssLayer: true })`, `Apps` mega-popover reused in mobile right `<Drawer>`, mini-sidebar hover-expand without layout shift |
| **Counter-Transform Mini Sidebar** | Vue / PHP / HTML + Bootstrap | Counter-transform mini sidebar (`translateX(-(W - W_mini))`), `subActivePaths` prefix array, slide-down search/loader bar (`Escape` dismiss) |
| **Compact Topbar + Overflow** | React + TanStack Router + Bootstrap | `compact-topbar` (`65px` merged brand+nav+search+utilities), inline route search dropdown, `.edge` viewport flip, horizontal `"More"` overflow |
| **Circular Scroll Progress** | Gulp + Bootstrap | SVG circular scroll-progress + back-to-top (`getTotalLength()` + `strokeDashoffset`), modal scrollbar-compensation guard, thumbnail mega-menu |
| **Attribute-Driven Store** | Vue + Pinia + Vuetify / Tailwind | Scoped layout store mirroring `<html>` `data-*` attributes, horizontal `offsetWidth` `"More"` overflow, two-column auto-collapse |
| **Tailwind `@theme` + Hover Pin** | React + React Router + Tailwind | Tailwind v4 `@theme` spacing tokens (`--spacing-sidenav-width`), `hover` vs `hover-active` rail pin dot, `hidden` sidebarless mode, pure-CSS flyout submenus |
| **Viewport Lock + Command Palette** | Next.js / Vue + MUI | Zero-prop viewport locking via CSS `:has(.rd-shell-fixed)`, `cmdk` `CommandPalette` (`Cmd+K`, 3-per-section cap), logical CSS properties |
| **Top Progress Bar + Dual Zone** | React / Next.js + Bootstrap | `3px` fixed top progress bar + Back-to-top, double-menu bottom utility bar + promo slot, duotone inline SVGs |

---

## 2. Standout Concrete Patterns

### 2.1 Single-Source Derived Chrome
- **5-surface single tree (`useMenu.ts`)**: One `navigation.config.ts` tree feeds Sidebar, Sub-Navbar (`getChildren(items, level)`), Mega-Menu, Breadcrumbs (`getBreadcrumb`), `PageHeader`, and `<title>`.
- **Auto-hide empty sections (`shouldHideNavSection`)**: When all items in a section are pinned to the top "Pinned" zone, automatically hide the empty section `title` header.
- **Ephemeral layout reassembly**: Layouts pass a reassembly callback via `LayoutContext` so `frameless` and `content-overlay` shells wrap the same `PageContainer` in rounded cards or overlapping hero banners without touching route components.

### 2.2 Discriminated Active-Path Matching
- **Segment-safe prefix match**: Never use raw `pathname.startsWith(href)` (which falsely matches `/ui/inputs` to `/ui/in`). Normalize trailing slashes and compare full path segments (`isNavActive()` in `useMenu.ts`).
- **Detail-route parent highlight**: Support `activeUrl` alongside `activeOptions: { exact: true }` so `/apps/orders/details/5434` highlights the `Orders` nav item via `activeUrl: '/apps/orders/details'`.

### 2.3 Auto-Generated Category Listing Pages
Intermediate parent routes (`/apps`, `/ui`, `/pages`) can render a searchable 3-column card grid directly from `currentItem.children` using `title`, `description`, and `icon` (shipped in `templates/components/react/menu/CategoryListing.tsx`).

### 2.4 Attribute-Driven Layout State Machine
Mirror layout state onto `<html>` attributes (`data-layout`, `data-theme`, `data-navbar-style`, `data-content-width`, `dir`) and drive geometry in CSS:
- **Zero-prop viewport lock**: `:has(.rd-shell-fixed) { max-block-size: 100dvh; overflow: hidden; }` locks Chat/Mail/Kanban shells to `100dvh` without prop drilling.
- **Hover-rail pin**: `data-layout="hover"` keeps `<main>` offset at `--sidebar-collapsed-width` (`76px`) while hovering expands the rail over content with zero layout shift; clicking pin switches to `vertical` (`hover-active`).
- **Ephemeral per-route override**: `NavItem.meta.layout` / `updatePageSettings(partial)` applies temporary layout overrides on mount and returns a cleanup function to restore user preferences on unmount without mutating `localStorage`/cookies.

### 2.5 Scroll-Progress Chrome & Modal Guard
- **Top scroll progress**: `3px` fixed bar at `inset-block-start: 0` driven by `scrollTop / (scrollHeight - clientHeight)`.
- **Circular SVG Back-to-Top**: Single `<path>` using `getTotalLength()` and `strokeDashoffset` to show scroll progress around the back-to-top button.
- **Modal scrollbar-compensation**: Measure `window.innerWidth - document.body.clientWidth` before locking body scroll so fixed headers and floating FABs don't jump horizontally.

---

## 3. Latest CSS / JS & Web Platform Best Practices

Grounded in `modern-web-guidance` (current Web Platform baselines):

### 3.1 One Semantic `<nav>` + Native Popover + CSS Anchor Positioning (`navbar` & `viewport-aware-dropdowns`)
- **Single DOM tree**: Use one `<nav aria-label="Primary">` landmark for both narrow popover/drawer and wide inline layouts—never duplicate markup.
- **Content-driven breakpoint (`ResizeObserver`)**: Instead of hardcoded pixel breakpoints, measure `inner.scrollWidth <= inner.clientWidth` inside a `ResizeObserver` on the header row and toggle `.is-wide`. Add a temporary `.is-measuring` class (`transition: none`) cleared in `requestAnimationFrame`.
- **Native `popover="auto"` + CSS Anchor Positioning**:
  - Use `popovertarget` on the menu button and `popover="auto"` on dropdowns/submenus (placed immediately after their trigger so browsers do not inject implicit `aria-details`).
  - Position tethered dropdowns with logical keywords only (never mix physical and logical keywords):
    ```css
    @supports (position-area: block-end) {
      [popover].anchored-overlay {
        inset: auto;
        margin: 0;
        position-area: block-end span-inline-end;
        position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
      }
    }
    ```
  - **Polyfill rule**: Conditionally load `@oddbird/popover-polyfill` ONLY when `!Object.hasOwn(HTMLElement.prototype, 'popover')`, use `setAttribute('popover', 'auto')` / `removeAttribute('popover')` (never the `.popover` IDL property), and combine `:is(:popover-open, .\:popover-open)`.
- **Smooth entry/exit (`@starting-style`)**: Declare `transition-behavior: allow-discrete` as a **separate** CSS property after `transition: opacity, translate, display, overlay;` (putting `allow-discrete` inside the `transition` shorthand causes older browsers to discard the entire rule).
- **Site nav vs. ARIA menu**: Site navigation links stay in the `Tab` order with `aria-current="page"` (`>= 3:1` visual contrast, never color alone). Do **not** add `role="menubar"` / `role="menu"` / `aria-haspopup="menu"` to site navigation link lists; reserve `focusgroup="menu nomemory"` + `commandfor` / `command="toggle-popover"` for application command menus.

### 3.2 Swipeable Mobile Navigation Drawer (`navigation-drawer`)
- **Drawer-only**: Use `<dialog class="Drawer">` opened via `showModal()` (native `inert` background, `Escape` handling, and focus restoration).
- **Drawer that also acts as a sidebar**: Use `popover="manual"` + `role="dialog"`, toggling `main.inert = true` and `aria-modal="true"` when open (never `popover="auto"`, which light-dismisses mid-swipe).
- **Native swipe physics**: Use `display: grid; grid-template-columns: var(--drawer-width) 100%; overflow-x: scroll; scroll-snap-type: x mandatory; overscroll-behavior: none;` with `height: 100svh` (prevents iOS Safari address-bar jump).
- **Scroll-driven backdrop**: Gate `@property --drawer-backdrop` + `scroll-timeline: --drawer-fade x` inside `@supports (animation-timeline: scroll())` and use `IntersectionObserver` on the sheet as the single source of truth for `onDrawerOpened` / `onDrawerClosed`.

### 3.3 Logical CSS & RTL Safety
Always use logical properties (`inline-size`, `block-size`, `inset-inline-start`, `margin-inline`, `ps-*`, `pe-*`, `ms-*`, `me-*`) and `dvw` / `dvh` / `svh` units so LTR and RTL (`dir="rtl"`) share one stylesheet.

---

## 4. Anti-Patterns to Avoid

1. **DOM `cloneNode(true)` for horizontal `"More"` overflow**: Strips React/Vue event listeners and forces `document.addEventListener` hacks. Instead, measure item widths with `ResizeObserver` and partition `visibleItems` vs `overflowItems` in declarative state (see `HorizontalNav.tsx`).
2. **Duplicated horizontal/vertical nav files**: Causes drift in labels, icons, and RBAC. Always filter one `navigationConfig` via `getHorizontalNav()`.
3. **Non-recursive `NavCollapse` active checks**: Breaks auto-expansion at depth 3+. Always use recursive `isNavSubtreeActive()`.
4. **Physical CSS properties in sidebar/drawer rules**: Mixing `left` / `margin-left` / `translateX(-100%)` breaks RTL. Use `inset-inline-start` / `ms-*` / logical transforms.
5. **Unbounded `localStorage` / `window` reads on SSR initial render**: Always guard client-only layout/pin state with a `mounted` check or pre-paint `<head>` script to avoid hydration mismatches.
6. **`<details>`/`<summary>` for nested nav disclosures**: Screen readers announce `<summary>` inconsistently; use `<button aria-expanded aria-controls>` followed by the submenu list.

---

## 5. Prebuilt Components & Generators in Designer Dashboards

| Artifact | Location | Purpose |
|---|---|---|
| **Unified Nav IR Schema** | `templates/starters/nav-ir.schema.json` | Draft 2020-12 JSON Schema for `navigation.config.ts` |
| **Canonical Nav Config** | `templates/components/react/configs/navigation.config.ts` | Exemplar tree with `pinned`, `pinnable`, `bottom`, `activeUrl`, `activeOptions`, `quickCreate`, `collapseLimit`, `meta` |
| **Nav Utilities (`useMenu`)** | `templates/components/{react,vue,angular}/menu/useMenu.ts` | Segment-safe `isNavActive`, `isNavSubtreeActive`, `getCurrentNavItem`, `getNavBreadcrumb`, `filterNavByAuthority`, `getHorizontalNav`, `getNavSearchIndex`, `getPinnedNavItems`, `shouldHideNavSection`, `getMegaMenuColumns` |
| **Vertical Renderer (`NavMenu`)** | `templates/components/{react,vue,angular}/menu/NavMenu.{tsx,vue,component.ts}` | Recursive sidebar renderer with collapsed rail flyouts, `pinned` section, `collapseLimit` truncation, and `quickCreate` `+` action |
| **Horizontal Renderer (`HorizontalNav`)** | `templates/components/{react,vue,angular}/menu/HorizontalNav.{tsx,vue,component.ts}` | Single-tree horizontal navbar with `ResizeObserver` `"More"` overflow, dropdowns, and `meta.megaMenu` columns |
| **Category Listing (`CategoryListing`)** | `templates/components/react/menu/CategoryListing.tsx` | Auto-generated searchable 3-column index grid from `NavItem.children` |
| **Modern Agnostic Nav (`nav-modern.html`)** | `templates/components/agnostic/nav-modern.html` | Zero-dependency HTML/CSS/JS navbar (`popover="auto"`, CSS Anchor Positioning, `@starting-style`, `ResizeObserver` `is-wide`, `<dialog>` scroll-snap swipe drawer, SVG scroll-progress FAB) |
| **CLI Generator** | `scripts/generate.mjs` (`nav`, `layout`, `app-shell`, `page`, `vertical`) | Emits framework-specific Nav IR, renderers, and shells (`--framework react|vue|angular|agnostic`) |
| **Nav & Modern Web Linter** | `scripts/lint-nav.mjs` | Checks duplicate Nav IR keys, JSX-in-config icons, duplicated horizontal trees, DOM `cloneNode()`, `<details>` in `<nav>`, `allow-discrete` shorthand, `.popover` IDL, unscoped `position-area`, and physical RTL CSS |
| **Verifier** | `scripts/verify-dashboard.mjs` | Runs `lint-nav.mjs`, validates `navigation.config.ts`, `type: 'item'` -> `path`, `translateKey` -> `en.json` parity, and physical RTL class bans |
