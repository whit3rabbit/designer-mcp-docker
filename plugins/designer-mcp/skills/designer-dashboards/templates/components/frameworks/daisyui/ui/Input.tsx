'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type DaisyInputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: DaisyInputSize;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const SIZE_CLASS: Record<DaisyInputSize, string> = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, size = 'md', startIcon, endIcon, id, className, ...rest }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-msg`;
    const hasMessage = Boolean(error || hint);

    return (
      <fieldset className="fieldset w-full">
        {label && (
          <label htmlFor={inputId} className="fieldset-legend text-sm font-medium">
            {label}
          </label>
        )}
        <label
          className={clsx(
            'input w-full flex items-center gap-2',
            SIZE_CLASS[size],
            error && 'input-error',
            className,
          )}
        >
          {startIcon && (
            <span className="text-[var(--color-text-muted)] shrink-0" aria-hidden="true">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={hasMessage ? messageId : undefined}
            className="grow bg-transparent outline-none"
            {...rest}
          />
          {endIcon && (
            <span className="text-[var(--color-text-muted)] shrink-0" aria-hidden="true">
              {endIcon}
            </span>
          )}
        </label>
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

Input.displayName = 'Input';
