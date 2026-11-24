'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, hint, error, id, className, style, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const descId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5 text-start">
      {label && (
        <label
          htmlFor={selectId}
          style={{ color: 'var(--color-text)' }}
          className="text-xs font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
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
            'h-9 w-full appearance-none border ps-3 pe-9 text-sm transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-55',
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          style={{ color: 'var(--color-text-muted)' }}
          className="pointer-events-none absolute end-3 size-4"
        />
      </div>
      {error ? (
        <p id={`${selectId}-error`} style={{ color: 'var(--color-error)' }} className="text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} style={{ color: 'var(--color-text-muted)' }} className="text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
