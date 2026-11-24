'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: 'area' | 'bar' | 'line' | 'donut';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories?: string[];
  height?: number;
  headerAction?: React.ReactNode;
  options?: ApexOptions;
  className?: string;
}

interface ThemeTokens {
  colors: string[];
  textMuted: string;
  border: string;
  fontFamily: string;
  isDark: boolean;
}

function readOpenDesignTokens(): ThemeTokens {
  if (typeof window === 'undefined') {
    return {
      colors: ['oklch(0.6 0.18 250)', 'oklch(0.65 0.16 160)', 'oklch(0.7 0.16 60)'],
      textMuted: 'oklch(0.55 0.02 250)',
      border: 'oklch(0.88 0.01 250)',
      fontFamily: 'system-ui, sans-serif',
      isDark: false,
    };
  }

  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const readVar = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    colors: [
      readVar('--chart-1', 'oklch(0.6 0.18 250)'),
      readVar('--chart-2', 'oklch(0.65 0.16 160)'),
      readVar('--chart-3', 'oklch(0.7 0.16 60)'),
      readVar('--chart-4', 'oklch(0.62 0.18 310)'),
      readVar('--chart-5', 'oklch(0.64 0.18 20)'),
    ],
    textMuted: readVar('--color-text-muted', 'oklch(0.55 0.02 250)'),
    border: readVar('--color-border', 'oklch(0.88 0.01 250)'),
    fontFamily: readVar('--font-sans', 'system-ui, sans-serif'),
    isDark:
      root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark'),
  };
}

export function ChartCard({
  title,
  description,
  type,
  series,
  categories = [],
  height = 280,
  headerAction,
  options,
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState<ThemeTokens>(() => readOpenDesignTokens());

  React.useEffect(() => {
    setTokens(readOpenDesignTokens());
    const observer = new MutationObserver(() => {
      setTokens(readOpenDesignTokens());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions: ApexOptions = React.useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: tokens.fontFamily,
        ...options?.chart,
      },
      colors: tokens.colors,
      theme: {
        mode: tokens.isDark ? 'dark' : 'light',
      },
      grid: {
        borderColor: tokens.border,
        strokeDashArray: 4,
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: type === 'bar' ? 0 : 2.5,
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: tokens.textMuted, fontSize: '12px' },
        },
        axisBorder: { color: tokens.border },
        axisTicks: { color: tokens.border },
      },
      yaxis: {
        labels: {
          style: { colors: tokens.textMuted, fontSize: '12px' },
        },
      },
      legend: {
        labels: { colors: tokens.textMuted },
      },
      ...options,
    }),
    [tokens, type, categories, options],
  );

  return (
    <Card className={twMerge(clsx(className))}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </CardHeader>
      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
