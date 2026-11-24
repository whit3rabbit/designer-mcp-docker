# Designer Dashboards — Open Props Framework Kit

Lightweight, framework-agnostic CSS design tokens powered by **Open Props** (`open-props` + `postcss-jit-props`) combined with **OpenDesign** semantic OKLCH color tokens.

## Architecture

| Layer | Responsibility | Token Prefix |
| --- | --- | --- |
| **OpenDesign** (`design-system/styles.css`) | Semantic color palette, light/dark modes, typography, chart series | `--color-*`, `--font-*`, `--chart-1..10` |
| **Open Props** (`postcss-jit-props`) | Spatial scale, elevation shadows, border radii, easing curves, z-index layers | `--size-*`, `--shadow-*`, `--ease-*`, `--radius-*`, `--border-size-*`, `--layer-*` |
| **Open Props Bridge** (`theme/open-props-bridge.css`) | Bridges Open Props spatial/motion tokens with OpenDesign semantic colors into `.op-*` primitives | `--op-*` |

## Why `postcss-jit-props`?

`postcss-jit-props(OpenProps)` statically scans your CSS for Open Props custom properties and injects **only** the tokens actually referenced. Zero unused CSS variables ship to the browser.

```js
// postcss.config.cjs
const postcssJitProps = require('postcss-jit-props');
const OpenProps = require('open-props');

module.exports = {
  plugins: [postcssJitProps(OpenProps)],
};
```

## Included UI Primitives (`ui/`)

- `Button` — `solid`, `outline`, `tonal`, `ghost` variants; `primary`, `neutral`, `success`, `warning`, `error`, `info` tones; `sm`, `md`, `lg` sizes; `loading` & `iconOnly`
- `Card` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge` — `solid`, `tonal`, `outline`, `dot` variants across all semantic tones
- `Alert` — Accessible `role="alert"` / `role="status"` callouts with optional dismiss action
- `Input` — Labeled text input with hint, error state (`aria-invalid`), and leading/trailing adornments
- `Select` — Accessible native `<select>` with label, hint, and error state
- `Dialog` — Native top-layer `<dialog>` modal with Escape/backdrop dismissal and `aria-labelledby`
- `Tabs` — WAI-ARIA `tablist` / `tab` / `tabpanel` with RTL-aware ArrowLeft/ArrowRight/Home/End keyboard navigation
- `KpiCard` — Metric card with trend delta badge and optional icon
- `DataTable` — Powered by `@tanstack/react-table` with sorting, search filtering, and pagination
- `ChartCard` — Powered by `react-apexcharts`, reading OpenDesign `--chart-1..10` and adapting to light/dark themes

## Accessibility & RTL

- All interactive controls include `:focus-visible` outlines (`2px solid var(--color-primary)`).
- Icon-only buttons require `aria-label`.
- Layout styles use CSS logical properties (`padding-inline`, `margin-inline`, `text-align: start`) for automatic `dir="rtl"` support.
- `prefers-reduced-motion: reduce` disables transitions and animations.

## Dependencies & License

- `open-props` (`^1.7.16`) — MIT License
- `postcss-jit-props` (`^1.0.15`, devDependency) — MIT License
- Peer/runtime dependencies: `react`, `react-dom`, `lucide-react`, `@tanstack/react-table`, `apexcharts`, `react-apexcharts`
