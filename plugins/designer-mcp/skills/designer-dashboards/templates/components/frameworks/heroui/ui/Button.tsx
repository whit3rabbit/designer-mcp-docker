'use client';

import * as React from 'react';
import { Button as HeroButton, type ButtonProps as HeroButtonProps } from '@heroui/react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'danger';
export type ButtonTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HeroButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  xs: 'size-7 p-0',
  sm: 'size-8 p-0',
  md: 'size-9 p-0',
  lg: 'size-11 p-0',
};

function getButtonStyles(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
  if (variant === 'danger') {
    return {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-on-solid)',
    };
  }
  if (tone === 'neutral') {
    if (variant === 'solid') {
      return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
    }
    if (variant === 'outline') {
      return {
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      };
    }
    if (variant === 'tonal') {
      return { backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text)' };
    }
    return { backgroundColor: 'transparent', color: 'var(--color-text)' };
  }

  const base = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  switch (variant) {
    case 'solid':
      return { backgroundColor: base, color: 'var(--color-on-solid)' };
    case 'outline':
      return { border: `1px solid ${border}`, backgroundColor: 'transparent', color: base };
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
    isDisabled,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const heroVariant =
    variant === 'solid'
      ? 'primary'
      : variant === 'outline'
        ? 'secondary'
        : variant === 'danger'
          ? 'danger'
          : 'tertiary';

  return (
    <HeroButton
      ref={ref}
      variant={heroVariant}
      isDisabled={isDisabled || loading}
      isPending={loading}
      style={{ ...getButtonStyles(variant, tone), ...style }}
      className={clsx(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-opacity',
        'hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        iconOnly ? ICON_ONLY_SIZES[size] : SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" /> : null}
      {children}
    </HeroButton>
  );
});
