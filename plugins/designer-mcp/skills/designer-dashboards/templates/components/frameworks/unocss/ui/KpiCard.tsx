import * as React from 'react';
import { clsx } from 'clsx';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge, type BadgeTone } from './Badge';
import { Card } from './Card';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  delta?: string;
  trend?: KpiTrend;
  subtitle?: string;
  icon?: React.ReactNode;
}

const TREND_TONE: Record<KpiTrend, BadgeTone> = {
  up: 'success',
  down: 'error',
  neutral: 'neutral',
};

export function KpiCard({
  title,
  value,
  delta,
  trend = 'neutral',
  subtitle,
  icon,
  className,
  ...rest
}: KpiCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className={clsx('p-5', className)} {...rest}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text-muted">{title}</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-text tabular-nums">
            {value}
          </p>
        </div>
        {icon ? (
          <div
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary"
          >
            {icon}
          </div>
        ) : null}
      </div>

      {delta || subtitle ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {delta ? (
            <Badge tone={TREND_TONE[trend]} variant="tonal">
              <TrendIcon className="size-3" aria-hidden="true" />
              <span>{delta}</span>
            </Badge>
          ) : null}
          {subtitle ? <span className="text-xs text-text-muted">{subtitle}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}
