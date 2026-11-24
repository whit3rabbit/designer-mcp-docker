'use client';

import * as React from 'react';
import { Input, type InputProps } from './Input';

export type MaskPreset = 'credit-card' | 'phone' | 'date' | 'expiry' | 'currency' | 'postal';

export interface MaskedInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  preset?: MaskPreset;
  mask?: string;
}

const PRESET_MASKS: Record<Exclude<MaskPreset, 'currency'>, string> = {
  'credit-card': '#### #### #### ####',
  phone: '(###) ###-####',
  date: '##/##/####',
  expiry: '##/##',
  postal: '#####-####',
};

function applyPatternMask(raw: string, pattern: string): string {
  const clean = raw.replace(/[^a-zA-Z0-9]/g, '');
  let result = '';
  let ci = 0;

  for (let pi = 0; pi < pattern.length && ci < clean.length; pi++) {
    const token = pattern[pi];
    const ch = clean[ci];
    if (token === '#') {
      if (/\d/.test(ch)) {
        result += ch;
        ci++;
      } else {
        ci++;
        pi--;
      }
    } else if (token === 'A') {
      if (/[a-zA-Z]/.test(ch)) {
        result += ch.toUpperCase();
        ci++;
      } else {
        ci++;
        pi--;
      }
    } else if (token === '*') {
      result += ch;
      ci++;
    } else {
      result += token;
    }
  }
  return result;
}

function formatCurrencyMask(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [whole = '', decimal] = cleaned.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formattedWhole}.${decimal.slice(0, 2)}` : formattedWhole;
}

function detectCardBrand(digits: string): string | null {
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return null;
}

/**
 * Zero-dependency masked input (Cuba / Vuexy / Materialize / Ecme / Steex).
 */
export function MaskedInput({
  value,
  onChange,
  preset = 'phone',
  mask,
  endAdornment,
  startAdornment,
  placeholder,
  ...rest
}: MaskedInputProps) {
  const effectiveMask = mask ?? (preset !== 'currency' ? PRESET_MASKS[preset] : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (preset === 'currency' && !mask) {
      onChange(formatCurrencyMask(raw));
      return;
    }
    onChange(effectiveMask ? applyPatternMask(raw, effectiveMask) : raw);
  };

  const cardBrand = preset === 'credit-card' ? detectCardBrand(value.replace(/\D/g, '')) : null;

  return (
    <Input
      value={value}
      onChange={handleChange}
      inputMode={preset === 'currency' || preset === 'credit-card' || preset === 'phone' ? 'numeric' : 'text'}
      placeholder={
        placeholder ??
        (preset === 'currency'
          ? '1,250.00'
          : preset === 'credit-card'
            ? '4532 •••• •••• ••••'
            : preset === 'expiry'
              ? 'MM/YY'
              : preset === 'date'
                ? 'MM/DD/YYYY'
                : '(555) 010-9988')
      }
      startAdornment={
        startAdornment ??
        (preset === 'currency' ? <span className="text-xs font-semibold">$</span> : undefined)
      }
      endAdornment={
        endAdornment ??
        (cardBrand ? (
          <span
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
            className="px-1.5 py-0.5 text-[10px] font-bold"
          >
            {cardBrand}
          </span>
        ) : undefined)
      }
      {...rest}
    />
  );
}
