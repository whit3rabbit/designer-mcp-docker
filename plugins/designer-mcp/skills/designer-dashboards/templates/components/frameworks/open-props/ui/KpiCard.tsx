import * as React from 'react';
import { Card, CardContent } from './Card';
import { Badge, type BadgeTone } from './Badge';

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: BadgeTone;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = 'primary',
  subtitle,
  icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={className}>
      <CardContent style={{ paddingTop: 'var(--op-space-lg)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--op-space-xs)',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-muted)',
            }}
          >
            {label}
          </span>
          {icon && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--op-radius-sm)',
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary)',
              }}
            >
              {icon}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 'var(--op-space-sm)',
            marginTop: 'var(--op-space-xs)',
          }}
        >
          <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {value}
          </span>
          {delta && (
            <Badge tone={deltaTone} variant="tonal" size="sm">
              {delta}
            </Badge>
          )}
        </div>

        {subtitle && (
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
