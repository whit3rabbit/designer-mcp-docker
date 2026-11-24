'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-[var(--radius-md)] border p-4 text-sm text-start',
  {
    variants: {
      tone: {
        info: 'border-[var(--color-info-border)] bg-[var(--color-info-surface)] text-[var(--color-text)]',
        success:
          'border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-text)]',
        warning:
          'border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-text)]',
        error:
          'border-[var(--color-error-border)] bg-[var(--color-error-surface)] text-[var(--color-text)]',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
);

const TONE_ICON_COLOR: Record<NonNullable<VariantProps<typeof alertVariants>['tone']>, string> = {
  info: 'text-[var(--color-info)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-error)]',
};

const TONE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  tone = 'info',
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const resolvedTone = tone ?? 'info';
  const Icon = TONE_ICONS[resolvedTone];

  return (
    <div
      role="alert"
      className={twMerge(clsx(alertVariants({ tone: resolvedTone }), className))}
      {...props}
    >
      <Icon
        className={clsx('mt-0.5 size-4 shrink-0', TONE_ICON_COLOR[resolvedTone])}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-semibold text-[var(--color-text)]">{title}</p> : null}
        {children ? <div className="text-[var(--color-text-muted)]">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="ms-auto inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
