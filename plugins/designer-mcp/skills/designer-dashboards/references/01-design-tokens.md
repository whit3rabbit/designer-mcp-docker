# Reference 01: Design Tokens & OpenDesign Contract

Distilled from the 17-template commercial dashboard audit and `design-system` (`DESIGN.md` / OpenDesign workflow).

## 1. Semantic Color Contract

Every dashboard defines six semantic roles plus neutrals:

| Role | Industry Cluster | Purpose |
|---|---|---|
| `primary` | `#7367F0` / `#666CFF` / `#3B82F6` / `#007D88` | Brand action, active nav, focus rings |
| `secondary` | Slate/neutral accent | Secondary controls, neutral badges |
| `success` | `#28C76F` / `#10B981` (fresh emerald/mint) | Positive deltas, completed status |
| `info` | `#00BAD1` / `#26C6F9` (cyan-blue) | Informational banners, secondary series |
| `warning` | `#FF9F43` / `#FDB528` (golden amber) | Pending states, caution alerts |
| `error` / `danger` | `#FF4C51` / `#FF4D49` (warm coral-red) | Destructive actions, negative deltas, form errors |

### Programmatic Soft/Tonal Sub-Tokens
Never hand-pick soft tints. Generate 6 sub-tokens per semantic color from the base hex:
- `main` (base), `surface` (soft tint ~10–14% alpha on light, ~16–20% on dark), `border` (~24–30% alpha), `hover` (lightness -6%), `pressed` (lightness -12%), `focus` (25% alpha ring).
- Use OKLCH (`oklch(...)` + `color-mix(in oklch, ...)`) natively with Tailwind v4 so a full 50–950 tonal scale and opacity ladders work in both light and dark modes from one base color (emit `--color-*-rgb` triplets only when a legacy third-party canvas plugin requires raw RGB).
- **Runtime preset & hex switching:** Support switching between curated primary/palette presets (persisted in `localStorage`/cookie) plus an optional primary hex picker without regenerating CSS from scratch.

## 2. Neutrals & Surfaces

- **10-step neutral scale (`50…950`) + 6 semantic surface roles (`canvas`, `surface`, `surfaceElevated`, `border`, `text`, `textMuted`):** Invert the neutral ladder cleanly for dark mode.
- **Light body text:** Never `#000000`. Use dark slate/navy (`#2F2B3D`, `#2A3547`, `#364A63`, or `zinc-900`). Muted text = same hue at 0.55–0.70 opacity.
- **Light canvas vs card:** Canvas is gray-tinted white (`#F5F6FA`, `#F8F7FA`, `#F7F7F9`); cards are `#FFFFFF` so cards lift cleanly without heavy borders.
- **Dark canvas vs card:** Never `#000000`. Use stepped navy/slate: canvas `#171C23` / `#25293C` / `#0F172A`, card surface `#1E2530` / `#2F3349` / `#1E293B`, elevated popover `#262F3D` / `#373C56`.
- **Card philosophy (switchable skin):** `elevated` (borderless or 1px subtle border + restrained shadow) or `bordered` (flat surface + crisp 1px neutral border).

## 3. Typography, Spacing, Radius, Elevation, Breakpoints & Z-Index

- **Typography density & scale:** Base body `13px–14px` (`2xs: 11px` uppercase micro-labels, `2sm: 13px`), heading weights `600–700`, tightened heading line-height (`1.1–1.25`) vs body (`1.5–1.7`), `tabular-nums` on all metrics, optional distinct `fontHeading` / display font, and fluid `clamp()` headings for hero/KPI titles.
- **Spacing grid:** `4px` base unit (`--space-unit: 0.25rem`). Standard layout padding: `24px` (`1.5rem`). Card padding: `24px` (compact `20px`, airy `28px`). Grid gap: `24px` (`16px` mobile).
- **Sidebar & chrome dimensions:** Expanded sidebar `260px–280px` (`--sidebar-width`), collapsed rail `72px–80px` (`--sidebar-collapsed-width`), topbar `64px` (`--header-height`, mobile `56–60px`), layout transition `~240–300ms`. Support `light`, `dark`, `brand`, `gradient`, and `transparent` sidebar skins, hover-expand rails, and `floating | detached | blur` navbar modes.
- **Iconography & custom SVG tokens:** Define `--sidenav-item-icon-size: 18px` and `--icon-stroke-width: 1.5` as tokens. Custom SVGs (layout thumbnails, empty states, file-type icons) and KPI icon wells must bind `fill`/`stroke` to semantic sub-tokens (`--color-primary`, `--color-primary-surface`, `--color-surface`, `--color-border`, `--color-text-muted`)—never raw hex—so they re-theme automatically across light/dark modes and presets.
- **Radius ladder (5-step):** `xs: 2px`, `sm: 4px`, `md: 6px` (or `8px` base), `lg: 10px`, `xl: 14px`, `full: 9999px` (pills, badges, avatars).
- **Shadows (restrained, navy-tinted) + colored glows:**
  - `sm`: `0 2px 6px rgba(31, 45, 61, 0.05)` · `md`: `0 4px 14px rgba(31, 45, 61, 0.07)` · `lg`: `0 10px 28px rgba(31, 45, 61, 0.10)`
  - Optional colored `customShadows` / accent glows (`0.3–0.5` alpha) for primary CTAs/bars; explicit `--shadow-modal: none` (rely on `--color-scrim` backdrop separation).
  - Dark mode lowers shadow alpha or switches to 1px border separation.
- **Breakpoints & Container Queries:** Viewport ladder (`576 / 768 / 992 / 1200 / 1400 / 1650` or MUI `600 / 900 / 1200 / 1536 / 1920`) with `--bp-drawer: 1024px`; prefer `@container` queries inside dashboard widgets for adaptive density.
- **RTL & Logical Properties:** Always use `dir="ltr|rtl"` paired with CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `inset-inline-*`)—never physical `left`/`right` utilities.
- **Top-Layer & Explicit Z-Index Ladder:** Prefer native Top-Layer rendering (`<dialog>.showModal()`, `popover="auto"`) for modals/popovers so they never fight stacking contexts; use the explicit `--z-*` ladder for non-top-layer shell chrome and fallbacks:
  `base: 0`, `dropdown: 1000`, `sticky: 1020`, `header: 1030`, `sidebar: 1040`, `scrim: 1050`, `drawer: 1060`, `modal: 1070`, `popover: 1080`, `toast: 1090`, `tooltip: 1100`.

## 4. Dark Mode Contract (FOUC-Free)

1. Trigger via `data-theme="light|dark"` and `.dark` class on `<html>`.
2. Support `system | light | dark` mode, persisted in `localStorage` (SPA) or cookie (SSR/Next.js).
3. Inject a synchronous inline `<script>` in `<head>` before stylesheets paint to apply the persisted/system theme immediately (zero white flash).

## 5. OpenDesign Package Artifacts (`design-system/`)

Every Designer Dashboards project generates and maintains:
- `DESIGN.md` — YAML frontmatter + human-readable visual rules & token roles.
- `DESIGN.evidence.json` — Source provenance (`preset`, `reference`, `override`, `observation`) and explicit `gaps`.
- `theme.json` — Machine-readable nested dashboard theme schema (`colors.semantic`, `colors.light`, `colors.dark`, `colors.chart`, `typography`, `layout`, `radius`, `zIndex`) compiled by `scripts/build-tokens.mjs`.
- `styles.css` — Generated `:root` + `[data-theme="dark"]` OKLCH `color-mix()` CSS variables + Tailwind v4 `@theme` bridge + attribute contracts (`[data-card-style]`, `[data-sidebar-skin]`, `[data-navbar-style]`, `[data-layout]`).
- `_ds_manifest.json` — Generated registry of every CSS token, WCAG AA contrast audit results, and machine-readable `adherence` policy (raw hex, pure black, physical RTL, and allowed font families) enforced by `verify-dashboard.mjs`.
- `_adherence.oxlintrc.json` — Schema-valid OxLint `jsx-a11y` contract extended by `.oxlintrc.json`.
