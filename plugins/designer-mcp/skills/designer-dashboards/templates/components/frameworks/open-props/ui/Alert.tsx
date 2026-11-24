import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  description?: React.ReactNode;
  onDismiss?: () => void;
}

const ICONS: Record<AlertTone, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  title,
  description,
  onDismiss,
  className,
  style,
  children,
  ...rest
}: AlertProps) {
  const Icon = ICONS[tone];
  const color = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={['op-alert', className ?? ''].filter(Boolean).join(' ')}
      style={{
        backgroundColor: surface,
        borderColor: border,
        ...style,
      }}
      {...rest}
    >
      <span style={{ color, flexShrink: 0, display: 'inline-flex', marginTop: '2px' }}>
        <Icon size={18} aria-hidden />
      </span>
      <div className="op-alert__body">
        {title && (
          <p className="op-alert__title" style={{ color: 'var(--color-text)' }}>
            {title}
          </p>
        )}
        {description && <p className="op-alert__description">{description}</p>}
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="op-focusable"
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: 'var(--op-radius-sm)',
            display: 'inline-flex',
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
