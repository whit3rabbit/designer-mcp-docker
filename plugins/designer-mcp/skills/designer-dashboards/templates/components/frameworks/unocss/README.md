# Designer Dashboards UnoCSS Framework Pack

Atomic, zero-runtime utility-first UI primitives built with **UnoCSS** (`@unocss/preset-wind4`) and **OpenDesign OKLCH tokens**.

## Features

- **OpenDesign Token Bridge**: `theme/uno.preset.ts` maps all `--color-*`, `--font-*`, and `--radius-*` CSS custom properties into UnoCSS `theme.colors` and semantic shortcuts (`rd-card`, `rd-btn-base`, `rd-input-base`, `rd-focus-ring`).
- **Light & Dark Mode**: Automatic support via `var(--color-*)` and `dark` / `[data-theme="dark"]` selectors — zero hardcoded `#000000` or `#FFFFFF` backgrounds.
- **RTL Ready**: Uses CSS logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`) so `dir="rtl"` works out of the box.
- **WCAG 2.1 AA Accessible**: Proper ARIA roles (`dialog`, `alert`, `tablist`/`tab`/`tabpanel`), `aria-label` on icon-only buttons, keyboard navigation, and `:focus-visible` outlines.

## Setup (`uno.config.ts`)

```ts
import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss';
import presetWind4 from '@unocss/preset-wind4';
import { presetOpenDesign } from './theme/uno.preset';

export default defineConfig({
  presets: [
    presetWind4({ dark: 'class' }),
    presetOpenDesign(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
```

## Vite Configuration (`vite.config.ts`)

Ensure `UnoCSS()` is registered before `react()` and `'virtual:uno.css'` is imported in `src/main.tsx`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [UnoCSS(), react()],
});
```

## Included Components (`ui/`)

- `Button` — `solid`, `outline`, `tonal`, `ghost`, `link` variants across 7 tones, `iconOnly`, `loading`
- `Card` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge` — `solid`, `tonal`, `outline` variants with optional status dot
- `Alert` — semantic `info`, `success`, `warning`, `error` banners with dismiss action
- `Input` — labeled text input with `startAdornment`, `endAdornment`, helper & error states
- `Select` — accessible native select with label, placeholder, helper & error states
- `Dialog` — modal dialog with focus trap, Escape key handling, and backdrop click
- `Tabs` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` with ArrowLeft/ArrowRight keyboard navigation
- `KpiCard` — metric card with delta badge, trend indicator, and icon slot
- `DataTable` — TanStack React Table v9 powered table with sorting, search filter, and pagination
- `ChartCard` — ApexCharts wrapper dynamically reading `--chart-1..10` and theme tokens
