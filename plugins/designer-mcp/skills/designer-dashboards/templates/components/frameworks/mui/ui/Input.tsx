import * as React from 'react';
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material';

export type InputProps = Omit<TextFieldProps, 'variant'> & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { startAdornment, endAdornment, size = 'small', fullWidth = true, slotProps, ...rest },
  ref,
) {
  return (
    <TextField
      inputRef={ref}
      variant="outlined"
      size={size}
      fullWidth={fullWidth}
      slotProps={{
        ...slotProps,
        input: {
          ...(typeof slotProps?.input === 'object' ? slotProps.input : undefined),
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
        },
      }}
      {...rest}
    />
  );
});
