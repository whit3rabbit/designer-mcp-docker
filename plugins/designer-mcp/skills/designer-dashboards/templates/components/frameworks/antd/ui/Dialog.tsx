'use client';

import * as React from 'react';
import { Modal, type ModalProps } from 'antd';
import { X } from 'lucide-react';

export interface DialogProps extends Omit<ModalProps, 'open' | 'onCancel' | 'width' | 'title'> {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_WIDTHS: Record<NonNullable<DialogProps['size']>, number> = {
  sm: 400,
  md: 520,
  lg: 680,
  xl: 880,
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  ...rest
}: DialogProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={SIZE_WIDTHS[size]}
      footer={footer === undefined ? null : footer}
      closeIcon={<X size={16} aria-hidden="true" />}
      destroyOnHidden
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingInlineEnd: 24 }}>
          <span style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 16 }}>
            {title}
          </span>
          {description && (
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 13 }}>
              {description}
            </span>
          )}
        </div>
      }
      {...rest}
    >
      <div style={{ paddingTop: 8 }}>{children}</div>
    </Modal>
  );
}
