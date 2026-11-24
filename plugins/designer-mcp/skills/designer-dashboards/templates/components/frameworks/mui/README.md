# Designer Dashboards — Material UI (MUI v7) Integration

Production-grade **Material UI v7** (`@mui/material` + `@emotion/react` + `@emotion/styled`) integration for Designer Dashboards, engineered for **enterprise complex applications** without Tailwind CSS.

## Architecture

1. **Single Source of Truth (`design-system/styles.css`)**
   OpenDesign OKLCH tokens (`--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-surface-subtle`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-surface`, `--color-primary-border`, `--color-primary-hover`, `--color-on-solid`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--font-sans`, `--font-mono`, `--radius-md`, `--chart-1..10`) are imported once in `src/index.css`.
2. **MUI `createTheme` + `cssVariables: true` Bridge (`theme/MuiThemeProvider.tsx`)**
   `MuiThemeProvider` maps MUI's `palette`, `typography`, `shape`, and `components` directly to OpenDesign `var(--color-*)` tokens. All four palette keys (`main`, `light`, `dark`, `contrastText`) are supplied so MUI's color manipulator never attempts to parse CSS `var()` strings at runtime.
3. **Dark Mode & RTL Support**
   - **Dark mode**: Syncs with `<html data-theme="dark">` and `.dark` class (persisted in `localStorage` under `rd-theme`), triggering `MutationObserver` updates and `useColorScheme()` / `ThemeProvider`.
   - **RTL**: Sets `theme.direction = 'rtl'` and `<html dir="rtl">`. For full Emotion CSS property flipping in production RTL apps, install `@emotion/cache` and `stylis-plugin-rtl` and wrap with `<CacheProvider>`.
4. **Accessibility (WCAG 2.1 AA)**
   - Visible `:focus-visible` ring using `var(--color-primary)`.
   - `aria-label` enforced on all icon-only `IconButton` / `Button` controls.
   - Semantic landmarks, `aria-sort` on sortable table headers, and keyboard-navigable dialogs/tabs.

## Directory Structure

```text
templates/components/frameworks/mui/
├── README.md
├── theme/
│   └── MuiThemeProvider.tsx
├── ui/
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ChartCard.tsx
│   ├── DataTable.tsx
│   ├── Dialog.tsx
│   ├── Input.tsx
│   ├── KpiCard.tsx
│   ├── Select.tsx
│   ├── Tabs.tsx
│   └── index.ts
└── ShowcasePage.tsx
```

## Peer Dependencies

```bash
pnpm add @mui/material @emotion/react @emotion/styled lucide-react apexcharts react-apexcharts @tanstack/react-table
```

Optional for automatic Emotion RTL CSS flipping:

```bash
pnpm add @emotion/cache stylis-plugin-rtl
```
