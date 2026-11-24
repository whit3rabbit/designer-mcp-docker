import * as React from 'react';
import {
  MultiSelect as MantineMultiSelect,
  Select as MantineSelect,
  type MultiSelectProps as MantineMultiSelectProps,
  type SelectProps as MantineSelectProps,
} from '@mantine/core';

const sharedSelectStyles = {
  input: {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  },
  dropdown: {
    backgroundColor: 'var(--color-surface-elevated)',
    borderColor: 'var(--color-border)',
  },
  option: {
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

export type SelectProps = MantineSelectProps;

export const Select = React.forwardRef<HTMLInputElement, SelectProps>(
  ({ styles, radius = 'md', ...props }, ref) => (
    <MantineSelect
      ref={ref}
      radius={radius}
      styles={{ ...sharedSelectStyles, ...styles }}
      {...props}
    />
  ),
);
Select.displayName = 'Select';

export type MultiSelectProps = MantineMultiSelectProps;

export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(
  ({ styles, radius = 'md', ...props }, ref) => (
    <MantineMultiSelect
      ref={ref}
      radius={radius}
      styles={{ ...sharedSelectStyles, ...styles }}
      {...props}
    />
  ),
);
MultiSelect.displayName = 'MultiSelect';
