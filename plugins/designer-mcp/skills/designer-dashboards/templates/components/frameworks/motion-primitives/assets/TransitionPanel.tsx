'use client';

import * as React from 'react';
import { AnimatePresence, motion, type Transition, type Variants } from 'motion/react';
import { clsx } from 'clsx';

export interface TransitionPanelProps {
  activeIndex: number;
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  variants?: Variants;
  mode?: 'wait' | 'popLayout' | 'sync';
}

const DEFAULT_VARIANTS: Variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function TransitionPanel({
  activeIndex,
  children,
  className,
  transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
  variants = DEFAULT_VARIANTS,
  mode = 'wait',
}: TransitionPanelProps) {
  const items = React.Children.toArray(children);
  const clampedIndex = Math.max(0, Math.min(activeIndex, items.length - 1));

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <AnimatePresence initial={false} mode={mode}>
        <motion.div
          key={clampedIndex}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
        >
          {items[clampedIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
