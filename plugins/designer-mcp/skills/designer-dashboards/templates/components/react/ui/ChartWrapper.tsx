'use client';

import * as React from 'react';
import type { ApexOptions } from 'apexcharts';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import type { KpiTone } from './KpiCard';

export type ChartDataPoint =
  | number
  | [number, number]
  | { x: string | number; y: number | number[]; z?: number; fillColor?: string };

export type ChartSeries =
  | Array<{ name: string; type?: 'line' | 'area' | 'column' | 'bar'; data: ChartDataPoint[] }>
  | number[];

export type SupportedChartType =
  | 'line'
  | 'dashedLine'
  | 'stepline'
  | 'slope'
  | 'area'
  | 'bar'
  | 'bullet'
  | 'donut'
  | 'semiDonut'
  | 'pie'
  | 'radialBar'
  | 'gauge'
  | 'radar'
  | 'polarArea'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'candlestick'
  | 'boxPlot'
  | 'rangeBar'
  | 'rangeArea'
  | 'funnel'
  | 'mixed';

function resolveApexType(type: SupportedChartType): string {
  if (type === 'funnel' || type === 'bullet') return 'bar';
  if (type === 'mixed' || type === 'dashedLine' || type === 'stepline' || type === 'slope') return 'line';
  if (type === 'gauge') return 'radialBar';
  if (type === 'semiDonut') return 'donut';
  return type;
}

export interface ChartWrapperProps {
  title: string;
  type: SupportedChartType;
  series: ChartSeries;
  categories?: string[];
  height?: number;
  options?: ApexOptions;
  tones?: KpiTone[];
  donutTitle?: string;
  donutText?: string;
  dataUnit?: string;
  valueFormatter?: (val: number) => string;
  loading?: boolean;
  empty?: boolean;
}

function readCssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function deepMergeOptions(base: ApexOptions, override?: ApexOptions): ApexOptions {
  if (!override) return base;
  const result: Record<string, unknown> = { ...base };
  for (const [key, val] of Object.entries(override)) {
    if (isPlainObject(val) && isPlainObject(result[key])) {
      result[key] = deepMergeOptions(result[key] as ApexOptions, val as ApexOptions);
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result as ApexOptions;
}

export function ChartWrapper({
  title,
  type,
  series,
  categories = [],
  height = 300,
  options,
  tones,
  donutTitle,
  donutText,
  dataUnit = '',
  valueFormatter,
  loading = false,
  empty = false,
}: ChartWrapperProps) {
  const [ApexChart, setApexChart] = React.useState<React.ComponentType<{
    type: string;
    series: ChartSeries;
    options: ApexOptions;
    height: number;
    width: string;
  }> | null>(null);
  const [showTable, setShowTable] = React.useState(false);
  const [themeTick, setThemeTick] = React.useState(0);

  // Client-only dynamic mount (SSR-safe for Next.js and Vite)
  React.useEffect(() => {
    let mounted = true;
    import('react-apexcharts').then((mod) => {
      if (mounted) setApexChart(() => mod.default as never);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Re-theme chart automatically when <html data-theme>, class, or dir changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => setThemeTick((t) => t + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'dir'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const isDark =
      typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark'));
    const isRtl =
      typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl';
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const singleSeries = Array.isArray(series) && series.length === 1 && typeof series[0] === 'object';
    const textMuted = readCssVar('--color-text-muted');
    const gridColor = readCssVar('--chart-grid') || readCssVar('--color-border');
    const borderColor = readCssVar('--color-border');
    const successColor = readCssVar('--color-success');
    const errorColor = readCssVar('--color-error');
    const fontSans = readCssVar('--font-sans');
    const palette = tones?.length
      ? tones.map((t) => readCssVar(`--color-${t}`)).filter(Boolean)
      : Array.from({ length: 10 }, (_, i) => readCssVar(`--chart-${i + 1}`)).filter(Boolean);

    const formatVal = (val: number) =>
      valueFormatter ? valueFormatter(val) : `${val}${dataUnit ? ` ${dataUnit}` : ''}`;

    const apexType = resolveApexType(type);
    const seqPalette = Array.from({ length: 5 }, (_, i) => readCssVar(`--chart-seq-${i + 1}`)).filter(Boolean);

    const baseOptions: ApexOptions = {
      chart: {
        type: apexType as ApexOptions['chart'] extends { type?: infer T } ? T : never,
        toolbar: { show: false },
        fontFamily: fontSans || undefined,
        background: 'transparent',
        animations: { enabled: !reduceMotion },
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors:
        type === 'heatmap' && !tones?.length && seqPalette.length > 0
          ? [seqPalette[3] || palette[0]]
          : palette.length > 0
            ? palette
            : undefined,
      tooltip: {
        shared:
          type === 'line' ||
          type === 'dashedLine' ||
          type === 'stepline' ||
          type === 'slope' ||
          type === 'area' ||
          type === 'bar' ||
          type === 'bullet' ||
          type === 'mixed' ||
          type === 'rangeArea',
        intersect: false,
        y: valueFormatter || dataUnit ? { formatter: formatVal } : undefined,
      },
      stroke: {
        curve: type === 'rangeArea' ? 'straight' : type === 'stepline' ? 'stepline' : 'smooth',
        width: type === 'bar' || type === 'funnel' || type === 'bullet' ? 0 : 2,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
          columnWidth: '48%',
          ...(type === 'funnel' ? { horizontal: true, isFunnel: true, distributed: true, barHeight: '72%' } : {}),
        },
        ...(type === 'gauge'
          ? {
              radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: { size: '68%' },
                track: { background: borderColor || undefined },
                dataLabels: {
                  name: { offsetY: -10, fontSize: '12px' },
                  value: { offsetY: -4, fontSize: '20px', fontWeight: 700 },
                },
              },
            }
          : {}),
        ...(type === 'radialBar' && borderColor
          ? { radialBar: { track: { background: borderColor } } }
          : {}),
        ...(type === 'candlestick' && successColor && errorColor
          ? { candlestick: { colors: { upward: successColor, downward: errorColor } } }
          : {}),
        ...(type === 'boxPlot' && palette.length >= 2
          ? {
              boxPlot: {
                colors: { upper: palette[0], lower: palette[1] },
              },
            }
          : {}),
        pie: {
          donut: {
            size: '68%',
            labels:
              donutTitle || donutText
                ? {
                    show: true,
                    total: {
                      show: true,
                      label: donutTitle ?? 'Total',
                      formatter: donutText ? () => donutText : undefined,
                    },
                  }
                : undefined,
          },
        },
      },
      grid: {
        borderColor: gridColor || undefined,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      dataLabels: { enabled: type === 'funnel' },
      legend: {
        show: !singleSeries,
        position: 'bottom',
        labels: { colors: textMuted || undefined },
      },
      xaxis: {
        categories,
        labels: { style: { colors: textMuted || undefined } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        opposite: isRtl,
        labels: {
          style: { colors: textMuted || undefined },
          formatter: valueFormatter || dataUnit ? formatVal : undefined,
        },
      },
      fill:
        type === 'area'
          ? {
              type: 'gradient',
              gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 95, 100] },
            }
          : undefined,
    };

    return deepMergeOptions(baseOptions, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories, options, tones, donutTitle, donutText, dataUnit, valueFormatter, themeTick]);

  const isNamedSeries = Array.isArray(series) && typeof series[0] === 'object';
  const isEmpty = empty || !Array.isArray(series) || series.length === 0;

  // Derive accessible table row labels from categories OR { x, y } object points
  const tableLabels = React.useMemo<string[]>(() => {
    if (!isNamedSeries) {
      return (series as number[]).map((_, i) => categories[i] ?? `Item ${i + 1}`);
    }
    if (categories.length > 0) return categories;
    const firstData = (series as Array<{ data: unknown[] }>)[0]?.data ?? [];
    return firstData.map((pt, i) =>
      pt && typeof pt === 'object' && 'x' in pt ? String((pt as { x: unknown }).x) : `Item ${i + 1}`,
    );
  }, [isNamedSeries, series, categories]);

  if (!loading && isEmpty) {
    return <EmptyState title={`No ${title} data`} description="No series points available for this period." />;
  }

  const needsRemountOnTheme =
    type === 'donut' ||
    type === 'semiDonut' ||
    type === 'pie' ||
    type === 'radialBar' ||
    type === 'gauge' ||
    type === 'heatmap' ||
    type === 'treemap' ||
    type === 'boxPlot';
  const apexType = resolveApexType(type);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          aria-pressed={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          <AppIcon name="table" size={14} />
          <span>{showTable ? 'Show chart' : 'View data table'}</span>
        </Button>
      </div>

      {loading || (!ApexChart && !showTable) ? (
        <div
          role="status"
          aria-label={`Loading ${title} chart`}
          style={{ height, backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)' }}
          className="rd-shimmer w-full"
        />
      ) : showTable ? (
        <div
          style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
          className="overflow-x-auto border"
        >
          <table className="w-full border-collapse text-start text-xs">
            <caption className="sr-only">{title} data table</caption>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-muted)' }}>
                <th className="px-3 py-2 text-start font-semibold">Category</th>
                {isNamedSeries ? (
                  (series as Array<{ name: string; data: unknown[] }>).map((s) => (
                    <th key={s.name} className="px-3 py-2 text-end font-semibold">
                      {s.name}
                    </th>
                  ))
                ) : (
                  <th className="px-3 py-2 text-end font-semibold">Value</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableLabels.map((cat, idx) => (
                <tr
                  key={`${cat}-${idx}`}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  className="border-t"
                >
                  <td className="px-3 py-2 font-medium">{cat}</td>
                  {isNamedSeries ? (
                    (series as Array<{ name: string; data: unknown[] }>).map((s) => {
                      const raw = s.data[idx];
                      const cell =
                        raw && typeof raw === 'object' && !Array.isArray(raw) && 'y' in raw
                          ? Array.isArray((raw as { y: unknown }).y)
                            ? (raw as { y: number[] }).y.join(' / ')
                            : 'z' in raw && (raw as { z?: unknown }).z !== undefined
                              ? `${String((raw as { y: unknown }).y)} (size ${String((raw as { z: unknown }).z)})`
                              : String((raw as { y: unknown }).y)
                          : Array.isArray(raw)
                            ? raw.join(', ')
                            : raw ?? '—';
                      return (
                        <td key={s.name} className="tabular-nums px-3 py-2 text-end">
                          {String(cell)}
                        </td>
                      );
                    })
                  ) : (
                    <td className="tabular-nums px-3 py-2 text-end">
                      {(series as number[])[idx]}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div role="img" aria-label={`${title} ${type} chart`}>
          {ApexChart && (
            <ApexChart
              key={needsRemountOnTheme ? themeTick : 'chart'}
              type={apexType}
              series={series}
              options={mergedOptions}
              height={height}
              width="100%"
            />
          )}
        </div>
      )}
    </div>
  );
}
