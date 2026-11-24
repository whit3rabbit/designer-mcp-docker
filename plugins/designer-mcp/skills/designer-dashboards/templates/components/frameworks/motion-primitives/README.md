# Motion Primitives for Designer Dashboards

Production-grade animated UI primitives and dashboard components built on [`motion`](https://motion.dev/) (`motion/react`), Tailwind CSS v4, and OpenDesign CSS custom properties.

## Core Principles

1. **Global Reduced Motion**: Always wrap your application root in `<MotionConfig reducedMotion="user">` (configured in `src/main.tsx`). Custom JS-driven primitives (`AnimatedNumber`, `SlidingNumber`, `TextEffect`, `InView`) also read `useReducedMotion()` so numeric and scroll animations settle immediately when `prefers-reduced-motion: reduce` is active.
2. **OpenDesign Token Bridge**: All surfaces, borders, text, semantic tones, and chart palettes reference `var(--color-*)`, `var(--radius-*)`, `var(--shadow-*)`, and `var(--font-*)` from `design-system/styles.css`. Zero hardcoded `#000000` or `#FFFFFF` backgrounds.
3. **OpenDesign Motion Tokens**:
   - `--motion-duration-fast` (`150ms`) — micro-interactions, button tap, badge pulse
   - `--motion-duration-base` (`240ms`) — tabs indicator, dialogs, select menus, card hover
   - `--motion-duration-slow` (`400ms`) — viewport reveals (`InView`), `TransitionPanel`, number springs
   - `--motion-ease-standard` (`cubic-bezier(0.22, 1, 0.36, 1)`) — primary decelerating curve
   - `--motion-ease-exit` (`cubic-bezier(0.4, 0, 1, 1)`) — exit transitions
4. **RTL & Accessibility**: Directional spacing uses CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`). All icon-only buttons include `aria-label`, modals trap focus and handle `Escape`, and `:focus-visible` outlines use `var(--color-primary-focus-ring)`.

## Structure

- `assets/` — Reusable motion primitives:
  - `TextEffect.tsx` — Word, character, or line reveal with `fade`, `slide`, or `blur` presets
  - `AnimatedNumber.tsx` — Spring-interpolated number counter with `Intl.NumberFormat`
  - `SlidingNumber.tsx` — Odometer-style digit-by-digit vertical sliding counter
  - `InView.tsx` — Viewport-triggered entrance reveal wrapper
  - `TransitionPanel.tsx` — Animated multi-step / multi-view panel switcher
  - `MorphingDialog.tsx` — Shared-element `layoutId` card-to-dialog expansion
- `ui/` — OpenDesign-styled dashboard components (`Button`, `Card`, `Badge`, `Alert`, `Input`, `Select`, `Dialog`, `Tabs`, `KpiCard`, `DataTable`, `ChartCard`, `index.ts`)
- `ShowcasePage.tsx` — Complete motion-enhanced analytics dashboard showcase

## Peer Dependencies

- `react` `^19.3.1`, `react-dom` `^19.3.1`
- `motion` `^12.4.7` (imported from `motion/react`)
- `lucide-react`, `clsx`, `tailwind-merge`
- `apexcharts`, `react-apexcharts` (for `ChartCard`)
- `@tanstack/react-table` (for `DataTable`)
