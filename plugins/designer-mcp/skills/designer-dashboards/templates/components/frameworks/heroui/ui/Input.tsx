'use client';

import * as React from 'react';
import {
  Description,
  FieldError,
  Input as HeroInput,
  Label,
  TextField,
  type TextFieldProps,
} from '@heroui/react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<TextFieldProps, 'children'> {
  label?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    placeholder,
    description,
    errorMessage,
    startIcon,
    endIcon,
    isInvalid,
    className,
    inputClassName,
    ...rest
  },
  ref,
) {
  const invalid = Boolean(isInvalid || errorMessage);

  return (
    <TextField
      isInvalid={invalid}
      className={clsx('flex flex-col gap-1.5', className)}
      {...rest}
    >
      {label ? (
        <Label className="text-sm font-medium text-[var(--color-text)]">{label}</Label>
      ) : null}
      <div className="relative flex items-center">
        {startIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-3 flex items-center text-[var(--color-text-muted)]"
          >
            {startIcon}
          </span>
        ) : null}
        <HeroInput
          ref={ref}
          placeholder={placeholder}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          className={clsx(
            'h-9 w-full rounded-[var(--radius-md)] border text-sm transition-colors',
            'placeholder:text-[var(--color-text-muted)]',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--color-primary)]',
            startIcon ? 'ps-9' : 'ps-3',
            endIcon ? 'pe-9' : 'pe-3',
            inputClassName,
          )}
        />
        {endIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-3 flex items-center text-[var(--color-text-muted)]"
          >
            {endIcon}
          </span>
        ) : null}
      </div>
      {description && !errorMessage ? (
        <Description className="text-xs text-[var(--color-text-muted)]">{description}</Description>
      ) : null}
      {errorMessage ? (
        <FieldError className="text-xs text-[var(--color-error)]">{errorMessage}</FieldError>
      ) : null}
    </TextField>
  );
});
