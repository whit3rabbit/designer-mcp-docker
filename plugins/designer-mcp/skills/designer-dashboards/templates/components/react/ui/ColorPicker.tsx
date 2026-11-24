'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { AppIcon } from '../../@core/icons/registry';

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  swatches?: string[];
  label?: string;
  className?: string;
}

const DEFAULT_SWATCH_TOKENS = [
  'var(--color-primary)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
];

/**
 * Token-aware ColorPicker with native color well, swatch grid, and copyable value.
 */
export function ColorPicker({
  value,
  onChange,
  swatches = DEFAULT_SWATCH_TOKENS,
  label = 'Pick color',
  className,
}: ColorPickerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${value}`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Clipboard access unavailable');
    }
  };

  return (
    <div className={clsx('space-y-2.5', className)}>
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
        className="flex items-center gap-2 border p-1.5"
      >
        <label
          aria-label={label}
          style={{ backgroundColor: value, borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }}
          className="relative size-7 shrink-0 cursor-pointer overflow-hidden border"
        >
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <input
          type="text"
          aria-label="Color value"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hex or CSS token"
          style={{ color: 'var(--color-text)' }}
          className="min-w-0 flex-1 bg-transparent px-1.5 font-mono text-xs focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy color value"
          style={{ color: 'var(--color-text-muted)' }}
          className="cursor-pointer p-1 hover:text-[var(--color-text)]"
        >
          <AppIcon name={copied ? 'check' : 'copy'} size={14} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {swatches.map((swatch) => {
          const active = value === swatch;
          return (
            <button
              key={swatch}
              type="button"
              aria-label={`Select color ${swatch}`}
              aria-pressed={active}
              onClick={() => onChange(swatch)}
              style={{
                backgroundColor: swatch,
                borderColor: active ? 'var(--color-text)' : 'var(--color-border)',
                borderRadius: 'var(--radius-full)',
              }}
              className={clsx(
                'size-6 cursor-pointer border-2 transition-transform hover:scale-110',
                active && 'ring-2 ring-[var(--color-primary-soft)]',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
