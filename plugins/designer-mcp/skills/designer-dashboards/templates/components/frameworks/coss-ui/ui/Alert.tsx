import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn, FOCUS_RING } from '../theme/cn';

const alertVariants = cva(
  'flex items-start gap-3 rounded-[var(--radius-md)] border p-3.5 text-sm',
  {
    variants: {
      tone: {
        info: 'bg-[var(--color-info)]/10 border-[var(--color-info)]/30 text-[var(--color-text)]',
        success:
          'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-text)]',
        warning:
          'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-text)]',
        error:
          'bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-text)]',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
);

const TONE_ICON = {
  info: { Icon: Info, color: 'text-[var(--color-info)]' },
  success: { Icon: CheckCircle2, color: 'text-[var(--color-success)]' },
  warning: { Icon: TriangleAlert, color: 'text-[var(--color-warning)]' },
  error: { Icon: AlertCircle, color: 'text-[var(--color-error)]' },
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
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const resolvedTone = tone ?? 'info';
  const { Icon, color } = TONE_ICON[resolvedTone];

  return (
    <div
      role={resolvedTone === 'error' || resolvedTone === 'warning' ? 'alert' : 'status'}
      className={cn(alertVariants({ tone: resolvedTone }), className)}
      {...props}
    >
      <Icon className={cn('size-4 shrink-0 mt-0.5', color)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm text-[var(--color-text)]">{title}</p>}
        {children && (
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
            {children}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={cn(
            'shrink-0 rounded-[var(--radius-md)] p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] cursor-pointer',
            FOCUS_RING,
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
