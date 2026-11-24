import * as React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  hint?: string;
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, delta, trend = 'neutral', hint, icon }: KpiCardProps) {
  const tone = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';

  return (
    <Card>
      <div className="rd-ark-kpi">
        <div className="rd-ark-kpi__top">
          <span className="rd-ark-kpi__label">{label}</span>
          {icon ? <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex' }}>{icon}</span> : null}
        </div>
        <div className="rd-ark-kpi__value">{value}</div>
        {(delta || hint) ? (
          <div className="rd-ark-kpi__meta">
            {delta ? (
              <Badge tone={tone}>
                {trend === 'up' ? <TrendingUp size={12} aria-hidden /> : null}
                {trend === 'down' ? <TrendingDown size={12} aria-hidden /> : null}
                {delta}
              </Badge>
            ) : null}
            {hint ? <span>{hint}</span> : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
