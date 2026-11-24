import * as React from 'react';
import { Portal } from '@ark-ui/react/portal';
import { Select as ArkSelect, createListCollection } from '@ark-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  'aria-label'?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function Select({
  label,
  'aria-label': ariaLabel,
  placeholder = 'Select an option',
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  className,
}: SelectProps) {
  const collection = React.useMemo(
    () =>
      createListCollection({
        items: options,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
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
      name={name}
      className={className}
    >
      {label ? <ArkSelect.Label>{label}</ArkSelect.Label> : null}
      <ArkSelect.Control>
        <ArkSelect.Trigger aria-label={ariaLabel}>
          <ArkSelect.ValueText placeholder={placeholder} />
          <ArkSelect.Indicator>
            <ChevronDown size={16} aria-hidden />
          </ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>

      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content>
            {collection.items.map((item) => (
              <ArkSelect.Item key={item.value} item={item}>
                <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                <ArkSelect.ItemIndicator>
                  <Check size={14} aria-hidden />
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
