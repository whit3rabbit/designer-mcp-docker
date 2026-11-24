'use client';

import * as React from 'react';
import { Alert as AntAlert, type AlertProps as AntAlertProps } from 'antd';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertVariant = 'tonal' | 'solid' | 'outline';

export interface AlertProps extends Omit<AntAlertProps, 'type' | 'message' | 'description' | 'closable'> {
  tone?: AlertTone;
  variant?: AlertVariant;
  title?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}

const TONE_ICONS: Record<AlertTone, React.ReactNode> = {
  info: <Info size={16} aria-hidden="true" />,
  success: <CheckCircle2 size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  error: <AlertCircle size={16} aria-hidden="true" />,
};

export function Alert({
  tone = 'info',
  variant = 'tonal',
  title,
  dismissible = false,
  onDismiss,
  style,
  children,
  ...rest
}: AlertProps) {
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
            color: 'var(--color-text)',
          }
        : {
            backgroundColor: `var(--color-${tone}-surface)`,
            borderColor: `var(--color-${tone}-border)`,
            color: 'var(--color-text)',
          };

  return (
    <AntAlert
      type={tone}
      showIcon
      icon={TONE_ICONS[tone]}
      message={title ?? children}
      description={title ? children : undefined}
      closable={dismissible}
      onClose={onDismiss}
      style={{
        borderRadius: 'var(--radius-md)',
        ...variantStyle,
        ...style,
      }}
      {...rest}
    />
  );
}
