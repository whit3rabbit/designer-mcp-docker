'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

export interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  delta,
  trend = 'neutral',
  subtitle,
  icon,
  className,
}: KpiCardProps) {
  const badgeTone =
    trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';

  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={twMerge(clsx('transition-shadow hover:shadow-sm', className))}>
      <CardContent className="p-5 text-start">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {title}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {value}
            </p>
          </div>
          {icon ? (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary-border)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]"
              aria-hidden="true"
            >
              {icon}
            </div>
          ) : null}
        </div>
        {(delta || subtitle) ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {delta ? (
              <Badge tone={badgeTone}>
                <TrendIcon className="size-3.5" aria-hidden="true" />
                <span>{delta}</span>
              </Badge>
            ) : null}
            {subtitle ? (
              <span className="text-xs text-[var(--color-text-muted)]">{subtitle}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
