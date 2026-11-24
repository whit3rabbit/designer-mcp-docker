'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-tight whitespace-nowrap',
  {
    variants: {
      tone: {
        primary:
          'border-[var(--color-primary-border)] bg-[var(--color-primary-surface)] text-[var(--color-primary)]',
        success:
          'border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success)]',
        warning:
          'border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-warning)]',
        error:
          'border-[var(--color-error-border)] bg-[var(--color-error-surface)] text-[var(--color-error)]',
        info:
          'border-[var(--color-info-border)] bg-[var(--color-info-surface)] text-[var(--color-info)]',
        neutral:
          'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={twMerge(clsx(badgeVariants({ tone }), className))} {...props} />;
}

export { badgeVariants };
