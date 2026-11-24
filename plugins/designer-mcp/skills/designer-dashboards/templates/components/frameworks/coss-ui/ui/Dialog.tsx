'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn, FOCUS_RING } from '../theme/cn';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  maxWidthClass = 'max-w-md',
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger render={trigger as React.ReactElement} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-[var(--color-canvas)]/70 backdrop-blur-xs',
            'transition-opacity duration-150',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
          )}
        />
        <BaseDialog.Popup
          className={cn(
            'fixed start-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2',
            'rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-xl outline-none',
            'transition-all duration-150',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            maxWidthClass,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <BaseDialog.Title className="text-base font-semibold tracking-tight text-[var(--color-text)]">
                {title}
              </BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="text-xs text-[var(--color-text-muted)] mt-1">
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              aria-label="Close dialog"
              className={cn(
                'rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)]',
                'hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] cursor-pointer',
                FOCUS_RING,
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </BaseDialog.Close>
          </div>

          <div className="px-5 py-4 text-sm">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3.5">
              {footer}
            </div>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
