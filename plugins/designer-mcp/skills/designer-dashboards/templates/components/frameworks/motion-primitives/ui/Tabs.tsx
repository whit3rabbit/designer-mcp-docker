'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx } from 'clsx';

export type TabsVariant = 'underline' | 'pills' | 'segmented';

interface TabsContextValue {
  value: string;
  setValue: (val: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  variant = 'underline',
  className,
  children,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolled;
  const baseId = React.useId();

  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue, variant, baseId }}>
      <div className={clsx('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsList must be used inside <Tabs>');

  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isRtl =
      listRef.current && getComputedStyle(listRef.current).direction === 'rtl';
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

    if (e.key !== nextKey && e.key !== prevKey) return;
    const triggers = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    if (triggers.length === 0) return;
    const currentIdx = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIdx === -1) return;

    e.preventDefault();
    const delta = e.key === nextKey ? 1 : -1;
    const nextIdx = (currentIdx + delta + triggers.length) % triggers.length;
    triggers[nextIdx].focus();
    triggers[nextIdx].click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: ctx.variant === 'segmented' ? 'var(--color-surface-subtle)' : undefined,
        borderRadius: ctx.variant === 'segmented' ? 'var(--radius-md)' : undefined,
      }}
      className={clsx(
        'relative flex items-center gap-1',
        ctx.variant === 'underline' && 'border-b',
        ctx.variant === 'segmented' && 'inline-flex border p-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
}: {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used inside <Tabs>');
  const active = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      style={{
        color: active
          ? ctx.variant === 'pills'
            ? 'var(--color-on-solid)'
            : 'var(--color-text)'
          : 'var(--color-text-muted)',
        borderRadius: ctx.variant !== 'underline' ? 'var(--radius-md)' : undefined,
      }}
      className={clsx(
        'relative z-10 px-3 py-2 text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 cursor-pointer select-none',
        className,
      )}
    >
      {active && ctx.variant === 'underline' && (
        <motion.span
          layoutId={`tab-indicator-${ctx.baseId}`}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{ backgroundColor: 'var(--color-primary)' }}
          className="absolute inset-x-0 bottom-0 h-0.5"
        />
      )}
      {active && ctx.variant === 'pills' && (
        <motion.span
          layoutId={`tab-indicator-${ctx.baseId}`}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}
          className="absolute inset-0 -z-10"
        />
      )}
      {active && ctx.variant === 'segmented' && (
        <motion.span
          layoutId={`tab-indicator-${ctx.baseId}`}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm, 6px)',
            boxShadow: 'var(--shadow-sm)',
          }}
          className="absolute inset-0 -z-10"
        />
      )}
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used inside <Tabs>');
  const active = ctx.value === value;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {active && (
        <motion.div
          key={value}
          role="tabpanel"
          id={`${ctx.baseId}-panel-${value}`}
          aria-labelledby={`${ctx.baseId}-tab-${value}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={clsx('mt-4', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
