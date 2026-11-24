'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_SNAPPY, useMotionPreferences } from '../theme/motionConfig';

export interface MagnetButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
  > {
  /** Maximum magnetic pull distance in pixels. */
  strength?: number;
  variant?: 'solid' | 'outline' | 'tonal';
}

/**
 * Magnetic cursor-attraction button with spring physics.
 * Disables pointer displacement when `prefers-reduced-motion: reduce` is active.
 */
export function MagnetButton({
  strength = 10,
  variant = 'solid',
  className,
  style,
  children,
  disabled,
  type = 'button',
  onPointerMove,
  onPointerLeave,
  ...rest
}: MagnetButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const { prefersReducedMotion } = useMotionPreferences();
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(e);
    if (prefersReducedMotion || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setOffset({
      x: Math.max(-1, Math.min(1, relX)) * strength,
      y: Math.max(-1, Math.min(1, relY)) * strength,
    });
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(e);
    setOffset({ x: 0, y: 0 });
  };

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-solid)' }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary-border)',
          }
        : {
            backgroundColor: 'var(--color-primary-surface)',
            color: 'var(--color-primary)',
          };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={prefersReducedMotion ? undefined : { x: offset.x, y: offset.y }}
      transition={SPRING_SNAPPY}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      style={{
        borderRadius: 'var(--radius-md)',
        ...variantStyle,
        ...style,
      }}
      className={clsx(
        'inline-flex h-10 cursor-pointer items-center justify-center gap-2 px-4 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
