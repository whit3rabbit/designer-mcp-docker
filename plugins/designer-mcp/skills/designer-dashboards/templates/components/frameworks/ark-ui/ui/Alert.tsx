import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const ICONS: Record<AlertTone, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const ICON_COLORS: Record<AlertTone, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

export function Alert({ tone = 'info', title, description, action, className = '', ...props }: AlertProps) {
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={['rd-ark-alert', `rd-ark-alert--${tone}`, className].filter(Boolean).join(' ')}
      {...props}
    >
      <span style={{ color: ICON_COLORS[tone], display: 'inline-flex', marginTop: '0.125rem' }}>
        <Icon size={18} aria-hidden />
      </span>
      <div className="rd-ark-alert__content">
        <p className="rd-ark-alert__title">{title}</p>
        {description ? <p className="rd-ark-alert__description">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
