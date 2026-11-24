import * as React from 'react';
import {
  ActionIcon,
  Button as MantineButton,
  type ActionIconProps,
  type ButtonProps as MantineButtonProps,
} from '@mantine/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps
  extends Omit<MantineButtonProps, 'variant' | 'color'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'style'> {
  variant?: ButtonVariant;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { mantineVariant: MantineButtonProps['variant']; style: React.CSSProperties }
> = {
  primary: {
    mantineVariant: 'filled',
    style: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-solid)',
    },
  },
  secondary: {
    mantineVariant: 'light',
    style: {
      backgroundColor: 'var(--color-primary-surface)',
      color: 'var(--color-primary)',
      borderColor: 'var(--color-primary-border)',
    },
  },
  outline: {
    mantineVariant: 'default',
    style: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text)',
      borderColor: 'var(--color-border)',
    },
  },
  ghost: {
    mantineVariant: 'subtle',
    style: {
      color: 'var(--color-text)',
    },
  },
  danger: {
    mantineVariant: 'filled',
    style: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-solid)',
    },
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', style, ...props }, ref) => {
    const mapped = VARIANT_STYLES[variant];
    return (
      <MantineButton
        ref={ref}
        variant={mapped.mantineVariant}
        radius="md"
        style={{ ...mapped.style, ...style }}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export interface IconButtonProps
  extends Omit<ActionIconProps, 'variant' | 'color'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'style'> {
  variant?: ButtonVariant;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'outline', style, ...props }, ref) => {
    const mapped = VARIANT_STYLES[variant];
    return (
      <ActionIcon
        ref={ref}
        variant={mapped.mantineVariant}
        radius="md"
        style={{ ...mapped.style, ...style }}
        {...props}
      />
    );
  },
);
IconButton.displayName = 'IconButton';
