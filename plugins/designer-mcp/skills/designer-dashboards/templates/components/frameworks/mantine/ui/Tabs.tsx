import * as React from 'react';
import {
  Tabs as MantineTabs,
  type TabsProps as MantineTabsProps,
} from '@mantine/core';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps extends Omit<MantineTabsProps, 'children'> {
  items: TabItem[];
}

export function Tabs({ items, variant = 'default', radius = 'md', styles, ...props }: TabsProps) {
  return (
    <MantineTabs
      variant={variant}
      radius={radius}
      styles={{
        list: {
          borderColor: 'var(--color-border)',
        },
        tab: {
          color: 'var(--color-text-muted)',
        },
        ...styles,
      }}
      {...props}
    >
      <MantineTabs.List>
        {items.map((item) => (
          <MantineTabs.Tab
            key={item.value}
            value={item.value}
            leftSection={item.icon}
            disabled={item.disabled}
          >
            {item.label}
          </MantineTabs.Tab>
        ))}
      </MantineTabs.List>

      {items.map((item) => (
        <MantineTabs.Panel key={item.value} value={item.value} pt="md">
          {item.content}
        </MantineTabs.Panel>
      ))}
    </MantineTabs>
  );
}
