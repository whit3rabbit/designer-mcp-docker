import * as React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: 'h-8 text-xs',
  md: 'h-[38px] text-sm',
  lg: 'h-11 text-sm',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    size = 'md',
    startAdornment,
    endAdornment,
    id: providedId,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const descriptionId = helperText || error ? `${id}-desc` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-text">
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {startAdornment ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-3 flex items-center text-text-muted"
          >
            {startAdornment}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
          className={clsx(
            'rd-input-base',
            SIZE_CLASSES[size],
            startAdornment ? 'ps-9' : 'ps-3',
            endAdornment ? 'pe-9' : 'pe-3',
            error ? 'border-error focus-visible:outline-error' : 'hover:border-primary-border',
            className,
          )}
          {...rest}
        />
        {endAdornment ? (
          <span className="absolute end-3 flex items-center text-text-muted">{endAdornment}</span>
        ) : null}
      </div>
      {error ? (
        <p id={descriptionId} className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
