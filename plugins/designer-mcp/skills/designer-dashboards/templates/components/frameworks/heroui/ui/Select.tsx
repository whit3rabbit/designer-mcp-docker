'use client';

import * as React from 'react';
import {
  Label,
  ListBox,
  Popover,
  Select as HeroSelect,
  type SelectProps as HeroSelectProps,
} from '@heroui/react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<HeroSelectProps<SelectOption>, 'children' | 'selectedKey' | 'onSelectionChange'> {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  errorMessage,
  isDisabled,
  className,
  ...rest
}: SelectProps) {
  return (
    <HeroSelect
      selectedKey={value ?? null}
      onSelectionChange={(key) => {
        if (key != null && onChange) {
          onChange(String(key));
        }
      }}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isInvalid={Boolean(errorMessage)}
      className={clsx('flex flex-col gap-1.5', className)}
      {...rest}
    >
      {label ? (
        <Label className="text-sm font-medium text-[var(--color-text)]">{label}</Label>
      ) : null}
      <HeroSelect.Trigger
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: errorMessage ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        className={clsx(
          'flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 text-sm',
          'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <HeroSelect.Value className="truncate text-start" />
        <ChevronDown className="size-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
      </HeroSelect.Trigger>
      <Popover
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        className="min-w-[var(--trigger-width)] rounded-[var(--radius-md)] border p-1 shadow-lg"
      >
        <ListBox className="max-h-60 overflow-auto outline-none">
          {options.map((opt) => (
            <ListBox.Item
              key={opt.value}
              id={opt.value}
              textValue={opt.label}
              isDisabled={opt.disabled}
              className={clsx(
                'flex cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-sm outline-none',
                'text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]',
                'data-[focused=true]:bg-[var(--color-surface-subtle)]',
                'data-[selected=true]:bg-[var(--color-primary-surface)] data-[selected=true]:text-[var(--color-primary)] data-[selected=true]:font-medium',
                'data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed',
              )}
            >
              <span>{opt.label}</span>
            </ListBox.Item>
          ))}
        </ListBox>
      </Popover>
      {errorMessage ? (
        <span className="text-xs text-[var(--color-error)]">{errorMessage}</span>
      ) : null}
    </HeroSelect>
  );
}
