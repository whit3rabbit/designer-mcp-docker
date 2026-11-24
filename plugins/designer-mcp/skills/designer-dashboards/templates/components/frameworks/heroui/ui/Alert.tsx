'use client';

import * as React from 'react';
import { Alert as HeroAlert } from '@heroui/react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  tone?: AlertTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const TONE_ICONS: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const HERO_STATUS_MAP: Record<AlertTone, 'accent' | 'success' | 'warning' | 'danger'> = {
  info: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

export function Alert({
  tone = 'info',
  title,
  description,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = TONE_ICONS[tone];
  const colorVar = `var(--color-${tone})`;
  const surfaceVar = `var(--color-${tone}-surface)`;
  const borderVar = `var(--color-${tone}-border)`;

  return (
    <HeroAlert
      status={HERO_STATUS_MAP[tone]}
      style={{
        backgroundColor: surfaceVar,
        borderColor: borderVar,
        color: 'var(--color-text)',
      }}
      className={clsx(
        'flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3',
        className,
      )}
    >
      <HeroAlert.Indicator style={{ color: colorVar }} className="mt-0.5 shrink-0">
        <Icon className="size-4" aria-hidden="true" />
      </HeroAlert.Indicator>
      <HeroAlert.Content className="min-w-0 flex-1">
        <HeroAlert.Title className="text-sm font-semibold text-[var(--color-text)]">
          {title}
        </HeroAlert.Title>
        {description ? (
          <HeroAlert.Description className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            {description}
          </HeroAlert.Description>
        ) : null}
      </HeroAlert.Content>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="ms-1 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </HeroAlert>
  );
}
