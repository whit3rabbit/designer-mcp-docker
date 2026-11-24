# Reference 04: Data Display, Charts, Maps, Tables & KPI Cards

Distilled from the 17-template commercial dashboard audit, integrated with the OpenDesign `design-system/` token pipeline.

## Contents

- [1. Chart Engine, Design-System Skinning & Wrapper Discipline](#1-chart-engine-design-system-skinning--wrapper-discipline)
- [2. Type <-> Data-Question Matrix (Standard Presets)](#2-type---data-question-matrix-standard-presets)
- [3. Chart Token Bridge (Categorical, Semantic & Sequential)](#3-chart-token-bridge-categorical-semantic--sequential)
- [4. `<LiveChart>` Primitive (Market Differentiator)](#4-livechart-primitive-market-differentiator)
- [5. Server-Mode DataGrid Contract (TanStack Table)](#5-server-mode-datagrid-contract-tanstack-table)
- [6. KPI Stat-Card Primitive](#6-kpi-stat-card-primitive)
- [7. Framework Parity & Verification Gate](#7-framework-parity--verification-gate)

## 1. Chart Engine, Design-System Skinning & Wrapper Discipline

- **Single engine:** **ApexCharts** (`apexcharts@^8.9.1`, `react-apexcharts@^2.2.1`, `vue3-apexcharts@^1.11.3`; MIT, config-as-JSON architecture, covers all standard types). Avoid bundling 2–3 competing chart libraries.
- **Optional Shadcn / Recharts Adapter (React-only):** If a React/Next.js project explicitly chooses `recharts@^3.11.0` instead of ApexCharts, use [ShadcnChart.tsx](../templates/components/react/ui/ShadcnChart.tsx) (`ChartContainer`, `ChartConfig`, `ChartTooltipContent`, `ChartLegendContent`) + [ShadcnChartExample.tsx](../templates/components/react/examples/ShadcnChartExample.tsx) (`node scripts/generate.mjs chart shadcn --out <project-dir>`), bound to `--chart-1..10` and `--chart-tooltip-*` tokens (never mix both engines in one `package.json`).
- **Design-System `@layer vendor` Skinning:** `scripts/build-tokens.mjs` emits CSS-var overrides inside `@layer vendor` for `.apexcharts-tooltip`, `.apexcharts-xaxistooltip`, `.apexcharts-yaxistooltip`, `.apexcharts-legend-text`, and `[dir="rtl"] .apexcharts-tooltip-marker` bound to `--color-surface-elevated`, `--color-border`, `--color-text`, and `--shadow-md`. Never hardcode tooltip or legend hex colors in chart configs.
- **Shared `<ChartWrapper>` component** is mandatory. It owns:
  1. Client-only mounting (`dynamic(..., { ssr: false })` in Next.js).
  2. Theme & dark-mode reactivity via `MutationObserver` on `data-theme`, `class`, and `dir`—re-theming `--chart-grid`, `--chart-tooltip-bg`, `--color-text-muted`, and forcing SVG rebuild via `key={themeTick}` on `donut`, `pie`, `radialBar`, and `heatmap`.
  3. Deep-merging `options` (never shallow-spreading `...options` over nested keys like `chart`, `plotOptions`, `xaxis`, `yaxis`, `tooltip`, `fill`).
  4. Font family synchronization (`var(--font-sans)`), `prefers-reduced-motion` animation disabling, and auto-hiding legends on single-series charts.
  5. RTL mirroring (`yaxis.opposite: true` when `dir="rtl"`).
  6. `donutTitle` / `donutText` center-total wiring, `dataUnit` / `valueFormatter` axis & tooltip formatting, and `tones?: KpiTone[]` for semantic status series.
  7. Skeleton loading + `<EmptyState>` fallback + `role="img"` / `aria-label` + accessible data-table toggle (handling both scalar and `{ x, y }` object points when `categories` is empty).
- **Config-as-Data Presets (`chartPresets.ts`):** Store chart specs as typed `{ type, height, series, options }` configs in colocated `<slug>.charts.ts` files built from `getChartPreset()` / `chartPresets.ts`, separate from rendering logic. Always apply `plotOptions.bar.borderRadiusApplication = 'end'` and `borderRadiusWhenStacked = 'all'` on bar/column charts.
- **Widget Card Pairing (`<WidgetCard>`):** Wrap every chart/grid/map in `<WidgetCard>` with `@container` body, `skeletonVariant` (`chart` | `table` | `list`), `allowFullscreen` (`Escape` key), `allowPin`, `collapsible`, `onRefresh`, `tabs`, and optional `periodOptions` (`ALL` | `1M` | `6M` | `1Y`).

## 2. Type <-> Data-Question Matrix (Standard Presets)

| Data Question | Preset Type | Default Height | Styling Defaults |
|---|---|---|---|
| Metric trend over time | `line` / `dashedLine` / `stepline` / `slope` / `area` / `rangeArea` | `280–320px` | `smooth` (or `dashedLine` for target vs actual, `stepline` for tiers, `slope` for before/after shifts, `rangeArea` for confidence bands), soft fill + solid stroke, horizontal-only `--chart-grid` |
| Category composition | `donut` / `semiDonut` / `pie` | `260–300px` | Center-text total (`donutTitle`/`donutText`), bottom legend (hidden if 1 series), semantic hues for status series |
| Compare across categories | `bar` (`stackedBar` / `stackedBar100` / `horizontalBar` / `dumbbell` / `bullet`) | `280–320px` | Rounded bar caps (`4px`, `borderRadiusApplication: 'end'`, `borderRadiusWhenStacked: 'all'`), `bullet` adds target `goals` markers |
| Single KPI progress to 100% | `radialBar` / `gauge` | `180–260px` | Center percentage, rounded track; `gauge` uses `-90..90` semi-circle arc |
| Inline mini trend in KPI card | `sparkline` | `44–56px` | Zero axes, zero gridlines, zero toolbar (`line` gradient, highlighted `bar`, or `radial` ring) |
| Multi-axis profile | `radar` / `polarArea` | `280px` | Soft polygon fills + solid strokes |
| Density / correlation / quartiles | `heatmap` / `scatter` / `bubble` / `treemap` / `boxPlot` | `280–320px` | Sequential color ramp (`--chart-seq-1..5`) for heatmap; `--chart-1..2` upper/lower for `boxPlot` |
| Financial OHLC / Mixed combo | `candlestick` / `mixed` | `300–320px` | Green/red semantic up/down (`candlestick`), combo column+area+line (`mixed`) |
| Pipeline stages | `funnel` (`bar` + `isFunnel`) | `280px` | Horizontal proportional distributed bar funnel |
| Geospatial / Timeline / Schedule | `<RegionMap>` / `rangeBar` (Gantt) / `FullCalendar` | `280–480px` | SSR-safe dynamic mount (`<RegionMap>` with `--chart-seq-1..5` + accessible table fallback; `Leaflet` or `Mapbox` for tile logistics) |

## 3. Chart Token Bridge (Categorical, Semantic & Sequential)

All chart colors come from `design-system/styles.css` (generated by `scripts/build-tokens.mjs`):
1. **10-Hue Categorical Palette (`--chart-1`..`--chart-10` + `--chart-1-rgb`..`--chart-10-rgb`):** Exposed in both `:root`, `[data-theme="dark"]`, and `@theme inline` (`bg-chart-1`, `fill-chart-1`):
   - `1. #2A85FF` (Blue) · `2. #10B981` (Emerald) · `3. #FF6A55` (Coral) · `4. #8C62FF` (Violet) · `5. #FBC13E` (Amber)
   - `6. #00C7BE` (Teal) · `7. #FE964A` (Orange) · `8. #7CD2FA` (Sky) · `9. #EC4899` (Rose) · `10. #94A3B8` (Slate)
   - Use `--chart-N-rgb` (`rgba(var(--chart-N-rgb), alpha)`) when building opacity-aware area fills or hover highlights.
2. **Semantic Status Tones:** Use `tones={['success', 'warning', 'error']}` (reading `--color-success`, `--color-warning`, `--color-error`) for status charts, not categorical palette order.
3. **Chart Chrome Tokens:** `--chart-grid` (defaults to `--color-border`), `--chart-tooltip-bg` (defaults to `--color-surface-elevated`), `--chart-tooltip-border` (defaults to `--color-border`).
4. **Sequential Choropleth Ramp (`--chart-seq-1`..`--chart-5`):** Generated from `theme.colors.semantic.primary` lightness steps for `<RegionMap>` and `heatmap` / `treemap` widgets.

## 4. `<LiveChart>` Primitive (Market Differentiator)

Zero commercial templates ship real-time updating charts. Implement `<LiveChart>` over ApexCharts with:
- Configurable `type` (`area` | `line` | `bar`), `intervalMs`, or WebSocket/SSE stream adapter,
- Bounded `maxPoints` rolling window (e.g. 20–60 points),
- Pause/resume toggle (`aria-live="polite"` status) + `prefers-reduced-motion` static fallback.

## 5. Server-Mode DataGrid Contract (TanStack Table)

Use a clean client<->server grid interface with generic typing (`{ id: string }`) and typed column filters:

```ts
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    headerTitle?: string;
    headerClassName?: string;
    cellClassName?: string;
    skeleton?: React.ReactNode;
    filterVariant?: 'text' | 'select' | 'number-range' | 'date-range';
    filterOptions?: Array<{ label: string; value: string }>;
    expandedContent?: (row: TData) => React.ReactNode;
  }
}

export interface DataGridFetchParams {
  pageIndex: number;
  pageSize: number;
  sorting: Array<{ id: string; desc: boolean }>;
  filters: Array<{ id: string; value: unknown }>;
  searchQuery?: string;
}

export interface DataGridResponse<TData> {
  data: TData[];
  totalCount: number;
  pageCount: number;
}
```

Required grid capabilities built into one reusable `<DataGrid>`:
- Toolbar (search + optional `<FilterBar>` with active-filter count & `dateRange` + column visibility using `ColumnMeta.headerTitle` + CSV export + `pageSize` selector `[8, 10, 25, 50]`),
- Optional per-column filter row (`enableColumnFilters`) driven by `ColumnMeta.filterVariant`, passing live `columnFilters` into `onFetchParamsChange` (and resetting `pageIndex` to `0` on filter/search change),
- Sorting (`aria-sort`), pagination, `IndeterminateCheckbox` row selection + bulk actions bar, optional expandable rows (`renderExpandedRow` / `ColumnMeta.expandedContent`), and `tableLayout` (`dense`, `striped`, `cellBorder`),
- Sticky header, `ColumnMeta.skeleton` loading rows, `<EmptyState>`, and full keyboard navigation (`role="grid"`, arrow keys, `Home`/`End`).

## 6. KPI Stat-Card Primitive

Every dashboard opens with 3–4 parameterized `<KpiCard>` widgets:
```ts
export interface KpiCardProps {
  label: string;
  value: string | number;
  format?: 'raw' | 'number' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  delta?: number;
  deltaLabel?: string;
  icon: string;
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'default' | 'bordered' | 'horizontal';
  sparkline?:
    | number[]
    | { type: 'line' | 'bar' | 'radial'; data: number[]; highlightIndex?: number };
  onClick?: () => void;
  loading?: boolean;
}
```
- Always format numeric values with `Intl.NumberFormat` + `tabular-nums`.
- Support inline `line` (with soft gradient fill), `bar` (with peak/selected highlight), and `radial` mini-gauge sparklines without spinning up full ApexCharts instances for 48px micro-charts.

## 7. Framework Parity, Generation & Verification Gate

- **React (`templates/components/react/ui/`):** Full suite (`ChartWrapper.tsx`, `chartPresets.ts` with 29 presets + `getChartSampleSpec()`, `LiveChart.tsx`, `RegionMap.tsx`, `DataGrid.tsx`, `FilterBar.tsx`, `KpiCard.tsx`, `WidgetCard.tsx`), plus `pages/ChartsGalleryPage.tsx` (`/ui/charts` proof page) and `examples/ChartsGalleryExample.tsx`.
- **Vue (`templates/components/vue/ui/`):** Full parity (`ChartWrapper.vue`, `chartPresets.ts`, `LiveChart.vue`, `RegionMap.vue`, `DataGrid.vue`, `FilterBar.vue`, `KpiCard.vue`, `WidgetCard.vue`).
- **Angular (`templates/components/angular/ui/`):** Full parity (`chart-wrapper.component.ts`, `chart-presets.ts`, `live-chart.component.ts`, `region-map.component.ts`, `data-grid.component.ts`, `kpi-card.component.ts`, `widget-card.component.ts` — Angular 22+ Signals + dynamic `apexcharts` import).
- **On-Demand Chart Generation:** `node scripts/generate.mjs chart <type|all> --framework <react|vue|angular> --out <project-dir>` emits a `<WidgetCard>` + `<ChartWrapper>` + colocated `*.charts.ts` spec (or the full 29-type `ChartsGalleryPage` when `<type>` is `all`).
- **Automated Gate (`scripts/verify-dashboard.mjs`):** Warns on direct `react-apexcharts` / `vue3-apexcharts` / `apexcharts` imports outside `ChartWrapper` / `LiveChart` and enforces single-engine dependency hygiene.
