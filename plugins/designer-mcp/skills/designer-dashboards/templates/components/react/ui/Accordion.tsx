'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';

interface AccordionContextValue {
  openKeys: string[];
  toggle: (key: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  className?: string;
  children: React.ReactNode;
}

export function Accordion({
  type = 'single',
  defaultValue = [],
  className,
  children,
}: AccordionProps) {
  const [openKeys, setOpenKeys] = React.useState<string[]>(defaultValue);

  const toggle = React.useCallback(
    (key: string) => {
      setOpenKeys((prev) => {
        const exists = prev.includes(key);
        if (type === 'single') return exists ? [] : [key];
        return exists ? prev.filter((k) => k !== key) : [...prev, key];
      });
    },
    [type],
  );

  return (
    <AccordionContext.Provider value={{ openKeys, toggle }}>
      <div
        style={{
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
        }}
        className={clsx('divide-y divide-[var(--color-border)] border', className)}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  title,
  children,
}: {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be used inside <Accordion>');
  const open = ctx.openKeys.includes(value);
  const id = React.useId();

  return (
    <div>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => ctx.toggle(value)}
        style={{ color: 'var(--color-text)' }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-start text-sm font-semibold"
      >
        <span>{title}</span>
        <AppIcon
          name="chevron-down"
          size={16}
          className={clsx('shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          id={`${id}-content`}
          role="region"
          aria-labelledby={`${id}-trigger`}
          style={{ color: 'var(--color-text-muted)' }}
          className="px-5 pb-4 text-xs leading-relaxed"
        >
          {children}
        </div>
      )}
    </div>
  );
}
