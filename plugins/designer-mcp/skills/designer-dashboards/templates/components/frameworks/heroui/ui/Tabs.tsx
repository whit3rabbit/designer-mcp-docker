'use client';

import * as React from 'react';
import { Tabs as HeroTabs } from '@heroui/react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  badge?: React.ReactNode;
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
  const initialKey = defaultValue ?? items[0]?.id;

  return (
    <HeroTabs
      selectedKey={value}
      defaultSelectedKey={initialKey}
      onSelectionChange={(key) => {
        if (onValueChange) onValueChange(String(key));
      }}
      className={clsx('flex flex-col gap-4', className)}
    >
      <HeroTabs.ListContainer>
        <HeroTabs.List
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderColor: 'var(--color-border)',
          }}
          className="inline-flex flex-wrap gap-1 rounded-[var(--radius-md)] border p-1"
        >
          {items.map((item) => (
            <HeroTabs.Tab
              key={item.id}
              id={item.id}
              isDisabled={item.disabled}
              className={clsx(
                'inline-flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors outline-none',
                'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                'data-[selected=true]:bg-[var(--color-surface)] data-[selected=true]:text-[var(--color-text)] data-[selected=true]:shadow-xs',
                'focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]',
                'data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed',
              )}
            >
              <span>{item.label}</span>
              {item.badge}
            </HeroTabs.Tab>
          ))}
        </HeroTabs.List>
      </HeroTabs.ListContainer>

      {items.map((item) => (
        <HeroTabs.Panel key={item.id} id={item.id} className="outline-none">
          {item.content}
        </HeroTabs.Panel>
      ))}
    </HeroTabs>
  );
}
