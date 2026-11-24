import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardHeader } from './Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  type?: 'area' | 'bar' | 'line' | 'donut';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories?: string[];
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
  subtitle,
  type = 'area',
  series,
  categories = [],
  height = 280,
  action,
}: ChartCardProps) {
  const options = React.useMemo<ApexOptions>(() => {
    const textMuted = readToken('--color-text-muted', 'currentColor');
    const border = readToken('--color-border', 'currentColor');
    const palette = [
      readToken('--chart-1', 'var(--color-primary)'),
      readToken('--chart-2', 'var(--color-info)'),
      readToken('--chart-3', 'var(--color-success)'),
      readToken('--chart-4', 'var(--color-warning)'),
    ];

    return {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
      },
      colors: palette,
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      grid: {
        borderColor: border,
        strokeDashArray: 4,
      },
      xaxis: {
        categories,
        labels: { style: { colors: textMuted } },
        axisBorder: { color: border },
        axisTicks: { color: border },
      },
      yaxis: {
        labels: { style: { colors: textMuted } },
      },
      legend: {
        labels: { colors: textMuted },
      },
      tooltip: {
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      },
    };
  }, [categories]);

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <CardBody>
        <Chart type={type} series={series} options={options} height={height} />
      </CardBody>
    </Card>
  );
}
