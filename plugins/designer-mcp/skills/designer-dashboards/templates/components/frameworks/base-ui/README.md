# Base UI (`@base-ui/react`) + OpenDesign Theme

Production-grade headless React primitives powered by **Base UI** (`@base-ui/react`) and styled with **OpenDesign** OKLCH CSS custom properties (`design-system/styles.css`).

## Architecture

- **Zero runtime CSS-in-JS & zero Tailwind requirement**: All primitives are styled via `theme/baseui.css` using semantic OpenDesign CSS variables (`--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-surface-subtle`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-on-solid`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--radius-md`, `--font-sans`, `--font-mono`, `--chart-1..10`).
- **State-driven styling via Base UI `data-*` attributes**:
  - `[data-open]`, `[data-closed]`, `[data-starting-style]`, `[data-ending-style]` for smooth CSS transitions on `Dialog`, `Select`, and `Popover`.
  - `[data-selected]`, `[data-highlighted]` for `Tabs.Tab` and `Select.Item`.
  - `[data-disabled]`, `[data-invalid]` for `Field` and `Button` states.
- **Light / Dark Mode**: Automatically adapts to `data-theme="dark"` and `.dark` without hardcoded `#000000` or `#FFFFFF` backgrounds.
- **RTL (`dir="rtl"`)**: Uses CSS logical properties (`padding-inline`, `margin-inline`, `inset-inline-start`, `text-align: start`) across all layouts and primitives.
- **Accessibility (WCAG 2.1 AA)**:
  - WAI-ARIA keyboard navigation, focus trapping, and inert background management provided by `@base-ui/react`.
  - Explicit `aria-label` on icon-only buttons and close triggers.
  - Visible `:focus-visible` ring (`2px solid var(--color-primary)`).

## Portal Stacking Context

Base UI renders `Dialog`, `Select`, and `Popover` into a `Portal`. Ensure your application root has `isolation: isolate` (already configured in `src/index.css`):

```css
#root {
  isolation: isolate;
}
```

## Subpath Imports

All Base UI primitives are imported from their modular subpaths for optimal tree-shaking:

- `@base-ui/react/dialog`
- `@base-ui/react/select`
- `@base-ui/react/tabs`
- `@base-ui/react/field`
- `@base-ui/react/popover`

## Usage

Import `theme/baseui.css` once in your application entry (or `ShowcasePage.tsx`), then import components from `./ui`:

```tsx
import './theme/baseui.css';
import { Button, Card, Dialog, Select, Tabs, Input, KpiCard, DataTable, ChartCard } from './ui';
```
