'use client';

import * as React from 'react';
import { Card as AntCard, Skeleton } from 'antd';
import { TrendingDown, TrendingUp } from 'lucide-react';
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
  icon?: React.ReactNode;
  tone?: KpiTone;
  sparkline?: number[];
  loading?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
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

function SparklineSvg({ data, tone }: { data: number[]; tone: KpiTone }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 96;
  const height = 32;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ flexShrink: 0, overflow: 'visible' }}
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
  style,
}: KpiCardProps) {
  const formatted = formatKpiValue(value, format, currency, locale);
  const isPositive = typeof delta === 'number' && delta >= 0;

  return (
    <AntCard
      hoverable={Boolean(onClick)}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      styles={{ body: { padding: 20 } }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>
              {label}
            </span>
            {icon && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `var(--color-${tone}-surface)`,
                  color: `var(--color-${tone})`,
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatted}
              </span>

              {(typeof delta === 'number' || deltaLabel) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {typeof delta === 'number' && (
                    <Badge tone={isPositive ? 'success' : 'error'} variant="tonal" size="xs">
                      {isPositive ? (
                        <TrendingUp size={12} aria-hidden="true" />
                      ) : (
                        <TrendingDown size={12} aria-hidden="true" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {delta}%
                      </span>
                    </Badge>
                  )}
                  {deltaLabel && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {deltaLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {sparkline && sparkline.length > 1 && <SparklineSvg data={sparkline} tone={tone} />}
          </div>
        </div>
      )}
    </AntCard>
  );
}
