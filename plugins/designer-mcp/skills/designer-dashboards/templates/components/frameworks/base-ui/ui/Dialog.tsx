'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  className?: string;
}

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="bui-dialog-backdrop" />
        <BaseDialog.Popup className={clsx('bui-dialog-popup', `bui-dialog-popup--${size}`, className)}>
          <div className="bui-dialog-header">
            <div>
              <BaseDialog.Title className="bui-dialog-title">{title}</BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="bui-dialog-description">
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              render={
                <Button variant="ghost" tone="neutral" size="xs" iconOnly aria-label="Close dialog">
                  <X size={16} aria-hidden="true" />
                </Button>
              }
            />
          </div>
          <div className="bui-dialog-body">{children}</div>
          {footer && <div className="bui-dialog-footer">{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
