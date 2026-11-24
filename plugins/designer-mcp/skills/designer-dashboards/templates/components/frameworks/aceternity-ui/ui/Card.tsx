'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { SpotlightCard } from '../assets/Spotlight';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { spotlight = false, className, style, children, ...rest },
  ref,
) {
  if (spotlight) {
    return (
      <SpotlightCard className={clsx('p-0', className)} style={style} {...rest}>
        {children}
      </SpotlightCard>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx('border transition-colors', className)}
      {...rest}
    >
      {children}
    </div>
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
