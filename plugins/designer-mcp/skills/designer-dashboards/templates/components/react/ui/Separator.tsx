'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function Separator({
  orientation = 'horizontal',
  label,
  className,
  style,
  ...rest
}: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        style={{ backgroundColor: 'var(--color-border)', ...style }}
        className={clsx('inline-block h-full min-h-4 w-px shrink-0', className)}
        {...rest}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={clsx('flex items-center gap-3', className)}
        {...rest}
      >
        <span style={{ backgroundColor: 'var(--color-border)' }} className="h-px flex-1" />
        <span
          style={{ color: 'var(--color-text-muted)' }}
          className="text-[11px] font-medium uppercase tracking-wider"
        >
          {label}
        </span>
        <span style={{ backgroundColor: 'var(--color-border)' }} className="h-px flex-1" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      style={{ backgroundColor: 'var(--color-border)', ...style }}
      className={clsx('h-px w-full shrink-0', className)}
      {...rest}
    />
  );
}
