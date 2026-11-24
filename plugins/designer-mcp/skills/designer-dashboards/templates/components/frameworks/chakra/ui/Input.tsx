import * as React from 'react';
import { Field, Input as ChakraInput, type InputProps as ChakraInputProps } from '@chakra-ui/react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, required = false, disabled = false, id, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <Field.Root invalid={Boolean(error)} required={required} disabled={disabled}>
      {label && (
        <Field.Label htmlFor={inputId} fontSize="sm" fontWeight="medium" color="var(--color-text)">
          {label}
          {required && <Field.RequiredIndicator color="var(--color-error)" ms={1} />}
        </Field.Label>
      )}
      <ChakraInput
        ref={ref}
        id={inputId}
        bg="var(--color-surface)"
        color="var(--color-text)"
        borderWidth="1px"
        borderColor={error ? 'var(--color-error)' : 'var(--color-border)'}
        borderRadius="var(--radius-md)"
        _placeholder={{ color: 'var(--color-text-muted)' }}
        _focusVisible={{
          borderColor: 'var(--color-primary)',
          outline: '2px solid var(--color-primary)',
          outlineOffset: '1px',
        }}
        {...rest}
      />
      {error ? (
        <Field.ErrorText fontSize="xs" color="var(--color-error)">
          {error}
        </Field.ErrorText>
      ) : helperText ? (
        <Field.HelperText fontSize="xs" color="var(--color-text-muted)">
          {helperText}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
});
