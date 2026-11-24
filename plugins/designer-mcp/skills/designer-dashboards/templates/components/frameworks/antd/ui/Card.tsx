'use client';

import * as React from 'react';
import { Card as AntCard, type CardProps as AntCardProps } from 'antd';

export type CardVariant = 'elevated' | 'bordered' | 'subtle' | 'interactive';

export interface CardProps extends Omit<AntCardProps, 'variant'> {
  variant?: CardVariant;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
}

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  elevated: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.06))',
  },
  bordered: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'none',
  },
  subtle: {
    backgroundColor: 'var(--color-surface-subtle)',
    borderColor: 'var(--color-border)',
    boxShadow: 'none',
  },
  interactive: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  },
};

export function Card({
  variant = 'bordered',
  title,
  subtitle,
  headerExtra,
  extra,
  style,
  children,
  ...rest
}: CardProps) {
  const renderedTitle =
    title || subtitle ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title && (
          <span style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 15 }}>
            {title}
          </span>
        )}
        {subtitle && (
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 12 }}>
            {subtitle}
          </span>
        )}
      </div>
    ) : undefined;

  return (
    <AntCard
      title={renderedTitle}
      extra={headerExtra ?? extra}
      hoverable={variant === 'interactive'}
      style={{
        borderRadius: 'var(--radius-md)',
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </AntCard>
  );
}
