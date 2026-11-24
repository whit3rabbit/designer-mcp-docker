# vanilla-extract + Ark UI for Designer Dashboards

Zero-runtime CSS-in-TypeScript powered by [`@vanilla-extract/css`](https://vanilla-extract.style/) and [`@vanilla-extract/recipes`](https://vanilla-extract.style/documentation/packages/recipes/), paired with headless accessible primitives from [`@ark-ui/react`](https://ark-ui.com/) and bridged directly to Designer Dashboards's OpenDesign OKLCH CSS variables.

## Architecture

1. **OpenDesign Token Bridge (`theme/tokens.css.ts`)**
   - `vars` provides a strictly typed TypeScript map to OpenDesign CSS custom properties (`--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-surface-subtle`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-surface`, `--color-primary-border`, `--color-primary-hover`, `--color-on-solid`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--font-sans`, `--font-mono`, `--radius-md`, `--chart-1..10`).
   - Because `design-system/styles.css` defines light and dark (`dark` / `[data-theme="dark"]`) values on `:root`, all vanilla-extract styles automatically adapt to all 21 OpenDesign WCAG AA presets and dark mode with zero runtime style recalculation.
   - `componentThemeContract` demonstrates `createThemeContract` for optional component-level overrides.

2. **Typed Recipes (`ui/ui.css.ts`)**
   - Uses `recipe()` from `@vanilla-extract/recipes` for `button`, `card`, `badge`, `alert`, `input`, `kpiCard`, and `table`, plus `style()` classes for Ark UI `Select`, `Dialog`, and `Tabs` slots (`[data-state="open"]`, `[data-selected]`, `[data-highlighted]`).
   - Uses CSS logical properties (`paddingInline`, `marginInlineStart`, `insetInlineEnd`) so `dir="rtl"` works out of the box.
   - Enforces `:focus-visible` outlines (`2px solid var(--color-primary)`) and avoids hardcoded `#000000` / `#FFFFFF` backgrounds.

3. **Vite Integration**
   - `vite.config.ts` registers `vanillaExtractPlugin()` from `@vanilla-extract/vite-plugin`.
   - All `.css.ts` files are compiled at build time into static CSS with zero client-side CSS-in-JS runtime overhead.

## Included Components

- **Primitives**: `Button`, `Card`, `Badge`, `Alert`, `Input`
- **Ark UI Headless**: `Select`, `Dialog`, `Tabs`
- **Dashboard**: `KpiCard` (with SVG sparklines & radial progress), `DataTable` (`@tanstack/react-table`), `ChartCard` (`react-apexcharts` + `--chart-1..10`)
- **Showcase**: `ShowcasePage.tsx` (complete interactive dashboard demo with theme & RTL toggles)
