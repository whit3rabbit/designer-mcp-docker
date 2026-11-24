import * as React from 'react';
import { Message } from 'primereact/message';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const TONE_TOKEN: Record<AlertTone, { color: string; severity: 'info' | 'success' | 'warn' | 'error'; Icon: typeof Info }> = {
  info: { color: 'var(--color-info)', severity: 'info', Icon: Info },
  success: { color: 'var(--color-success)', severity: 'success', Icon: CheckCircle2 },
  warning: { color: 'var(--color-warning)', severity: 'warn', Icon: AlertTriangle },
  error: { color: 'var(--color-error)', severity: 'error', Icon: AlertCircle },
};

export function Alert({
  tone = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  style,
}: AlertProps) {
  const { color, severity, Icon } = TONE_TOKEN[tone];

  return (
    <div role="alert" className={className} style={{ width: '100%', ...style }}>
      <Message
        severity={severity}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          backgroundColor: `color-mix(in oklch, ${color} 10%, var(--color-surface))`,
          border: `1px solid color-mix(in oklch, ${color} 32%, var(--color-border))`,
          borderInlineStart: `4px solid ${color}`,
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
        }}
        content={
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <Icon size={18} style={{ color, flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
              <div style={{ fontSize: '0.875rem', lineHeight: 1.45 }}>
                {title ? (
                  <div style={{ fontWeight: 600, marginBottom: '0.15rem', color: 'var(--color-text)' }}>
                    {title}
                  </div>
                ) : null}
                <div style={{ color: 'var(--color-text-muted)' }}>{children}</div>
              </div>
            </div>
            {dismissible && onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss alert"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
