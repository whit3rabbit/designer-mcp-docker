'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { SPRING_SNAPPY, useMotionPreferences } from '../theme/motionConfig';

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
  const { prefersReducedMotion, getTransition } = useMotionPreferences();

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

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 'var(--z-modal, 50)' }}
        >
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={getTransition({ duration: 0.16 })}
            className="fixed inset-0 backdrop-blur-[2px]"
            style={{ backgroundColor: 'var(--color-scrim, oklch(0.15 0 0 / 0.55))' }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={getTransition(SPRING_SNAPPY)}
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
              className="flex items-start justify-between gap-3 border-b px-6 py-4 text-start"
            >
              <div className="min-w-0">
                <h2 className="text-base font-semibold">{title}</h2>
                {description && (
                  <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)' }}
                className="shrink-0 cursor-pointer p-1.5 transition-colors hover:opacity-80"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-start">{children}</div>
            {footer && (
              <footer
                style={{ borderColor: 'var(--color-border)' }}
                className="flex items-center justify-end gap-2 border-t px-6 py-4"
              >
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
