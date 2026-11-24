'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge, type BadgeTone } from './Badge';

export type KpiTrend = 'up' | 'down' | 'flat';

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  trend?: KpiTrend;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const TREND_TONE: Record<KpiTrend, BadgeTone> = {
  up: 'success',
  down: 'error',
  flat: 'neutral',
};

export function KpiCard({
  label,
  value,
  delta,
  trend = 'flat',
  subtitle,
  icon,
  className,
}: KpiCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={className}>
      <CardContent>
        <div className="bui-kpi__top">
          <span className="bui-kpi__label">{label}</span>
          {icon && (
            <span className="bui-kpi__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
        <div className="bui-kpi__value">{value}</div>
        {(delta || subtitle) && (
          <div className="bui-kpi__meta">
            {delta && (
              <Badge tone={TREND_TONE[trend]} size="sm">
                <TrendIcon size={12} aria-hidden="true" />
                {delta}
              </Badge>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
