'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './Button';

export type AlertTone = 'info' | 'success' | 'warning' | 'error' | 'neutral';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onDismiss?: () => void;
}

const ALERT_ICONS: Record<AlertTone, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  neutral: Info,
};

export function Alert({
  tone = 'info',
  title,
  description,
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  const Icon = ALERT_ICONS[tone];

  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={clsx('bui-alert', `bui-alert--${tone}`, className)}
      {...props}
    >
      <span className="bui-alert__icon">
        <Icon size={18} aria-hidden />
      </span>
      <div className="bui-alert__body">
        {title && <p className="bui-alert__title">{title}</p>}
        {description && <p className="bui-alert__desc">{description}</p>}
        {children}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          <X size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
