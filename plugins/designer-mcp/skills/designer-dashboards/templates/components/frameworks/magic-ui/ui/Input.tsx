'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, startIcon, endIcon, id, className, style, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const descId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5 text-start">
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
        {startIcon && (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
            className="pointer-events-none absolute start-3 flex items-center"
          >
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descId}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            ...style,
          }}
          className={cn(
            'h-9 w-full border text-sm transition-colors',
            'placeholder:text-[var(--color-text-muted)]',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-55',
            startIcon ? 'ps-9' : 'ps-3',
            endIcon ? 'pe-9' : 'pe-3',
            className,
          )}
          {...rest}
        />
        {endIcon && (
          <span
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
            className="pointer-events-none absolute end-3 flex items-center"
          >
            {endIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} style={{ color: 'var(--color-error)' }} className="text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} style={{ color: 'var(--color-text-muted)' }} className="text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
