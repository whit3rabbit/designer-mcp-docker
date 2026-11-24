'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type DaisySelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: DaisySelectSize;
  options?: SelectOption[];
  placeholder?: string;
}

const SIZE_CLASS: Record<DaisySelectSize, string> = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
  xl: 'select-xl',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, size = 'md', options, placeholder, id, className, children, ...rest },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const messageId = `${selectId}-msg`;
    const hasMessage = Boolean(error || hint);

    return (
      <fieldset className="fieldset w-full">
        {label && (
          <label htmlFor={selectId} className="fieldset-legend text-sm font-medium">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={clsx('select w-full', SIZE_CLASS[size], error && 'select-error', className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p id={messageId} className="label text-xs text-[var(--color-error)]">
            {error}
          </p>
        ) : hint ? (
          <p id={messageId} className="label text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        ) : null}
      </fieldset>
    );
  },
);

Select.displayName = 'Select';
