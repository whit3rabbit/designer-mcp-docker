'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { SpotlightCard } from '../assets/SpotlightCard';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable interactive React Bits radial spotlight hover effect. */
  spotlight?: boolean;
  /** Use elevated surface token instead of base surface. */
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { spotlight = false, elevated = false, className, style, ...rest },
  ref,
) {
  const surfaceBg = elevated ? 'var(--color-surface-elevated)' : 'var(--color-surface)';

  if (spotlight) {
    return (
      <SpotlightCard
        ref={ref}
        style={{ backgroundColor: surfaceBg, ...style }}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: surfaceBg,
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx('border', className)}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('flex flex-col gap-1.5 p-6', className)} {...rest} />;
}

export function CardTitle({ className, style, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{ fontWeight: 'var(--font-heading-weight)', color: 'var(--color-text)', ...style }}
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
