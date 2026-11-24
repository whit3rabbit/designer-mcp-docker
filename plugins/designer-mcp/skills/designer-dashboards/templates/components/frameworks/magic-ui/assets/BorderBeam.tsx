'use client';

import * as React from 'react';
import { useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export function BorderBeam({
  size = 160,
  duration = 10,
  delay = 0,
  borderWidth = 1.5,
  colorFrom = 'var(--color-primary)',
  colorTo = 'var(--color-info)',
  className,
}: BorderBeamProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={
        {
          '--beam-duration': `${duration}s`,
          '--beam-delay': `${delay}s`,
          borderWidth: `${borderWidth}px`,
          maskClip: 'padding-box, border-box',
          WebkitMaskClip: 'padding-box, border-box',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
          maskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
          WebkitMaskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent',
        className,
      )}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        className="animate-magic-beam absolute aspect-square"
      />
    </div>
  );
}
