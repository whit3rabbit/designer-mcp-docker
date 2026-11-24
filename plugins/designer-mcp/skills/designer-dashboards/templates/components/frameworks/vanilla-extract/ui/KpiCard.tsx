import * as React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from './Badge';
import { kpiCardRecipe, kpiFooter, kpiHeader, kpiIconBox, kpiLabel, kpiValue } from './ui.css';

export type KpiTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export type KpiSparkline =
  | number[]
  | {
      type: 'line' | 'bar' | 'radial';
      data: number[];
    };

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
  variant?: 'default' | 'bordered' | 'horizontal';
  sparkline?: KpiSparkline;
  onClick?: () => void;
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% progress`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
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
        >
          {Math.round(pct)}%
        </text>
      </svg>
    );
  }

  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const width = 92;
  const height = 32;

  if (spec.type === 'bar') {
    const gap = 3;
    const barW = Math.max(4, (width - gap * (points.length - 1)) / points.length);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {points.map((pt, idx) => {
          const barH = Math.max(4, ((pt - min) / span) * (height - 4));
          return (
            <rect
              key={idx}
              x={idx * (barW + gap)}
              y={height - barH}
              width={barW}
              height={barH}
              rx={2}
              fill={idx === points.length - 1 ? `var(--color-${tone})` : `var(--color-${tone}-surface)`}
            />
          );
        })}
      </svg>
    );
  }

  const coords = points.map((pt, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - 4 - ((pt - min) / span) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`kpi-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`var(--color-${tone})`} stopOpacity="0.28" />
          <stop offset="100%" stopColor={`var(--color-${tone})`} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${coords.join(' ')} ${width},${height}`} fill={`url(#kpi-grad-${uid})`} />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={`var(--color-${tone})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  variant = 'default',
  sparkline,
  onClick,
}: KpiCardProps) {
  const formatted = formatKpiValue(value, format, currency, locale);
  const isPositive = delta !== undefined && delta >= 0;

  const content = (
    <>
      <div className={kpiHeader}>
        <span className={kpiLabel}>{label}</span>
        {icon && (
          <span
            className={kpiIconBox}
            style={{
              backgroundColor: `var(--color-${tone}-surface)`,
              color: `var(--color-${tone})`,
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      <div className={kpiValue}>{formatted}</div>
      {(delta !== undefined || sparkline) && (
        <div className={kpiFooter}>
          {delta !== undefined ? (
            <Badge tone={isPositive ? 'success' : 'error'} variant="tonal" size="sm">
              {isPositive ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
              <span>
                {isPositive ? '+' : ''}
                {delta}%{deltaLabel ? ` ${deltaLabel}` : ''}
              </span>
            </Badge>
          ) : (
            <span />
          )}
          {sparkline && <MiniSparkline sparkline={sparkline} tone={tone} />}
        </div>
      )}
    </>
  );

  const className = kpiCardRecipe({ variant, interactive: Boolean(onClick) });
  const borderStyle =
    variant === 'bordered' ? { borderColor: `var(--color-${tone}-border)` } : undefined;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={borderStyle}>
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={borderStyle}>
      {content}
    </div>
  );
}
