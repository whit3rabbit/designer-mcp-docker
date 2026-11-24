import * as React from 'react';
import { useReducedMotion, type Transition, type Variants } from 'motion/react';

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 26,
  mass: 1,
};

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const REDUCED_TRANSITION: Transition = {
  duration: 0.01,
};

export const FADE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const FADE_ONLY_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Returns the user's reduced-motion preference and helper utilities
 * for selecting Motion transitions and variants safely.
 */
export function useMotionPreferences() {
  const motionReduced = useReducedMotion();
  const [mediaReduced, setMediaReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setMediaReduced(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const prefersReducedMotion = Boolean(motionReduced || mediaReduced);

  const getTransition = React.useCallback(
    (transition: Transition = SPRING_GENTLE): Transition =>
      prefersReducedMotion ? REDUCED_TRANSITION : transition,
    [prefersReducedMotion],
  );

  return {
    prefersReducedMotion,
    getTransition,
    variants: prefersReducedMotion ? FADE_ONLY_VARIANTS : FADE_UP_VARIANTS,
  };
}
