# HeroUI v3 + React Aria + Tailwind v4 Adapter

Production-grade Designer Dashboards integration for **HeroUI v3** (`@heroui/react` + `@heroui/styles` + `react-aria-components`) powered by **Tailwind CSS v4** and **OpenDesign OKLCH tokens**.

## Architecture

HeroUI v3 is built directly on **React Aria Components** and **Tailwind CSS v4**, removing legacy v2 runtime dependencies (`framer-motion`, `tailwind.config.js` plugins, and `HeroUIProvider`).

1. **CSS-First Token Bridge (`src/index.css`)**
   - Imports `tailwindcss`, `@heroui/styles`, and `../design-system/styles.css`.
   - Maps HeroUI v3 semantic variables (`--background`, `--foreground`, `--surface`, `--surface-secondary`, `--surface-tertiary`, `--overlay`, `--muted`, `--border`, `--divider`, `--focus`, `--accent`, `--accent-foreground`, `--success`, `--warning`, `--danger`, `--font-sans`, `--font-mono`, `--radius`) directly to OpenDesign CSS custom properties (`var(--color-*)`, `var(--font-*)`, `var(--radius-md)`).
   - Never hardcodes `#000000` or `#FFFFFF` backgrounds.

2. **Theme & RTL Synchronization (`theme/HeroUIThemeProvider.tsx`)**
   - Synchronizes `data-theme="light" | "dark"` and `.dark` on `<html>` with `localStorage` (`rd-theme`), OS `prefers-color-scheme`, and external theme mutations.
   - Manages `dir="ltr" | "rtl"` and wraps children in React Aria's `I18nProvider` for full RTL and locale support.

3. **Accessible SaaS Primitives (`ui/`)**
   - `Button`, `Card`, `Badge`, `Alert`, `Input`, `Select`, `Dialog`, `Tabs`, `KpiCard`, `DataTable`, `ChartCard`.
   - Built on HeroUI v3 compound components and React Aria accessibility guarantees (keyboard navigation, focus management, ARIA attributes, `:focus-visible` outlines).

## Peer Dependencies & Vite Setup

- **Vite plugin**: `@tailwindcss/vite` (no `postcss.config.js` or `tailwind.config.js` required).
- **Packages**: `@heroui/react`, `@heroui/styles`, `react-aria-components`, `tailwindcss` v4, `lucide-react`, `@tanstack/react-table`, `apexcharts`, `react-apexcharts`.
- **License**: `@heroui/react`, `@heroui/styles`, and `react-aria-components` are MIT/Apache-2.0 licensed.
