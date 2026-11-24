'use client';

import * as React from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  layout?: 'stacked' | 'horizontal';
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  layout = 'stacked',
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const enhancedChild = React.isValidElement<Record<string, unknown>>(children)
    ? React.cloneElement(children, {
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': describedBy ?? children.props['aria-describedby'],
      })
    : children;

  return (
    <div className={layout === 'horizontal' ? 'grid items-start gap-2 sm:grid-cols-3 sm:gap-4' : 'space-y-1.5'}>
      <label
        htmlFor={id}
        style={{ color: 'var(--color-text)' }}
        className={layout === 'horizontal' ? 'block pt-2 text-xs font-semibold' : 'block text-xs font-semibold'}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--color-error)' }} className="ms-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className={layout === 'horizontal' ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
        {enhancedChild}
        {error ? (
          <p id={errorId} role="alert" style={{ color: 'var(--color-error)' }} className="text-xs">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  label = 'Verification code',
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, char: string) => {
    const clean = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    onChange(next.join(''));
    if (clean && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`${label} digit ${i + 1}`}
          value={digit}
          onChange={(e) => setDigit(i, e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digit && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="tabular-nums h-11 w-11 border text-center text-base font-semibold"
        />
      ))}
    </div>
  );
}
