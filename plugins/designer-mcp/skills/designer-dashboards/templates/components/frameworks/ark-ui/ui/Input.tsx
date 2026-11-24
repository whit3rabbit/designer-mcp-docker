import * as React from 'react';
import { Field } from '@ark-ui/react/field';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, invalid, disabled, required, className = '', ...props }, ref) => {
    const isInvalid = Boolean(invalid || errorText);

    return (
      <Field.Root invalid={isInvalid} disabled={disabled} required={required} className={className}>
        {label ? <Field.Label>{label}</Field.Label> : null}
        <Field.Input ref={ref} {...props} />
        {errorText ? (
          <Field.ErrorText>{errorText}</Field.ErrorText>
        ) : helperText ? (
          <Field.HelperText>{helperText}</Field.HelperText>
        ) : null}
      </Field.Root>
    );
  },
);

Input.displayName = 'Input';
