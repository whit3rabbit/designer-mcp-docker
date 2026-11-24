'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useMotionPreferences } from '../theme/motionConfig';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  description?: React.ReactNode;
  onClose?: () => void;
}

const TONE_ICONS: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  title,
  description,
  onClose,
  className,
  style,
  children,
  ...rest
}: AlertProps) {
  const { prefersReducedMotion, getTransition } = useMotionPreferences();
  const Icon = TONE_ICONS[tone];

  return (
    <motion.div
      role="alert"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition()}
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
      <span style={{ color: `var(--color-${tone})` }} className="mt-0.5 shrink-0" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 text-start">
        {title && <div className="font-semibold leading-snug">{title}</div>}
        {(description || children) && (
          <div style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs leading-relaxed">
            {description ?? children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
          className="shrink-0 cursor-pointer p-1 transition-colors hover:opacity-80"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
