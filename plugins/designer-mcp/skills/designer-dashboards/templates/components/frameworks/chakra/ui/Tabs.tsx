import * as React from 'react';
import { Tabs as ChakraTabs } from '@chakra-ui/react';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  fitted?: boolean;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  fitted = false,
}: TabsProps) {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <ChakraTabs.Root
      value={value}
      defaultValue={value === undefined ? initial : undefined}
      onValueChange={(details) => onValueChange?.(details.value)}
      fitted={fitted}
      variant="line"
    >
      <ChakraTabs.List
        borderBottomWidth="1px"
        borderColor="var(--color-border)"
        gap={1}
      >
        {items.map((item) => (
          <ChakraTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            color="var(--color-text-muted)"
            fontWeight="medium"
            fontSize="sm"
            px={3}
            py={2}
            display="inline-flex"
            alignItems="center"
            gap={2}
            _selected={{
              color: 'var(--color-primary)',
              borderBottomWidth: '2px',
              borderColor: 'var(--color-primary)',
            }}
            _focusVisible={{
              outline: '2px solid var(--color-primary)',
              outlineOffset: '-2px',
            }}
          >
            {item.icon}
            {item.label}
          </ChakraTabs.Trigger>
        ))}
      </ChakraTabs.List>

      {items.map((item) => (
        <ChakraTabs.Content key={item.value} value={item.value} pt={4}>
          {item.content}
        </ChakraTabs.Content>
      ))}
    </ChakraTabs.Root>
  );
}
