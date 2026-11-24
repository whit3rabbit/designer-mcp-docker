import * as React from 'react';
import { Chip, type ChipProps } from '@mui/material';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends Omit<ChipProps, 'color'> {
  tone?: BadgeTone;
}

const TONE_STYLES: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  neutral: {
    bg: 'var(--color-surface-subtle)',
    fg: 'var(--color-text)',
    border: 'var(--color-border)',
  },
  primary: {
    bg: 'var(--color-primary-surface)',
    fg: 'var(--color-primary)',
    border: 'var(--color-primary-border)',
  },
  success: {
    bg: 'color-mix(in oklch, var(--color-success) 14%, transparent)',
    fg: 'var(--color-success)',
    border: 'color-mix(in oklch, var(--color-success) 32%, transparent)',
  },
  warning: {
    bg: 'color-mix(in oklch, var(--color-warning) 16%, transparent)',
    fg: 'var(--color-warning)',
    border: 'color-mix(in oklch, var(--color-warning) 35%, transparent)',
  },
  error: {
    bg: 'color-mix(in oklch, var(--color-error) 14%, transparent)',
    fg: 'var(--color-error)',
    border: 'color-mix(in oklch, var(--color-error) 32%, transparent)',
  },
  info: {
    bg: 'color-mix(in oklch, var(--color-info) 14%, transparent)',
    fg: 'var(--color-info)',
    border: 'color-mix(in oklch, var(--color-info) 32%, transparent)',
  },
};

export function Badge({ tone = 'neutral', size = 'small', sx, ...rest }: BadgeProps) {
  const palette = TONE_STYLES[tone];

  return (
    <Chip
      size={size}
      sx={[
        {
          bgcolor: palette.bg,
          color: palette.fg,
          border: `1px solid ${palette.border}`,
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          '& .MuiChip-icon': { color: 'inherit' },
        },
        sx,
      ]}
      {...rest}
    />
  );
}
