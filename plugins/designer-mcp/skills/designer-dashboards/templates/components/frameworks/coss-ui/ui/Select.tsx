'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { cn, CONTROL_RING } from '../theme/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Select({
  label,
  placeholder = 'Select an option…',
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  className,
  ariaLabel,
}: SelectProps) {
  const labelId = React.useId();

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <span
          id={labelId}
          className="text-xs font-medium text-[var(--color-text)] select-none"
        >
          {label}
        </span>
      )}
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val) => {
          if (val !== null && onValueChange) {
            onValueChange(String(val));
          }
        }}
        disabled={disabled}
      >
        <BaseSelect.Trigger
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? ariaLabel ?? placeholder : undefined}
          className={cn(
            'inline-flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)]',
            'hover:bg-[var(--color-surface-subtle)] transition-colors duration-150 cursor-pointer',
            'disabled:cursor-not-allowed disabled:opacity-50',
            CONTROL_RING,
          )}
        >
          <BaseSelect.Value placeholder={placeholder} className="truncate text-start" />
          <BaseSelect.Icon className="text-[var(--color-text-muted)] shrink-0">
            <ChevronDown className="size-4" aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>

        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={6} className="z-50">
            <BaseSelect.Popup
              className={cn(
                'min-w-[var(--anchor-width)] max-h-64 overflow-y-auto rounded-[var(--radius-md)]',
                'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-lg',
                'text-[var(--color-text)] outline-none',
              )}
            >
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'relative flex items-center justify-between gap-2 rounded-[calc(var(--radius-md)-2px)] px-2.5 py-1.5 text-sm',
                    'cursor-pointer select-none outline-none',
                    'data-[highlighted]:bg-[var(--color-surface-subtle)]',
                    'data-[selected]:font-medium data-[selected]:text-[var(--color-primary)]',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                  )}
                >
                  <BaseSelect.ItemText className="truncate">{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="shrink-0 text-[var(--color-primary)]">
                    <Check className="size-3.5" aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}
