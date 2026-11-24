import * as React from 'react';
import { clsx } from 'clsx';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  dot?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, Record<BadgeVariant, string>> = {
  primary: {
    solid: 'bg-primary text-on-solid border-transparent',
    tonal: 'bg-primary-surface text-primary border-primary-border',
    outline: 'bg-transparent text-primary border-primary-border',
  },
  success: {
    solid: 'bg-success text-on-solid border-transparent',
    tonal: 'bg-success-surface text-success border-success-border',
    outline: 'bg-transparent text-success border-success-border',
  },
  warning: {
    solid: 'bg-warning text-on-solid border-transparent',
    tonal: 'bg-warning-surface text-warning border-warning-border',
    outline: 'bg-transparent text-warning border-warning-border',
  },
  error: {
    solid: 'bg-error text-on-solid border-transparent',
    tonal: 'bg-error-surface text-error border-error-border',
    outline: 'bg-transparent text-error border-error-border',
  },
  info: {
    solid: 'bg-info text-on-solid border-transparent',
    tonal: 'bg-info-surface text-info border-info-border',
    outline: 'bg-transparent text-info border-info-border',
  },
  neutral: {
    solid: 'bg-text text-surface border-transparent',
    tonal: 'bg-surface-subtle text-text border-border',
    outline: 'bg-transparent text-text-muted border-border',
  },
};

export function Badge({
  tone = 'neutral',
  variant = 'tonal',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-tight',
        TONE_CLASSES[tone][variant],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
