'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

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
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      style={{ borderRadius: 'var(--radius-md)', ...variantStyle }}
      className={clsx(
        'flex items-start justify-between gap-3 px-4 py-3 text-sm',
        variant !== 'borderless' && 'border',
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-xs opacity-90">{children}</div>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          tone={variant === 'solid' ? 'neutral' : tone}
          size="xs"
          iconOnly
          aria-label="Dismiss alert"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <AppIcon name="x" size={14} />
        </Button>
      )}
    </div>
  );
}
