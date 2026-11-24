import * as React from 'react';
import { Dialog as PrimeDialog, type DialogProps as PrimeDialogProps } from 'primereact/dialog';

export interface DialogProps extends Omit<PrimeDialogProps, 'visible' | 'onHide'> {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  footer,
  width = '32rem',
  style,
  children,
  ...rest
}: DialogProps) {
  return (
    <PrimeDialog
      visible={open}
      onHide={onClose}
      header={title}
      footer={footer}
      modal
      dismissableMask
      closeOnEscape
      style={{
        width,
        maxWidth: '94vw',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-elevated)',
        color: 'var(--color-text)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </PrimeDialog>
  );
}
