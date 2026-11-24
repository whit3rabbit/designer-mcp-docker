'use client';

import * as React from 'react';
import { Tabs as AntTabs, Segmented, type TabsProps as AntTabsProps } from 'antd';

export type TabsVariant = 'underline' | 'pills' | 'segmented';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  items: TabItem[];
  size?: AntTabsProps['size'];
  style?: React.CSSProperties;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  items,
  size = 'middle',
  style,
}: TabsProps) {
  const firstKey = items[0]?.key ?? '';
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? firstKey);
  const activeKey = value ?? uncontrolled;

  const handleChange = React.useCallback(
    (nextKey: string) => {
      if (value === undefined) setUncontrolled(nextKey);
      onValueChange?.(nextKey);
    },
    [value, onValueChange],
  );

  if (variant === 'segmented') {
    const activeItem = items.find((item) => item.key === activeKey);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
        <div>
          <Segmented
            value={activeKey}
            onChange={(val) => handleChange(String(val))}
            options={items.map((item) => ({
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ),
              value: item.key,
              disabled: item.disabled,
            }))}
          />
        </div>
        {activeItem?.children && <div>{activeItem.children}</div>}
      </div>
    );
  }

  return (
    <AntTabs
      activeKey={activeKey}
      onChange={handleChange}
      type={variant === 'pills' ? 'card' : 'line'}
      size={size}
      style={style}
      items={items.map((item) => ({
        key: item.key,
        label: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {item.icon}
            <span>{item.label}</span>
          </span>
        ),
        disabled: item.disabled,
        children: item.children,
      }))}
    />
  );
}
