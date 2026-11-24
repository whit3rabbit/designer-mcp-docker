import * as React from 'react';
import { Alert as MuiAlert, AlertTitle, type AlertProps as MuiAlertProps } from '@mui/material';

export interface AlertProps extends MuiAlertProps {
  title?: React.ReactNode;
}

export function Alert({ title, severity = 'info', children, sx, ...rest }: AlertProps) {
  return (
    <MuiAlert
      severity={severity}
      variant="outlined"
      sx={[
        {
          borderRadius: 'var(--radius-md)',
          bgcolor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor:
            severity === 'error'
              ? 'var(--color-error)'
              : severity === 'warning'
                ? 'var(--color-warning)'
                : severity === 'success'
                  ? 'var(--color-success)'
                  : 'var(--color-info)',
        },
        sx,
      ]}
      {...rest}
    >
      {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
