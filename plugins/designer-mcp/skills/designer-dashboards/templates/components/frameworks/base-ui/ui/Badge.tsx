'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type BadgeVariant = 'tonal' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export function Badge({
  tone = 'neutral',
  variant = 'tonal',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantClass = variant === 'outline' ? 'bui-badge--outline' : `bui-badge--${variant}-${tone}`;

  return (
    <span className={clsx('bui-badge', `bui-badge--${size}`, variantClass, className)} {...props}>
      {dot && <span className="bui-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
