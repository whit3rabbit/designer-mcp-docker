'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { clsx } from 'clsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export type ChartKind = 'area' | 'bar' | 'line' | 'donut' | 'radialBar';

export interface ChartCardProps {
  title: string;
  description?: string;
  type?: ChartKind;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories?: string[];
  height?: number;
  action?: React.ReactNode;
  options?: ApexOptions;
  spotlight?: boolean;
  className?: string;
}

function readOpenDesignTokens() {
  if (typeof window === 'undefined') {
    return {
      isDark: false,
      palette: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
      textColor: 'var(--color-text)',
      mutedColor: 'var(--color-text-muted)',
      borderColor: 'var(--color-border)',
      fontFamily: 'sans-serif',
    };
  }
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const isDark =
    root.classList.contains('dark') || root.getAttribute('data-theme') === 'dark';

  const palette = [
    get('--chart-1', get('--color-primary', 'var(--color-primary)')),
    get('--chart-2', 'var(--chart-2)'),
    get('--chart-3', 'var(--chart-3)'),
    get('--chart-4', 'var(--chart-4)'),
    get('--chart-5', 'var(--chart-5)'),
    get('--chart-6', 'var(--chart-6)'),
  ];

  return {
    isDark,
    palette,
    textColor: get('--color-text', 'var(--color-text)'),
    mutedColor: get('--color-text-muted', 'var(--color-text-muted)'),
    borderColor: get('--color-border', 'var(--color-border)'),
    fontFamily: get('--font-sans', 'sans-serif'),
  };
}

export function ChartCard({
  title,
  description,
  type = 'area',
  series,
  categories,
  height = 280,
  action,
  options,
  spotlight = false,
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState(() => readOpenDesignTokens());

  React.useEffect(() => {
    const sync = () => setTokens(readOpenDesignTokens());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const base: ApexOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: tokens.fontFamily,
        foreColor: tokens.mutedColor,
        animations: {
          enabled: true,
          speed: 450,
        },
      },
      theme: {
        mode: tokens.isDark ? 'dark' : 'light',
      },
      colors: tokens.palette,
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: type === 'bar' ? 0 : 2.5,
      },
      grid: {
        borderColor: tokens.borderColor,
        strokeDashArray: 4,
      },
      xaxis: categories
        ? {
            categories,
            axisBorder: { color: tokens.borderColor },
            axisTicks: { color: tokens.borderColor },
            labels: { style: { colors: tokens.mutedColor } },
          }
        : undefined,
      yaxis: {
        labels: { style: { colors: tokens.mutedColor } },
      },
      legend: {
        labels: { colors: tokens.textColor },
      },
      tooltip: {
        theme: tokens.isDark ? 'dark' : 'light',
      },
    };

    return {
      ...base,
      ...options,
      chart: { ...base.chart, ...options?.chart },
      grid: { ...base.grid, ...options?.grid },
    };
  }, [tokens, type, categories, options]);

  return (
    <Card spotlight={spotlight} className={clsx('overflow-hidden', className)}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </CardContent>
    </Card>
  );
}
