'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { clsx } from 'clsx';

export type TabsVariant = 'underline' | 'pills';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  orientation = 'horizontal',
  className,
}: TabsProps) {
  const initialValue = defaultValue ?? items[0]?.value;

  return (
    <BaseTabs.Root
      value={value}
      defaultValue={value === undefined ? initialValue : undefined}
      onValueChange={(val) => onValueChange?.(String(val))}
      orientation={orientation}
      className={clsx('bui-tabs', className)}
    >
      <BaseTabs.List className={clsx('bui-tabs-list', `bui-tabs-list--${variant}`)}>
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="bui-tabs-tab"
          >
            {item.icon}
            <span>{item.label}</span>
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="bui-tabs-indicator" />
      </BaseTabs.List>

      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value} className="bui-tabs-panel">
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
