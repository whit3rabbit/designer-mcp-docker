import * as React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Tabs({ items, activeIndex = 0, onTabChange, className, style }: TabsProps) {
  return (
    <TabView
      activeIndex={activeIndex}
      onTabChange={(e) => onTabChange?.(e.index)}
      className={className}
      style={style}
    >
      {items.map((item) => (
        <TabPanel
          key={item.id}
          header={item.label}
          leftIcon={item.icon}
          disabled={item.disabled}
        >
          {item.content}
        </TabPanel>
      ))}
    </TabView>
  );
}
