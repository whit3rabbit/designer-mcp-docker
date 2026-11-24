'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { InputGroup } from './Input';

export interface CountryDialCode {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export const DEFAULT_COUNTRIES: CountryDialCode[] = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
];

export interface PhoneValue {
  countryCode: string;
  dialCode: string;
  number: string;
}

export interface PhoneInputProps {
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  countries?: CountryDialCode[];
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * International Phone Input with country flag & dial code (Ecme / Metronic / Steex / Cuba).
 */
export function PhoneInput({
  value,
  onChange,
  countries = DEFAULT_COUNTRIES,
  invalid = false,
  disabled = false,
  placeholder = '(555) 234-5678',
  className,
}: PhoneInputProps) {
  const handleCountryChange = (code: string) => {
    const match = countries.find((c) => c.code === code);
    if (!match) return;
    onChange({ ...value, countryCode: match.code, dialCode: match.dial });
  };

  return (
    <InputGroup invalid={invalid} className={className}>
      <select
        aria-label="Country dial code"
        value={value.countryCode}
        disabled={disabled}
        onChange={(e) => handleCountryChange(e.target.value)}
        style={{
          backgroundColor: 'var(--color-canvas)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        className="h-[38px] shrink-0 cursor-pointer border-e px-2.5 text-xs font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-55"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        aria-label="Phone number"
        disabled={disabled}
        value={value.number}
        placeholder={placeholder}
        onChange={(e) => onChange({ ...value, number: e.target.value.replace(/[^\d\s()-]/g, '') })}
        style={{ color: 'var(--color-text)' }}
        className={clsx(
          'h-[38px] min-w-0 flex-1 bg-transparent px-3 text-sm placeholder:text-[var(--color-text-muted)]',
          'disabled:cursor-not-allowed disabled:opacity-55',
        )}
      />
    </InputGroup>
  );
}
