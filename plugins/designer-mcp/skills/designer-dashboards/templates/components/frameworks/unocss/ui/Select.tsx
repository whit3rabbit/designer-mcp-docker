import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'h-8 text-xs',
  md: 'h-[38px] text-sm',
  lg: 'h-11 text-sm',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    placeholder,
    helperText,
    error,
    size = 'md',
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
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
          className={clsx(
            'rd-input-base appearance-none pe-9 ps-3',
            SIZE_CLASSES[size],
            error ? 'border-error focus-visible:outline-error' : 'hover:border-primary-border',
            className,
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute end-3 size-4 text-text-muted"
        />
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
