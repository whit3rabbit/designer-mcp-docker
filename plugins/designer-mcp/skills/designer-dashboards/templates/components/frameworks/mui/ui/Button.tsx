import * as React from 'react';
import { Button as MuiButton, CircularProgress, type ButtonProps as MuiButtonProps } from '@mui/material';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size' | 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_MAP: Record<ButtonVariant, { muiVariant: MuiButtonProps['variant']; muiColor: MuiButtonProps['color'] }> = {
  primary: { muiVariant: 'contained', muiColor: 'primary' },
  secondary: { muiVariant: 'contained', muiColor: 'secondary' },
  outline: { muiVariant: 'outlined', muiColor: 'primary' },
  ghost: { muiVariant: 'text', muiColor: 'inherit' },
  danger: { muiVariant: 'contained', muiColor: 'error' },
};

const SIZE_MAP: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, startIcon, children, sx, ...rest },
  ref,
) {
  const { muiVariant, muiColor } = VARIANT_MAP[variant];

  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      color={muiColor}
      size={SIZE_MAP[size]}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" aria-hidden="true" />
        ) : (
          startIcon
        )
      }
      sx={[
        variant === 'outline' && {
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          '&:hover': {
            borderColor: 'var(--color-primary-border)',
            backgroundColor: 'var(--color-primary-surface)',
          },
        },
        variant === 'ghost' && {
          color: 'var(--color-text)',
          '&:hover': {
            backgroundColor: 'var(--color-surface-subtle)',
          },
        },
        sx,
      ]}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});
