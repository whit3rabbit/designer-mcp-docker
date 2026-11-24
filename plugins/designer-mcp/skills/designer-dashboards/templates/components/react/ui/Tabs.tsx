'use client';

import * as React from 'react';
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

  return (
    <div
      role="tablist"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: ctx.variant === 'segmented' ? 'var(--color-canvas)' : undefined,
        borderRadius: ctx.variant === 'segmented' ? 'var(--radius-md)' : undefined,
      }}
      className={clsx(
        'flex items-center gap-1',
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

  const activeStyle: React.CSSProperties =
    ctx.variant === 'underline'
      ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }
      : ctx.variant === 'pills'
        ? {
            backgroundColor: 'var(--color-primary-surface)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-md)',
          }
        : {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 'var(--radius-sm)',
          };

  const inactiveStyle: React.CSSProperties = {
    color: 'var(--color-text-muted)',
    borderColor: 'transparent',
  };

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      style={active ? activeStyle : inactiveStyle}
      className={clsx(
        'cursor-pointer px-3 py-2 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        ctx.variant === 'underline' && '-mb-px border-b-2',
        className,
      )}
    >
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
  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      className={clsx('pt-4', className)}
    >
      {children}
    </div>
  );
}
