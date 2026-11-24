'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    startIcon,
    endIcon,
    clearable = false,
    onClear,
    id,
    className,
    containerClassName,
    style,
    value,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  const showClear = clearable && Boolean(value) && !disabled && Boolean(onClear);

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-3 flex items-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          value={value}
          disabled={disabled}
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
            'h-10 w-full border text-sm transition-colors placeholder:opacity-60 disabled:cursor-not-allowed disabled:opacity-50',
            startIcon ? 'ps-9' : 'ps-3',
            endIcon || showClear ? 'pe-9' : 'pe-3',
            className,
          )}
          {...rest}
        />
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute end-2.5 flex size-6 items-center justify-center rounded transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          endIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute end-3 flex items-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {endIcon}
            </span>
          )
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
});
