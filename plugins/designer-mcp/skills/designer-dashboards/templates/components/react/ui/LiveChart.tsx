'use client';

import * as React from 'react';
import { ChartWrapper } from './ChartWrapper';
import { Button } from './Button';

export interface LiveChartProps {
  title: string;
  type?: 'area' | 'line' | 'bar';
  seriesName?: string;
  initialPoints?: number[];
  maxPoints?: number;
  intervalMs?: number;
  height?: number;
  getNextValue?: (prev: number) => number;
}

export function LiveChart({
  title,
  type = 'area',
  seriesName = 'Throughput',
  initialPoints = [42, 48, 45, 53, 50, 58, 56, 62, 59, 64],
  maxPoints = 20,
  intervalMs = 2000,
  height = 280,
  getNextValue = (prev) => Math.max(10, Math.round(prev + (Math.random() - 0.48) * 10)),
}: LiveChartProps) {
  const [points, setPoints] = React.useState<number[]>(initialPoints);
  const [labels, setLabels] = React.useState<string[]>(() =>
    initialPoints.map((_, i) => `-${(initialPoints.length - i) * (intervalMs / 1000)}s`),
  );
  const [paused, setPaused] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  React.useEffect(() => {
    if (paused || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPaused(true);
      return;
    }

    const timer = window.setInterval(() => {
      setPoints((prev) => {
        const nextVal = getNextValue(prev[prev.length - 1] ?? 50);
        return [...prev, nextVal].slice(-maxPoints);
      });
      setLabels((prev) => {
        const now = new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
        return [...prev, now].slice(-maxPoints);
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [paused, intervalMs, maxPoints, getNextValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span
          role="status"
          aria-live="polite"
          style={{ color: paused ? 'var(--color-text-muted)' : 'var(--color-success)' }}
          className="inline-flex items-center gap-1.5 font-medium"
        >
          <span
            aria-hidden="true"
            style={{
              backgroundColor: paused ? 'var(--color-text-muted)' : 'var(--color-success)',
              borderRadius: 'var(--radius-full)',
            }}
            className="size-2"
          />
          {paused ? 'Stream paused' : 'Live stream active'}
        </span>
        <Button variant="outline" tone="neutral" size="xs" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <ChartWrapper
        title={title}
        type={type}
        height={height}
        categories={labels}
        series={[{ name: seriesName, data: points }]}
        options={{ chart: { animations: { enabled: false } } }}
      />
    </div>
  );
}
