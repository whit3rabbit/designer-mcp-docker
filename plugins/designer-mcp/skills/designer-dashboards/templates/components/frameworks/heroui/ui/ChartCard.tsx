'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card } from './Card';

export interface ChartCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  type: 'area' | 'line' | 'bar' | 'donut';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  headerAction?: React.ReactNode;
  className?: string;
}

function readOpenDesignChartTokens() {
  if (typeof window === 'undefined') {
    return {
      colors: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'],
      textMuted: 'var(--color-text-muted)',
      border: 'var(--color-border)',
      mode: 'light' as const,
    };
  }
  const styles = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const isDark =
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.documentElement.classList.contains('dark');

  return {
    colors: [
      get('--chart-1', get('--color-primary', 'var(--color-primary)')),
      get('--chart-2', get('--color-success', 'var(--color-success)')),
      get('--chart-3', get('--color-warning', 'var(--color-warning)')),
      get('--chart-4', get('--color-info', 'var(--color-info)')),
    ],
    textMuted: get('--color-text-muted', 'var(--color-text-muted)'),
    border: get('--color-border', 'var(--color-border)'),
    mode: isDark ? ('dark' as const) : ('light' as const),
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
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState(() => readOpenDesignChartTokens());

  React.useEffect(() => {
    const update = () => setTokens(readOpenDesignChartTokens());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        ...options?.chart,
      },
      colors: options?.colors ?? tokens.colors,
      theme: { mode: tokens.mode },
      grid: {
        borderColor: tokens.border,
        strokeDashArray: 4,
        ...options?.grid,
      },
      dataLabels: { enabled: false, ...options?.dataLabels },
      stroke: { curve: 'smooth', width: 2, ...options?.stroke },
      xaxis: {
        labels: { style: { colors: tokens.textMuted, fontSize: '12px' } },
        axisBorder: { color: tokens.border },
        axisTicks: { color: tokens.border },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: tokens.textMuted, fontSize: '12px' } },
        ...options?.yaxis,
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
    <Card
      variant="bordered"
      padding="md"
      title={title}
      description={description}
      headerAction={headerAction}
      className={className}
    >
      <div className="w-full overflow-hidden">
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </div>
    </Card>
  );
}
