'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: 'h-8 text-xs',
  md: 'h-[38px] text-sm',
  lg: 'h-11 text-sm',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, size = 'md', startIcon, endIcon, id, className, style, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex w-full flex-col gap-1.5 text-start">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-3 flex items-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
            ...style,
          }}
          className={clsx(
            'w-full border px-3 transition-colors duration-150 placeholder:text-[var(--color-text-muted)]',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)]',
            'disabled:cursor-not-allowed disabled:opacity-55',
            SIZE_CLASSES[size],
            Boolean(startIcon) && 'ps-9',
            Boolean(endIcon) && 'pe-9',
            className,
          )}
          {...rest}
        />
        {endIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute end-3 flex items-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {endIcon}
          </span>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-medium"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" id={hintId} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
