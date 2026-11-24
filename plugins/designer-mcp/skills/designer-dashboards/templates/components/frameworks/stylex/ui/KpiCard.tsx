import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';
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
  icon: React.ReactNode;
  tone?: KpiTone;
  sparkline?: number[];
  onClick?: () => void;
}

const styles = stylex.create({
  card: {
    paddingBlock: '20px',
    paddingInline: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: '150ms',
    boxShadow: {
      default: tokens.shadowSm,
      ':hover': tokens.shadowMd,
    },
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  label: {
    margin: 0,
    fontSize: tokens.textXs,
    fontWeight: 500,
    color: tokens.textMuted,
  },
  iconBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.radiusMd,
    flexShrink: 0,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
  },
  value: {
    margin: 0,
    fontSize: tokens.text2xl,
    fontWeight: tokens.headingWeight,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.15,
    color: tokens.text,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: tokens.textXs,
  },
  deltaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  deltaLabel: {
    color: tokens.textMuted,
  },
});

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

function MiniSparkline({ data, tone }: { data: number[]; tone: KpiTone }) {
  const width = 76;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
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
    >
      <polyline
        fill="none"
        stroke={`var(--color-${tone})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
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
  deltaLabel = 'vs last period',
  icon,
  tone = 'primary',
  sparkline,
  onClick,
}: KpiCardProps) {
  const isPositive = typeof delta === 'number' && delta >= 0;
  const cardSx = stylex.props(styles.card, Boolean(onClick) && styles.interactive);

  return (
    <Card
      className={cardSx.className}
      style={cardSx.style}
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
    >
      <div {...stylex.props(styles.topRow)}>
        <p {...stylex.props(styles.label)}>{label}</p>
        <span
          aria-hidden="true"
          {...stylex.props(styles.iconBox)}
          style={{
            backgroundColor: `var(--color-${tone}-surface)`,
            color: `var(--color-${tone})`,
          }}
        >
          {icon}
        </span>
      </div>
      <div {...stylex.props(styles.valueRow)}>
        <p {...stylex.props(styles.value)}>{formatKpiValue(value, format, currency, locale)}</p>
        {sparkline && sparkline.length > 1 ? <MiniSparkline data={sparkline} tone={tone} /> : null}
      </div>
      {typeof delta === 'number' ? (
        <div {...stylex.props(styles.footer)}>
          <span
            {...stylex.props(styles.deltaBadge)}
            style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-error)' }}
          >
            {isPositive ? (
              <TrendingUp size={14} aria-hidden="true" />
            ) : (
              <TrendingDown size={14} aria-hidden="true" />
            )}
            {isPositive ? '+' : ''}
            {delta}%
          </span>
          <span {...stylex.props(styles.deltaLabel)}>{deltaLabel}</span>
        </div>
      ) : null}
    </Card>
  );
}
