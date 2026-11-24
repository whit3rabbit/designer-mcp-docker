---
name: ui
description: >-
  Dashboard UI primitives and data-display builder (designer-dashboards:ui). Covers 4px spacing
  and sizing, single-pipeline icons (Iconify/Lucide string registry), standardized button
  grammar, ApexCharts 10 presets + LiveChart, TanStack server-mode DataGrid, KPI stat cards,
  12 form primitives + wizards, Sonner/Radix feedback/overlays, and restrained motion. Use
  when building dashboard buttons, icons, charts, KPI cards, data grids, forms, or toasts.
---

# `designer-dashboards:ui` — Dashboard UI Primitives, Icons, Charts & Grids

Use this skill when building or upgrading the component layer of a dashboard. Consult these references as needed:
- Icons & Typography: [03-icons-and-typography.md](../references/03-icons-and-typography.md)
- Data Display & Charts: [04-data-display-and-charts.md](../references/04-data-display-and-charts.md)
- Forms, Feedback & Chrome: [06-forms-feedback-chrome.md](../references/06-forms-feedback-chrome.md)
- Motion & A11y: [08-a11y-i18n-motion.md](../references/08-a11y-i18n-motion.md)

## 1. Sizing, Spacing & Button Grammar

- Enforce the `4px` spacing grid (`gap-6` = `24px` page gutters, `p-6` = `24px` card padding, `13px–14px` body text, `tabular-nums` on all metrics).
- Implement one `<Button>` primitive covering the industry matrix:
  - `variant`: `solid | outline | tonal | ghost | link`
  - `tone`: `primary | secondary | success | info | warning | error | neutral`
  - `size`: `xs (28px) | sm (32px) | md (38px) | lg (44px) | xl (48px)`
  - `iconOnly`: boolean (enforce non-empty `aria-label`!), `fullWidth`, `asChild` / link-button, `ButtonGroup`
  - `loading`: boolean (spinner + `disabled` + `aria-busy="true"`)
  - Press feedback: `motion-safe:active:scale-[0.98]` + `--color-<tone>-hover` / `--color-<tone>-pressed` tokens.

## 2. Single-Pipeline Icons

- Pick **ONE** open-source icon set (`lucide`, `tabler`, `remix`, `phosphor`, or tree-shaken build-time offline Iconify bundle via `getIcons()`/`getIconsCSS()` / subset SVG `<use href>` sprite). Delete unused icon deps and avoid runtime DOM-scanning (`createIcons()`, `feather.replace()`) or unshaken full-set bundles.
- Create `src/@core/icons/registry.tsx` (or `AppIcon.vue` / `app-icon.component.ts`) mapping string keys (`"layout-dashboard"`, `"bar-chart-3"`, `"users"`, `"settings"`) to icon components and expose `<AppIcon name="..." size={18} strokeWidth={1.5} />` (supporting `variant`, `oneTone`, `aria-hidden="true"` by default, and `rtl:rotate-180` / `rtlFlip` mirroring). Centralize Alert/Select/Rating/DataGrid/DatePicker default icons in theme slot overrides.
- Use parent-enforced sizing (`[&_svg:not([class*=size-])]:size-4`, `--sidenav-item-icon-size: 18px`): `12–14px` deltas/sort, `16px` inline/buttons, `18px–20px` nav/topbar, `20–24px` KPI icon wells (`bg-{tone}-soft text-{tone}`), `40–48px` empty states, `96px+` `stroke-1` watermarks. Color via `currentColor` (zero hardcoded hex fills; `role="img"` for brand/flag SVGs), require `aria-label` on icon-only buttons, and include the `/ui/icons` proof page.

## 3. Charts, Maps & Presets (`chartPresets` + `<ChartWrapper>` + `<LiveChart>` + `<RegionMap>`)

- Ship **ApexCharts only**—never install a second redundant chart engine.
- Build a single `<ChartWrapper>` component that handles:
  1. Client-only dynamic mount (SSR-safe),
  2. Automatic re-theming on light/dark toggle (`--chart-grid`, `--chart-tooltip-bg`, `--color-text-muted`, plus `key={themeTick}` rebuild on `donut`/`pie`/`radialBar`/`heatmap`),
  3. Deep-merging `options` (never shallow-spreading over nested keys), font sync (`var(--font-sans)`), and RTL mirroring (`yaxis.opposite`),
  4. Skeleton loading state, `<EmptyState>` fallback, and `role="img"` + `aria-label` + toggleable data-table view (handling both scalar and `{ x, y }` object points) for WCAG AA.
- Use `templates/components/react/ui/chartPresets.ts` (`getChartPreset` / `getChartSampleSpec`, also available for Vue & Angular) and the **Type <-> Data-Question Matrix** (store specs as `{ type, height, series, options }` configs in colocated `<slug>.charts.ts` separate from `<WidgetCard>`, or generate any chart / the full 28-type gallery via `node scripts/generate.mjs chart <type|all|shadcn> --framework <react|vue|angular> --out <project-dir>`):
  - Trend -> `line` / `dashedLine` / `stepline` / `slope` / `area` / `rangeArea` (`smooth`, target-dashed, step, slope, or confidence bands, soft fill + solid stroke, horizontal-only `--chart-grid` gridlines, `280–320px` height)
  - Composition -> `donut` / `semiDonut` / `pie` (`donutTitle`/`donutText` center-text total, bottom legend hidden on single series)
  - Category comparison -> `bar` (`stackedBar` / `stackedBar100` / `horizontalBar` / `dumbbell` / `bullet`, `borderRadiusApplication: 'end'`, `borderRadiusWhenStacked: 'all'`) or `funnel`
  - Single KPI progress -> `radialBar` / `gauge` (semi-circle `-90..90` arc)
  - KPI inline trend -> `sparkline` (`48px`, zero axes/gridlines)
  - Multi-axis / density / finance / geo -> `radar`, `polarArea`, `heatmap`, `scatter`, `bubble`, `treemap`, `boxPlot`, `candlestick`, `mixed`, `<RegionMap>` (choropleth using `--chart-seq-1..5` + accessible table fallback), `rangeBar` (Gantt)
- Consume the 10-hue theme token palette (`--chart-1`..`--chart-10` and `--chart-1-rgb`..`--chart-10-rgb`, preserved in dark mode); use `tones?: KpiTone[]` for semantic status data and `@layer vendor` CSS-var tooltips. Include the `/ui/charts` proof page (`ChartsGalleryPage`) when showcasing UI primitives.
- For telemetry/crypto/ops dashboards, emit `<LiveChart>` using ApexCharts with configurable `type` (`area` | `line` | `bar`), WebSocket/SSE stream adapter, bounded rolling window (`maxPoints`), pause button, ticker-card pairing, and reduced-motion static fallback.

## 4. KPI Cards & Widget Cards

- Build `<KpiCard>` accepting `{ label, value, format?, currency?, delta, deltaLabel, icon, tone, variant?, sparkline?, onClick?, loading? }` with `Intl.NumberFormat`, `tabular-nums`, `line` (gradient) / `bar` (peak-highlighted) / `radial` sparklines, and skeleton state.
- Build `<WidgetCard>` with `@container` body, `skeletonVariant` (`chart | table | list`), header (title, subtitle, `tabs`, `periodOptions`, `onRefresh`, `collapsible`, kebab menu, **Fullscreen** & **Pin** actions), body (built-in `loading` skeleton & `empty` state), and optional footer.

## 5. Server-Mode DataGrid (TanStack Table)

- Implement one generic `<DataGrid<TData extends { id: string }>>` over TanStack Table with `ColumnMeta` augmentation (`headerTitle`, `skeleton`, `filterVariant`, `expandedContent`) using the standard server contract:
  - Request: `{ pageIndex, pageSize, sorting, filters, searchQuery }`
  - Response: `{ data, totalCount, pageCount }`
- Built-in features: toolbar (search, per-column filter row, column visibility, CSV export, `pageSize` selector, optional **NLQ AI filter bar** with suggested query chips translating prompts into `DataGridFetchParams`), sorting, pagination, `IndeterminateCheckbox` row selection + bulk action bar, expandable rows, `tableLayout` (`dense`, `striped`, `cellBorder`), sticky header, `ColumnMeta.skeleton` loading rows, `<EmptyState>`, and arrow-key cell navigation.

## 6. Forms, Wizards, Feedback & Overlays

- **Forms:** `react-hook-form` + `zod` (or Vue/Angular equivalent). Emit `<FormField>` propagating `aria-invalid` and `aria-describedby`, red helper slot, and toast on submit failure. Support stacked, horizontal, and inline (`FilterBar`) layouts, `<InlineEdit>` click-to-edit fields, `<FormRepeater>` (`useFieldArray`) dynamic rows, dialog CRUD forms, and the 4-page form proof suite (`inputs`, `layouts`, `validation`, `wizard`). See `templates/components/react/examples/ShadcnFormExample.tsx` for the shadcn v4 `Controller` + `InputGroup` + `ToggleGroup` pattern.
- **Standard Input Primitives:** `Input`, `InputGroup` (`InputGroupAddon`, `InputGroupButton`), `CopyInput`, `FloatingInput`/`FloatingTextarea`, `InputPassword` (`showStrength`), `OtpInput`, `Textarea`, `Select`/`Combobox`/`TagInput`, `DatePicker`/`DateRangePicker` (with presets)/`TimePicker`/`DateTimePicker`/`InlineCalendar`, `FileUpload`/`AvatarUpload`/`ImageUpload`, `Slider`/`RangeSlider` (dual-thumb), `Switch`/`Checkbox`/`RadioGroup`, `ToggleGroup` (`SegmentedControl`), `OptionCard`/`OptionCardGroup`, `NumberInput`, `Rating`, `MaskedInput`, `PhoneInput`, `ColorPicker`, `InlineEdit`, and `FormRepeater`. Use `dayjs` for dates, `FullCalendar` for calendar apps, `Tiptap` for rich text.
- **Feedback, Overlays & Toasts:** `<Alert>` (`tonal|solid|outline|borderless`), `<Badge>` (`solid|tonal|outline|dot` + `BadgeDot`/`BadgeButton`), `<EmptyState>` (multi-scenario SVGs), `<Spinner>` + pre-hydration loader + route progress bar, Radix UI primitives (`Dialog`, `AlertDialog`, `Sheet`/`Drawer`/`vaul`, `DropdownMenu`, `Popover`, `Tooltip`, `HoverCard`, `ContextMenu`, `Menubar`, `Resizable`, `cmdk` Command Palette) via `floating-ui` with `--color-scrim` + **Sonner** toasts (`aria-live="polite"`). Respect the explicit `--z-*` ladder and derived `<PageHeader>`/`<Breadcrumb>` chrome.
- **Motion:** Single `.anim-in` staggered-entrance CSS utility + `.rd-shimmer` skeletons + `.typing-dots` + `CountingNumber`. Skip bloated page-transition libraries and guard everything with `@media (prefers-reduced-motion: reduce)`.

## Verification

Before completing UI work:
1. Verify zero raw hex colors or unauthorized fonts in new components (run `node <designer-dashboards-root>/scripts/verify-dashboard.mjs <project>`).
2. Confirm every icon-only button has an `aria-label`, every chart has a data-table fallback, and dark mode + RTL (`dir="rtl"`) render cleanly.
