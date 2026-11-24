'use client';

import * as React from 'react';
import { Chip, type ChipProps } from '@heroui/react';
import { clsx } from 'clsx';

export type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends Omit<ChipProps, 'color' | 'variant' | 'size'> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[11px]',
  md: 'h-6 px-2.5 text-xs',
  lg: 'h-7 px-3 text-xs',
};

function getBadgeStyle(tone: BadgeTone, variant: BadgeVariant): React.CSSProperties {
  if (tone === 'neutral') {
    if (variant === 'solid') {
      return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
    }
    if (variant === 'outline') {
      return {
        border: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-muted)',
      };
    }
    return { backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text-muted)' };
  }

  const base = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  if (variant === 'solid') {
    return { backgroundColor: base, color: 'var(--color-on-solid)' };
  }
  if (variant === 'outline') {
    return { border: `1px solid ${border}`, backgroundColor: 'transparent', color: base };
  }
  return { backgroundColor: surface, color: base };
}

export function Badge({
  tone = 'primary',
  variant = 'soft',
  size = 'md',
  dot = false,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const dotColor = tone === 'neutral' ? 'var(--color-text-muted)' : `var(--color-${tone})`;

  return (
    <Chip
      variant={variant === 'solid' ? 'primary' : 'soft'}
      style={{ ...getBadgeStyle(tone, variant), ...style }}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full shrink-0"
          style={{ backgroundColor: variant === 'solid' ? 'var(--color-on-solid)' : dotColor }}
        />
      ) : null}
      {children}
    </Chip>
  );
}
