import * as React from 'react';
import { Portal } from '@ark-ui/react/portal';
import { Select as ArkSelect, createListCollection } from '@ark-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { fieldLabel, fieldWrapper, selectContent, selectItem, selectTrigger } from './ui.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
}: SelectProps) {
  const collection = React.useMemo(
    () => createListCollection({ items: options }),
    [options],
  );

  return (
    <ArkSelect.Root
      collection={collection}
      value={value !== undefined ? [value] : undefined}
      defaultValue={defaultValue !== undefined ? [defaultValue] : undefined}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next !== undefined) {
          onValueChange?.(next);
        }
      }}
      disabled={disabled}
    >
      <div className={fieldWrapper}>
        {label && <ArkSelect.Label className={fieldLabel}>{label}</ArkSelect.Label>}
        <ArkSelect.Control>
          <ArkSelect.Trigger className={selectTrigger}>
            <ArkSelect.ValueText placeholder={placeholder} />
            <ArkSelect.Indicator>
              <ChevronDown size={16} aria-hidden="true" />
            </ArkSelect.Indicator>
          </ArkSelect.Trigger>
        </ArkSelect.Control>
      </div>
      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content className={selectContent}>
            {collection.items.map((item) => (
              <ArkSelect.Item key={item.value} item={item} className={selectItem}>
                <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                <ArkSelect.ItemIndicator>
                  <Check size={14} aria-hidden="true" />
                </ArkSelect.ItemIndicator>
              </ArkSelect.Item>
            ))}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}
