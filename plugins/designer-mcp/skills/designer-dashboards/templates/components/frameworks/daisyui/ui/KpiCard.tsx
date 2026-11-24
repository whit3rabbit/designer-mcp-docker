'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';

export type KpiTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface KpiCardProps {
  label: string;
  value: string | number;
  format?: 'raw' | 'number' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  tone?: KpiTone;
  sparkline?: number[];
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const TONE_COLOR_VAR: Record<KpiTone, string> = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
};

const TONE_SURFACE_VAR: Record<KpiTone, string> = {
  primary: 'var(--color-primary-surface)',
  success: 'var(--color-success-surface)',
  warning: 'var(--color-warning-surface)',
  error: 'var(--color-error-surface)',
  info: 'var(--color-info-surface)',
};

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

function Sparkline({ data, tone }: { data: number[]; tone: KpiTone }) {
  const uid = React.useId().replace(/:/g, '');
  if (data.length < 2) return null;

  const width = 112;
  const height = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const coords = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${coords.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const stroke = TONE_COLOR_VAR[tone];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`kpi-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#kpi-grad-${uid})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
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
  const formatted = formatKpiValue(value, format, currency, locale);
  const isPositive = typeof delta === 'number' && delta >= 0;

  const content = (
    <div className="card-body p-4 gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-text-muted)] truncate">{label}</p>
          {loading ? (
            <div className="skeleton h-7 w-24 mt-1.5" />
          ) : (
            <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">{formatted}</p>
          )}
        </div>
        {icon && (
          <div
            className="size-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
            style={{
              backgroundColor: TONE_SURFACE_VAR[tone],
              color: TONE_COLOR_VAR[tone],
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2 min-h-[24px]">
        {typeof delta === 'number' ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={clsx(
                'badge badge-soft badge-sm gap-1 font-medium tabular-nums',
                isPositive ? 'badge-success' : 'badge-error',
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              {isPositive ? `+${delta}%` : `${delta}%`}
            </span>
            {deltaLabel && (
              <span className="text-xs text-[var(--color-text-muted)]">{deltaLabel}</span>
            )}
          </div>
        ) : (
          <span />
        )}
        {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} tone={tone} />}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          'card bg-base-100 text-base-content text-start border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary-border)] transition-colors w-full',
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={clsx(
        'card bg-base-100 text-base-content border border-[var(--color-border)] shadow-sm',
        className,
      )}
    >
      {content}
    </div>
  );
}
