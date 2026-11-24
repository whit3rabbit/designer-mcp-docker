'use client';

import * as React from 'react';
import { clsx } from 'clsx';

interface DropdownContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function DropdownMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className={clsx('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownMenuTrigger must be used inside <DropdownMenu>');

  return (
    <span
      role="button"
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ctx.setOpen((v) => !v);
        }
      }}
      className={clsx('inline-flex cursor-pointer', className)}
    >
      {children}
    </span>
  );
}

export function DropdownMenuContent({
  align = 'end',
  className,
  children,
}: {
  align?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div
      role="menu"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-dropdown)',
      }}
      className={clsx(
        'absolute mt-1.5 min-w-44 border p-1',
        align === 'end' ? 'end-0' : 'start-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ color: 'var(--color-text-muted)' }}
      className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div role="separator" style={{ backgroundColor: 'var(--color-border)' }} className="my-1 h-px" />;
}

export function DropdownMenuItem({
  onSelect,
  tone = 'neutral',
  disabled = false,
  className,
  children,
}: {
  onSelect?: () => void;
  tone?: 'neutral' | 'error';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        ctx?.setOpen(false);
      }}
      style={{
        color: tone === 'error' ? 'var(--color-error)' : 'var(--color-text)',
        borderRadius: 'var(--radius-sm)',
      }}
      className={clsx(
        'flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-start text-xs font-medium transition-colors',
        'hover:bg-[var(--color-canvas)] disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
