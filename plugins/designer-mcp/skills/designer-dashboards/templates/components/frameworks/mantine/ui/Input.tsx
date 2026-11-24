import * as React from 'react';
import {
  PasswordInput,
  Textarea,
  TextInput,
  type PasswordInputProps,
  type TextareaProps,
  type TextInputProps,
} from '@mantine/core';

const sharedInputStyles = {
  input: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  },
  label: {
    color: 'var(--color-text)',
    fontWeight: 500,
  },
  description: {
    color: 'var(--color-text-muted)',
  },
  error: {
    color: 'var(--color-error)',
  },
};

export type InputProps = TextInputProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ styles, radius = 'md', ...props }, ref) => (
    <TextInput
      ref={ref}
      radius={radius}
      styles={{ ...sharedInputStyles, ...styles }}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export type PasswordFieldProps = PasswordInputProps;

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ styles, radius = 'md', ...props }, ref) => (
    <PasswordInput
      ref={ref}
      radius={radius}
      styles={{ ...sharedInputStyles, ...styles }}
      {...props}
    />
  ),
);
PasswordField.displayName = 'PasswordField';

export type TextareaFieldProps = TextareaProps;

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ styles, radius = 'md', ...props }, ref) => (
    <Textarea
      ref={ref}
      radius={radius}
      styles={{ ...sharedInputStyles, ...styles }}
      {...props}
    />
  ),
);
TextareaField.displayName = 'TextareaField';
