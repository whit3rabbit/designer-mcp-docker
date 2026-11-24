import * as React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export type ChartType = 'line' | 'area' | 'bar' | 'donut' | 'pie' | 'radialBar';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: ChartType;
  series: ApexOptions['series'];
  options?: ApexOptions;
  height?: number;
  headerAction?: React.ReactNode;
  className?: string;
}

function readOpenDesignChartTokens() {
  if (typeof window === 'undefined') {
    return {
      isDark: false,
      colors: ['oklch(0.6 0.18 250)', 'oklch(0.65 0.17 160)', 'oklch(0.7 0.16 70)'],
      textMuted: 'oklch(0.55 0.02 250)',
      border: 'oklch(0.88 0.01 250)',
    };
  }
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const isDark =
    root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');

  const chartVars = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']
    .map((v) => styles.getPropertyValue(v).trim())
    .filter(Boolean);

  return {
    isDark,
    colors: chartVars.length > 0 ? chartVars : [styles.getPropertyValue('--color-primary').trim()],
    textMuted: styles.getPropertyValue('--color-text-muted').trim(),
    border: styles.getPropertyValue('--color-border').trim(),
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

  const mergedOptions: ApexOptions = {
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
    colors: options?.colors ?? tokens.colors,
    grid: {
      borderColor: tokens.border,
      strokeDashArray: 4,
      ...options?.grid,
    },
    xaxis: {
      labels: { style: { colors: tokens.textMuted } },
      axisBorder: { color: tokens.border },
      axisTicks: { color: tokens.border },
      ...options?.xaxis,
    },
    yaxis: {
      labels: { style: { colors: tokens.textMuted } },
      ...options?.yaxis,
    },
    legend: {
      labels: { colors: tokens.textMuted },
      ...options?.legend,
    },
    dataLabels: { enabled: false, ...options?.dataLabels },
    ...options,
  };

  return (
    <Card className={className}>
      <CardHeader
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--op-space-md)',
        }}
      >
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>
        <ReactApexChart type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
