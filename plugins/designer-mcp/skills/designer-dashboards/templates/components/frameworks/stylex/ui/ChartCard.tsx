import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { tokens } from '../theme/tokens.stylex';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

export interface ChartCardProps {
  title: string;
  description?: string;
  type: 'line' | 'area' | 'bar' | 'donut' | 'radialBar';
  series: ApexOptions['series'];
  options?: ApexOptions;
  height?: number;
  action?: React.ReactNode;
}

const styles = stylex.create({
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  chartWrap: {
    width: '100%',
    minHeight: '220px',
    color: tokens.text,
  },
});

export function ChartCard({
  title,
  description,
  type,
  series,
  options,
  height = 280,
  action,
}: ChartCardProps) {
  const mergedOptions: ApexOptions = React.useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'var(--font-sans)',
        foreColor: 'var(--color-text-muted)',
        ...options?.chart,
      },
      colors: [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ],
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        ...options?.grid,
      },
      dataLabels: {
        enabled: false,
        ...options?.dataLabels,
      },
      tooltip: {
        theme: 'dark',
        ...options?.tooltip,
      },
      ...options,
    }),
    [options],
  );

  return (
    <Card>
      <CardHeader>
        <div {...stylex.props(styles.headerRow)}>
          <div {...stylex.props(styles.titleWrap)}>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ?? null}
        </div>
      </CardHeader>
      <CardContent>
        <div {...stylex.props(styles.chartWrap)}>
          <Chart type={type} series={series} options={mergedOptions} height={height} />
        </div>
      </CardContent>
    </Card>
  );
}
