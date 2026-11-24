'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}

const SIZE_CLASS: Record<NonNullable<DialogProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  children,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="modal"
    >
      <div
        className={clsx(
          'modal-box bg-base-100 text-base-content border border-[var(--color-border)]',
          SIZE_CLASS[size],
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 id={titleId} className="text-lg font-semibold leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p id={descId} className="text-sm text-[var(--color-text-muted)] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-ghost btn-sm btn-square shrink-0"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer && <div className="modal-action">{footer}</div>}
      </div>

      {closeOnBackdrop && (
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose} aria-label="Close dialog backdrop">
            close
          </button>
        </form>
      )}
    </dialog>
  );
}
