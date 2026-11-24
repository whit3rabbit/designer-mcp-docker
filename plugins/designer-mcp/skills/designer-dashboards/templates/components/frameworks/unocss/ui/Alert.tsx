import * as React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  onDismiss?: () => void;
}

const TONE_STYLES: Record<AlertTone, string> = {
  info: 'bg-info-surface text-info border-info-border',
  success: 'bg-success-surface text-success border-success-border',
  warning: 'bg-warning-surface text-warning border-warning-border',
  error: 'bg-error-surface text-error border-error-border',
};

const TONE_ICONS: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  title,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-lg border p-4 text-sm',
        TONE_STYLES[tone],
        className,
      )}
      {...rest}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold leading-snug">{title}</p> : null}
        {children ? <div className={clsx('text-text', title && 'mt-1')}>{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="rd-focus-ring shrink-0 rounded-md p-1 text-current opacity-75 transition-opacity hover:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
