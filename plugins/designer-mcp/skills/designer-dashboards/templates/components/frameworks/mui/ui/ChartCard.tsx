import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Box } from '@mui/material';
import { Card } from './Card';
import { useMuiThemeMode } from '../theme/MuiThemeProvider';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  type: 'line' | 'area' | 'bar' | 'donut' | 'pie';
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
}

function readCssToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export function ChartCard({
  title,
  subtitle,
  action,
  type,
  series,
  options,
  height = 300,
}: ChartCardProps) {
  const { mode } = useMuiThemeMode();

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const chartColors = [
      readCssToken('--chart-1', 'oklch(0.62 0.19 255)'),
      readCssToken('--chart-2', 'oklch(0.68 0.16 175)'),
      readCssToken('--chart-3', 'oklch(0.72 0.16 70)'),
      readCssToken('--chart-4', 'oklch(0.64 0.19 310)'),
      readCssToken('--chart-5', 'oklch(0.62 0.21 25)'),
    ];
    const muted = readCssToken('--color-text-muted', 'var(--color-text-muted)');
    const border = readCssToken('--color-border', 'var(--color-border)');
    const fontFamily = readCssToken('--font-sans', 'sans-serif');

    return {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily,
        ...options?.chart,
      },
      colors: options?.colors ?? chartColors,
      theme: { mode },
      grid: {
        borderColor: border,
        strokeDashArray: 4,
        ...options?.grid,
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      xaxis: {
        labels: { style: { colors: muted } },
        axisBorder: { color: border },
        axisTicks: { color: border },
        ...options?.xaxis,
      },
      yaxis: {
        labels: { style: { colors: muted } },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: muted },
        ...options?.legend,
      },
      ...options,
    };
  }, [mode, options]);

  return (
    <Card title={title} subtitle={subtitle} action={action}>
      <Box sx={{ width: '100%', minHeight: height }}>
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </Box>
    </Card>
  );
}
