'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon, type IconName } from '../../@core/icons/registry';

export type KpiTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export type KpiSparkline =
  | number[]
  | {
      type: 'line' | 'bar' | 'radial';
      data: number[];
      highlightIndex?: number;
    };

export interface KpiCardProps {
  label: string;
  value: string | number;
  format?: 'raw' | 'number' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  delta?: number;
  deltaLabel?: string;
  icon: IconName | string;
  tone?: KpiTone;
  variant?: 'default' | 'bordered' | 'horizontal';
  sparkline?: KpiSparkline;
  onClick?: () => void;
  loading?: boolean;
}

function formatKpiValue(
  value: string | number,
  format: KpiCardProps['format'],
  currency = 'USD',
  locale?: string,
): string | number {
  if (typeof value !== 'number' || !format || format === 'raw') return value;
  if (format === 'currency') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(value / 100);
  }
  return new Intl.NumberFormat(locale).format(value);
}

function MiniSparkline({ sparkline, tone }: { sparkline: KpiSparkline; tone: KpiTone }) {
  const uid = React.useId().replace(/:/g, '');
  const spec = Array.isArray(sparkline) ? { type: 'line' as const, data: sparkline } : sparkline;
  const points = spec.data;

  if (spec.type === 'radial') {
    const pct = Math.max(0, Math.min(100, points[0] ?? 0));
    const size = 48;
    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${pct}% progress`}
        className="shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`var(--color-${tone})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="53%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-text)"
          fontSize="10"
          fontWeight="600"
          className="tabular-nums"
        >
          {Math.round(pct)}%
        </text>
      </svg>
    );
  }

  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 96;
  const height = 44;

  if (spec.type === 'bar') {
    const peakIdx = spec.highlightIndex ?? points.indexOf(max);
    const barW = Math.max(4, Math.floor((width - (points.length - 1) * 3) / points.length));
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend bar sparkline"
        className="shrink-0"
      >
        {points.map((p, i) => {
          const barH = Math.max(4, ((p - min) / range) * (height - 6) + 4);
          const x = i * (barW + 3);
          const y = height - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              fill={i === peakIdx ? `var(--color-${tone})` : `var(--color-${tone}-surface)`}
            />
          );
        })}
      </svg>
    );
  }

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))] as const;
  });
  const linePoints = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPath = `M 0,${height} L ${coords.map(([x, y]) => `${x},${y}`).join(' L ')} L ${width},${height} Z`;

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
          <stop offset="0%" stopColor={`var(--color-${tone})`} stopOpacity="0.28" />
          <stop offset="100%" stopColor={`var(--color-${tone})`} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#kpi-grad-${uid})`} />
      <polyline
        fill="none"
        stroke={`var(--color-${tone})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints}
      />
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
  deltaLabel = 'vs last 30d',
  icon,
  tone = 'primary',
  variant = 'default',
  sparkline,
  onClick,
  loading = false,
}: KpiCardProps) {
  const isPositive = typeof delta === 'number' && delta >= 0;
  const formattedValue = formatKpiValue(value, format, currency, locale);

  return (
    <article
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: variant === 'bordered' ? `var(--color-${tone}-border)` : 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: variant === 'bordered' ? 'none' : 'var(--shadow-sm)',
      }}
      className={clsx(
        'rd-card border p-5',
        variant === 'bordered' && 'border-b-2',
        onClick && 'rd-card-interactive cursor-pointer',
      )}
    >
      {loading ? (
        <div className="space-y-3" role="status" aria-label={`Loading ${label}`}>
          <div
            style={{ borderRadius: 'var(--radius-sm)' }}
            className="rd-shimmer h-3.5 w-24"
          />
          <div
            style={{ borderRadius: 'var(--radius-sm)' }}
            className="rd-shimmer h-7 w-32"
          />
        </div>
      ) : (
        <div
          className={clsx(
            'flex justify-between gap-3',
            variant === 'horizontal' ? 'items-center' : 'items-start',
          )}
        >
          <div className="min-w-0 space-y-1.5">
            <p
              style={{ color: 'var(--color-text-muted)' }}
              className="truncate text-xs font-medium uppercase tracking-wider"
            >
              {label}
            </p>
            <p
              style={{ color: 'var(--color-text)' }}
              className="tabular-nums text-2xl font-bold tracking-tight"
            >
              {formattedValue}
            </p>
            {typeof delta === 'number' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  style={{
                    backgroundColor: isPositive
                      ? 'var(--color-success-surface)'
                      : 'var(--color-error-surface)',
                    color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                    borderRadius: 'var(--radius-full)',
                  }}
                  className="tabular-nums inline-flex items-center gap-0.5 px-2 py-0.5 font-semibold"
                >
                  <AppIcon
                    name={isPositive ? 'arrow-up-right' : 'arrow-down-right'}
                    size={12}
                  />
                  {isPositive ? '+' : ''}
                  {delta.toFixed(1)}%
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{deltaLabel}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              style={{
                backgroundColor: `var(--color-${tone}-surface)`,
                color: `var(--color-${tone})`,
                borderRadius: 'var(--radius-md)',
              }}
              className="flex size-10 items-center justify-center"
            >
              <AppIcon name={icon} size={20} />
            </span>
            {sparkline && <MiniSparkline sparkline={sparkline} tone={tone} />}
          </div>
        </div>
      )}
    </article>
  );
}
