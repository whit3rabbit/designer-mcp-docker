import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card } from './Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  type: 'line' | 'area' | 'bar' | 'donut' | 'pie';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
}

const CHART_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

export function ChartCard({
  title,
  subtitle,
  actions,
  type,
  series,
  options,
  height = 280,
}: ChartCardProps) {
  const mergedOptions = React.useMemo<ApexOptions>(
    () => ({
      chart: {
        toolbar: { show: false },
        fontFamily: 'var(--font-sans)',
        foreColor: 'var(--color-text-muted)',
        background: 'transparent',
        ...options?.chart,
      },
      colors: options?.colors ?? CHART_PALETTE,
      grid: {
        borderColor: 'var(--color-border)',
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
      tooltip: {
        theme: 'dark',
        ...options?.tooltip,
      },
      ...options,
    }),
    [options],
  );

  return (
    <Card title={title} subtitle={subtitle} actions={actions}>
      <Chart type={type} series={series} options={mergedOptions} height={height} />
    </Card>
  );
}
