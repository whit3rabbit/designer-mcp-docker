import * as React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string>
  extends Omit<MuiSelectProps<T>, 'variant'> {
  label?: string;
  options: SelectOption[];
  helperText?: React.ReactNode;
}

export function Select<T extends string | number = string>({
  id,
  label,
  options,
  helperText,
  error,
  size = 'small',
  fullWidth = true,
  ...rest
}: SelectProps<T>) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const labelId = `${selectId}-label`;

  return (
    <FormControl fullWidth={fullWidth} size={size} error={error}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect
        id={selectId}
        labelId={label ? labelId : undefined}
        label={label}
        {...rest}
      >
        {options.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
