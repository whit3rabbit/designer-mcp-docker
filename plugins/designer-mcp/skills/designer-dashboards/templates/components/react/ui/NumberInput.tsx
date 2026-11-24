'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label = 'Quantity',
  disabled = false,
  className,
}: NumberInputProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('inline-flex h-[38px] items-center overflow-hidden border', className)}
    >
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - step))}
        style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
        className="flex h-full w-9 cursor-pointer items-center justify-center border-e text-sm font-semibold hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        −
      </button>
      <input
        type="number"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        style={{ color: 'var(--color-text)' }}
        className="tabular-nums h-full w-16 bg-transparent text-center text-sm font-medium outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + step))}
        style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
        className="flex h-full w-9 cursor-pointer items-center justify-center border-s text-sm font-semibold hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        +
      </button>
    </div>
  );
}
