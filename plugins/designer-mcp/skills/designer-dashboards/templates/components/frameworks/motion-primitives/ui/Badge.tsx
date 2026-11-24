'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

function getBadgeStyle(tone: BadgeTone, variant: BadgeVariant): React.CSSProperties {
  if (tone === 'neutral') {
    if (variant === 'solid') {
      return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
    }
    if (variant === 'outline') {
      return {
        border: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
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
  variant = 'tonal',
  size = 'md',
  dot = false,
  pulse = false,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const prefersReduced = useReducedMotion();

  return (
    <span
      style={{
        borderRadius: 'var(--radius-full, 9999px)',
        ...getBadgeStyle(tone, variant),
        ...style,
      }}
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        className,
      )}
      {...rest}
    >
      {dot && (
        <span className="relative flex size-1.5" aria-hidden="true">
          {pulse && !prefersReduced && (
            <motion.span
              animate={{ scale: [1, 1.9, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-current"
            />
          )}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
