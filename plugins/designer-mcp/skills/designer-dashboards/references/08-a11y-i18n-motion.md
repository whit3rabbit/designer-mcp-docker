# Reference 08: Accessibility (WCAG 2.1 AA), i18n/RTL & Motion

Distilled from the 17-template commercial dashboard audit.

## 1. The 18-Point WCAG 2.1 AA Dashboard Spec

Commercial templates fail systematically on accessibility. Designer Dashboards bakes in all 18 points:

### Shell & Landmarks
1. Visible-on-focus `<a class="skip-link" href="#main-content">Skip to content</a>` as the first focusable element.
2. Semantic landmarks (`<header>`, `<nav aria-label="...">`, `<main id="main-content">`) with unique labels.
3. `aria-current="page"` on active navigation links (driven automatically by `useMenu`).
4. Route-change focus management (move focus to `<main tabIndex={-1}>` using `{ preventScroll: true }` on route changes, skipping initial page load, and announce page title).

### Keyboard Navigation
5. Sidebar/menus built on headless accessible primitives (Radix NavigationMenu / ARIA tree) with arrow-key, `Home`/`End`, typeahead, and roving `tabIndex` navigation.
6. Modals, drawers, and command palettes trap `Tab`/`Shift+Tab` focus, set `aria-modal="true"` + `aria-labelledby`, close on `Escape`, and restore focus to the trigger.
7. DataGrid uses `role="grid"`, `aria-sort` on sortable headers, roving `tabIndex`, and keyboard arrow / `Home` / `End` cell navigation.
8. Kanban / drag-and-drop boards include keyboard move controls alongside pointer DnD.

### Forms & Controls
9. Every input has an explicit `<label htmlFor>`, `aria-invalid` on error, and `aria-describedby` pointing to the error message.
10. OTP inputs form a labeled group with `autocomplete="one-time-code"`; date pickers are keyboard-operable.
11. Every icon-only button requires a non-empty `aria-label`.

### Charts & Live Regions
12. Every chart exposes `role="img"` + descriptive `aria-label` AND a toggleable accessible data-table fallback generated from the same series data.
13. Toasts, loading skeletons, and streaming AI responses use `aria-live="polite"`.

### Tokens & Preferences
14. Contrast-verified token pairs: >= `4.5:1` for normal text (including `--color-on-solid` on semantic buttons and foreground text on `--color-*-surface` soft tints), >= `3:1` for large text and UI/border boundaries.
15. Global `:focus-visible` ring token (`outline: 2px solid var(--color-primary-focus-ring); outline-offset: 2px`).
16. `@media (prefers-reduced-motion: reduce)` collapses all staggered entrances, count-ups, chart animations, button press transforms, and shimmers cleanly.
17. `prefers-contrast` / `forced-colors` safe CSS-variable fallbacks across cards, buttons, switches, and charts.
18. Automated enforcement: `eslint-plugin-jsx-a11y` (React) / `eslint-plugin-vuejs-accessibility` (Vue) / `@angular-eslint/template/*` (Angular) + Playwright `axe-core` smoke check (`tests/a11y.spec.ts`) in CI.

## 2. Localization & RTL From Day One

- **Framework-standard libraries:** `next-intl` (Next.js with `[lang]` routing + `Accept-Language` middleware negotiation), `react-i18next` (React SPA), `vue-i18n` (Vue), `@ngx-translate` (Angular).
- **Flat JSON catalogs & ICU plurals:** `locales/{en,es,fr,de,ar}.json`—include **Arabic (`ar`)** as the built-in RTL verification locale and support ICU plural syntax (`{count, plural, one {# item} other {# items}}`).
- **Keys everywhere on day one:** Nav titles (`translateKey`), page chrome, validation errors, toasts, chart labels.
- **Locale <-> `<html lang>` + `dir` Coupling:** Persist active locale in `localeStore` / SSR cookie, restore both `lang` and `dir` pre-hydration (preventing RTL FOUC), and auto-flip `dir="rtl"` when switching to `ar` (+ Radix `DirectionProvider`).
- **CSS Logical Properties ONLY:** Always use `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `rounded-s-*`, `rounded-e-*`, `text-start`, `text-end`, `border-s`, `border-e`, plus `stylelint-use-logical-spec` for raw CSS (`margin-inline`, `padding-inline`, `inset-inline-*`) and `rtl:rotate-180` on directional icons. Never use physical `ml-*`/`mr-*`/`pl-*`/`pr-*`/`left-*`/`right-*`.
- **`Intl` formatting helper (`useFormat`):** Wrap `Intl.NumberFormat` (currency, compact numbers, percentages), `Intl.DateTimeFormat`, ApexCharts `locales` / `Intl` formatters, and `dayjs.locale(activeLocale)`. Never hardcode `$` or `MM/DD/YYYY`.

## 3. Restrained Dashboard Motion

- **Staggered widget entrance:** One lightweight CSS utility (`.anim-in` with `nth-child` 30–40ms staggered delays, 220ms `ease-out`, `translateY(8px) -> 0`) applied directly to dashboard widget grids (supporting logical inline variants too).
- **FOUC-only `beforeInteractive` bootstrap:** Reserve `beforeInteractive` scripts strictly for setting `data-theme`, `lang`, and `dir` pre-paint; use SSR streaming / `loading.tsx` skeletons rather than a blocking full-screen splash loader (which hurts LCP/FCP).
- **Native View Transitions & `@starting-style`:** Use CSS View Transitions (`document.startViewTransition` / `view-transition-name`) for `<WidgetCard>` fullscreen expansion, layout-mode switches, and route transitions, plus `@starting-style` for `<dialog>`/popover entry animations—all guarded by `@media (prefers-reduced-motion: reduce)`.
- **Micro-feedback:** KPI `CountingNumber` count-ups (preserving `Intl.NumberFormat`, instant snap under reduced-motion), interactive card hover elevation (`.rd-card-interactive`), `.rd-shimmer` skeletons, button press scale (`motion-safe:active:scale-[0.98]`), and `.typing-dots` AI indicator.
- **Skip heavy JS animation libraries** (e.g., full-page Framer route wrappers, AOS, WOW)—rely on CSS transitions, `@starting-style`, and native View Transitions.
