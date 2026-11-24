'use client';

import * as React from 'react';
import { Modal } from '@heroui/react';
import { clsx } from 'clsx';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: DialogProps) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <Modal.Container className={clsx('w-full', SIZE_CLASSES[size])}>
          <Modal.Dialog
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            className={clsx(
              'relative w-full rounded-[var(--radius-md)] border p-6 shadow-xl outline-none',
              className,
            )}
          >
            <Modal.CloseTrigger
              aria-label="Close dialog"
              className="absolute end-4 top-4 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
            />
            <Modal.Header className="pe-8">
              <Modal.Heading className="text-lg font-semibold text-[var(--color-text)]">
                {title}
              </Modal.Heading>
              {description ? (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
              ) : null}
            </Modal.Header>
            <Modal.Body className="mt-4">{children}</Modal.Body>
            {footer ? (
              <Modal.Footer className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--color-border)] pt-4">
                {footer}
              </Modal.Footer>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
