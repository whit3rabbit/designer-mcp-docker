# Designer Dashboards Mantine Adapter

Production-grade integration between **Mantine** (CSS Modules + `postcss-preset-mantine`) and **Designer Dashboards OpenDesign** CSS custom properties — **no Tailwind CSS required**.

## Architecture

1. **OpenDesign Token Bridge (`theme/MantineThemeProvider.tsx`)**
   - `openDesignMantineTheme` (`createTheme`) maps `--font-sans`, `--font-mono`, `--radius-md`, and a semantic `brand` color tuple backed by `var(--color-primary*)`.
   - `openDesignCssVariablesResolver` (`CSSVariablesResolver`) maps Mantine's core CSS variables (`--mantine-color-body`, `--mantine-color-text`, `--mantine-color-dimmed`, `--mantine-color-default`, `--mantine-color-default-border`, `--mantine-primary-color-*`) directly to OpenDesign's `--color-*` tokens.
   - `ThemeObserver` uses a `MutationObserver` on `<html>` (`data-theme="dark"` / `.dark`) so Mantine's `useMantineColorScheme()` stays in sync with Designer Dashboards's theme switcher.
   - `<Notifications position="bottom-right" />` from `@mantine/notifications` is mounted inside the provider.

2. **No Tailwind CSS**
   - Mantine ships pre-compiled CSS Modules (`@mantine/core/styles.css`, `@mantine/notifications/styles.css`, `@mantine/dates/styles.css`).
   - `postcss.config.cjs` enables `postcss-preset-mantine` and `postcss-simple-vars` for Mantine's responsive breakpoints (`xs`..`xl`) without Tailwind.

3. **RTL & Accessibility**
   - All components use logical spacing/alignment and respect `dir="rtl"` on `<html>`.
   - Icon-only buttons require `aria-label`; focus rings use `:focus-visible` with `var(--color-primary)`.
   - Never hardcodes `#000000` or `#FFFFFF`; all surfaces, borders, text, and charts reference OpenDesign variables (`--color-*`, `--chart-1..10`).

## Included Files

- `theme/MantineThemeProvider.tsx` — Theme, CSSVariablesResolver, dark mode sync, Notifications
- `ui/Button.tsx` — Semantic `Button` and `IconButton`
- `ui/Card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `ui/Badge.tsx` — Semantic status `Badge`
- `ui/Alert.tsx` — Dismissible semantic `Alert`
- `ui/Input.tsx` — `Input`, `PasswordField`, `TextareaField`
- `ui/Select.tsx` — `Select` and `MultiSelect`
- `ui/Dialog.tsx` — Accessible `Dialog` (wraps Mantine `Modal`)
- `ui/Tabs.tsx` — `Tabs` with OpenDesign active indicator
- `ui/KpiCard.tsx` — Dashboard KPI metric card with trend badge
- `ui/DataTable.tsx` — TanStack React Table v9 + Mantine `Table` with search, sorting, pagination
- `ui/ChartCard.tsx` — ApexCharts wrapper using `--chart-1..10` tokens
- `ui/index.ts` — Barrel exports
- `ShowcasePage.tsx` — Full dashboard showcase page
