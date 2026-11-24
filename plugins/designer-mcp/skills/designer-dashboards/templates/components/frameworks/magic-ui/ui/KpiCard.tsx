'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { BorderBeam } from '../assets/BorderBeam';
import { NumberTicker } from '../assets/NumberTicker';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

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
  icon: React.ReactNode;
  tone?: KpiTone;
  beam?: boolean;
  sparkline?: KpiSparkline;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
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
  const height = 40;

  if (spec.type === 'bar') {
    const peakIdx = spec.highlightIndex ?? points.indexOf(max);
    const barW = Math.max(4, Math.floor((width - (points.length - 1) * 3) / points.length));
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Sparkline bar trend"
        className="shrink-0"
      >
        {points.map((v, i) => {
          const h = Math.max(4, Math.round(((v - min) / range) * (height - 4)));
          const x = i * (barW + 3);
          const y = height - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill={i === peakIdx ? `var(--color-${tone})` : 'var(--color-border)'}
            />
          );
        })}
      </svg>
    );
  }

  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - 4 - ((v - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline trend"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`kpi-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`var(--color-${tone})`} stopOpacity="0.28" />
          <stop offset="100%" stopColor={`var(--color-${tone})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${coords} ${width},${height}`}
        fill={`url(#kpi-grad-${uid})`}
      />
      <polyline
        fill="none"
        stroke={`var(--color-${tone})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  format = 'number',
  currency = 'USD',
  locale,
  delta,
  deltaLabel,
  icon,
  tone = 'primary',
  beam = false,
  sparkline,
  onClick,
  loading = false,
  className,
}: KpiCardProps) {
  const isPositive = typeof delta === 'number' && delta >= 0;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
      }}
      className={cn(
        'relative flex w-full flex-col justify-between gap-4 overflow-hidden border p-5 text-start transition-shadow duration-150',
        onClick &&
          'cursor-pointer hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className,
      )}
    >
      {beam && <BorderBeam duration={10} size={140} />}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p style={{ color: 'var(--color-text-muted)' }} className="truncate text-xs font-medium">
            {label}
          </p>
          {loading ? (
            <div
              style={{ backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}
              className="h-7 w-24 animate-pulse motion-reduce:animate-none"
            />
          ) : typeof value === 'number' && format !== 'raw' ? (
            <div className="text-2xl font-bold tracking-tight">
              <NumberTicker value={value} format={format} currency={currency} locale={locale} />
            </div>
          ) : (
            <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
          )}
        </div>

        <div
          style={{
            backgroundColor: `var(--color-${tone}-surface)`,
            borderColor: `var(--color-${tone}-border)`,
            color: `var(--color-${tone})`,
            borderRadius: 'var(--radius-md)',
          }}
          className="inline-flex size-10 shrink-0 items-center justify-center border"
        >
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        {typeof delta === 'number' ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              style={{
                backgroundColor: isPositive ? 'var(--color-success-surface)' : 'var(--color-error-surface)',
                color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                borderRadius: 'var(--radius-full, 9999px)',
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 font-semibold tabular-nums"
            >
              {isPositive ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              {isPositive ? '+' : ''}
              {delta}%
            </span>
            {deltaLabel && (
              <span style={{ color: 'var(--color-text-muted)' }} className="truncate">
                {deltaLabel}
              </span>
            )}
          </div>
        ) : (
          <span />
        )}

        {sparkline && <MiniSparkline sparkline={sparkline} tone={tone} />}
      </div>
    </Tag>
  );
}
