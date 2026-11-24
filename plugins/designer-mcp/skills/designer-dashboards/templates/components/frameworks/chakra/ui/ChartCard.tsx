import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Box } from '@chakra-ui/react';
import { Card } from './Card';

export type ChartType = 'line' | 'area' | 'bar' | 'donut' | 'radialBar';

export interface ChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  type: ChartType;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
}

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function ChartCard({
  title,
  subtitle,
  headerAction,
  type,
  series,
  options,
  height = 280,
}: ChartCardProps) {
  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const palette = [
      readCssVar('--chart-1', 'var(--chart-1)'),
      readCssVar('--chart-2', 'var(--chart-2)'),
      readCssVar('--chart-3', 'var(--chart-3)'),
      readCssVar('--chart-4', 'var(--chart-4)'),
      readCssVar('--chart-5', 'var(--chart-5)'),
    ];
    const textMuted = readCssVar('--color-text-muted', 'var(--color-text-muted)');
    const borderColor = readCssVar('--color-border', 'var(--color-border)');

    return {
      chart: {
        toolbar: { show: false },
        fontFamily: 'var(--font-sans)',
        background: 'transparent',
        ...options?.chart,
      },
      colors: options?.colors ?? palette,
      grid: {
        borderColor,
        strokeDashArray: 4,
        ...options?.grid,
      },
      xaxis: {
        labels: { style: { colors: textMuted } },
        axisBorder: { color: borderColor },
        axisTicks: { color: borderColor },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: textMuted } },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: textMuted },
        ...options?.legend,
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        ...options?.stroke,
      },
      ...options,
    };
  }, [options]);

  return (
    <Card title={title} subtitle={subtitle} headerAction={headerAction}>
      <Box w="full" minH={`${height}px`}>
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </Box>
    </Card>
  );
}
