# The Designer Dashboards Engineering Guide

> Distilled best practices from an audit of 17 commercial admin templates paired with the OpenDesign / `design-system` contract.

---

## 1. Core Philosophy: The 10 Dashboard Laws

1. **Navigation Config is the Primary IR.** One typed tree drives the sidebar, horizontal nav, mega-menu, breadcrumbs, page headers, `<title>`, i18n keys, and RBAC route filtering. Never author them separately.
2. **Design System as Code + Lint Contract.** Every visual token lives in `DESIGN.md` -> `theme.json` -> `styles.css`, audited by `DESIGN.evidence.json`, indexed by `_ds_manifest.json`, and enforced by `_adherence.oxlintrc.json` (no raw hex, no raw px, no unauthorized fonts).
3. **One Engine Per Concern.** Commercial templates routinely ship 3–7 icon sets, 2–3 chart libraries, and 2–3 toast libraries. Designer Dashboards enforces strict single-engine discipline:
   - **Icons:** Iconify (build-time offline bundle) or Lucide via string-key registry.
   - **Charts:** ApexCharts behind one theme/RTL/SSR-aware wrapper.
   - **Tables:** TanStack Table with a standardized server-mode fetch contract.
   - **Forms:** `react-hook-form` + `zod` (or framework equivalent).
   - **Toasts & Overlays:** One toast engine (Sonner or MUI Snackbar—never 2+) + native `<dialog>` / Popover API (`popover="auto"`) with CSS Anchor Positioning & `@starting-style` (or `shadcn` v4 / unified `radix-ui` / `@base-ui/react` with `tw-animate-css`—never legacy `tailwindcss-animate` or per-package `@radix-ui/react-*`), borderless `::backdrop` (`--color-scrim`), Top-Layer rendering, and `--z-*` ladder for shell chrome (never mix jQuery plugins).
   - **State:** Scoped micro-stores (Zustand / Pinia / Angular Signals)—never a monolithic global Redux store.
4. **Programmatic OKLCH Soft/Tonal Palettes.** Define 6 semantic roles (`primary`, `secondary`, `success`, `info`, `warning`, `error`) + neutrals. Generate soft/tonal fills, hover, pressed, border, and focus rings programmatically using OKLCH and `color-mix(in oklch, ...)` (5–9 tint steps).
5. **Navy/Slate Dark Mode, Never Pure Black.** Body text in light mode is dark slate (`#2F2B3D`–`#364A63`), light canvas is tinted off-white (`#F5F6FA`–`#F8F7FA`) so white cards lift cleanly, and dark surfaces are stepped navy/slate (`#171C23` / `#25293C` / `#2F3349`) with an inline FOUC-prevention script.
6. **Dense, Intentional Layout Geometry.** Base body size is `13px–14px` (not 16px). Spacing runs on a `4px` grid (`24px` gutters, `24–30px` card padding). Sidebar widths: `260–280px` expanded, `70–80px` collapsed rail, `64–70px` topbar, collapsing to an offcanvas drawer at `<1024px`.
7. **Config-Driven Variants, Never Copy-Paste Clones.** Switch layout modes (`vertical`, `collapsed`, `horizontal`, `two-column`), content width (`fluid`, `boxed`), sidebar skins, and theme presets via `data-*` attributes on `<html>` driven by a persisted settings store.
8. **Own the Data & Auth Layer.** Commercial templates ship cosmetic localStorage auth and hardcoded mocks. Designer Dashboards uses typed domain models + services (with an explicit mock-adapter toggle) and real backend auth wiring (`Auth.js/NextAuth + Prisma`, `Supabase`, or `Better Auth`), with every secret in `.env` + `.env.example`.
9. **Differentiate on the Four Market Absences.** Ship (a) **WCAG 2.1 AA accessibility** (18-point spec), (b) **i18n keys + CSS logical-property RTL + `Intl` formatting from day one**, (c) **skeleton-first loading + illustration-backed `<EmptyState>` on every data widget**, and (d) **automated smoke/a11y tests + lean, pruned dependencies**.
10. **One Dashboard Recipe + Derived Chrome + Widget Superpowers.** Every vertical dashboard is a widget-set selection over one page recipe (`Derived PageHeader + Filter Row` -> `3–4 KPI Cards` -> `2-Up Charts` -> `Full-Width Table/Timeline/Map`) inside `@container` shells with standardized topbar furniture (`Cmd+K` Command Palette, `NotificationsSheet`, App Switcher, Theme/RTL/User menus) and `<WidgetCard>` primitives (kebab menu, fullscreen, pin, collapse, loading, empty). Every app page maps to a reusable app shell (`list-detail`, `board`, `stream`, `full-canvas`, etc.).

---

## 2. Architecture & Layering (`@core` / `@layouts` / `@menu`)

Adopt the proven `@core` / `@layouts` / `@menu` separation:

```text
src/
├── @core/                 # Framework-agnostic design tokens, theme engine, primitives, formatters
├── @layouts/              # AppShell (protected) + BlankShell (guest/auth) + customizer drawer
├── @menu/                 # Recursive NavRenderer driven by navigation.config.ts
├── configs/               # navigation.config.ts, theme.config.ts, chart.config.ts, i18n.config.ts
├── components/
│   ├── ui/                # Button grammar, WidgetCard (fullscreen/pin), DataGrid, ChartWrapper, FormField, Alert, Badge, EmptyState
│   └── feedback/          # Skeletons, Sonner Toaster, Dialog/Drawer (Top-Layer), CommandPalette (Cmd+K), NotificationsSheet, PageHeader/Breadcrumb
├── apps/                  # Isolated feature modules: apps/<name>/{routes, data/{model,service}, features}
└── app/ or pages/         # Route groups: (dashboard)/(private) and (auth)/(guest-only)
```

---

## 3. End-to-End Build Workflow

| Step | Subskill | Output |
|---|---|---|
| 1. Choose stack & scaffold | `designer-dashboards:init` | Clean repo, package manager config, hosting adapter, `@core/@layouts/@menu` skeleton, `.env.example` |
| 2. Lock design system | `designer-dashboards:design` | `design-system/{DESIGN.md, theme.json, DESIGN.evidence.json, styles.css, _ds_manifest.json, _adherence.oxlintrc.json}` |
| 3. Build UI & data layer | `designer-dashboards:ui` | Icon registry, Button grammar, KPI cards, ApexCharts wrapper + presets, TanStack server DataGrid, 12 form primitives, Sonner + Top-Layer/headless overlays |
| 4. Wire auth & RBAC | `designer-dashboards:login` | 7-page auth suite, shell variants, `(guest-only)` / `(private)` guards, unified `authority` RBAC, backend adapter |
| 5. Compose pages & nav | `designer-dashboards:pages` | Unified `navigation.config.ts`, vertical dashboards, 4 app shells, print invoice, AI assistant side-panel |
| 6. Verify & ship | `designer-dashboards:audit` | Token parity pass, WCAG 2.1 AA checklist, RTL logical-properties check, dep & secret audit |

---

## 4. Detailed Topic References

For deep specifications, exact token tables, schemas, and code contracts, see `references/`:

- [01-design-tokens.md](references/01-design-tokens.md) — Semantic palette, soft tint ladders, surfaces, radii, shadows, dark mode, OpenDesign contract
- [02-navigation-and-layout.md](references/02-navigation-and-layout.md) — Unified Nav IR, sidebar magic numbers, attribute-driven layout machine, page composition recipe, 4 app shells
- [03-icons-and-typography.md](references/03-icons-and-typography.md) — Iconify/Lucide pipeline, string-key registry, font shortlist, 13–14px density scale
- [04-data-display-and-charts.md](references/04-data-display-and-charts.md) — ApexCharts 10 presets, type↔question matrix, 10-hue chart palette, `<LiveChart>`, TanStack server-grid contract, KPI stat-card primitive
- [05-auth-and-security.md](references/05-auth-and-security.md) — 7-page auth suite, reusable shells, RBAC guard chain, real backend adapters, security checklist
- [06-forms-feedback-chrome.md](references/06-forms-feedback-chrome.md) — 12 input primitives, validation contract, wizards, Tiptap/FullCalendar/dayjs, Sonner/Radix overlays, z-index ladder, derived page chrome
- [07-state-data-ai.md](references/07-state-data-ai.md) — Scoped micro-stores, mock-adapter & server-first data layers, AI chat + assistant chrome + `AIProvider`
- [08-a11y-i18n-motion.md](references/08-a11y-i18n-motion.md) — 18-point WCAG 2.1 AA spec, i18n + Arabic RTL logical properties + `Intl` formatting, restrained motion & reduced-motion
- [09-tech-stacks.md](references/09-tech-stacks.md) — 26 curated tech-stack profiles, capability-slot recommendation matrix, and single-engine integration rules
- [10-navigation-examples-and-patterns.md](references/10-navigation-examples-and-patterns.md) — Canonical Nav IR examples, horizontal/mega-menu derivations, popover/anchor-positioning patterns, and RTL navigation rules
