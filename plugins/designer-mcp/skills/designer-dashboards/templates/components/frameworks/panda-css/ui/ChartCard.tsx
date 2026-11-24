'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { css } from 'styled-system/css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: 'line' | 'area' | 'bar' | 'donut';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  action?: React.ReactNode;
}

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export function ChartCard({
  title,
  description,
  type,
  series,
  options,
  height = 280,
  action,
}: ChartCardProps) {
  const palette = React.useMemo(
    () => [
      readToken('--chart-1', 'var(--chart-1)'),
      readToken('--chart-2', 'var(--chart-2)'),
      readToken('--chart-3', 'var(--chart-3)'),
      readToken('--chart-4', 'var(--chart-4)'),
      readToken('--chart-5', 'var(--chart-5)'),
    ],
    [],
  );

  const mergedOptions: ApexOptions = React.useMemo(
    () => ({
      colors: palette,
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: readToken('--font-sans', 'system-ui, sans-serif'),
      },
      grid: {
        borderColor: readToken('--color-border', 'rgba(128,128,128,0.2)'),
        strokeDashArray: 4,
      },
      xaxis: {
        labels: {
          style: { colors: readToken('--color-text-muted', 'var(--color-text-muted)') },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: readToken('--color-text-muted', 'var(--color-text-muted)') },
        },
      },
      legend: {
        labels: {
          colors: readToken('--color-text-muted', 'var(--color-text-muted)'),
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      ...options,
    }),
    [options, palette],
  );

  return (
    <Card>
      <CardHeader
        className={css({
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        })}
      >
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
