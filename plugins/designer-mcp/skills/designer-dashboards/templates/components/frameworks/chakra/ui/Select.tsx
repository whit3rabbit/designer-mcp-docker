import * as React from 'react';
import {
  Field,
  Portal,
  Select as ChakraSelect,
  createListCollection,
} from '@chakra-ui/react';

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
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Select({
  label,
  'aria-label': ariaLabel,
  placeholder = 'Select an option',
  options,
  value,
  defaultValue,
  onValueChange,
  helperText,
  error,
  required = false,
  disabled = false,
  size = 'md',
}: SelectProps) {
  const collection = React.useMemo(
    () => createListCollection({ items: options }),
    [options],
  );

  return (
    <Field.Root invalid={Boolean(error)} required={required} disabled={disabled}>
      <ChakraSelect.Root
        collection={collection}
        size={size}
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
        <ChakraSelect.HiddenSelect />
        {label && (
          <ChakraSelect.Label fontSize="sm" fontWeight="medium" color="var(--color-text)">
            {label}
            {required && <Field.RequiredIndicator color="var(--color-error)" ms={1} />}
          </ChakraSelect.Label>
        )}
        <ChakraSelect.Control>
          <ChakraSelect.Trigger
            aria-label={ariaLabel}
            bg="var(--color-surface)"
            color="var(--color-text)"
            borderWidth="1px"
            borderColor={error ? 'var(--color-error)' : 'var(--color-border)'}
            borderRadius="var(--radius-md)"
            _focusVisible={{
              outline: '2px solid var(--color-primary)',
              outlineOffset: '1px',
            }}
          >
            <ChakraSelect.ValueText placeholder={placeholder} />
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup>
            <ChakraSelect.Indicator color="var(--color-text-muted)" />
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>
        <Portal>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content
              bg="var(--color-surface-elevated)"
              color="var(--color-text)"
              borderWidth="1px"
              borderColor="var(--color-border)"
              borderRadius="var(--radius-md)"
              boxShadow="lg"
            >
              {collection.items.map((item) => (
                <ChakraSelect.Item
                  key={item.value}
                  item={item}
                  _highlighted={{ bg: 'var(--color-surface-subtle)' }}
                >
                  {item.label}
                  <ChakraSelect.ItemIndicator color="var(--color-primary)" />
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
      {error ? (
        <Field.ErrorText fontSize="xs" color="var(--color-error)">
          {error}
        </Field.ErrorText>
      ) : helperText ? (
        <Field.HelperText fontSize="xs" color="var(--color-text-muted)">
          {helperText}
        </Field.HelperText>
      ) : null}
    </Field.Root>
  );
}
