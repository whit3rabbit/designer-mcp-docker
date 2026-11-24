'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type DaisyAlertTone = 'info' | 'success' | 'warning' | 'error';
export type DaisyAlertVariant = 'solid' | 'soft' | 'outline';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: DaisyAlertTone;
  variant?: DaisyAlertVariant;
  title?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

const TONE_CLASS: Record<DaisyAlertTone, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const VARIANT_CLASS: Record<DaisyAlertVariant, string> = {
  solid: '',
  soft: 'alert-soft',
  outline: 'alert-outline',
};

const ICONS: Record<DaisyAlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  variant = 'soft',
  title,
  onDismiss,
  dismissLabel = 'Dismiss alert',
  className,
  children,
  ...rest
}: AlertProps) {
  const Icon = ICONS[tone];

  return (
    <div
      role="alert"
      className={clsx('alert', TONE_CLASS[tone], VARIANT_CLASS[variant], className)}
      {...rest}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="btn btn-ghost btn-xs btn-square shrink-0"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
