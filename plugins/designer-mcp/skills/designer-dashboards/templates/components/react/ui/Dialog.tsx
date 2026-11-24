'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[var(--color-scrim)] backdrop-blur-[1px]"
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
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        className={clsx('relative z-10 flex max-h-[90vh] w-full flex-col border', SIZE_CLASSES[size])}
      >
        <header
          style={{ borderColor: 'var(--color-border)' }}
          className="flex items-start justify-between gap-3 border-b px-6 py-4"
        >
          <div className="min-w-0">
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

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <footer
            style={{ borderColor: 'var(--color-border)' }}
            className="flex items-center justify-end gap-2 border-t px-6 py-3.5"
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
