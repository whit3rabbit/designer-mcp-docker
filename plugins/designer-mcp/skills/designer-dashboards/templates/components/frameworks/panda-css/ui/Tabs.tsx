'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { css } from 'styled-system/css';

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
}

export function Tabs({ items, defaultValue, value, onValueChange }: TabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <BaseTabs.Root
      defaultValue={initial}
      value={value}
      onValueChange={onValueChange}
      className={css({ width: '100%' })}
    >
      <BaseTabs.List
        className={css({
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          bg: 'surfaceSubtle',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 'md',
        })}
      >
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={css({
              position: 'relative',
              zIndex: 1,
              paddingBlock: '6px',
              paddingInline: '14px',
              borderRadius: 'sm',
              fontSize: '13px',
              fontWeight: '500',
              color: 'textMuted',
              cursor: 'pointer',
              transitionProperty: 'color',
              transitionDuration: '150ms',
              '&[data-selected]': {
                color: 'text',
                fontWeight: '600',
              },
              _hover: { color: 'text' },
              _focusVisible: {
                outline: '2px solid token(colors.primary)',
                outlineOffset: '2px',
              },
              _disabled: { opacity: 0.45, cursor: 'not-allowed' },
            })}
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator
          className={css({
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: 'var(--active-tab-left)',
            width: 'var(--active-tab-width)',
            bg: 'surface',
            borderRadius: 'sm',
            boxShadow: 'sm',
            transitionProperty: 'left, width',
            transitionDuration: '180ms',
          })}
        />
      </BaseTabs.List>

      {items.map((item) => (
        <BaseTabs.Panel
          key={item.value}
          value={item.value}
          className={css({
            marginTop: '16px',
            outline: 'none',
          })}
        >
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
