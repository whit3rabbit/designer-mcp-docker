# React Bits for Designer Dashboards

Production-grade animated UI primitives, shader-style backgrounds, cursor interactions, and dashboard components built on **Motion** (`motion/react`), **Tailwind CSS v4**, and **plain CSS**, bridged to **OpenDesign OKLCH CSS custom properties**.

## License & Attribution Notice

> **Important:** React Bits permits **commercial application use** (building websites, internal tools, SaaS products, and client dashboards), **but restricts redistributing, reselling, or repackaging the components themselves** as a standalone UI kit, component library, or template marketplace offering.
>
> Review the upstream React Bits license terms before publishing derivative template packages.

## `prefers-reduced-motion` Compliance

All animated primitives in this directory respect `prefers-reduced-motion: reduce` at both the JS and CSS layers:

1. **Global Motion Wrapper:** `main.tsx` wraps the app in `<MotionConfig reducedMotion="user">`.
2. **Runtime Hook (`theme/motionConfig.ts`):** `useMotionPreferences()` subscribes to `window.matchMedia('(prefers-reduced-motion: reduce)')` and `useReducedMotion()` from `motion/react`.
   - `AuroraBackground`: pauses Canvas shader animation and renders a static token-driven radial gradient.
   - `SpotlightCard`: disables dynamic pointer-tracking transforms and uses a subtle static focus/hover highlight.
   - `SplitText`: renders text immediately without staggered translate/opacity delays.
   - `MagnetButton`: disables magnetic spring displacement while preserving click and `:focus-visible` states.
   - `ClickSpark`: skips particle burst generation on click/tap.
3. **CSS Safeguard:** `@media (prefers-reduced-motion: reduce)` in `src/index.css` disables CSS keyframe animations and transitions.

## OpenDesign Token & RTL Support

- Zero hardcoded `#000000` or `#FFFFFF` backgrounds — all surfaces, borders, text, and chart series read `var(--color-*)` and `var(--chart-*)` from `design-system/styles.css`.
- Supports both `light` and `dark` (`[data-theme="dark"]` / `.dark`) modes dynamically.
- Uses CSS logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`) for full `dir="rtl"` compatibility.

## Directory Structure

```text
react-bits/
├── README.md
├── ShowcasePage.tsx
├── theme/
│   └── motionConfig.ts
├── assets/
│   ├── AuroraBackground.tsx
│   ├── ClickSpark.tsx
│   ├── MagnetButton.tsx
│   ├── SplitText.tsx
│   └── SpotlightCard.tsx
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
