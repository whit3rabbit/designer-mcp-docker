'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { useMotionPreferences } from '../theme/motionConfig';

export interface ClickSparkProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of spark rays per click. */
  sparkCount?: number;
  /** Spark ray length in pixels. */
  sparkRadius?: number;
  /** Spark duration in milliseconds. */
  durationMs?: number;
}

interface SparkBurst {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

/**
 * Interactive click/tap spark burst container.
 * Renders token-colored SVG rays at pointer click coordinates and cleans up
 * automatically. Skips particles when `prefers-reduced-motion: reduce` is active.
 */
export function ClickSpark({
  sparkCount = 8,
  sparkRadius = 22,
  durationMs = 420,
  className,
  onClick,
  children,
  ...rest
}: ClickSparkProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useMotionPreferences();
  const [bursts, setBursts] = React.useState<SparkBurst[]>([]);
  const nextId = React.useRef(1);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const id = nextId.current++;
    const burst: SparkBurst = {
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      createdAt: Date.now(),
    };
    setBursts((prev) => [...prev, burst]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((item) => item.id !== id));
    }, durationMs + 50);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={clsx('relative', className)}
      {...rest}
    >
      {children}
      {!prefersReducedMotion && bursts.length > 0 && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
        >
          {bursts.map((burst) =>
            Array.from({ length: sparkCount }).map((_, idx) => {
              const angle = (idx * 360) / sparkCount;
              const rad = (angle * Math.PI) / 180;
              const x2 = burst.x + Math.cos(rad) * sparkRadius;
              const y2 = burst.y + Math.sin(rad) * sparkRadius;
              const colorToken = idx % 2 === 0 ? 'var(--color-primary)' : 'var(--chart-2)';
              return (
                <line
                  key={`${burst.id}-${idx}`}
                  x1={burst.x}
                  y1={burst.y}
                  x2={x2}
                  y2={y2}
                  stroke={colorToken}
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="opacity"
                    from="1"
                    to="0"
                    dur={`${durationMs}ms`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="x1"
                    from={burst.x}
                    to={x2}
                    dur={`${durationMs}ms`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="y1"
                    from={burst.y}
                    to={y2}
                    dur={`${durationMs}ms`}
                    fill="freeze"
                  />
                </line>
              );
            }),
          )}
        </svg>
      )}
    </div>
  );
}
