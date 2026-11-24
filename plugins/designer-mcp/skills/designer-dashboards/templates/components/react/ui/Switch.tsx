'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
}: SwitchProps) {
  const autoId = React.useId();
  const switchId = id ?? autoId;

  const trackClass = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const thumbClass = size === 'sm' ? 'size-3.5' : 'size-4';
  const translateClass =
    size === 'sm'
      ? checked
        ? 'translate-x-4 rtl:-translate-x-4'
        : 'translate-x-0.5 rtl:-translate-x-0.5'
      : checked
        ? 'translate-x-5 rtl:-translate-x-5'
        : 'translate-x-1 rtl:-translate-x-1';

  return (
    <div className="flex items-start justify-between gap-3">
      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer space-y-0.5">
          {label && (
            <span style={{ color: 'var(--color-text)' }} className="block text-xs font-medium">
              {label}
            </span>
          )}
          {description && (
            <span style={{ color: 'var(--color-text-muted)' }} className="block text-[11px]">
              {description}
            </span>
          )}
        </label>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle'}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        style={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
        }}
        className={clsx(
          'relative inline-flex shrink-0 cursor-pointer items-center transition-colors disabled:cursor-not-allowed disabled:opacity-55',
          trackClass,
        )}
      >
        <span
          style={{
            backgroundColor: 'var(--color-on-solid)',
            borderRadius: 'var(--radius-full)',
          }}
          className={clsx('inline-block transition-transform', thumbClass, translateClass)}
        />
      </button>
    </div>
  );
}
