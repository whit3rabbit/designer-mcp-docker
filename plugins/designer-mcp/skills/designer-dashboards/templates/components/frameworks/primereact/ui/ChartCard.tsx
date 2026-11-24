import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Skeleton } from 'primereact/skeleton';
import { Card } from './Card';
import { usePrimeTheme } from '../theme/PrimeThemeProvider';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'area' | 'bar' | 'donut' | 'pie' | 'radialBar';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  actions?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

const DEFAULT_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

function readCssToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export function ChartCard({
  title,
  subtitle,
  type,
  series,
  options,
  height = 280,
  actions,
  loading = false,
  empty = false,
  emptyMessage = 'No chart data available.',
}: ChartCardProps) {
  const { theme } = usePrimeTheme();

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const palette = [1, 2, 3, 4, 5, 6].map((idx, i) =>
      readCssToken(`--chart-${idx}`, DEFAULT_PALETTE[i] ?? 'var(--chart-1)'),
    );
    const textMuted = readCssToken('--color-text-muted', 'var(--color-text-muted)');
    const borderColor = readCssToken('--color-border', 'var(--color-border)');

    return {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        ...options?.chart,
      },
      theme: {
        mode: theme,
      },
      colors: options?.colors ?? palette,
      grid: {
        borderColor,
        strokeDashArray: 4,
        ...options?.grid,
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      stroke: {
        curve: 'smooth',
        width: 2.5,
        ...options?.stroke,
      },
      xaxis: {
        labels: { style: { colors: textMuted, fontSize: '12px' } },
        axisBorder: { color: borderColor },
        axisTicks: { color: borderColor },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: textMuted, fontSize: '12px' } },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: textMuted },
        ...options?.legend,
      },
      tooltip: {
        theme,
        ...options?.tooltip,
      },
      ...options,
    };
  }, [options, theme]);

  return (
    <Card title={title} subtitle={subtitle} actions={actions}>
      {loading ? (
        <Skeleton width="100%" height={`${height}px`} />
      ) : empty ? (
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      )}
    </Card>
  );
}
