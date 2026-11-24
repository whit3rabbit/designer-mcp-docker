'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  unit = '',
  disabled = false,
  className,
}: SliderProps) {
  const id = React.useId();

  return (
    <div className={clsx('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label htmlFor={id} style={{ color: 'var(--color-text)' }} className="font-medium">
              {label}
            </label>
          )}
          {showValue && (
            <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums font-medium">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: 'var(--color-primary)' }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-55"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  RangeSlider (Dual-thumb range slider — shadcn / Ecme / Vuexy / Steex)     */
/* -------------------------------------------------------------------------- */

export interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  minGap?: number;
  label?: string;
  unit?: string;
  showInputs?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  label,
  unit = '',
  showInputs = false,
  disabled = false,
  className,
}: RangeSliderProps) {
  const [low, high] = value;
  const span = Math.max(1, max - min);
  const startPct = ((low - min) / span) * 100;
  const endPct = ((high - min) / span) * 100;

  const updateLow = (next: number) => {
    const clamped = Math.min(Math.max(min, next), high - minGap);
    onChange([clamped, high]);
  };

  const updateHigh = (next: number) => {
    const clamped = Math.max(Math.min(max, next), low + minGap);
    onChange([low, clamped]);
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        {label && (
          <span style={{ color: 'var(--color-text)' }} className="font-medium">
            {label}
          </span>
        )}
        <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums ms-auto font-medium">
          {low}
          {unit} – {high}
          {unit}
        </span>
      </div>

      <div className="relative flex h-6 items-center">
        <div
          style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-full)' }}
          className="relative h-2 w-full overflow-hidden"
        >
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              insetInlineStart: `${startPct}%`,
              width: `${Math.max(0, endPct - startPct)}%`,
            }}
            className="absolute top-0 bottom-0"
          />
        </div>
        <input
          type="range"
          aria-label={label ? `${label} minimum` : 'Minimum value'}
          min={min}
          max={max}
          step={step}
          value={low}
          disabled={disabled}
          onChange={(e) => updateLow(Number(e.target.value))}
          style={{ accentColor: 'var(--color-primary)' }}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-surface)] [&::-webkit-slider-thumb]:bg-[var(--color-primary)] [&::-webkit-slider-thumb]:shadow-sm"
        />
        <input
          type="range"
          aria-label={label ? `${label} maximum` : 'Maximum value'}
          min={min}
          max={max}
          step={step}
          value={high}
          disabled={disabled}
          onChange={(e) => updateHigh(Number(e.target.value))}
          style={{ accentColor: 'var(--color-primary)' }}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-surface)] [&::-webkit-slider-thumb]:bg-[var(--color-primary)] [&::-webkit-slider-thumb]:shadow-sm"
        />
      </div>

      {showInputs && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            aria-label={label ? `${label} minimum input` : 'Minimum'}
            min={min}
            max={high - minGap}
            step={step}
            value={low}
            disabled={disabled}
            onChange={(e) => updateLow(Number(e.target.value))}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="tabular-nums h-8 border px-2.5 text-xs"
          />
          <input
            type="number"
            aria-label={label ? `${label} maximum input` : 'Maximum'}
            min={low + minGap}
            max={max}
            step={step}
            value={high}
            disabled={disabled}
            onChange={(e) => updateHigh(Number(e.target.value))}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="tabular-nums h-8 border px-2.5 text-xs"
          />
        </div>
      )}
    </div>
  );
}
