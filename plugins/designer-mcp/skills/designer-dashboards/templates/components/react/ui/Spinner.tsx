'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  xs: 'size-3.5 border-2',
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
};

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      className={clsx('inline-block animate-spin rounded-full', SIZE_MAP[size], className)}
    />
  );
}
