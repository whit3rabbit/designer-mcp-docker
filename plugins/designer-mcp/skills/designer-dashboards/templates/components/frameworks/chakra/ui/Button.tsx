import * as React from 'react';
import {
  Button as ChakraButton,
  IconButton as ChakraIconButton,
  Spinner,
  type ButtonProps as ChakraButtonProps,
} from '@chakra-ui/react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, Partial<ChakraButtonProps>> = {
  primary: {
    bg: 'var(--color-primary)',
    color: 'var(--color-on-solid)',
    borderWidth: '1px',
    borderColor: 'var(--color-primary)',
    _hover: { bg: 'var(--color-primary-hover)', borderColor: 'var(--color-primary-hover)' },
  },
  secondary: {
    bg: 'var(--color-primary-surface)',
    color: 'var(--color-primary)',
    borderWidth: '1px',
    borderColor: 'var(--color-primary-border)',
    _hover: { bg: 'var(--color-surface-subtle)' },
  },
  outline: {
    bg: 'transparent',
    color: 'var(--color-text)',
    borderWidth: '1px',
    borderColor: 'var(--color-border)',
    _hover: { bg: 'var(--color-surface-subtle)' },
  },
  ghost: {
    bg: 'transparent',
    color: 'var(--color-text)',
    borderWidth: '1px',
    borderColor: 'transparent',
    _hover: { bg: 'var(--color-surface-subtle)' },
  },
  danger: {
    bg: 'var(--color-error)',
    color: 'var(--color-on-solid)',
    borderWidth: '1px',
    borderColor: 'var(--color-error)',
    _hover: { opacity: 0.9 },
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    ...rest
  },
  ref,
) {
  return (
    <ChakraButton
      ref={ref}
      size={size}
      disabled={disabled || loading}
      borderRadius="var(--radius-md)"
      fontWeight="medium"
      transition="all 150ms ease"
      _focusVisible={{
        outline: '2px solid var(--color-primary)',
        outlineOffset: '2px',
      }}
      {...variantStyles[variant]}
      {...rest}
    >
      {loading && <Spinner size="xs" me={2} aria-hidden="true" />}
      {!loading && leftIcon ? <span style={{ display: 'inline-flex', marginInlineEnd: '0.5rem' }}>{leftIcon}</span> : null}
      {children}
      {!loading && rightIcon ? <span style={{ display: 'inline-flex', marginInlineStart: '0.5rem' }}>{rightIcon}</span> : null}
    </ChakraButton>
  );
});

export interface IconButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size' | 'aria-label'> {
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 'md', icon, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <ChakraIconButton
      ref={ref}
      aria-label={ariaLabel}
      size={size}
      borderRadius="var(--radius-md)"
      _focusVisible={{
        outline: '2px solid var(--color-primary)',
        outlineOffset: '2px',
      }}
      {...variantStyles[variant]}
      {...rest}
    >
      {icon}
    </ChakraIconButton>
  );
});
