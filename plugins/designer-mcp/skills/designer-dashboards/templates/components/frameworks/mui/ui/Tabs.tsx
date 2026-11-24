import * as React from 'react';
import { Box, Tab, Tabs as MuiTabs, type TabsProps as MuiTabsProps } from '@mui/material';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactElement;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps extends Omit<MuiTabsProps, 'value' | 'onChange'> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ items, value, defaultValue, onChange, sx, ...rest }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value ?? '');
  const activeValue = value ?? internal;
  const baseId = React.useId();

  const handleChange = (_event: React.SyntheticEvent, next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <Box>
      <MuiTabs
        value={activeValue}
        onChange={handleChange}
        sx={[
          {
            borderBottom: '1px solid var(--color-border)',
            minHeight: 42,
            '& .MuiTab-root': {
              minHeight: 42,
              textTransform: 'none',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              '&.Mui-selected': {
                color: 'var(--color-primary)',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-primary)',
            },
          },
          sx,
        ]}
        {...rest}
      >
        {items.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            disabled={item.disabled}
            id={`${baseId}-tab-${item.value}`}
            aria-controls={`${baseId}-panel-${item.value}`}
          />
        ))}
      </MuiTabs>
      {items.map((item) => (
        <Box
          key={item.value}
          role="tabpanel"
          hidden={activeValue !== item.value}
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          sx={{ pt: 2 }}
        >
          {activeValue === item.value ? item.content : null}
        </Box>
      ))}
    </Box>
  );
}
