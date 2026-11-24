import * as React from 'react';
import { Card as PrimeCard, type CardProps as PrimeCardProps } from 'primereact/card';

export interface CardProps extends Omit<PrimeCardProps, 'title' | 'subTitle'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  elevated?: boolean;
  children?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  actions,
  elevated = false,
  footer,
  style,
  children,
  ...rest
}: CardProps) {
  const headerNode =
    title || subtitle || actions ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '1rem 1.25rem 0',
        }}
      >
        <div style={{ minWidth: 0 }}>
          {title ? (
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                lineHeight: 1.35,
              }}
            >
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.2rem',
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {actions ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{actions}</div> : null}
      </div>
    ) : undefined;

  return (
    <PrimeCard
      header={headerNode}
      footer={footer}
      style={{
        backgroundColor: elevated ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </PrimeCard>
  );
}
