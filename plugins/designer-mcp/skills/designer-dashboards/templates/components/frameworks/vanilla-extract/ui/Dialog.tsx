import * as React from 'react';
import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { X } from 'lucide-react';
import { Button } from './Button';
import {
  dialogBackdrop,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositioner,
  dialogTitle,
} from './ui.css';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  return (
    <ArkDialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <Portal>
        <ArkDialog.Backdrop className={dialogBackdrop} />
        <ArkDialog.Positioner className={dialogPositioner}>
          <ArkDialog.Content className={dialogContent}>
            <div className={dialogHeader}>
              <ArkDialog.Title className={dialogTitle}>{title}</ArkDialog.Title>
              <ArkDialog.CloseTrigger asChild>
                <Button
                  variant="ghost"
                  tone="neutral"
                  size="sm"
                  iconOnly
                  aria-label="Close dialog"
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </ArkDialog.CloseTrigger>
            </div>
            {description && (
              <ArkDialog.Description className={dialogDescription}>
                {description}
              </ArkDialog.Description>
            )}
            <div>{children}</div>
            {footer && <div className={dialogFooter}>{footer}</div>}
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
