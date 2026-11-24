'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type DaisyButtonVariant = 'solid' | 'outline' | 'soft' | 'ghost' | 'link';
export type DaisyButtonTone =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type DaisyButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DaisyButtonVariant;
  tone?: DaisyButtonTone;
  size?: DaisyButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const TONE_CLASS: Record<DaisyButtonTone, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  neutral: 'btn-neutral',
  info: 'btn-info',
  success: 'btn-success',
  warning: 'btn-warning',
  error: 'btn-error',
};

const VARIANT_CLASS: Record<DaisyButtonVariant, string> = {
  solid: '',
  outline: 'btn-outline',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  link: 'btn-link',
};

const SIZE_CLASS: Record<DaisyButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      tone = 'primary',
      size = 'md',
      iconOnly = false,
      fullWidth = false,
      loading = false,
      disabled,
      type = 'button',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={clsx(
          'btn',
          TONE_CLASS[tone],
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          iconOnly && 'btn-square',
          fullWidth && 'btn-block',
          className,
        )}
        {...rest}
      >
        {loading && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
