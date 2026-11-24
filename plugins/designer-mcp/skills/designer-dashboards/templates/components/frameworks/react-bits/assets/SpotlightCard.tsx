'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { useMotionPreferences } from '../theme/motionConfig';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spotlight tint color (defaults to OpenDesign primary token). */
  spotlightColor?: string;
  /** Spotlight radius in pixels. */
  radius?: number;
}

/**
 * Interactive cursor-tracking radial spotlight card.
 * Uses CSS custom properties (`--spotlight-x`, `--spotlight-y`) so it works
 * cleanly in both Tailwind and plain CSS, and respects `prefers-reduced-motion`.
 */
export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard(
    {
      spotlightColor = 'color-mix(in oklch, var(--color-primary) 16%, transparent)',
      radius = 420,
      className,
      style,
      onPointerMove,
      onPointerLeave,
      children,
      ...rest
    },
    ref,
  ) {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const { prefersReducedMotion } = useMotionPreferences();
    const [coords, setCoords] = React.useState<{ x: string; y: string; active: boolean }>({
      x: '50%',
      y: '50%',
      active: false,
    });

    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      if (prefersReducedMotion || !innerRef.current) return;
      const rect = innerRef.current.getBoundingClientRect();
      setCoords({
        x: `${Math.round(e.clientX - rect.left)}px`,
        y: `${Math.round(e.clientY - rect.top)}px`,
        active: true,
      });
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      setCoords((prev) => ({ ...prev, active: false }));
    };

    return (
      <div
        ref={innerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={clsx('rb-spotlight-card relative overflow-hidden border transition-colors', className)}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--color-text)',
          ['--spotlight-x' as string]: coords.x,
          ['--spotlight-y' as string]: coords.y,
          ...style,
        }}
        {...rest}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: coords.active || prefersReducedMotion ? (coords.active ? 1 : 0.35) : 0,
            background: prefersReducedMotion
              ? `radial-gradient(${radius}px circle at 50% 0%, ${spotlightColor}, transparent 75%)`
              : `radial-gradient(${radius}px circle at ${coords.x} ${coords.y}, ${spotlightColor}, transparent 70%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);
