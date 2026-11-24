# coss ui · Designer Dashboards Framework Pack

**coss ui** (Cal.com's modern product UI built on **Base UI** + **Tailwind CSS v4**) delivers crisp, high-craft SaaS product primitives with zero-runtime styling, unstyled accessible primitives from `@base-ui/react`, and full integration with **OpenDesign OKLCH tokens**.

## Architecture

- **Primitives**: `@base-ui/react` (`Button`, `Dialog`, `Select`, `Tabs`) providing WAI-ARIA keyboard navigation, focus management, and top-layer portals.
- **Variants & Styling**: `class-variance-authority` (`cva`) + `clsx` + `tailwind-merge` via `theme/cn.ts`.
- **Token Bridge**: Every surface, border, text, focus ring, and chart series maps directly to OpenDesign CSS custom properties (`var(--color-*)`, `var(--font-*)`, `var(--radius-md)`, `var(--chart-1..10)`).
- **Dark Mode & RTL**: Automatic light/dark switching via `.dark` / `[data-theme="dark"]` and logical Tailwind utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`) for full `dir="rtl"` support.
- **Density**: `compact` | `comfortable` | `spacious` density presets in `theme/cn.ts`.

## Peer & Runtime Dependencies

- `react` & `react-dom` (`^19.3.1`)
- `@base-ui/react` (`^1.9.0`)
- `class-variance-authority` (`^0.7.1`)
- `clsx` (`^2.1.1`)
- `tailwind-merge` (`^3.7.1`)
- `lucide-react` (`^1.78.0`)
- `@tanstack/react-table` (`^9.3.1`) — used by `DataTable`
- `apexcharts` & `react-apexcharts` — used by `ChartCard`
- `tailwindcss` & `@tailwindcss/vite` (`^4.3.5`)

## License Note

- `@base-ui/react` is MIT-licensed (MUI / Base UI).
- `coss ui` component patterns are inspired by Cal.com's open-source product UI conventions and adapted for Designer Dashboards OpenDesign tokens.
