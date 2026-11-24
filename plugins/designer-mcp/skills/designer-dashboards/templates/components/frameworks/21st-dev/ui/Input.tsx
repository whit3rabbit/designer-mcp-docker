'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      className,
      label,
      helperText,
      error,
      startAdornment,
      endAdornment,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = error || helperText ? `${inputId}-desc` : undefined;

    return (
      <div className="flex flex-col gap-1.5 text-start">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center">
          {startAdornment ? (
            <span className="pointer-events-none absolute start-3 flex items-center text-[var(--color-text-muted)]">
              {startAdornment}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={descriptionId}
            className={twMerge(
              clsx(
                'h-9 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)]',
                'placeholder:text-[var(--color-text-muted)] transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error
                  ? 'border-[var(--color-error)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
                startAdornment ? 'ps-9' : '',
                endAdornment ? 'pe-9' : '',
                className,
              ),
            )}
            {...props}
          />
          {endAdornment ? (
            <span className="absolute end-3 flex items-center text-[var(--color-text-muted)]">
              {endAdornment}
            </span>
          ) : null}
        </div>
        {error ? (
          <p id={descriptionId} className="text-xs text-[var(--color-error)]">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-[var(--color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
