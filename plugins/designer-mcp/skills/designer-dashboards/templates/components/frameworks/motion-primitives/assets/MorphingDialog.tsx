'use client';

import * as React from 'react';
import { AnimatePresence, MotionConfig, motion, type Transition } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface MorphingDialogContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MorphingDialogContext = React.createContext<MorphingDialogContextValue | null>(null);

function useMorphingDialog() {
  const ctx = React.useContext(MorphingDialogContext);
  if (!ctx) {
    throw new Error('MorphingDialog subcomponents must be used within <MorphingDialog>');
  }
  return ctx;
}

export interface MorphingDialogProps {
  children: React.ReactNode;
  transition?: Transition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MorphingDialog({
  children,
  transition = { type: 'spring', stiffness: 280, damping: 28 },
  open: controlledOpen,
  onOpenChange,
}: MorphingDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const uniqueId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const setIsOpen: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(isOpen) : value;
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, isOpen, onOpenChange],
  );

  return (
    <MorphingDialogContext.Provider value={{ isOpen, setIsOpen, uniqueId, triggerRef }}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export interface MorphingDialogTriggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogTrigger({ children, className, style }: MorphingDialogTriggerProps) {
  const { setIsOpen, uniqueId, triggerRef } = useMorphingDialog();

  return (
    <motion.button
      ref={triggerRef}
      type="button"
      layoutId={`morph-dialog-${uniqueId}`}
      onClick={() => setIsOpen(true)}
      aria-haspopup="dialog"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx(
        'text-start border shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--color-primary-border)] cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function MorphingDialogContainer({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, triggerRef } = useMorphingDialog();

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, setIsOpen, triggerRef]);

  return (
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <motion.div
            key="morph-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[var(--color-scrim)] backdrop-blur-[2px]"
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export interface MorphingDialogContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogContent({ children, className, style }: MorphingDialogContentProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`morph-dialog-${uniqueId}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`morph-title-${uniqueId}`}
      aria-describedby={`morph-desc-${uniqueId}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx(
        'relative z-10 w-full max-w-lg overflow-hidden border p-6 text-start',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.h3
      layoutId={`morph-title-${uniqueId}`}
      id={`morph-title-${uniqueId}`}
      className={clsx('text-lg font-semibold leading-snug', className)}
      style={{ color: 'var(--color-text)' }}
    >
      {children}
    </motion.h3>
  );
}

export function MorphingDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { uniqueId } = useMorphingDialog();
  return (
    <motion.p
      layoutId={`morph-desc-${uniqueId}`}
      id={`morph-desc-${uniqueId}`}
      className={clsx('mt-1 text-sm leading-relaxed', className)}
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </motion.p>
  );
}

export function MorphingDialogClose({
  className,
  ariaLabel = 'Close dialog',
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const { setIsOpen } = useMorphingDialog();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => setIsOpen(false)}
      style={{
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-muted)',
      }}
      className={clsx(
        'absolute top-4 end-4 inline-flex size-8 items-center justify-center transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] cursor-pointer',
        className,
      )}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  );
}
