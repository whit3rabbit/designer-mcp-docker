'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface SlidingNumberProps {
  value: number;
  padStart?: boolean;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function DigitColumn({ digit }: { digit: string }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced || !/\d/.test(digit)) {
    return <span className="inline-block">{digit}</span>;
  }

  return (
    <span className="relative inline-flex h-[1.2em] w-[0.62em] justify-center overflow-hidden align-top">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function SlidingNumber({
  value,
  padStart = false,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  className,
}: SlidingNumberProps) {
  const formatted = React.useMemo(() => {
    const fixed = decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value).toString();
    if (!padStart) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const padded = intPart.padStart(2, '0');
    return decPart !== undefined ? `${padded}.${decPart}` : padded;
  }, [value, padStart, decimalPlaces]);

  return (
    <span className={clsx('inline-flex items-baseline tabular-nums', className)}>
      {prefix && <span>{prefix}</span>}
      {formatted.split('').map((char, idx) => (
        <DigitColumn key={`pos-${formatted.length - idx}`} digit={char} />
      ))}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
