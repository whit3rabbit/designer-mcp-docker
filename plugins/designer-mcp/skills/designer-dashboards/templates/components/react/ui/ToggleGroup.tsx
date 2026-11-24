'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon, type IconName } from '../../@core/icons/registry';

export interface ToggleGroupOption {
  value: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  variant?: 'segmented' | 'outline' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  label?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3 text-xs',
  lg: 'h-9 px-3.5 text-sm',
} as const;

/**
 * Accessible ToggleGroup / SegmentedControl (shadcn v4 / Ecme / Steex / Metronic).
 */
export function ToggleGroup({
  options,
  value,
  onChange,
  multiple = false,
  variant = 'segmented',
  size = 'md',
  fullWidth = false,
  label = 'Toggle options',
  className,
}: ToggleGroupProps) {
  const selected = Array.isArray(value) ? value : [value];

  const handleSelect = (optValue: string) => {
    if (!multiple) {
      onChange(optValue);
      return;
    }
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next);
  };

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
      style={{
        backgroundColor: variant === 'segmented' ? 'var(--color-canvas)' : 'transparent',
        borderColor: 'var(--color-border)',
        borderRadius: variant === 'pill' ? 'var(--radius-full)' : 'var(--radius-md)',
      }}
      className={clsx(
        'inline-flex items-center gap-1 p-1',
        variant === 'segmented' && 'border',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role={multiple ? undefined : 'radio'}
            aria-checked={multiple ? undefined : active}
            aria-pressed={multiple ? active : undefined}
            disabled={opt.disabled}
            onClick={() => handleSelect(opt.value)}
            style={{
              backgroundColor: active
                ? variant === 'segmented'
                  ? 'var(--color-surface)'
                  : 'var(--color-primary-surface)'
                : 'transparent',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderColor:
                variant === 'outline'
                  ? active
                    ? 'var(--color-primary)'
                    : 'var(--color-border)'
                  : 'transparent',
              borderRadius: variant === 'pill' ? 'var(--radius-full)' : 'var(--radius-sm)',
            }}
            className={clsx(
              'inline-flex cursor-pointer items-center justify-center gap-1.5 font-semibold transition-all',
              'hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50',
              active && variant === 'segmented' && 'shadow-xs',
              variant === 'outline' && 'border',
              fullWidth && 'flex-1',
              SIZE_CLASSES[size],
            )}
          >
            {opt.icon && <AppIcon name={opt.icon} size={14} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const SegmentedControl = ToggleGroup;
