'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cn, FOCUS_RING } from '../theme/cn';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
}: TabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <BaseTabs.Root
      defaultValue={initial}
      value={value}
      onValueChange={(val) => {
        if (val !== null && onValueChange) {
          onValueChange(String(val));
        }
      }}
      className={cn('flex flex-col gap-4', className)}
    >
      <BaseTabs.List
        className={cn(
          'relative inline-flex w-fit items-center gap-1 rounded-[var(--radius-md)]',
          'border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-1',
        )}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'relative z-10 inline-flex items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium',
              'text-[var(--color-text-muted)] transition-colors duration-150 cursor-pointer select-none',
              'hover:text-[var(--color-text)]',
              'data-[selected]:bg-[var(--color-surface)] data-[selected]:text-[var(--color-text)] data-[selected]:shadow-xs',
              'disabled:pointer-events-none disabled:opacity-40',
              FOCUS_RING,
            )}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="rounded-full bg-[var(--color-primary-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                {item.badge}
              </span>
            )}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>

      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value} className="outline-none">
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
