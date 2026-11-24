import * as React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost';
export type ButtonTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function getToneStyle(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
  if (tone === 'neutral') {
    switch (variant) {
      case 'solid':
        return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
      case 'outline':
        return {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        };
      case 'tonal':
        return { backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text)' };
      case 'ghost':
        return { backgroundColor: 'transparent', color: 'var(--color-text)' };
    }
  }

  const base = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  switch (variant) {
    case 'solid':
      return { backgroundColor: base, color: 'var(--color-on-solid)' };
    case 'outline':
      return { backgroundColor: 'transparent', color: base, borderColor: border };
    case 'tonal':
      return { backgroundColor: surface, color: base };
    case 'ghost':
      return { backgroundColor: 'transparent', color: base };
  }
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
    startIcon,
    endIcon,
    className,
    style,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const classes = [
    'op-btn',
    `op-btn--${size}`,
    iconOnly ? 'op-btn--icon' : '',
    fullWidth ? 'op-btn--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      style={{ ...getToneStyle(variant, tone), ...style }}
      {...rest}
    >
      {loading ? <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  );
});
