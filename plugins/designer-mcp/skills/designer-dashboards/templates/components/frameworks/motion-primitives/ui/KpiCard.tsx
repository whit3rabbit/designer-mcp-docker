'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatedNumber } from '../assets/AnimatedNumber';
import { SlidingNumber } from '../assets/SlidingNumber';

export type KpiTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface KpiCardProps {
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  currency?: string;
  locale?: string;
  numberMode?: 'spring' | 'sliding';
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  tone?: KpiTone;
  sparkline?: number[];
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

function MiniSparkline({ data, tone }: { data: number[]; tone: KpiTone }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 92;
  const height = 36;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Trend sparkline"
      className="shrink-0 overflow-visible"
    >
      <polyline
        fill="none"
        stroke={`var(--color-${tone})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
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
  numberMode = 'spring',
  delta,
  deltaLabel = 'vs last period',
  icon,
  tone = 'primary',
  sparkline,
  onClick,
  loading = false,
  className,
}: KpiCardProps) {
  const prefersReduced = useReducedMotion();

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className={clsx('border p-5', className)}
      >
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-subtle)]" />
        <div className="mt-3 h-7 w-32 animate-pulse rounded bg-[var(--color-surface-subtle)]" />
        <div className="mt-3 h-3 w-20 animate-pulse rounded bg-[var(--color-surface-subtle)]" />
      </div>
    );
  }

  const deltaTone: KpiTone =
    delta === undefined || delta === 0 ? 'info' : delta > 0 ? 'success' : 'error';

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 text-start">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
        <div
          className="mt-2 text-2xl font-bold tracking-tight tabular-nums"
          style={{ color: 'var(--color-text)' }}
        >
          {numberMode === 'sliding' ? (
            <SlidingNumber
              value={value}
              prefix={format === 'currency' ? '$' : ''}
              suffix={format === 'percent' ? '%' : ''}
            />
          ) : (
            <AnimatedNumber value={value} format={format} currency={currency} locale={locale} />
          )}
        </div>

        {delta !== undefined && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span
              style={{
                backgroundColor: `var(--color-${deltaTone}-surface)`,
                color: `var(--color-${deltaTone})`,
                borderRadius: 'var(--radius-full, 9999px)',
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 font-medium tabular-nums"
            >
              {delta > 0 ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : delta < 0 ? (
                <TrendingDown className="size-3" aria-hidden="true" />
              ) : (
                <Minus className="size-3" aria-hidden="true" />
              )}
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>{deltaLabel}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        {icon && (
          <span
            aria-hidden="true"
            style={{
              backgroundColor: `var(--color-${tone}-surface)`,
              color: `var(--color-${tone})`,
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex size-10 items-center justify-center"
          >
            {icon}
          </span>
        )}
        {sparkline && <MiniSparkline data={sparkline} tone={tone} />}
      </div>
    </div>
  );

  const sharedStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  };

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={prefersReduced ? undefined : { y: -2 }}
        whileTap={prefersReduced ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={sharedStyle}
        className={clsx(
          'rd-card rd-card-interactive w-full border p-5 text-start cursor-pointer',
          className,
        )}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={sharedStyle}
      className={clsx('rd-card border p-5', className)}
    >
      {content}
    </motion.div>
  );
}
