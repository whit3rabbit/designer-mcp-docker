'use client';

import * as React from 'react';
import { Input as AntInput, type InputProps as AntInputProps, type InputRef } from 'antd';

export interface InputProps extends Omit<AntInputProps, 'status'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  isPassword?: boolean;
}

export const Input = React.forwardRef<InputRef, InputProps>(function Input(
  {
    id,
    label,
    helperText,
    error,
    required = false,
    isPassword = false,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  const Component = isPassword ? AntInput.Password : AntInput;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
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
      <Component
        ref={ref}
        id={inputId}
        status={error ? 'error' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        style={{
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
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
});
