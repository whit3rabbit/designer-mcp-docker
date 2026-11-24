'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, hint, error, options, placeholder, className, style, ...rest },
  ref,
) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 text-start">
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
            'h-10 w-full appearance-none border ps-3 pe-9 text-sm transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
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
