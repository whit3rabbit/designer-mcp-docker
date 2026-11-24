# Aceternity UI — Designer Dashboards Framework Adapter

Creative, motion-driven UI primitives and dashboard components built for **Designer Dashboards** using **Tailwind CSS v4**, **Motion (`motion/react`)**, and **OpenDesign OKLCH CSS tokens**.

## Token & Theme Integration

Every primitive and UI component bridges directly to OpenDesign CSS custom properties compiled in `design-system/styles.css`:

- **Surfaces & Borders**: `--color-canvas`, `--color-surface`, `--color-surface-elevated`, `--color-surface-subtle`, `--color-border`, `--color-scrim`
- **Typography**: `--color-text`, `--color-text-muted`, `--font-sans`, `--font-mono`, `--font-heading-weight`
- **Semantic & Brand Accents**: `--color-primary`, `--color-primary-surface`, `--color-primary-border`, `--color-primary-hover`, `--color-on-solid`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- **Charts**: `--chart-1` through `--chart-10`
- **Radii & Elevation**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`

No hardcoded `#000000` or `#FFFFFF` backgrounds are used anywhere; all 21 OpenDesign light/dark presets and RTL (`dir="rtl"`) layouts work out of the box.

## Accessibility & `prefers-reduced-motion`

- All motion primitives (`Card3D`, `SpotlightCard`, `MovingBorder`, `BackgroundBeams`, `FloatingDock`, `Dialog`, `Tabs`) check `useReducedMotion()` from `motion/react`.
- The starter wraps the application in `<MotionConfig reducedMotion="user">` in `src/main.tsx`.
- CSS keyframe utilities in `src/index.css` are disabled inside `@media (prefers-reduced-motion: reduce)`.
- Interactive controls provide `:focus-visible` rings, keyboard navigation, `aria-label` on icon-only buttons, and WCAG 2.1 AA contrast via OpenDesign tokens.

## Structure

- `assets/` — Aceternity interactive primitives:
  - `Card3D.tsx` (`CardContainer`, `CardBody`, `CardItem`)
  - `Spotlight.tsx` (`Spotlight`, `SpotlightCard`)
  - `MovingBorder.tsx` (`MovingBorderBox`, `MovingBorderButton`)
  - `BackgroundBeams.tsx` (`BackgroundBeams`)
  - `FloatingDock.tsx` (`FloatingDock`)
- `ui/` — Token-wired dashboard UI kit (`Button`, `Card`, `Badge`, `Alert`, `Input`, `Select`, `Dialog`, `Tabs`, `KpiCard`, `DataTable`, `ChartCard`, `index.ts`)
- `ShowcasePage.tsx` — Creative animated dashboard showcase combining bento grids, 3D cards, spotlights, ApexCharts, and TanStack Table.

## Notes

- **License**: Aceternity UI patterns are MIT-compatible; `motion` is MIT-licensed.
- **Peer Dependencies**: Requires `react` (^19), `motion` (^14), `tailwindcss` (^4), `lucide-react`, `clsx`, `tailwind-merge`, `@tanstack/react-table`, `apexcharts`, and `react-apexcharts`.
