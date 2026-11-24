import * as React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from './Card';

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
}

const TONE_COLOR: Record<KpiTone, string> = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
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

function SparklineSvg({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const width = 96;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
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
      style={{ flexShrink: 0 }}
    >
      <polyline
        fill="none"
        stroke={color}
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
}: KpiCardProps) {
  const accent = TONE_COLOR[tone];
  const formatted = formatKpiValue(value, format, currency, locale);
  const isPositive = typeof delta === 'number' && delta >= 0;

  return (
    <Card
      style={{
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <Skeleton width="45%" height="0.875rem" />
          <Skeleton width="65%" height="1.75rem" />
          <Skeleton width="35%" height="0.875rem" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              {label}
            </span>
            {icon ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `color-mix(in oklch, ${accent} 14%, transparent)`,
                  color: accent,
                }}
              >
                {icon}
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <div
                style={{
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatted}
              </div>
              {typeof delta === 'number' ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                  }}
                >
                  {isPositive ? (
                    <TrendingUp size={14} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={14} aria-hidden="true" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {delta.toFixed(1)}%
                  </span>
                  {deltaLabel ? (
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{deltaLabel}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            {sparkline && sparkline.length > 1 ? <SparklineSvg data={sparkline} color={accent} /> : null}
          </div>
        </div>
      )}
    </Card>
  );
}
