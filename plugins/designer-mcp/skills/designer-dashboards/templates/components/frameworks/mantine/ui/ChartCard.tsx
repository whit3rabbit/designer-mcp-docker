import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: 'area' | 'line' | 'bar' | 'donut';
  series: ApexOptions['series'];
  options?: ApexOptions;
  height?: number;
  ranges?: { label: string; value: string }[];
  rangeValue?: string;
  onRangeChange?: (value: string) => void;
}

const CHART_PALETTE = [
  'var(--chart-1, var(--color-primary))',
  'var(--chart-2, var(--color-info))',
  'var(--chart-3, var(--color-success))',
  'var(--chart-4, var(--color-warning))',
  'var(--chart-5, var(--color-error))',
];

export function ChartCard({
  title,
  description,
  type,
  series,
  options,
  height = 280,
  ranges,
  rangeValue,
  onRangeChange,
}: ChartCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const mergedOptions = React.useMemo<ApexOptions>(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        ...options?.chart,
      },
      theme: {
        mode: isDark ? 'dark' : 'light',
      },
      colors: options?.colors ?? CHART_PALETTE,
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        ...options?.grid,
      },
      xaxis: {
        labels: {
          style: { colors: 'var(--color-text-muted)' },
        },
        axisBorder: { color: 'var(--color-border)' },
        axisTicks: { color: 'var(--color-border)' },
        ...options?.xaxis,
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--color-text-muted)' },
        },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: 'var(--color-text-muted)' },
        ...options?.legend,
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        ...options?.tooltip,
      },
      ...options,
    }),
    [isDark, options],
  );

  return (
    <Card padding="lg">
      <CardHeader
        action={
          ranges && ranges.length > 0 ? (
            <SegmentedControl
              size="xs"
              radius="md"
              data={ranges}
              value={rangeValue}
              onChange={onRangeChange}
              aria-label={`${title} time range`}
            />
          ) : undefined
        }
      >
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </CardContent>
    </Card>
  );
}
