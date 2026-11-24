'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card } from './Card';

export interface ChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  type: 'line' | 'area' | 'bar' | 'donut' | 'pie' | 'radialBar';
  series: ApexOptions['series'];
  options?: ApexOptions;
  height?: number;
  className?: string;
}

function readThemeChartTokens() {
  if (typeof document === 'undefined') {
    return {
      isDark: false,
      palette: [] as string[],
      textMuted: 'currentColor',
      borderColor: 'currentColor',
    };
  }
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const isDark =
    root.classList.contains('dark') ||
    root.getAttribute('data-theme') === 'rabbit-dark' ||
    root.getAttribute('data-theme') === 'dark';

  const palette: string[] = [];
  for (let i = 1; i <= 6; i += 1) {
    const val = styles.getPropertyValue(`--chart-${i}`).trim();
    if (val) palette.push(val);
  }

  return {
    isDark,
    palette,
    textMuted: styles.getPropertyValue('--color-text-muted').trim() || 'currentColor',
    borderColor: styles.getPropertyValue('--color-border').trim() || 'currentColor',
  };
}

export function ChartCard({
  title,
  subtitle,
  headerAction,
  type,
  series,
  options,
  height = 280,
  className,
}: ChartCardProps) {
  const [tokens, setTokens] = React.useState(() => readThemeChartTokens());

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const sync = () => setTokens(readThemeChartTokens());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    return {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        ...options?.chart,
      },
      theme: {
        mode: tokens.isDark ? 'dark' : 'light',
        ...options?.theme,
      },
      colors: options?.colors ?? (tokens.palette.length > 0 ? tokens.palette : undefined),
      grid: {
        borderColor: tokens.borderColor,
        strokeDashArray: 4,
        ...options?.grid,
      },
      xaxis: {
        labels: {
          style: { colors: tokens.textMuted },
          ...options?.xaxis?.labels,
        },
        axisBorder: { color: tokens.borderColor },
        axisTicks: { color: tokens.borderColor },
        ...options?.xaxis,
      },
      yaxis: {
        labels: {
          style: { colors: tokens.textMuted },
        },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: tokens.textMuted },
        ...options?.legend,
      },
      ...options,
    };
  }, [options, tokens]);

  return (
    <Card title={title} subtitle={subtitle} headerAction={headerAction} className={className}>
      <Chart type={type} series={series} options={mergedOptions} height={height} />
    </Card>
  );
}
