'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface BackgroundBeamsProps {
  className?: string;
}

const BEAM_PATHS = [
  'M-80 340 C 160 220, 420 420, 720 180 C 980 -20, 1180 180, 1460 40',
  'M-40 460 C 240 310, 480 480, 780 260 C 1020 90, 1240 240, 1500 120',
  'M-100 220 C 180 120, 440 280, 700 110 C 940 -40, 1200 110, 1480 10',
  'M-60 540 C 260 410, 520 520, 820 340 C 1060 190, 1260 320, 1520 210',
  'M20 600 C 300 460, 580 560, 880 400 C 1100 280, 1300 380, 1540 290',
];

/**
 * Decorative animated SVG light-beam backdrop wired to OpenDesign chart & primary tokens.
 */
export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const gradientId = React.useId();

  return (
    <div
      aria-hidden="true"
      className={clsx(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        className,
      )}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 600"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${gradientId}-a`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-b`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-chart-4)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {BEAM_PATHS.map((d, idx) => (
          <path
            key={d}
            d={d}
            stroke={idx % 2 === 0 ? `url(#${gradientId}-a)` : `url(#${gradientId}-b)`}
            strokeWidth="1.25"
            strokeOpacity="0.28"
          />
        ))}

        {!reducedMotion &&
          BEAM_PATHS.map((d, idx) => (
            <motion.path
              key={`pulse-${d}`}
              d={d}
              stroke={idx % 2 === 0 ? 'var(--color-primary)' : 'var(--color-chart-2)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              initial={{ pathLength: 0.14, pathOffset: 0, opacity: 0 }}
              animate={{
                pathOffset: [0, 1],
                opacity: [0, 0.65, 0],
              }}
              transition={{
                duration: 6 + idx * 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idx * 0.9,
              }}
            />
          ))}
      </svg>
    </div>
  );
}
