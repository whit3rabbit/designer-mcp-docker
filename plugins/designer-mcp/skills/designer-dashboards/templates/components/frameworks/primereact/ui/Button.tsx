import * as React from 'react';
import { Button as PrimeButton, type ButtonProps as PrimeButtonProps } from 'primereact/button';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PrimeButtonProps, 'severity' | 'outlined' | 'text' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Required for icon-only buttons to satisfy WCAG 2.1 AA. */
  'aria-label'?: string;
}

const VARIANT_MAP: Record<
  ButtonVariant,
  { severity?: PrimeButtonProps['severity']; outlined?: boolean; text?: boolean; style?: React.CSSProperties }
> = {
  primary: {
    style: {
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-primary)',
      color: 'var(--color-on-solid)',
    },
  },
  secondary: {
    severity: 'secondary',
    style: {
      backgroundColor: 'var(--color-surface-subtle)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text)',
    },
  },
  outline: {
    outlined: true,
    style: {
      backgroundColor: 'transparent',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text)',
    },
  },
  ghost: {
    text: true,
    style: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: 'var(--color-text)',
    },
  },
  danger: {
    severity: 'danger',
    style: {
      backgroundColor: 'var(--color-error)',
      borderColor: 'var(--color-error)',
      color: 'var(--color-on-solid)',
    },
  },
  success: {
    severity: 'success',
    style: {
      backgroundColor: 'var(--color-success)',
      borderColor: 'var(--color-success)',
      color: 'var(--color-on-solid)',
    },
  },
};

const SIZE_PADDING: Record<ButtonSize, string> = {
  sm: '0.375rem 0.75rem',
  md: '0.5rem 1rem',
  lg: '0.6875rem 1.25rem',
};

export const Button = React.forwardRef<PrimeButton, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', style, children, label, ...rest },
  ref,
) {
  const mapped = VARIANT_MAP[variant];
  return (
    <PrimeButton
      ref={ref}
      severity={mapped.severity}
      outlined={mapped.outlined}
      text={mapped.text}
      size={size === 'md' ? undefined : size === 'sm' ? 'small' : 'large'}
      label={label}
      style={{
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        padding: SIZE_PADDING[size],
        ...mapped.style,
        ...style,
      }}
      {...rest}
    >
      {children}
    </PrimeButton>
  );
});
