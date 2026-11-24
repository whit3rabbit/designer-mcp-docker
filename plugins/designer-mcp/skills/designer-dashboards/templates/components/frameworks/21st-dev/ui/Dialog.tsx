'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <BaseDialog.Trigger render={trigger as React.ReactElement} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--color-text)_45%,transparent)] backdrop-blur-xs transition-opacity" />
        <BaseDialog.Popup
          className={twMerge(
            clsx(
              'fixed inset-x-0 top-1/2 z-50 mx-auto w-[min(92vw,32rem)] -translate-y-1/2',
              'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-start shadow-xl',
              className,
            ),
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <BaseDialog.Title className="text-base font-semibold text-[var(--color-text)]">
                {title}
              </BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="text-sm text-[var(--color-text-muted)]">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close
              aria-label="Close dialog"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <X className="size-4" aria-hidden="true" />
            </BaseDialog.Close>
          </div>
          <div className="mt-4">{children}</div>
          {footer ? (
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              {footer}
            </div>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
