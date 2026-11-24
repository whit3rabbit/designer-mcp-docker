'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardHeader } from './Card';

export type ChartType = 'area' | 'line' | 'bar' | 'donut' | 'pie';

export interface ChartCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  type?: ChartType;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
  height?: number;
  className?: string;
}

function readOpenDesignChartTokens() {
  if (typeof window === 'undefined') {
    return {
      isDark: false,
      palette: [] as string[],
      textMuted: '',
      border: '',
      fontSans: 'sans-serif',
    };
  }
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const isDark = root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
  const palette: string[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const val = styles.getPropertyValue(`--chart-${i}`).trim();
    if (val) palette.push(val);
  }
  return {
    isDark,
    palette,
    textMuted: styles.getPropertyValue('--color-text-muted').trim(),
    border: styles.getPropertyValue('--color-border').trim(),
    fontSans: styles.getPropertyValue('--font-sans').trim() || 'sans-serif',
  };
}

export function ChartCard({
  title,
  description,
  action,
  type = 'area',
  series,
  options,
  height = 280,
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState(readOpenDesignChartTokens);

  React.useEffect(() => {
    setTokens(readOpenDesignChartTokens());
    const observer = new MutationObserver(() => {
      setTokens(readOpenDesignChartTokens());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const base: ApexOptions = {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: tokens.fontSans,
      },
      theme: {
        mode: tokens.isDark ? 'dark' : 'light',
      },
      colors: tokens.palette.length > 0 ? tokens.palette : undefined,
      grid: {
        borderColor: tokens.border || undefined,
        strokeDashArray: 4,
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        labels: { style: { colors: tokens.textMuted || undefined } },
        axisBorder: { color: tokens.border || undefined },
        axisTicks: { color: tokens.border || undefined },
      },
      yaxis: {
        labels: { style: { colors: tokens.textMuted || undefined } },
      },
      legend: {
        labels: { colors: tokens.textMuted || undefined },
      },
    };

    return {
      ...base,
      ...options,
      chart: { ...base.chart, ...options?.chart },
      grid: { ...base.grid, ...options?.grid },
      xaxis: { ...base.xaxis, ...options?.xaxis },
      yaxis: { ...base.yaxis, ...options?.yaxis },
    };
  }, [tokens, options]);

  return (
    <Card className={className}>
      <CardHeader title={title} description={description} action={action} />
      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} width="100%" />
      </CardContent>
    </Card>
  );
}
