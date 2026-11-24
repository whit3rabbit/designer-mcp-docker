'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { useMotionPreferences } from '../theme/motionConfig';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
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
        color: 'var(--color-text-muted)',
        backgroundColor: 'transparent',
      };
    }
    return { backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text)' };
  }

  const base = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  switch (variant) {
    case 'solid':
      return { backgroundColor: base, color: 'var(--color-on-solid)' };
    case 'outline':
      return { border: `1px solid ${border}`, color: base, backgroundColor: 'transparent' };
    case 'tonal':
      return { backgroundColor: surface, color: base };
  }
}

export function Badge({
  tone = 'primary',
  variant = 'tonal',
  dot = false,
  pulse = false,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const { prefersReducedMotion } = useMotionPreferences();
  const dotColor =
    variant === 'solid'
      ? 'var(--color-on-solid)'
      : tone === 'neutral'
        ? 'var(--color-text-muted)'
        : `var(--color-${tone})`;

  return (
    <span
      style={{
        borderRadius: '9999px',
        ...getBadgeStyle(tone, variant),
        ...style,
      }}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium leading-5',
        className,
      )}
      {...rest}
    >
      {dot && (
        <span className="relative flex size-1.5" aria-hidden="true">
          {pulse && !prefersReducedMotion && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span
            className="relative inline-flex size-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </span>
      )}
      {children}
    </span>
  );
}
