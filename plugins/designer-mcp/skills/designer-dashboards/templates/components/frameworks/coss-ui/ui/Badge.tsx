import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../theme/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium leading-tight whitespace-nowrap border',
  {
    variants: {
      tone: {
        neutral:
          'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)]',
        primary:
          'bg-[var(--color-primary-surface)] text-[var(--color-primary)] border-[var(--color-primary-border)]',
        success:
          'bg-[var(--color-success)]/12 text-[var(--color-success)] border-[var(--color-success)]/30',
        warning:
          'bg-[var(--color-warning)]/12 text-[var(--color-warning)] border-[var(--color-warning)]/30',
        error:
          'bg-[var(--color-error)]/12 text-[var(--color-error)] border-[var(--color-error)]/30',
        info: 'bg-[var(--color-info)]/12 text-[var(--color-info)] border-[var(--color-info)]/30',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
