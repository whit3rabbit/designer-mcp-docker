'use client';

import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { css } from 'styled-system/css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Select({
  label,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  'aria-label': ariaLabel,
}: SelectProps) {
  const labelId = React.useId();

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' })}>
      {label && (
        <span id={labelId} className={css({ fontSize: '13px', fontWeight: '500', color: 'text' })}>
          {label}
        </span>
      )}
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <BaseSelect.Trigger
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? ariaLabel ?? placeholder : undefined}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
            height: '38px',
            paddingInline: '12px',
            bg: 'surface',
            color: 'text',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 'md',
            fontFamily: 'sans',
            fontSize: '14px',
            cursor: 'pointer',
            _hover: { borderColor: 'primaryBorder' },
            _focusVisible: {
              outline: '2px solid token(colors.primary)',
              outlineOffset: '2px',
            },
            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon>
            <ChevronDown size={16} aria-hidden="true" className={css({ color: 'textMuted' })} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>

        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={6} alignItemWithTrigger={false}>
            <BaseSelect.Popup
              className={css({
                minWidth: 'var(--anchor-width)',
                padding: '4px',
                bg: 'surfaceElevated',
                color: 'text',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: 'md',
                boxShadow: 'md',
                zIndex: 50,
                outline: 'none',
              })}
            >
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingBlock: '8px',
                    paddingInline: '10px',
                    borderRadius: 'sm',
                    fontSize: '14px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    outline: 'none',
                    '&[data-highlighted]': {
                      bg: 'primarySurface',
                      color: 'primary',
                    },
                    '&[data-disabled]': {
                      opacity: 0.45,
                      cursor: 'not-allowed',
                    },
                  })}
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check size={14} aria-hidden="true" className={css({ color: 'primary' })} />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}
