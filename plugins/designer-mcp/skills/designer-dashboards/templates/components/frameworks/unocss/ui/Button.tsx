import * as React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-[38px] px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  xs: 'size-7 p-0',
  sm: 'size-8 p-0',
  md: 'size-[38px] p-0',
  lg: 'size-11 p-0',
  xl: 'size-12 p-0',
};

function getToneClasses(variant: ButtonVariant, tone: ButtonTone): string {
  if (tone === 'neutral') {
    switch (variant) {
      case 'solid':
        return 'bg-text text-surface hover:opacity-90';
      case 'outline':
        return 'border border-border bg-surface text-text hover:bg-surface-subtle';
      case 'tonal':
        return 'bg-surface-subtle text-text hover:bg-border';
      case 'ghost':
        return 'bg-transparent text-text hover:bg-surface-subtle';
      case 'link':
        return 'bg-transparent text-text underline-offset-4 hover:underline';
    }
  }

  if (tone === 'secondary') {
    switch (variant) {
      case 'solid':
        return 'bg-surface-elevated text-text border border-border hover:bg-surface-subtle';
      case 'outline':
        return 'border border-border bg-transparent text-text hover:bg-surface-subtle';
      case 'tonal':
        return 'bg-surface-subtle text-text hover:bg-border';
      case 'ghost':
        return 'bg-transparent text-text-muted hover:bg-surface-subtle hover:text-text';
      case 'link':
        return 'bg-transparent text-text-muted underline-offset-4 hover:underline hover:text-text';
    }
  }

  const toneMap: Record<'primary' | 'success' | 'info' | 'warning' | 'error', Record<ButtonVariant, string>> = {
    primary: {
      solid: 'bg-primary text-on-solid hover:bg-primary-hover',
      outline: 'border border-primary-border bg-transparent text-primary hover:bg-primary-surface',
      tonal: 'bg-primary-surface text-primary hover:opacity-90',
      ghost: 'bg-transparent text-primary hover:bg-primary-surface',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline',
    },
    success: {
      solid: 'bg-success text-on-solid hover:bg-success-hover',
      outline: 'border border-success-border bg-transparent text-success hover:bg-success-surface',
      tonal: 'bg-success-surface text-success hover:opacity-90',
      ghost: 'bg-transparent text-success hover:bg-success-surface',
      link: 'bg-transparent text-success underline-offset-4 hover:underline',
    },
    info: {
      solid: 'bg-info text-on-solid hover:bg-info-hover',
      outline: 'border border-info-border bg-transparent text-info hover:bg-info-surface',
      tonal: 'bg-info-surface text-info hover:opacity-90',
      ghost: 'bg-transparent text-info hover:bg-info-surface',
      link: 'bg-transparent text-info underline-offset-4 hover:underline',
    },
    warning: {
      solid: 'bg-warning text-on-solid hover:bg-warning-hover',
      outline: 'border border-warning-border bg-transparent text-warning hover:bg-warning-surface',
      tonal: 'bg-warning-surface text-warning hover:opacity-90',
      ghost: 'bg-transparent text-warning hover:bg-warning-surface',
      link: 'bg-transparent text-warning underline-offset-4 hover:underline',
    },
    error: {
      solid: 'bg-error text-on-solid hover:bg-error-hover',
      outline: 'border border-error-border bg-transparent text-error hover:bg-error-surface',
      tonal: 'bg-error-surface text-error hover:opacity-90',
      ghost: 'bg-transparent text-error hover:bg-error-surface',
      link: 'bg-transparent text-error underline-offset-4 hover:underline',
    },
  };

  return toneMap[tone][variant];
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
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'rd-btn-base rounded-md',
        iconOnly ? ICON_ONLY_SIZES[size] : SIZE_CLASSES[size],
        getToneClasses(variant, tone),
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
