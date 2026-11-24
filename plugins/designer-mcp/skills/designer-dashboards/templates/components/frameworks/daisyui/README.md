# daisyUI v5 + Designer Dashboards OpenDesign Bridge

Production-grade **daisyUI v5** component suite and Tailwind CSS v4 `@plugin "daisyui/theme"` bridge for Designer Dashboards.

## Highlights

- **CSS-First Tailwind v4 Integration**: Uses `@import "tailwindcss";`, `@plugin "daisyui";`, and `@plugin "daisyui/theme"` with zero `tailwind.config.js` boilerplate.
- **OpenDesign Token Bridge**: Maps daisyUI semantic tokens (`--color-base-100`, `--color-base-200`, `--color-base-300`, `--color-base-content`, `--color-primary`, `--color-info`, `--color-success`, `--color-warning`, `--color-error`, `--radius-*`) directly to OpenDesign CSS custom properties (`--color-surface`, `--color-canvas`, `--color-text`, `--color-primary`, etc.).
- **Dual Light/Dark Sync**: `DaisyThemeProvider` synchronizes `data-theme="rabbit-light"` / `"rabbit-dark"` (for daisyUI v5) alongside `.dark` (for OpenDesign `design-system/styles.css` dark tokens) and `dir="ltr" | "rtl"`.
- **WCAG 2.1 AA Accessible**: Native top-layer `<dialog>` modal, `aria-label` enforcement on icon-only buttons, keyboard-navigable `Tabs`, `aria-invalid` / `aria-describedby` form controls, and `:focus-visible` outlines.

## Installation & Peer Dependencies

```bash
npm install daisyui@^5.0.0 lucide-react apexcharts react-apexcharts @tanstack/react-table
npm install -D tailwindcss@^4.3.5 @tailwindcss/vite@^4.3.5
```

- **Vite Plugin**: `@tailwindcss/vite` is required in `vite.config.ts`.
- **License**: daisyUI v5 is **MIT** licensed.

## CSS Bridge (`src/index.css`)

```css
@import "tailwindcss";
@import "../design-system/styles.css";
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: "rabbit-light";
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-base-100: var(--color-surface);
  --color-base-200: var(--color-canvas);
  --color-base-300: var(--color-surface-subtle);
  --color-base-content: var(--color-text);
  --color-primary: var(--color-primary);
  --color-primary-content: var(--color-on-solid);
  --color-info: var(--color-info);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-error: var(--color-error);
  --radius-selector: var(--radius-md);
  --radius-field: var(--radius-md);
  --radius-box: var(--radius-md);
}
```

## Components Included

- `theme/DaisyThemeProvider.tsx` — Theme (`rabbit-light` / `rabbit-dark` / `system`) + RTL (`dir="rtl"`) provider
- `ui/Button.tsx` — Variants, tones, sizes, loading & icon-only states
- `ui/Card.tsx` — Structured card with header, body, actions, bordered/elevated variants
- `ui/Badge.tsx` — Semantic tones, soft/outline/ghost styles, sizes
- `ui/Alert.tsx` — Accessible status alerts with optional dismiss action
- `ui/Input.tsx` — Fieldset-wrapped input with label, hint, error, and start/end adornments
- `ui/Select.tsx` — Fieldset-wrapped select with typed options and error state
- `ui/Dialog.tsx` — Native HTML `<dialog>` top-layer modal with Escape & backdrop handling
- `ui/Tabs.tsx` — Box/border/lift tabs with ArrowLeft/ArrowRight keyboard navigation
- `ui/KpiCard.tsx` — Metric card with formatted value, delta badge, icon, and inline SVG sparkline
- `ui/DataTable.tsx` — TanStack Table v9 + daisyUI `table` with sorting, search, and pagination
- `ui/ChartCard.tsx` — ApexCharts wrapper reading OpenDesign `--chart-1..10` and surface tokens
- `ShowcasePage.tsx` — Interactive dashboard showcase demonstrating all components
