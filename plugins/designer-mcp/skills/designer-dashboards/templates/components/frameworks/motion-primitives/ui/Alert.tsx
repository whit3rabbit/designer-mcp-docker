'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  description?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
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
  children,
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);
  const Icon = ICONS[tone];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: `var(--color-${tone}-surface)`,
            borderColor: `var(--color-${tone}-border)`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
          }}
          className={clsx('flex items-start gap-3 border p-4 text-start', className)}
        >
          <span style={{ color: `var(--color-${tone})` }} className="mt-0.5 shrink-0" aria-hidden="true">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            {title && <p className="text-sm font-semibold leading-snug">{title}</p>}
            {description && (
              <div className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {description}
              </div>
            )}
            {children}
          </div>
          {action && <div className="shrink-0">{action}</div>}
          {dismissible && (
            <button
              type="button"
              aria-label="Dismiss alert"
              onClick={handleDismiss}
              style={{ borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)' }}
              className="shrink-0 p-1 transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] cursor-pointer"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
