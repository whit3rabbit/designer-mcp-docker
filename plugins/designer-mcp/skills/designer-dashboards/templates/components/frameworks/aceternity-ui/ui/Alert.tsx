'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const ICONS: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  action,
  className,
  style,
  children,
  ...rest
}: AlertProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const Icon = ICONS[tone];

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={reducedMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: `var(--color-${tone}-surface)`,
        borderColor: `var(--color-${tone}-border)`,
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      className={clsx('flex items-start gap-3 border p-4 text-sm', className)}
      {...(rest as Record<string, unknown>)}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        style={{ color: `var(--color-${tone})` }}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        {description && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {description}
          </p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
          style={{ color: 'var(--color-text)' }}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
