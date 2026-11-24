# Reference 03: Icons & Typography

Distilled from commercial dashboard icon and typography patterns.

## Contents

- [1. Icon System Rules](#1-icon-system-rules)
- [2. Typography Rules](#2-typography-rules)

## 1. Icon System Rules

1. **Ship exactly ONE primary open-source icon set.** Never mix 3–7 webfonts, leave unused icon deps (`@mui/icons-material`, `bootstrap-icons`), or ship unshaken full-set payloads (~2.5 MB CSS or ~300 KB inline sprites).
   - **Recommended default:** **Lucide** (`lucide-react` / `lucide-vue-next` / bundled `lucide-core` sprite) or **Tabler** (`@tabler/icons-react`) or **Phosphor** (`@phosphor-icons/react` when native `regular`/`fill`/`duotone` weights are desired).
   - **Multi-framework or brand/flag logos:** **Iconify with build-time tree-shaken offline bundling** (`@iconify/json` + `@iconify/utils` `getIcons(json, usedNames)` + `getIconsCSS()`, or `@iconify/tailwind4`, or an offline `iconify-bundle.js` for `<iconify-icon icon="set:name">`). Never fetch from the public Iconify API at runtime, never compile unshaken 5,000-icon sets, and avoid runtime DOM-scanning (`createIcons()`, `feather.replace()`, `SVGInject`) which breaks SSR/hydration and requires manual re-runs on table/pagination updates.
2. **Data-Driven String-Key Registry & Global Slot Overrides:**
   - Store icons as serializable strings in `navigation.config.ts`, KPI configs, and command palettes (`icon: "bar-chart-3"` or `"lucide:bar-chart-3"`), resolved through `<AppIcon name="..." size={18} strokeWidth={1.5} />` ([registry.tsx](../templates/components/react/icons/registry.tsx), [AppIcon.vue](../templates/components/vue/icons/AppIcon.vue), or `<svg><use href="/icons/lucide-dashboard-sprite.svg#rd-..." /></svg>`).
   - Centralize default UI-kit icons (Alert severities, Select/Accordion chevrons, Rating stars, DataGrid sort/filter/pagination, DatePicker arrows) in theme/component slot defaults rather than repeating them per page.
   - Standardize structural micro-slots: input adornments (`pointer-events-none` `14px–16px` icon at `start-3` over `ps-9` logical padding), breadcrumb separators (`rtlFlip`), and `more-vertical` card/table overflow triggers.
3. **Parent-Enforced Sizing, Spinners & Stroke Discipline:**
   - Use zero-specificity base sizing (`:where(...)` or `1em` SVG sizing) and parent slot selectors (`[&_svg:not([class*=size-])]:size-4`, `--sidenav-item-icon-size: 18px`, `font-size: inherit` on icon buttons) so icons scale automatically with their host control:
     - `12px–14px` (`size-3`–`3.5`): inline metadata, trend deltas, table sort arrows
     - `16px` (`size-4`): buttons, inputs, badges, alerts, inline UI
     - `18px–20px` (`size-4.5`–`5`): sidebar nav (`--sidenav-item-icon-size`), topbar triggers, icon-only buttons
     - `20px–24px` (`size-5`–`6`): KPI icon wells, page headers, section titles
     - `40px–48px` (`size-10`–`12`): empty states, dropzones
     - `96px+` (`size-24`–`40` with `stroke-1`): subtle card/hero watermarks at `/10`–`/25` opacity
   - Default `strokeWidth` to `var(--icon-stroke-width, 1.5)` (or `2` at `16px` dense UI) with `round` caps/joins; honor explicit `strokeWidth` overrides when passed.
   - **Loading spinners:** Use a single `loader-2` / `<Spinner>` icon with `motion-safe:animate-spin` (respecting the design system's `prefers-reduced-motion` reset) instead of multi-loader SVG packs or font-spin hacks.
4. **Color, Theme-Aware Custom SVGs & Duotone Hierarchy (Zero Hardcoded Hex):**
   - Always color UI icons via `currentColor` and design-system tokens (`--color-primary`, `--color-text-muted`, `dark:*`). Never hardcode hex fills inside UI SVGs or custom illustrations (enforced by `_adherence.oxlintrc.json`).
   - **Theme-aware custom SVGs:** Layout thumbnails, empty states, and file-type icons must bind `fill`/`stroke` to design-system tokens (`--color-primary`, `--color-primary-surface`, `--color-surface`, `--color-border`) so they re-theme live on preset/dark-mode switches.
   - Use a two-tier visual hierarchy: lighter outline or muted chrome icons (`opacity-60` on neutral buttons/nav via `[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60`), paired with filled/duotone or tinted icon wells for active nav states, KPIs, and status badges.
   - **KPI & Card Icon Wells:** Frame KPI icons in soft-tinted containers (`bg-[var(--color-primary-surface)] text-[var(--color-primary)]`, `rounded-lg` or `rounded-full`, `size-10`/`size-12`) or subtle outlined badges; derive duotone secondary fills via `opacity` (`0.2`–`0.6` with optional `oneTone` toggle) or `color-mix()` CSS tokens.
   - Keep multi-color country flags (`flagpack-core` / `circle-flags:*`) and OAuth/payment brand marks (`logos:*`) isolated with `role="img"` so muted-chrome opacity rules don't dim them.
5. **RTL Mirroring & Accessibility Contract:**
   - **RTL:** Wrap directional icons (`arrow-*`, `chevron-*`, `forward`/`back`, pagination, breadcrumbs, expanders) with `rtlFlip` (`rtl:rotate-180` / `rtl:scale-x-[-1]`) or a `<DirectionalIcon>` helper, and always use CSS logical spacing (`ms-*`, `me-*`, `margin-inline-*`).
   - **A11y:** Default `<AppIcon>` to `aria-hidden="true"` + `focusable="false"` when decorative; require `aria-label` (or `<span className="sr-only">`) on every icon-only `<button>` (header toggles, card overflow `...`, close buttons, table actions). Never use `<span role="button">` or `<div role="button">` without native `<button>` semantics.
6. **Interactive Proof Page (`/ui/icons`):** Every scaffolded starter includes a searchable `/ui/icons` catalog page ([IconCatalogPage.tsx](../templates/components/react/pages/IconCatalogPage.tsx)) driven from `ICON_REGISTRY` metadata with live size/stroke/variant preview, filtered count, empty state, and click-to-copy `<AppIcon ... />` snippets.

### Implementation Patterns (Clean-Room Examples)

```tsx
// 1. Parent-enforced sizing & muted-chrome selector (Tailwind v4 / Radix Button pattern)
<button
  type="button"
  aria-label={iconOnly ? label : undefined}
  className="inline-flex items-center gap-x-2 [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 [&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-70"
>
  <AppIcon name={icon} rtlFlip={isDirectional} />
  {!iconOnly && <span>{label}</span>}
</button>

// 2. Soft-tinted KPI icon well (dark-mode & theme-token safe)
<div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
  <AppIcon name={kpi.icon} size={22} strokeWidth={1.5} />
</div>
```

### Bundled Icons & Permissive Icon Packs

Machine-readable manifest: [templates/assets/icons/catalog.json](../templates/assets/icons/catalog.json)

- **Bundled Offline Lucide Core (ISC License):**
  - Combined 44-icon dashboard SVG sprite (`stroke-width="1.5"`, `currentColor`): [lucide-dashboard-sprite.svg](../templates/assets/icons/lucide-dashboard-sprite.svg)
  - Individual `.svg` files + ISC license: [templates/assets/icons/lucide-core/](../templates/assets/icons/lucide-core/) ([LICENSE](../templates/assets/icons/lucide-core/LICENSE))
  - Automatically copied to `public/icons/lucide-dashboard-sprite.svg` by `scripts/scaffold-starter.mjs`.

| Pack | License | React / Vue / Static npm | Iconify Prefix | Official Release ZIP / Repo |
|---|---|---|---|---|
| **Lucide** *(bundled)* | ISC | `lucide-react` · `lucide-vue-next` · `lucide-static` | `lucide:` | https://github.com/lucide-icons/lucide/releases/latest |
| **Tabler Icons** | MIT | `@tabler/icons-react` · `@tabler/icons-vue` · `@tabler/icons` | `tabler:` | https://github.com/tabler/tabler-icons/releases/latest |
| **Remix Icon** | Apache-2.0 | `@remixicon/react` · `@remixicon/vue` · `remixicon` | `ri:` | https://github.com/Remix-Design/RemixIcon/releases/latest |
| **Phosphor Icons** | MIT | `@phosphor-icons/react` · `@phosphor-icons/vue` · `@phosphor-icons/core` | `ph:` | https://github.com/phosphor-icons/core/releases/latest |
| **Iconify Offline** | MIT | `@iconify/json` · `@iconify/tailwind4` · `@iconify/react` | `*` | https://github.com/iconify/icon-sets/releases/latest |

---

## 2. Typography Rules

### Bundled Self-Hosted Variable Fonts (All SIL OFL 1.1)

Every font on the curated dashboard shortlist is **bundled directly** as a self-hosted variable `.woff2` file with its `LICENSE` and a zero-CDN `@font-face` manifest ([fonts.css](../templates/assets/fonts/fonts.css), [catalog.json](../templates/assets/fonts/catalog.json)). `scripts/scaffold-starter.mjs` automatically copies them into `public/fonts/` and links `/fonts/fonts.css`.

| Family | Role | License | Bundled Variable `.woff2` | npm / `next/font` | Official Release ZIP |
|---|---|---|---|---|---|
| **Inter** | Universal SaaS baseline | SIL OFL 1.1 | [inter-latin-wght-normal.woff2](../templates/assets/fonts/inter/inter-latin-wght-normal.woff2) | `@fontsource-variable/inter` / `Inter` | https://github.com/rsms/inter/releases/latest |
| **Public Sans** | Editorial SaaS (`saas-violet`) | SIL OFL 1.1 | [public-sans-latin-wght-normal.woff2](../templates/assets/fonts/public-sans/public-sans-latin-wght-normal.woff2) | `@fontsource-variable/public-sans` / `Public_Sans` | https://github.com/uswds/public-sans/releases/latest |
| **Plus Jakarta Sans** | Friendly geometric (`executive-emerald`) | SIL OFL 1.1 | [plus-jakarta-sans-latin-wght-normal.woff2](../templates/assets/fonts/plus-jakarta-sans/plus-jakarta-sans-latin-wght-normal.woff2) | `@fontsource-variable/plus-jakarta-sans` / `Plus_Jakarta_Sans` | https://github.com/tokotype/PlusJakartaSans/releases/latest |
| **Geist + Geist Mono** | High-density technical/ops (`teal-precision`) | SIL OFL 1.1 | [Geist.woff2](../templates/assets/fonts/geist/Geist.woff2) · [GeistMono.woff2](../templates/assets/fonts/geist/GeistMono.woff2) | `geist` / `Geist`, `Geist_Mono` | https://github.com/vercel/geist-font/releases/latest |
| **DM Sans** | Clean flat utility | SIL OFL 1.1 | [dm-sans-latin-wght-normal.woff2](../templates/assets/fonts/dm-sans/dm-sans-latin-wght-normal.woff2) | `@fontsource-variable/dm-sans` / `DM_Sans` | https://github.com/googlefonts/dm-fonts/releases/latest |
| **JetBrains Mono** | Tabular monospace for IDs & metrics | SIL OFL 1.1 | [jetbrains-mono-latin-wght-normal.woff2](../templates/assets/fonts/jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2) | `@fontsource-variable/jetbrains-mono` / `JetBrains_Mono` | https://github.com/JetBrains/JetBrainsMono/releases/latest |

### Delivery (No Broken CDN Imports)
- **Default in Designer Dashboards:** Self-hosted `.woff2` via `/fonts/fonts.css` (copied automatically into `public/fonts/`).
- **Alternatives:** `next/font/local` or `next/font/google` in Next.js (zero-CLS `size-adjust`) or `@fontsource-variable/*` in Vite/Vue/Angular.
- **Never** use remote CSS `@import url(...)` inside stylesheets.

### Dense Dashboard Type Scale
Dashboards run `1–2px` smaller than marketing sites:

| Token | Size | Line Height | Weight | Role |
|---|---|---|---|---|
| `--text-2xs` | `11px` (`0.6875rem`) | `1.3` | `600` | Uppercase section micro-labels (`tracking-wider`), table badges |
| `--text-xs` | `12px` (`0.75rem`) | `1.4` | `500` | Captions, helper text, chart axes, breadcrumbs |
| `--text-sm` | `13px` (`0.8125rem`) | `1.5` | `400` | Compact body / dense table cells / sidebar items |
| `--text-base` | `14px` (`0.875rem`) | `1.55` | `400` | Default dashboard body copy |
| `--text-lg` | `16px` (`1rem`) | `1.4` | `600` | Card/widget titles |
| `--text-xl` | `20px` (`1.25rem`) | `1.25` | `600` | Page titles |
| `--text-2xl` | `26px` (`1.625rem`) | `1.15` | `700` | KPI primary values (`tabular-nums`) |

Always apply `font-variant-numeric: tabular-nums` to KPI numbers, table metrics, currencies, and timestamps so digits align cleanly and don't jitter on updates.
