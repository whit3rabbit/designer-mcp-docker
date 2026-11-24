'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './Button';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertVariant = 'tonal' | 'solid' | 'outline' | 'borderless';

export interface AlertProps {
  tone?: AlertTone;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children: React.ReactNode;
}

const TONE_ICONS: Record<AlertTone, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  variant = 'tonal',
  title,
  dismissible = false,
  onDismiss,
  className,
  children,
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  const Icon = TONE_ICONS[tone];

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? {
          backgroundColor: `var(--color-${tone})`,
          borderColor: `var(--color-${tone})`,
          color: 'var(--color-on-solid)',
        }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            borderColor: `var(--color-${tone}-border)`,
            color: `var(--color-${tone})`,
          }
        : variant === 'borderless'
          ? {
              backgroundColor: `var(--color-${tone}-surface)`,
              borderColor: 'transparent',
              color: `var(--color-${tone})`,
            }
          : {
              backgroundColor: `var(--color-${tone}-surface)`,
              borderColor: `var(--color-${tone}-border)`,
              color: `var(--color-${tone})`,
            };

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      style={{
        borderRadius: 'var(--radius-md)',
        ...variantStyle,
      }}
      className={cn('flex items-start gap-3 border px-4 py-3 text-sm', className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5 text-start">
        {title && <div className="font-semibold leading-snug">{title}</div>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Dismiss alert"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
