'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Field } from '@base-ui/react/field';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  'aria-label'?: string;
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option…',
  label,
  description,
  error,
  disabled,
  required,
  name,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const isInvalid = Boolean(error);
  const labelMap = React.useMemo(
    () => new Map(options.map((opt) => [opt.value, opt.label])),
    [options],
  );

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      className={clsx('bui-field', className)}
    >
      {label && (
        <Field.Label className="bui-field__label">
          {label}
          {required && (
            <span className="bui-field__required" aria-hidden="true">
              *
            </span>
          )}
        </Field.Label>
      )}

      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val) => onValueChange?.(val ?? null)}
        disabled={disabled}
        required={required}
        name={name}
      >
        <BaseSelect.Trigger
          className="bui-select-trigger"
          aria-label={ariaLabel}
          aria-invalid={isInvalid || undefined}
        >
          <BaseSelect.Value className="bui-select-value" placeholder={placeholder}>
            {(selectedValue) =>
              selectedValue != null ? (labelMap.get(String(selectedValue)) ?? String(selectedValue)) : placeholder
            }
          </BaseSelect.Value>
          <BaseSelect.Icon className="bui-select-icon">
            <ChevronDown size={16} aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>

        <BaseSelect.Portal>
          <BaseSelect.Positioner className="bui-select-positioner" sideOffset={6} alignItemWithTrigger={false}>
            <BaseSelect.Popup className="bui-select-popup">
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bui-select-item"
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check size={14} aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>

      {description && !error && <Field.Description className="bui-field__description">{description}</Field.Description>}
      {error && (
        <Field.Error match={true} className="bui-field__error">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}
