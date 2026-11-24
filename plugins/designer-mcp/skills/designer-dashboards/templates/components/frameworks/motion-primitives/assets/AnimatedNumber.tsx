'use client';

import * as React from 'react';
import { useReducedMotion, useSpring, useMotionValueEvent, type SpringOptions } from 'motion/react';
import { clsx } from 'clsx';

export interface AnimatedNumberProps {
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  currency?: string;
  locale?: string;
  maximumFractionDigits?: number;
  springOptions?: SpringOptions;
  className?: string;
}

function formatNumber(
  val: number,
  format: AnimatedNumberProps['format'],
  currency: string,
  locale: string | undefined,
  maximumFractionDigits: number,
): string {
  if (format === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(val);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits,
    }).format(val / 100);
  }
  if (format === 'compact') {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(val);
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(val);
}

export function AnimatedNumber({
  value,
  format = 'number',
  currency = 'USD',
  locale,
  maximumFractionDigits = 0,
  springOptions = { stiffness: 120, damping: 20, mass: 0.8 },
  className,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion();
  const spring = useSpring(prefersReduced ? value : 0, springOptions);
  const [display, setDisplay] = React.useState(() =>
    formatNumber(prefersReduced ? value : 0, format, currency, locale, maximumFractionDigits),
  );

  React.useEffect(() => {
    if (prefersReduced) {
      spring.jump(value);
      setDisplay(formatNumber(value, format, currency, locale, maximumFractionDigits));
      return;
    }
    spring.set(value);
  }, [value, prefersReduced, spring, format, currency, locale, maximumFractionDigits]);

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(formatNumber(latest, format, currency, locale, maximumFractionDigits));
  });

  return <span className={clsx('tabular-nums', className)}>{display}</span>;
}
