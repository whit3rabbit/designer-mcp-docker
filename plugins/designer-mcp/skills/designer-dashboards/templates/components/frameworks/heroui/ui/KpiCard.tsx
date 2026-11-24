'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

export type KpiTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface KpiCardProps {
  label: string;
  value: string | number;
  format?: 'raw' | 'number' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  tone?: KpiTone;
  sparkline?: number[];
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

function formatKpiValue(
  value: string | number,
  format: KpiCardProps['format'],
  currency = 'USD',
  locale?: string,
): string | number {
  if (typeof value !== 'number' || !format || format === 'raw') return value;
  if (format === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value / 100);
  }
  return new Intl.NumberFormat(locale).format(value);
}

function MiniSparkline({ points, tone }: { points: number[]; tone: KpiTone }) {
  const uid = React.useId().replace(/:/g, '');
  if (points.length < 2) return null;

  const width = 96;
  const height = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - 4 - ((p - min) / span) * (height - 8);
    return { x, y };
  });

  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const strokeColor = `var(--color-${tone})`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Trend sparkline"
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={`kpi-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.24" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#kpi-grad-${uid})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  format = 'raw',
  currency = 'USD',
  locale,
  delta,
  deltaLabel,
  icon,
  tone = 'primary',
  sparkline,
  loading = false,
  onClick,
  className,
}: KpiCardProps) {
  const formattedValue = formatKpiValue(value, format, currency, locale);
  const isPositive = typeof delta === 'number' && delta >= 0;

  return (
    <Card
      variant="bordered"
      padding="md"
      className={clsx(
        'flex flex-col justify-between gap-3',
        onClick && 'cursor-pointer hover:border-[var(--color-primary-border)]',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-[var(--color-surface-subtle)]" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--color-text)] tabular-nums">
              {formattedValue}
            </p>
          )}
        </div>
        <div
          aria-hidden="true"
          style={{
            backgroundColor: `var(--color-${tone}-surface)`,
            color: `var(--color-${tone})`,
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        {typeof delta === 'number' ? (
          <div className="flex items-center gap-1.5">
            <Badge tone={isPositive ? 'success' : 'error'} variant="soft" size="sm">
              {isPositive ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              <span>{`${isPositive ? '+' : ''}${delta.toFixed(1)}%`}</span>
            </Badge>
            {deltaLabel ? (
              <span className="text-xs text-[var(--color-text-muted)]">{deltaLabel}</span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">{deltaLabel ?? ''}</span>
        )}

        {sparkline && sparkline.length > 1 ? <MiniSparkline points={sparkline} tone={tone} /> : null}
      </div>
    </Card>
  );
}
