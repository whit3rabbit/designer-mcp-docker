import * as React from 'react';
import { cn, CONTROL_RING } from '../theme/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      description,
      error,
      leadingIcon,
      trailingIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descId = description ? `${inputId}-desc` : undefined;
    const errorId = error ? `${inputId}-err` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--color-text)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute start-3 flex items-center text-[var(--color-text-muted)]"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-9 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)]',
              'placeholder:text-[var(--color-text-muted)] transition-colors duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-[var(--color-error)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)]/25'
                : cn('border-[var(--color-border)]', CONTROL_RING),
              Boolean(leadingIcon) && 'ps-9',
              Boolean(trailingIcon) && 'pe-9',
              className,
            )}
            {...props}
          />
          {trailingIcon && (
            <span
              className="pointer-events-none absolute end-3 flex items-center text-[var(--color-text-muted)]"
              aria-hidden="true"
            >
              {trailingIcon}
            </span>
          )}
        </div>
        {description && !error && (
          <p id={descId} className="text-xs text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-[var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
