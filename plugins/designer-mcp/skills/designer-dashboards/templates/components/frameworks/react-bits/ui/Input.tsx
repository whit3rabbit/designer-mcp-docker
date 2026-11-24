'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, startAdornment, endAdornment, className, style, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 text-start">
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: 'var(--color-text)' }}
          className="text-xs font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startAdornment && (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
            className="pointer-events-none absolute start-3 flex items-center"
          >
            {startAdornment}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            ...style,
          }}
          className={clsx(
            'h-10 w-full border text-sm transition-colors placeholder:opacity-60',
            'disabled:cursor-not-allowed disabled:opacity-50',
            startAdornment ? 'ps-9' : 'ps-3',
            endAdornment ? 'pe-9' : 'pe-3',
            className,
          )}
          {...rest}
        />
        {endAdornment && (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
            className="pointer-events-none absolute end-3 flex items-center"
          >
            {endAdornment}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} style={{ color: 'var(--color-error)' }} className="text-xs">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} style={{ color: 'var(--color-text-muted)' }} className="text-xs">
          {hint}
        </p>
      )}
    </div>
  );
});
