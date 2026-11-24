'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface MovingBorderBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  borderRadius?: string;
  innerClassName?: string;
}

/**
 * Container with an animated conic-gradient border powered by OpenDesign tokens.
 */
export function MovingBorderBox({
  children,
  duration = 4,
  borderRadius = 'var(--radius-lg)',
  className,
  innerClassName,
  style,
  ...rest
}: MovingBorderBoxProps) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <div
      className={clsx('relative overflow-hidden p-[1.5px]', className)}
      style={{
        borderRadius,
        backgroundColor: reducedMotion ? 'var(--color-primary-border)' : 'var(--color-border)',
        ...style,
      }}
      {...rest}
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[100%]"
          style={{
            background:
              'conic-gradient(from 0deg, var(--color-primary) 0deg, var(--color-chart-2) 70deg, transparent 140deg, transparent 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <div
        className={clsx('relative z-10 h-full w-full', innerClassName)}
        style={{
          borderRadius: `calc(${borderRadius} - 1.5px)`,
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
  borderRadius?: string;
}

/**
 * Action button wrapped in an animated conic-gradient border.
 */
export function MovingBorderButton({
  children,
  duration = 3.5,
  borderRadius = 'var(--radius-md)',
  className,
  type = 'button',
  disabled,
  ...rest
}: MovingBorderButtonProps) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'relative inline-flex items-center justify-center overflow-hidden p-[1.5px] font-medium transition-opacity disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      style={{
        borderRadius,
        backgroundColor: reducedMotion ? 'var(--color-primary-border)' : 'var(--color-border)',
      }}
      {...rest}
    >
      {!reducedMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[120%]"
          style={{
            background:
              'conic-gradient(from 0deg, var(--color-primary) 0deg, var(--color-chart-4) 90deg, transparent 160deg, transparent 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <span
        className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
        style={{
          borderRadius: `calc(${borderRadius} - 1.5px)`,
          backgroundColor: 'var(--color-surface-elevated)',
          color: 'var(--color-text)',
        }}
      >
        {children}
      </span>
    </button>
  );
}
