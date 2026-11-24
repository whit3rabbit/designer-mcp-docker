import * as React from 'react';
import {
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  type DialogProps as MuiDialogProps,
} from '@mui/material';
import { X } from 'lucide-react';

export interface DialogProps extends Omit<MuiDialogProps, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  maxWidth = 'sm',
  fullWidth = true,
  children,
  ...rest
}: DialogProps) {
  const titleId = React.useId();
  const descId = React.useId();

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      {...rest}
    >
      {(title || description) && (
        <DialogTitle
          id={titleId}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid var(--color-border)',
            pb: 1.5,
          }}
        >
          <div>
            {title && (
              <Typography variant="h6" component="span" display="block">
                {title}
              </Typography>
            )}
            {description && (
              <Typography id={descId} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </div>
          <IconButton
            onClick={onClose}
            aria-label="Close dialog"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent sx={{ py: 2.5 }}>{children}</DialogContent>
      {footer && (
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            borderTop: '1px solid var(--color-border)',
            gap: 1,
          }}
        >
          {footer}
        </DialogActions>
      )}
    </MuiDialog>
  );
}
