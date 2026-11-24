'use client';

import * as React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Skeleton } from 'antd';
import { Card } from './Card';

export type ChartType = 'area' | 'bar' | 'line' | 'donut' | 'pie' | 'radialBar';

export interface ChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  type: ChartType;
  series: ApexOptions['series'];
  categories?: string[];
  height?: number;
  loading?: boolean;
  options?: ApexOptions;
  style?: React.CSSProperties;
}

function resolveColor(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.color = `var(${varName})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || fallback;
}

function readChartTheme() {
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark'));

  const palette = [
    resolveColor('--chart-1', 'rgb(79, 70, 229)'),
    resolveColor('--chart-2', 'rgb(16, 185, 129)'),
    resolveColor('--chart-3', 'rgb(245, 158, 11)'),
    resolveColor('--chart-4', 'rgb(6, 182, 212)'),
    resolveColor('--chart-5', 'rgb(244, 63, 94)'),
    resolveColor('--chart-6', 'rgb(139, 92, 246)'),
  ];

  return {
    isDark,
    palette,
    textMuted: resolveColor('--color-text-muted', 'rgb(100, 116, 139)'),
    border: resolveColor('--color-border', 'rgb(226, 232, 240)'),
  };
}

export function ChartCard({
  title,
  subtitle,
  headerExtra,
  type,
  series,
  categories,
  height = 280,
  loading = false,
  options,
  style,
}: ChartCardProps) {
  const [chartTheme, setChartTheme] = React.useState(() => readChartTheme());

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const sync = () => setChartTheme(readChartTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const base: ApexOptions = {
      chart: {
        type,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
      },
      theme: {
        mode: chartTheme.isDark ? 'dark' : 'light',
      },
      colors: chartTheme.palette,
      stroke: {
        curve: 'smooth',
        width: type === 'bar' || type === 'donut' || type === 'pie' ? 0 : 2.5,
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: chartTheme.border,
        strokeDashArray: 4,
      },
      xaxis: categories
        ? {
            categories,
            labels: { style: { colors: chartTheme.textMuted } },
            axisBorder: { color: chartTheme.border },
            axisTicks: { color: chartTheme.border },
          }
        : undefined,
      yaxis: {
        labels: { style: { colors: chartTheme.textMuted } },
      },
      legend: {
        labels: { colors: chartTheme.textMuted },
      },
    };

    return {
      ...base,
      ...options,
      chart: { ...base.chart, ...options?.chart },
      xaxis: { ...base.xaxis, ...options?.xaxis },
      grid: { ...base.grid, ...options?.grid },
    };
  }, [type, categories, chartTheme, options]);

  return (
    <Card title={title} subtitle={subtitle} headerExtra={headerExtra} style={style}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <ReactApexChart type={type} series={series} options={mergedOptions} height={height} />
      )}
    </Card>
  );
}
