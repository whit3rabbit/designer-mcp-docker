'use client';

import * as React from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface NumberTickerProps {
  value: number;
  startValue?: number;
  direction?: 'up' | 'down';
  delay?: number;
  decimalPlaces?: number;
  format?: 'number' | 'currency' | 'percent';
  currency?: string;
  locale?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function formatNumber(
  num: number,
  decimalPlaces: number,
  format: NumberTickerProps['format'],
  currency: string,
  locale?: string,
): string {
  if (format === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(num);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(num / 100);
  }
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(num.toFixed(decimalPlaces)));
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  decimalPlaces = 0,
  format = 'number',
  currency = 'USD',
  locale,
  prefix = '',
  suffix = '',
  className,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const initial = direction === 'down' ? value : startValue;
  const target = direction === 'down' ? startValue : value;

  const motionValue = useMotionValue(initial);
  const springValue = useSpring(motionValue, {
    damping: 55,
    stiffness: 110,
  });

  const [display, setDisplay] = React.useState<string>(() =>
    formatNumber(prefersReducedMotion ? value : initial, decimalPlaces, format, currency, locale),
  );

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(formatNumber(value, decimalPlaces, format, currency, locale));
      return;
    }
    if (!isInView) return;

    const timer = window.setTimeout(() => {
      motionValue.set(target);
    }, delay * 1000);

    return () => window.clearTimeout(timer);
  }, [isInView, delay, target, value, motionValue, prefersReducedMotion, decimalPlaces, format, currency, locale]);

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplay(formatNumber(latest, decimalPlaces, format, currency, locale));
    });
    return () => unsubscribe();
  }, [springValue, prefersReducedMotion, decimalPlaces, format, currency, locale]);

  return (
    <span
      ref={ref}
      className={cn('inline-block tabular-nums tracking-tight', className)}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
