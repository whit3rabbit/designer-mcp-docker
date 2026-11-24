import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn, DENSITY_PADDING, type Density } from '../theme/cn';
import { Card } from './Card';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: KpiTrend;
  subtitle?: string;
  icon?: React.ReactNode;
  density?: Density;
  className?: string;
}

const TREND_STYLES: Record<KpiTrend, { className: string; Icon: React.ElementType }> = {
  up: {
    className: 'text-[var(--color-success)] bg-[var(--color-success)]/12',
    Icon: ArrowUpRight,
  },
  down: {
    className: 'text-[var(--color-error)] bg-[var(--color-error)]/12',
    Icon: ArrowDownRight,
  },
  neutral: {
    className: 'text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)]',
    Icon: Minus,
  },
};

export function KpiCard({
  label,
  value,
  delta,
  trend = 'neutral',
  subtitle,
  icon,
  density = 'comfortable',
  className,
}: KpiCardProps) {
  const { className: trendClass, Icon: TrendIcon } = TREND_STYLES[trend];

  return (
    <Card className={cn(DENSITY_PADDING[density], 'flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] truncate">
          {label}
        </span>
        {icon && (
          <span
            className="flex size-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] shrink-0"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-text)]">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
              trendClass,
            )}
          >
            <TrendIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[var(--color-text-muted)] truncate">{subtitle}</p>
      )}
    </Card>
  );
}
