'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion, type Transition, type Variants } from 'motion/react';

export interface InViewProps {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  once?: boolean;
  amount?: 'some' | 'all' | number;
  className?: string;
}

const DEFAULT_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function InView({
  children,
  variants = DEFAULT_VARIANTS,
  transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  once = true,
  amount = 0.15,
  className,
}: InViewProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
