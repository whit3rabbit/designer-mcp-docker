'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type ProgressTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const HEIGHT_CLASS = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function Progress({
  value,
  max = 100,
  tone = 'primary',
  size = 'md',
  label,
  showValue = false,
  indeterminate = false,
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={clsx('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span style={{ color: 'var(--color-text)' }} className="font-medium">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        style={{
          backgroundColor: 'var(--color-canvas)',
          borderRadius: 'var(--radius-full)',
        }}
        className={clsx('w-full overflow-hidden', HEIGHT_CLASS[size])}
      >
        <div
          style={{
            width: indeterminate ? '40%' : `${pct}%`,
            backgroundColor: `var(--color-${tone})`,
            borderRadius: 'var(--radius-full)',
          }}
          className={clsx(
            'h-full transition-[width] duration-300',
            indeterminate && 'animate-pulse',
          )}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 56,
  strokeWidth = 5,
  tone = 'primary',
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tone?: ProgressTone;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`var(--color-${tone})`}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{ color: 'var(--color-text)' }}
        className="tabular-nums absolute text-[11px] font-semibold"
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
}
