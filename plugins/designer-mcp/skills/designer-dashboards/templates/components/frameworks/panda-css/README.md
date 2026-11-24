# Designer Dashboards — Panda CSS + Base UI

Zero-runtime, type-safe CSS-in-JS built at compile time with **Panda CSS** (`@pandacss/dev`) and headless accessible primitives from **Base UI** (`@base-ui/react`), bridged to **OpenDesign** CSS custom properties.

## Architecture

- **Zero Runtime Overhead**: All `css()`, `cva()`, and `sva()` calls are statically extracted by Panda's PostCSS plugin (`@pandacss/dev/postcss`) into atomic CSS layers (`@layer reset, base, tokens, recipes, utilities;`).
- **OpenDesign Token Bridge**: `theme/panda.preset.ts` maps `--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-surface-subtle`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary*`, `--color-success*`, `--color-warning*`, `--color-error*`, `--color-info*`, `--font-sans`, `--font-mono`, `--radius-*`, and `--chart-1..10` into Panda `semanticTokens`.
- **Light / Dark & RTL**: Automatically adapts when `.dark` or `[data-theme="dark"]` is toggled on `<html>`, and uses logical CSS properties (`ps`, `pe`, `ms`, `me`, `insetInlineStart`, `insetInlineEnd`) for `dir="rtl"` support.
- **Accessible Primitives**: Interactive overlays and controls (`Dialog`, `Tabs`, `Select`) use `@base-ui/react` for WAI-ARIA compliance, keyboard navigation, and focus management.

## Setup

1. Install dependencies and run Panda codegen:

```bash
pnpm install
pnpm prepare # runs `panda codegen` -> generates `styled-system/`
```

2. Use the OpenDesign preset in `panda.config.ts`:

```ts
import { defineConfig } from '@pandacss/dev';
import { openDesignPreset } from './src/theme/panda.preset';

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/preset-base', openDesignPreset],
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  outdir: 'styled-system',
});
```

3. Ensure `src/index.css` declares Panda's cascade layers before importing `design-system/styles.css`:

```css
@layer reset, base, tokens, recipes, utilities;
@import "../design-system/styles.css";
```

## Components Included

- `ui/Button.tsx` — `cva` recipe with `variant` (`solid`, `outline`, `tonal`, `ghost`, `link`), `tone` (`primary`, `success`, `warning`, `error`, `info`, `neutral`), `size` (`xs`–`xl`), `iconOnly`, `loading`.
- `ui/Card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` with `elevated` and `interactive` variants.
- `ui/Badge.tsx` — `cva` status pill with semantic tones and optional dot indicator.
- `ui/Alert.tsx` — Semantic status banner (`info`, `success`, `warning`, `error`) with dismissible action and `aria-label`.
- `ui/Input.tsx` — Accessible labeled input with leading/trailing icon slots, helper text, and `aria-invalid` error state.
- `ui/Select.tsx` — `@base-ui/react/select` dropdown styled with Panda `css()`.
- `ui/Dialog.tsx` — `@base-ui/react/dialog` modal with backdrop blur, keyboard Escape, and focus trap.
- `ui/Tabs.tsx` — `@base-ui/react/tabs` with animated indicator and keyboard arrow navigation.
- `ui/KpiCard.tsx` — Metric card with delta badge, trend direction, and icon slot.
- `ui/DataTable.tsx` — `@tanstack/react-table` with sorting, global filter, and semantic table tokens.
- `ui/ChartCard.tsx` — `react-apexcharts` wrapper reading OpenDesign `--chart-1..10` and `--color-text-muted` tokens.
- `ShowcasePage.tsx` — Full dashboard showcase combining all components.
