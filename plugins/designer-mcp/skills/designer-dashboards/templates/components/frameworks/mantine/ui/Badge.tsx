import * as React from 'react';
import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps } from '@mantine/core';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends Omit<MantineBadgeProps, 'color'> {
  tone?: BadgeTone;
}

const TONE_STYLES: Record<BadgeTone, React.CSSProperties> = {
  neutral: {
    backgroundColor: 'var(--color-surface-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-surface)',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary-border)',
  },
  success: {
    backgroundColor: 'color-mix(in oklab, var(--color-success) 14%, transparent)',
    color: 'var(--color-success)',
    border: '1px solid color-mix(in oklab, var(--color-success) 32%, transparent)',
  },
  warning: {
    backgroundColor: 'color-mix(in oklab, var(--color-warning) 16%, transparent)',
    color: 'var(--color-warning)',
    border: '1px solid color-mix(in oklab, var(--color-warning) 35%, transparent)',
  },
  error: {
    backgroundColor: 'color-mix(in oklab, var(--color-error) 14%, transparent)',
    color: 'var(--color-error)',
    border: '1px solid color-mix(in oklab, var(--color-error) 32%, transparent)',
  },
  info: {
    backgroundColor: 'color-mix(in oklab, var(--color-info) 14%, transparent)',
    color: 'var(--color-info)',
    border: '1px solid color-mix(in oklab, var(--color-info) 32%, transparent)',
  },
};

export function Badge({ tone = 'neutral', style, variant = 'light', ...props }: BadgeProps) {
  return (
    <MantineBadge
      variant={variant}
      radius="sm"
      style={{ ...TONE_STYLES[tone], ...style }}
      {...props}
    />
  );
}
