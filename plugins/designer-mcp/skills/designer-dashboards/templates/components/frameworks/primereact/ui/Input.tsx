import * as React from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';

export interface InputProps extends InputTextProps {
  label?: string;
  helperText?: string;
  error?: string;
  id?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, id, style, className, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          {label}
        </label>
      ) : null}
      <InputText
        ref={ref}
        id={inputId}
        invalid={Boolean(error)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={className}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
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
});
