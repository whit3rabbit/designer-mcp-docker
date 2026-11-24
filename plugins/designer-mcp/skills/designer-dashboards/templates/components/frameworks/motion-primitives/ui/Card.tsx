'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { clsx } from 'clsx';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className, style, children, ...rest },
  ref,
) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      whileHover={interactive && !prefersReduced ? { y: -2 } : undefined}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx('rd-card border', interactive && 'rd-card-interactive', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('flex flex-col gap-1.5 p-6', className)} {...rest} />;
}

export function CardTitle({ className, style, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{ fontWeight: 'var(--font-heading-weight, 600)', color: 'var(--color-text)', ...style }}
      className={clsx('text-base leading-none tracking-tight', className)}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  style,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      style={{ color: 'var(--color-text-muted)', ...style }}
      className={clsx('text-xs leading-relaxed', className)}
      {...rest}
    />
  );
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-6 pt-0', className)} {...rest} />;
}

export function CardFooter({ className, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ borderColor: 'var(--color-border)', ...style }}
      className={clsx('flex items-center gap-2 border-t px-6 py-4', className)}
      {...rest}
    />
  );
}
