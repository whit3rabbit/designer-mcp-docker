'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { SPRING_SNAPPY, useMotionPreferences } from '../theme/motionConfig';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
  > {
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

function getToneStyles(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
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
  const { prefersReducedMotion } = useMotionPreferences();
  const isDisabled = Boolean(disabled || loading);

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={prefersReducedMotion || isDisabled ? undefined : { scale: 0.97 }}
      whileHover={prefersReducedMotion || isDisabled ? undefined : { y: -1 }}
      transition={SPRING_SNAPPY}
      style={{
        borderRadius: 'var(--radius-md)',
        ...getToneStyles(variant, tone),
        ...style,
      }}
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center font-medium select-none transition-opacity',
        'hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'link' && 'underline-offset-4 hover:underline',
        iconOnly ? ICON_ONLY_SIZES[size] : SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </motion.button>
  );
});
