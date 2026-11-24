'use client';

import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { clsx } from 'clsx';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  invalid?: boolean;
  size?: InputSize;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    description,
    error,
    invalid,
    disabled,
    required,
    size = 'md',
    startAdornment,
    endAdornment,
    containerClassName,
    className,
    name,
    ...props
  },
  ref,
) {
  const isInvalid = Boolean(invalid || error);

  return (
    <Field.Root
      name={name}
      disabled={disabled}
      invalid={isInvalid}
      className={clsx('bui-field', containerClassName)}
    >
      {label && (
        <Field.Label className="bui-field__label">
          {label}
          {required && (
            <span className="bui-field__required" aria-hidden="true">
              *
            </span>
          )}
        </Field.Label>
      )}
      <div className="bui-input-wrap">
        {startAdornment && (
          <span className="bui-input__adornment bui-input__adornment--start" aria-hidden="true">
            {startAdornment}
          </span>
        )}
        <Field.Control
          ref={ref}
          required={required}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          className={clsx(
            'bui-input',
            size !== 'md' && `bui-input--${size}`,
            Boolean(startAdornment) && 'bui-input--with-start',
            Boolean(endAdornment) && 'bui-input--with-end',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <span className="bui-input__adornment bui-input__adornment--end" aria-hidden="true">
            {endAdornment}
          </span>
        )}
      </div>
      {description && !error && <Field.Description className="bui-field__description">{description}</Field.Description>}
      {error && (
        <Field.Error match={true} className="bui-field__error">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
});
