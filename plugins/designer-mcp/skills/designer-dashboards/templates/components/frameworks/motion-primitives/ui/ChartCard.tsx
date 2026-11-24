'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { clsx } from 'clsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: 'area' | 'line' | 'bar' | 'donut' | 'radialBar';
  series: ApexOptions['series'];
  options?: ApexOptions;
  height?: number;
  headerAction?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

function readChartTokens() {
  if (typeof window === 'undefined') {
    return {
      isDark: false,
      palette: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
      textMuted: 'var(--color-text-muted)',
      border: 'var(--color-border)',
      fontSans: 'sans-serif',
    };
  }
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const isDark =
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark';

  const palette = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => get(`--chart-${i}`, `var(--chart-${i})`));

  return {
    isDark,
    palette,
    textMuted: get('--color-text-muted', 'var(--color-text-muted)'),
    border: get('--color-border', 'var(--color-border)'),
    fontSans: get('--font-sans', 'sans-serif'),
  };
}

export function ChartCard({
  title,
  description,
  type,
  series,
  options,
  height = 280,
  headerAction,
  loading = false,
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState(readChartTokens);

  React.useEffect(() => {
    setTokens(readChartTokens());
    const observer = new MutationObserver(() => {
      setTokens(readChartTokens());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions: ApexOptions = React.useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: tokens.fontSans,
        animations: {
          enabled: true,
          speed: 400,
        },
        ...options?.chart,
      },
      colors: options?.colors ?? tokens.palette,
      theme: {
        mode: tokens.isDark ? 'dark' : 'light',
      },
      grid: {
        borderColor: tokens.border,
        strokeDashArray: 4,
        ...options?.grid,
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: tokens.textMuted, fontSize: '12px' } },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: tokens.textMuted, fontSize: '12px' } },
        ...options?.yaxis,
      },
      tooltip: {
        theme: tokens.isDark ? 'dark' : 'light',
        ...options?.tooltip,
      },
      legend: {
        labels: { colors: tokens.textMuted },
        ...options?.legend,
      },
      ...options,
    }),
    [options, tokens],
  );

  return (
    <Card className={clsx('overflow-hidden', className)}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="text-start">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            style={{ height }}
            className="w-full animate-pulse rounded-md bg-[var(--color-surface-subtle)]"
          />
        ) : (
          <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
        )}
      </CardContent>
    </Card>
  );
}
