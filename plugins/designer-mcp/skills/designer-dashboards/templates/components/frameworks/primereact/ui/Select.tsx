import * as React from 'react';
import { Dropdown, type DropdownProps } from 'primereact/dropdown';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectProps<T = string> extends Omit<DropdownProps, 'options' | 'value' | 'onChange'> {
  label?: string;
  options: SelectOption<T>[];
  value?: T;
  onValueChange?: (value: T) => void;
  helperText?: string;
  error?: string;
  id?: string;
}

export function Select<T = string>({
  label,
  options,
  value,
  onValueChange,
  helperText,
  error,
  id,
  style,
  ...rest
}: SelectProps<T>) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label ? (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          {label}
        </label>
      ) : null}
      <Dropdown
        inputId={selectId}
        value={value}
        options={options}
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        invalid={Boolean(error)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onValueChange?.(e.value as T)}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span id={errorId} role="alert" style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
