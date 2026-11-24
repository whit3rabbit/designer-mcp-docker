# StyleX UI Framework (`react-stylex`)

Production-grade **Meta StyleX** (`@stylexjs/stylex`) component suite for **Designer Dashboards**, bridged directly to **OpenDesign** CSS custom properties (`design-system/styles.css`).

## Architecture

1. **OpenDesign Token Bridge (`theme/tokens.stylex.ts`)**:
   - Uses `stylex.defineVars()` to map semantic tokens (`canvas`, `surface`, `primary`, `success`, `warning`, `error`, `info`, `radius*`, `shadow*`, `font*`, `chart*`) to OpenDesign CSS variables (`var(--color-*)`, `var(--radius-*)`, etc.).
   - Light/dark theme switching (`[data-theme="dark"]` / `.dark`) and all 21 OpenDesign WCAG AA presets work automatically at runtime without duplicating `stylex.createTheme()` blocks.

2. **Compile-Time Atomic CSS (`stylex.create` + `stylex.props`)**:
   - All UI primitives (`Button`, `Card`, `Badge`, `Alert`, `Input`, `Select`, `Dialog`, `Tabs`, `KpiCard`, `DataTable`, `ChartCard`) use `stylex.create()` for zero-runtime-overhead atomic CSS generation.
   - CSS logical properties (`paddingInline`, `paddingBlock`, `marginInlineStart`, `textAlign: 'start'`) are used throughout so RTL (`dir="rtl"`) layouts work out of the box.

3. **Vite Integration (`@stylexjs/unplugin`)**:
   - Place `stylex.vite({ useCSSLayers: true })` **before** `@vitejs/plugin-react` in `vite.config.ts`.
   - Ensure `src/index.css` (importing `../design-system/styles.css`) is imported in `src/main.tsx` so Vite emits a CSS asset for StyleX to append compiled atomic rules.

## Accessibility & Standards

- WCAG 2.1 AA contrast via OpenDesign OKLCH tokens (no hardcoded `#000000` or `#FFFFFF` backgrounds).
- Native `<dialog>` top-layer modal with `Escape` and backdrop dismissal.
- `role="tablist"` / `role="tab"` / `role="tabpanel"` with RTL-aware arrow-key navigation.
- Explicit `aria-label` on all icon-only buttons and `:focus-visible` focus rings.
