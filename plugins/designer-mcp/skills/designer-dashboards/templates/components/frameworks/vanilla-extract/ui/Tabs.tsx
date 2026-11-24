import * as React from 'react';
import { Tabs as ArkTabs } from '@ark-ui/react/tabs';
import { tabsContent, tabsList, tabsTrigger } from './ui.css';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ items, value, defaultValue, onValueChange }: TabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <ArkTabs.Root
      value={value}
      defaultValue={initial}
      onValueChange={(details) => onValueChange?.(details.value)}
    >
      <ArkTabs.List className={tabsList}>
        {items.map((item) => (
          <ArkTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={tabsTrigger}
          >
            {item.label}
          </ArkTabs.Trigger>
        ))}
      </ArkTabs.List>
      {items.map((item) => (
        <ArkTabs.Content key={item.value} value={item.value} className={tabsContent}>
          {item.content}
        </ArkTabs.Content>
      ))}
    </ArkTabs.Root>
  );
}
