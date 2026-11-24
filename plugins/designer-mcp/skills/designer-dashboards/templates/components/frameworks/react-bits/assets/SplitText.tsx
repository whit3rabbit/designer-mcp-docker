'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { EASE_OUT_EXPO, useMotionPreferences } from '../theme/motionConfig';

export interface SplitTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  splitBy?: 'words' | 'chars';
  staggerMs?: number;
  delayMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated text reveal component splitting by words or characters.
 * Renders immediately without motion when `prefers-reduced-motion: reduce` is active.
 */
export function SplitText({
  text,
  as: Tag = 'h2',
  splitBy = 'words',
  staggerMs = 40,
  delayMs = 0,
  className,
  style,
}: SplitTextProps) {
  const { prefersReducedMotion } = useMotionPreferences();

  if (prefersReducedMotion) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const units = splitBy === 'chars' ? Array.from(text) : text.split(' ');

  return (
    <Tag className={clsx('inline-flex flex-wrap gap-x-[0.28em]', className)} style={style} aria-label={text}>
      {units.map((unit, idx) => (
        <span key={`${unit}-${idx}`} className="inline-block overflow-hidden" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: '0.65em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: EASE_OUT_EXPO,
              delay: (delayMs + idx * staggerMs) / 1000,
            }}
          >
            {unit === ' ' ? '\u00A0' : unit}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
