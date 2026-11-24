'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { clsx } from 'clsx';

export type TextEffectPer = 'word' | 'char' | 'line';
export type TextEffectPreset = 'fade' | 'slide' | 'blur';

export interface TextEffectProps {
  children: string;
  per?: TextEffectPer;
  preset?: TextEffectPreset;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  trigger?: boolean;
}

const PRESET_VARIANTS: Record<TextEffectPreset, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slide: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(6px)', y: 4 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
  },
};

export function TextEffect({
  children,
  per = 'word',
  preset = 'slide',
  as = 'p',
  className,
  delay = 0,
  staggerDelay = 0.035,
  duration = 0.24,
  trigger = true,
}: TextEffectProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as];

  const segments = React.useMemo(() => {
    if (per === 'line') return children.split('\n');
    if (per === 'char') return children.split('');
    return children.split(/(\s+)/);
  }, [children, per]);

  if (prefersReduced) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = PRESET_VARIANTS[preset];

  return (
    <MotionTag
      className={clsx('inline-block', className)}
      variants={containerVariants}
      initial="hidden"
      animate={trigger ? 'visible' : 'hidden'}
      aria-label={children}
    >
      {segments.map((segment, index) => {
        if (per === 'word' && /^\s+$/.test(segment)) {
          return <React.Fragment key={`ws-${index}`}>{segment}</React.Fragment>;
        }
        return (
          <motion.span
            key={`${per}-${index}`}
            aria-hidden="true"
            variants={itemVariants}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className={per === 'line' ? 'block' : 'inline-block whitespace-pre'}
          >
            {segment}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}
