import * as React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  type CardProps as MuiCardProps,
} from '@mui/material';

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  children,
  sx,
  ...rest
}: CardProps) {
  return (
    <MuiCard
      sx={[
        {
          bgcolor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        },
        sx,
      ]}
      {...rest}
    >
      {(title || subtitle || action) && (
        <CardHeader
          title={
            title ? (
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {title}
              </Typography>
            ) : undefined
          }
          subheader={
            subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : undefined
          }
          action={action}
          sx={{
            pb: noPadding ? 1.5 : 0,
            borderBottom: noPadding ? '1px solid var(--color-border)' : 'none',
          }}
        />
      )}
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
        {children}
      </CardContent>
      {footer && (
        <CardActions
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid var(--color-border)',
            justifyContent: 'flex-end',
          }}
        >
          {footer}
        </CardActions>
      )}
    </MuiCard>
  );
}
