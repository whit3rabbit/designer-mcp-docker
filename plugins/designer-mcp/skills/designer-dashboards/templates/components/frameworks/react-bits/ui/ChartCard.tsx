'use client';

import * as React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { useMotionPreferences } from '../theme/motionConfig';

export interface ChartCardProps {
  title: string;
  description?: string;
  type?: 'area' | 'line' | 'bar' | 'donut';
  series: ApexOptions['series'];
  categories?: string[];
  height?: number;
  options?: ApexOptions;
  className?: string;
}

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function ChartCard({
  title,
  description,
  type = 'area',
  series,
  categories = [],
  height = 280,
  options,
  className,
}: ChartCardProps) {
  const { prefersReducedMotion } = useMotionPreferences();
  const [themeKey, setThemeKey] = React.useState(0);

  React.useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => setThemeKey((k) => k + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'dir'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions = React.useMemo<ApexOptions>(() => {
    const c1 = readToken('--chart-1', 'var(--chart-1)');
    const c2 = readToken('--chart-2', 'var(--chart-2)');
    const c3 = readToken('--chart-3', 'var(--chart-3)');
    const textMuted = readToken('--color-text-muted', 'var(--color-text-muted)');
    const border = readToken('--color-border', 'var(--color-border)');

    return {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: !prefersReducedMotion, speed: 450 },
        fontFamily: 'var(--font-sans)',
      },
      colors: [c1, c2, c3],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: border, strokeDashArray: 4 },
      xaxis: {
        categories,
        labels: { style: { colors: textMuted, fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: textMuted, fontSize: '11px' } },
      },
      legend: {
        labels: { colors: textMuted },
      },
      tooltip: { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' },
      ...options,
    };
  }, [categories, options, prefersReducedMotion, themeKey]);

  return (
    <Card spotlight className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Chart key={themeKey} type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
