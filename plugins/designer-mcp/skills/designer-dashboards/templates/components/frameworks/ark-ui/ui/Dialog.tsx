import * as React from 'react';
import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { X } from 'lucide-react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  return (
    <ArkDialog.Root open={open} onOpenChange={(details) => onOpenChange?.(details.open)}>
      {trigger ? <ArkDialog.Trigger asChild>{trigger}</ArkDialog.Trigger> : null}
      <Portal>
        <ArkDialog.Backdrop />
        <ArkDialog.Positioner>
          <ArkDialog.Content>
            <ArkDialog.Title>{title}</ArkDialog.Title>
            {description ? <ArkDialog.Description>{description}</ArkDialog.Description> : null}
            <ArkDialog.CloseTrigger aria-label="Close dialog">
              <X size={16} aria-hidden />
            </ArkDialog.CloseTrigger>

            <div style={{ marginTop: '1rem' }}>{children}</div>

            {footer ? (
              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.625rem',
                }}
              >
                {footer}
              </div>
            ) : null}
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
