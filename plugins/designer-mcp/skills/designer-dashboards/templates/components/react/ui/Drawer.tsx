'use client';

import * as React from 'react';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, description, children }: DrawerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: 'var(--z-drawer)' }}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[var(--color-scrim)]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          zIndex: 'var(--z-modal)',
        }}
        className="relative flex h-full w-full max-w-md flex-col border-s shadow-xl"
      >
        <header
          style={{ borderColor: 'var(--color-border)' }}
          className="flex items-start justify-between gap-3 border-b px-5 py-4"
        >
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && (
              <p style={{ color: 'var(--color-text-muted)' }} className="mt-0.5 text-xs">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <AppIcon name="x" size={16} />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'primary' | 'error' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'error',
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-[var(--color-scrim)]" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="relative w-full max-w-md border p-6"
      >
        <h2 id="confirm-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          style={{ color: 'var(--color-text-muted)' }}
          className="mt-2 text-sm"
        >
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" tone="neutral" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            tone={tone}
            size="sm"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
