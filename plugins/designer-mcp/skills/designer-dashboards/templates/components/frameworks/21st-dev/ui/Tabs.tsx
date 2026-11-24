'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  value: string;
  label: string;
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
  const initialValue = defaultValue ?? items[0]?.value;

  return (
    <BaseTabs.Root
      defaultValue={initialValue}
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === 'string' && onValueChange) {
          onValueChange(nextValue);
        }
      }}
      className={twMerge(clsx('flex flex-col gap-4', className))}
    >
      <BaseTabs.List
        className={clsx(
          'relative inline-flex w-fit flex-wrap items-center gap-1 rounded-[var(--radius-md)]',
          'border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-1',
        )}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={clsx(
              'relative z-10 cursor-pointer rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium',
              'text-[var(--color-text-muted)] transition-colors select-none',
              'hover:text-[var(--color-text)] data-[selected]:bg-[var(--color-surface)] data-[selected]:text-[var(--color-text)] data-[selected]:shadow-xs',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {item.label}
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
