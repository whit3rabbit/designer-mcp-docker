import * as React from 'react';
import { Alert as MantineAlert, type AlertProps as MantineAlertProps } from '@mantine/core';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<MantineAlertProps, 'color'> {
  tone?: AlertTone;
}

const TONE_CONFIG: Record<
  AlertTone,
  { colorVar: string; icon: React.ReactNode }
> = {
  info: { colorVar: 'var(--color-info)', icon: <Info size={18} /> },
  success: { colorVar: 'var(--color-success)', icon: <CheckCircle2 size={18} /> },
  warning: { colorVar: 'var(--color-warning)', icon: <AlertTriangle size={18} /> },
  error: { colorVar: 'var(--color-error)', icon: <AlertCircle size={18} /> },
};

export function Alert({
  tone = 'info',
  icon,
  style,
  closeButtonLabel = 'Dismiss alert',
  ...props
}: AlertProps) {
  const cfg = TONE_CONFIG[tone];

  return (
    <MantineAlert
      radius="md"
      variant="light"
      icon={icon ?? cfg.icon}
      closeButtonLabel={closeButtonLabel}
      styles={{
        root: {
          backgroundColor: `color-mix(in oklab, ${cfg.colorVar} 10%, var(--color-surface))`,
          border: `1px solid color-mix(in oklab, ${cfg.colorVar} 30%, var(--color-border))`,
          color: 'var(--color-text)',
        },
        icon: {
          color: cfg.colorVar,
        },
        title: {
          color: 'var(--color-text)',
        },
        message: {
          color: 'var(--color-text-muted)',
        },
      }}
      style={style}
      {...props}
    />
  );
}
