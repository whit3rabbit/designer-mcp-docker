# Ark UI (`@ark-ui/react`) + OpenDesign Bridge

Headless, state-machine-driven UI primitives powered by **Zag.js** and styled exclusively with **OpenDesign OKLCH CSS custom properties**—no Tailwind CSS required.

## Architecture

- **State Machines (`@ark-ui/react` v5)**: Every interactive primitive (`Field`, `Select`, `Dialog`, `Tabs`) is backed by a deterministic Zag.js finite-state machine that manages keyboard navigation, focus trapping, ARIA attributes, and RTL support out of the box.
- **Data-Attribute Styling (`theme/arkui.css`)**: Rather than utility classes, components are styled via semantic `.rd-ark-*` classes combined with Zag.js state attributes:
  - `[data-state="open"]` / `[data-state="closed"]` — animated popovers, modals, and chevrons
  - `[data-selected]` / `[data-highlighted]` — active tabs and select options
  - `[data-disabled]` — consistent disabled opacity & pointer handling
  - `[data-focus]` / `:focus-visible` — WCAG 2.1 AA keyboard focus rings
  - `[data-invalid]` — error borders and helper/error text toggling
- **OpenDesign Token Bridge**: All colors, radii, typography, and chart palettes resolve directly to `--color-*`, `--font-*`, `--radius-md`, and `--chart-1..10`, ensuring automatic light/dark mode (`[data-theme="dark"]` / `.dark`) and zero hardcoded `#000000` / `#FFFFFF` values.

## Usage

1. Import `design-system/styles.css` and `theme/arkui.css` in your entry CSS or `main.tsx`.
2. Import typed components from `./ui`:

```tsx
import { Button, Card, Dialog, Select, Tabs, DataTable, ChartCard } from './ui';
```

3. Pair with CSS Modules, vanilla-extract, or plain CSS using the same `var(--color-*)` tokens.

## Components Included

- **Primitives**: `Button`, `Card`, `Badge`, `Alert`
- **Ark UI State-Machine Inputs**: `Input` (`@ark-ui/react/field`), `Select` (`@ark-ui/react/select` + `createListCollection`)
- **Ark UI Overlays & Navigation**: `Dialog` (`@ark-ui/react/dialog` + `Portal`), `Tabs` (`@ark-ui/react/tabs`)
- **Analytics & Data**: `KpiCard`, `DataTable` (`@tanstack/react-table`), `ChartCard` (`react-apexcharts`)
- **Showcase**: `ShowcasePage.tsx`
