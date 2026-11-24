'use client';

import * as React from 'react';
import { Select as AntSelect, type SelectProps as AntSelectProps } from 'antd';

export interface SelectOption<TValue extends string | number = string> {
  label: React.ReactNode;
  value: TValue;
  disabled?: boolean;
}

export interface SelectProps<TValue extends string | number = string>
  extends Omit<AntSelectProps<TValue>, 'options' | 'status'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options: SelectOption<TValue>[];
}

export function Select<TValue extends string | number = string>({
  id,
  label,
  helperText,
  error,
  required = false,
  options,
  style,
  ...rest
}: SelectProps<TValue>) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{label}</span>
          {required && (
            <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>
              *
            </span>
          )}
        </label>
      )}
      <AntSelect<TValue>
        id={selectId}
        options={options}
        status={error ? 'error' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        style={{ width: '100%', ...style }}
        {...rest}
      />
      {error ? (
        <span
          id={errorId}
          role="alert"
          style={{ fontSize: 12, color: 'var(--color-error)' }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
