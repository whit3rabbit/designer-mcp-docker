'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'solid' | 'tonal' | 'outline';
export type BadgeTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  dot?: boolean;
}

function getBadgeStyles(variant: BadgeVariant, tone: BadgeTone): React.CSSProperties {
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
    return {
      backgroundColor: 'var(--color-surface-subtle)',
      color: 'var(--color-text-muted)',
    };
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
  }
}

export function Badge({
  variant = 'tonal',
  tone = 'primary',
  size = 'md',
  dot = false,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      style={{
        ...getBadgeStyles(variant, tone),
        ...style,
      }}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        className,
      )}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{
            backgroundColor:
              variant === 'solid'
                ? 'var(--color-on-solid)'
                : tone === 'neutral'
                  ? 'var(--color-text-muted)'
                  : `var(--color-${tone})`,
          }}
        />
      )}
      {children}
    </span>
  );
}
