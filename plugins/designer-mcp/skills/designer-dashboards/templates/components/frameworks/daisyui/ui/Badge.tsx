'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type DaisyBadgeTone =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type DaisyBadgeVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type DaisyBadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: DaisyBadgeTone;
  variant?: DaisyBadgeVariant;
  size?: DaisyBadgeSize;
}

const TONE_CLASS: Record<DaisyBadgeTone, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

const VARIANT_CLASS: Record<DaisyBadgeVariant, string> = {
  solid: '',
  soft: 'badge-soft',
  outline: 'badge-outline',
  ghost: 'badge-ghost',
};

const SIZE_CLASS: Record<DaisyBadgeSize, string> = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
  xl: 'badge-xl',
};

export function Badge({
  tone = 'primary',
  variant = 'soft',
  size = 'md',
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'badge font-medium',
        TONE_CLASS[tone],
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
