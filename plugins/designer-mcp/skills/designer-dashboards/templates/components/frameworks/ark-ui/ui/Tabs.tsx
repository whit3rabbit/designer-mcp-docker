import * as React from 'react';
import { Tabs as ArkTabs } from '@ark-ui/react/tabs';

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
  className?: string;
}

export function Tabs({ items, value, defaultValue, onValueChange, className }: TabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <ArkTabs.Root
      value={value}
      defaultValue={value === undefined ? initial : undefined}
      onValueChange={(details) => onValueChange?.(details.value)}
      className={className}
    >
      <ArkTabs.List>
        {items.map((item) => (
          <ArkTabs.Trigger key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </ArkTabs.Trigger>
        ))}
        <ArkTabs.Indicator />
      </ArkTabs.List>
      {items.map((item) => (
        <ArkTabs.Content key={item.value} value={item.value}>
          {item.content}
        </ArkTabs.Content>
      ))}
    </ArkTabs.Root>
  );
}
