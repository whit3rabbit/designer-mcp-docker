# Magic UI Framework Adapter for Designer Dashboards

Production-grade animated bento dashboard primitives and UI components built with **Motion (`motion/react`)**, **Tailwind CSS v4**, and **OpenDesign OKLCH CSS tokens**.

## Features

- **OpenDesign Token Bridge**: Every surface, border, text, chart, and accent color resolves through `var(--color-*)`, `var(--radius-*)`, `var(--shadow-*)`, and `var(--chart-1..10)`. Zero hardcoded `#000000` or `#FFFFFF` backgrounds.
- **Light, Dark & RTL Ready**: Automatic `[data-theme="dark"]` / `.dark` support (including ApexCharts theme sync) and logical CSS properties (`ps-*`, `pe-*`, `text-start`) for `dir="rtl"`.
- **Reduced Motion First**: Every animated primitive (`BorderBeam`, `NumberTicker`, `AnimatedGradientText`, `Dialog`, `Tabs`, `Button`) honors `prefers-reduced-motion: reduce` and `<MotionConfig reducedMotion="user">`.
- **Accessible (WCAG 2.1 AA)**: Proper ARIA roles, `aria-label` on icon-only controls, keyboard navigation, focus trapping in `Dialog`, and `:focus-visible` rings.

## Dependencies

- **Runtime**: `motion` (`^12.6.0`), `tailwindcss` (`^4.3.5`), `clsx`, `tailwind-merge`, `lucide-react`, `apexcharts`, `react-apexcharts`, `@tanstack/react-table`
- **Vite Plugin**: `@tailwindcss/vite`
- **License**: Magic UI patterns & Designer Dashboards adapter components are MIT-licensed.

## Structure

```text
magic-ui/
├── README.md
├── ShowcasePage.tsx          # Animated Bento Dashboard Showcase
├── assets/
│   ├── AnimatedGradientText.tsx
│   ├── BentoGrid.tsx
│   ├── BorderBeam.tsx
│   ├── DotPattern.tsx
│   └── NumberTicker.tsx
└── ui/
    ├── Alert.tsx
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── ChartCard.tsx
    ├── DataTable.tsx
    ├── Dialog.tsx
    ├── Input.tsx
    ├── KpiCard.tsx
    ├── Select.tsx
    ├── Tabs.tsx
    └── index.ts
```

## CSS Keyframes

Ensure your `src/index.css` imports `../design-system/styles.css` and includes the `.animate-magic-beam`, `.animate-magic-gradient`, and `.animate-magic-shimmer` keyframes with `@media (prefers-reduced-motion: reduce)` overrides (included by default in `templates/starters/react-vite-magicui/files/src/index.css`).
