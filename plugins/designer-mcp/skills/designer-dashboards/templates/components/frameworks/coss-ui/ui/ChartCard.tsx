'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { cn, type Density } from '../theme/cn';

export type ChartKind = 'area' | 'bar' | 'line' | 'donut';

export interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  type: ChartKind;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories?: string[];
  height?: number;
  options?: ApexOptions;
  density?: Density;
  className?: string;
}

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export function ChartCard({
  title,
  description,
  action,
  type,
  series,
  categories,
  height = 260,
  options,
  density = 'comfortable',
  className,
}: ChartCardProps) {
  const palette = React.useMemo(
    () => [
      readToken('--chart-1', 'oklch(0.62 0.19 255)'),
      readToken('--chart-2', 'oklch(0.68 0.17 165)'),
      readToken('--chart-3', 'oklch(0.72 0.16 65)'),
      readToken('--chart-4', 'oklch(0.64 0.2 310)'),
    ],
    [],
  );

  const textMuted = readToken('--color-text-muted', 'oklch(0.55 0.02 260)');
  const border = readToken('--color-border', 'oklch(0.88 0.01 260)');
  const fontSans = readToken('--font-sans', 'Inter, system-ui, sans-serif');

  const mergedOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: fontSans,
      background: 'transparent',
      zoom: { enabled: false },
      ...options?.chart,
    },
    colors: palette,
    stroke: {
      curve: 'smooth',
      width: type === 'bar' ? 0 : 2,
      ...options?.stroke,
    },
    dataLabels: { enabled: false, ...options?.dataLabels },
    grid: {
      borderColor: border,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      ...options?.grid,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: textMuted, fontSize: '11px' } },
      ...options?.xaxis,
    },
    yaxis: {
      labels: { style: { colors: textMuted, fontSize: '11px' } },
      ...options?.yaxis,
    },
    legend: {
      labels: { colors: textMuted },
      fontSize: '12px',
      ...options?.legend,
    },
    tooltip: {
      theme:
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light',
      ...options?.tooltip,
    },
    ...options,
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader density={density}>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent density={density}>
        <Chart type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
