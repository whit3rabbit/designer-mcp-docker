'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export type ChartCardType = 'area' | 'line' | 'bar' | 'donut' | 'radialBar';

export interface ChartCardProps {
  title: string;
  description?: string;
  type?: ChartCardType;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories?: string[];
  height?: number;
  beam?: boolean;
  action?: React.ReactNode;
  options?: ApexOptions;
  className?: string;
}

function readTokenPalette(): {
  colors: string[];
  textMuted: string;
  border: string;
  isDark: boolean;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      colors: ['oklch(0.6 0.18 255)', 'oklch(0.65 0.16 170)', 'oklch(0.7 0.17 55)'],
      textMuted: 'var(--color-text-muted)',
      border: 'var(--color-border)',
      isDark: false,
    };
  }
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const colors = Array.from({ length: 6 }, (_, i) =>
    styles.getPropertyValue(`--chart-${i + 1}`).trim(),
  ).filter(Boolean);

  const isDark =
    root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');

  return {
    colors:
      colors.length > 0
        ? colors
        : [
            styles.getPropertyValue('--color-primary').trim() || 'var(--color-primary)',
            styles.getPropertyValue('--color-info').trim() || 'var(--color-info)',
            styles.getPropertyValue('--color-success').trim() || 'var(--color-success)',
          ],
    textMuted: styles.getPropertyValue('--color-text-muted').trim() || 'var(--color-text-muted)',
    border: styles.getPropertyValue('--color-border').trim() || 'var(--color-border)',
    isDark,
  };
}

export function ChartCard({
  title,
  description,
  type = 'area',
  series,
  categories,
  height = 260,
  beam = false,
  action,
  options,
  className,
}: ChartCardProps) {
  const [palette, setPalette] = React.useState(readTokenPalette);

  React.useEffect(() => {
    setPalette(readTokenPalette());
    const observer = new MutationObserver(() => {
      setPalette(readTokenPalette());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions: ApexOptions = React.useMemo(
    () => ({
      chart: {
        type,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        animations: {
          enabled:
            typeof window !== 'undefined'
              ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              : true,
        },
        ...options?.chart,
      },
      colors: options?.colors ?? palette.colors,
      theme: {
        mode: palette.isDark ? 'dark' : 'light',
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      stroke: {
        curve: 'smooth',
        width: type === 'bar' ? 0 : 2,
        ...options?.stroke,
      },
      grid: {
        borderColor: palette.border,
        strokeDashArray: 4,
        ...options?.grid,
      },
      xaxis: {
        categories,
        labels: { style: { colors: palette.textMuted, fontSize: '11px' } },
        axisBorder: { color: palette.border },
        axisTicks: { color: palette.border },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: palette.textMuted, fontSize: '11px' } },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: palette.textMuted },
        ...options?.legend,
      },
      tooltip: {
        theme: palette.isDark ? 'dark' : 'light',
        ...options?.tooltip,
      },
      ...options,
    }),
    [type, categories, palette, options],
  );

  return (
    <Card beam={beam} className={className}>
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1 text-start">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent>
        <div className="w-full" role="region" aria-label={title}>
          <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
        </div>
      </CardContent>
    </Card>
  );
}
