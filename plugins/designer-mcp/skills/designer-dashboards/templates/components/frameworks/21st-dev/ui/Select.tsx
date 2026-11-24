'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
}: SelectProps) {
  const labelId = React.useId();

  return (
    <div className={twMerge(clsx('flex flex-col gap-1.5 text-start', className))}>
      {label ? (
        <span id={labelId} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
      ) : null}
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={(nextValue) => {
          if (typeof nextValue === 'string' && onValueChange) {
            onValueChange(nextValue);
          }
        }}
        disabled={disabled}
      >
        <BaseSelect.Trigger
          aria-labelledby={label ? labelId : undefined}
          className={clsx(
            'inline-flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-md)]',
            'border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)]',
            'transition-colors hover:border-[var(--color-text-muted)]',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <BaseSelect.Value placeholder={placeholder} className="truncate text-start" />
          <BaseSelect.Icon className="text-[var(--color-text-muted)]">
            <ChevronDown className="size-4" aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={6} align="start" className="z-50">
            <BaseSelect.Popup
              className={clsx(
                'min-w-[var(--anchor-width)] overflow-hidden rounded-[var(--radius-md)]',
                'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-lg',
              )}
            >
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={clsx(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-[calc(var(--radius-md)-2px)]',
                    'px-2.5 py-1.5 text-sm text-[var(--color-text)] select-none outline-none',
                    'data-[highlighted]:bg-[var(--color-primary-surface)] data-[highlighted]:text-[var(--color-primary)]',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="text-[var(--color-primary)]">
                    <Check className="size-4" aria-hidden="true" />
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
