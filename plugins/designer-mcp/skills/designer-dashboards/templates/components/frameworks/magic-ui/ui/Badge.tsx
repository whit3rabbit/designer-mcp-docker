'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({
  tone = 'primary',
  variant = 'tonal',
  size = 'sm',
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const color = tone === 'neutral' ? 'var(--color-text)' : `var(--color-${tone})`;
  const surface = tone === 'neutral' ? 'var(--color-surface-subtle)' : `var(--color-${tone}-surface)`;
  const border = tone === 'neutral' ? 'var(--color-border)' : `var(--color-${tone}-border)`;

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: color, color: 'var(--color-on-solid)' }
      : variant === 'outline'
        ? { border: `1px solid ${border}`, color, backgroundColor: 'transparent' }
        : { backgroundColor: surface, color };

  return (
    <span
      style={{ borderRadius: 'var(--radius-full, 9999px)', ...variantStyle, ...style }}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold leading-tight',
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {variant === 'dot' && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: color }}
          className="size-1.5 shrink-0 rounded-full"
        />
      )}
      {children}
    </span>
  );
}
