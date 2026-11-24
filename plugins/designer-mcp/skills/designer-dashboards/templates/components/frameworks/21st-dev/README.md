# 21st.dev + Base UI Integration for Designer Dashboards

This framework pack integrates **21st.dev** AI-assisted UI prototyping and its community component registry (`@21st-dev`) with **OpenDesign OKLCH tokens** (`design-system/styles.css`) and **Base UI** (`@base-ui/react`).

## Architecture & Single-Engine Laws

1. **Single Styling Engine**: Tailwind CSS v4 (`@tailwindcss/vite`) is the sole utility styling engine. All semantic colors, radii, and typography are bridged from `design-system/styles.css` via `src/index.css`.
2. **Zero Hardcoded Neutral Hexes**: Never hardcode `#FFFFFF`, `#000000`, `bg-white`, `bg-black`, or `bg-slate-*` in 21st.dev-generated components. Always use the bridged OpenDesign CSS custom properties:
   - Canvas / Page background: `var(--color-canvas)` (`bg-[var(--color-canvas)]`)
   - Card / Surface: `var(--color-surface)` (`bg-[var(--color-surface)]`)
   - Elevated Popover / Dialog: `var(--color-surface-elevated)`
   - Subtle / Muted Surface: `var(--color-surface-subtle)`
   - Borders: `var(--color-border)`
   - Text / Muted Text: `var(--color-text)` / `var(--color-text-muted)`
   - Primary & Semantic Tones: `var(--color-primary)`, `var(--color-success)`, `var(--color-warning)`, `var(--color-error)`, `var(--color-info)` and their `*-surface` / `*-border` counterparts.
3. **Accessible Headless Primitives**: Interactive overlays (`Dialog`, `Select`, `Tabs`, `Button`) use `@base-ui/react` for built-in keyboard navigation, ARIA attributes, focus trapping, and portal layering.
4. **RTL & Dark Mode First-Class**:
   - Light/dark mode is controlled by `[data-theme="dark"]` / `.dark` on `<html>`, automatically updating all OpenDesign and shadcn-bridged variables (`--background`, `--card`, `--popover`, etc.).
   - Use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) so `dir="rtl"` works out of the box.
5. **Icon & Chart Standards**:
   - Icons use `lucide-react` exclusively, with `aria-label` on icon-only buttons.
   - Charts use `react-apexcharts` / `apexcharts` reading `--chart-1` through `--chart-10` from `design-system/styles.css`.

## Installing Components from 21st.dev Registry

The starter includes a pre-configured `components.json` pointing to the `@21st-dev` registry:

```bash
npx shadcn@latest add @21st-dev/<component-slug>
```

After pulling any community component into `src/components/ui/`:
1. Replace any hardcoded `#fff` / `#000` / `zinc-*` / `slate-*` classes with `var(--color-*)` tokens or bridged Tailwind classes (`bg-card`, `text-foreground`, `border-border`, `bg-muted`).
2. Ensure icon-only buttons include `aria-label`.
3. Verify keyboard focus rings rely on `:focus-visible` (`var(--color-primary)`).

## Included Components

- `ui/Button.tsx` — Base UI `Button` + `class-variance-authority` variants (`solid`, `outline`, `tonal`, `ghost`, `destructive`) and sizes (`xs`, `sm`, `md`, `lg`, `icon`)
- `ui/Card.tsx` — Composable `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `ui/Badge.tsx` — Semantic status badges (`primary`, `success`, `warning`, `error`, `info`, `neutral`)
- `ui/Alert.tsx` — Accessible `role="alert"` banners with optional dismiss button
- `ui/Input.tsx` — Typed form input with label, helper/error text, and RTL-safe adornments
- `ui/Select.tsx` — `@base-ui/react/select` accessible dropdown with keyboard support
- `ui/Dialog.tsx` — `@base-ui/react/dialog` modal with backdrop, Escape close, and `aria-label` close button
- `ui/Tabs.tsx` — `@base-ui/react/tabs` keyboard-navigable tab list and panels
- `ui/KpiCard.tsx` — SaaS metric card with trend badge and icon slot
- `ui/DataTable.tsx` — `@tanstack/react-table` sortable, filterable, paginated table
- `ui/ChartCard.tsx` — `react-apexcharts` wrapper synchronized with OpenDesign `--chart-*` tokens
- `ShowcasePage.tsx` — Full AI-prototyped SaaS dashboard showcase
