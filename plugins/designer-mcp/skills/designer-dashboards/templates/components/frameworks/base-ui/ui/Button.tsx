'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'neutral' | 'success' | 'info' | 'warning' | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function getVariantClass(variant: ButtonVariant, tone: ButtonTone): string {
  if (variant === 'solid') return `bui-btn--solid-${tone}`;
  if (variant === 'outline') return tone === 'primary' ? 'bui-btn--outline-primary' : 'bui-btn--outline';
  if (variant === 'tonal') return 'bui-btn--tonal-primary';
  if (variant === 'link') return 'bui-btn--link';
  return 'bui-btn--ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    tone = 'primary',
    size = 'md',
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      data-disabled={isDisabled ? '' : undefined}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      className={clsx(
        'bui-btn',
        iconOnly ? `bui-btn--icon-${size}` : `bui-btn--${size}`,
        getVariantClass(variant, tone),
        fullWidth && 'bui-btn--full',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="bui-spinner" aria-hidden="true" /> : leftIcon}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {!iconOnly && !loading && rightIcon}
    </button>
  );
});
