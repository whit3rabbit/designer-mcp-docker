'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link' | 'shimmer';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
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
  xs: 'h-7 px-2.5 text-xs gap-1',
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

function getToneStyles(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
  if (tone === 'neutral') {
    if (variant === 'solid' || variant === 'shimmer') {
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
    case 'shimmer':
      return {
        backgroundColor: base,
        color: 'var(--color-on-solid)',
      };
    case 'outline':
      return { border: `1px solid ${border}`, backgroundColor: 'transparent', color: base };
    case 'tonal':
      return { backgroundColor: surface, color: base };
    case 'ghost':
    case 'link':
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
    className,
    style,
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
      style={{
        borderRadius: 'var(--radius-md)',
        ...getToneStyles(variant, tone),
        ...style,
      }}
      className={cn(
        'relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden font-medium transition-all duration-150',
        'active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        'disabled:pointer-events-none disabled:opacity-55',
        (variant === 'solid' || variant === 'shimmer') &&
          tone !== 'neutral' &&
          'hover:brightness-95 active:brightness-90',
        variant === 'link' && 'px-1 underline-offset-4 hover:underline',
        fullWidth && 'w-full',
        iconOnly ? ICON_ONLY_SIZES[size] : SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {variant === 'shimmer' && !disabled && !loading && (
        <span
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(90deg, transparent, color-mix(in oklch, var(--color-on-solid) 24%, transparent), transparent)',
          }}
          className="animate-magic-shimmer pointer-events-none absolute inset-0"
        />
      )}
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-inherit">{children}</span>
    </button>
  );
});
