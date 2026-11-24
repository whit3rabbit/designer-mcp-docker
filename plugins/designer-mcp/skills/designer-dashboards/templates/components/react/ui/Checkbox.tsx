'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, description, className, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className={clsx('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        style={{ accentColor: 'var(--color-primary)' }}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded"
        {...rest}
      />
      {(label || description) && (
        <span className="space-y-0.5">
          {label && (
            <span style={{ color: 'var(--color-text)' }} className="block text-xs font-medium">
              {label}
            </span>
          )}
          {description && (
            <span style={{ color: 'var(--color-text-muted)' }} className="block text-[11px]">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={clsx(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
    >
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={clsx(
              'flex cursor-pointer items-start gap-2.5',
              opt.disabled && 'cursor-not-allowed opacity-55',
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={opt.disabled}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: 'var(--color-primary)' }}
              className="mt-0.5 size-4 shrink-0 cursor-pointer"
            />
            <span className="space-y-0.5">
              <span style={{ color: 'var(--color-text)' }} className="block text-xs font-medium">
                {opt.label}
              </span>
              {opt.description && (
                <span style={{ color: 'var(--color-text-muted)' }} className="block text-[11px]">
                  {opt.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
