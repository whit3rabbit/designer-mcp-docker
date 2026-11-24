import * as React from 'react';
import Chart, { type Props as ApexChartProps } from 'react-apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: ApexChartProps['type'];
  series: ApexChartProps['series'];
  options?: ApexChartProps['options'];
  height?: number;
  action?: React.ReactNode;
  className?: string;
}

function readOpenDesignChartTheme() {
  if (typeof window === 'undefined') {
    return {
      colors: undefined as string[] | undefined,
      textMuted: undefined as string | undefined,
      border: undefined as string | undefined,
      isDark: false,
    };
  }
  const styles = getComputedStyle(document.documentElement);
  const colors = Array.from({ length: 10 }, (_, idx) =>
    styles.getPropertyValue(`--chart-${idx + 1}`).trim(),
  ).filter(Boolean);

  return {
    colors: colors.length > 0 ? colors : undefined,
    textMuted: styles.getPropertyValue('--color-text-muted').trim() || undefined,
    border: styles.getPropertyValue('--color-border').trim() || undefined,
    isDark:
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark',
  };
}

export function ChartCard({
  title,
  description,
  type,
  series,
  options,
  height = 280,
  action,
  className,
}: ChartCardProps) {
  const [themeState, setThemeState] = React.useState(readOpenDesignChartTheme);

  React.useEffect(() => {
    setThemeState(readOpenDesignChartTheme());
    const observer = new MutationObserver(() => {
      setThemeState(readOpenDesignChartTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const mergedOptions: ApexChartProps['options'] = React.useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        ...options?.chart,
      },
      colors: options?.colors ?? themeState.colors,
      theme: {
        mode: themeState.isDark ? 'dark' : 'light',
        ...options?.theme,
      },
      grid: {
        borderColor: themeState.border,
        strokeDashArray: 3,
        ...options?.grid,
      },
      xaxis: {
        labels: {
          style: { colors: themeState.textMuted },
        },
        axisBorder: { color: themeState.border },
        axisTicks: { color: themeState.border },
        ...options?.xaxis,
      },
      yaxis: {
        labels: {
          style: { colors: themeState.textMuted },
        },
        ...options?.yaxis,
      },
      legend: {
        labels: { colors: themeState.textMuted },
        ...options?.legend,
      },
      ...options,
    }),
    [options, themeState],
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        <Chart type={type} series={series} options={mergedOptions} height={height} />
      </CardContent>
    </Card>
  );
}
