'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BorderBeam } from '../assets/BorderBeam';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  beam?: boolean;
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { beam = false, elevated = false, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: elevated ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={cn('relative overflow-hidden border', className)}
      {...rest}
    >
      {beam && <BorderBeam duration={12} size={180} />}
      {children}
    </div>
  );
});

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...rest} />;
}

export function CardTitle({ className, style, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{ fontWeight: 'var(--font-heading-weight)', color: 'var(--color-text)', ...style }}
      className={cn('text-base leading-none tracking-tight', className)}
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
      className={cn('text-xs leading-relaxed', className)}
      {...rest}
    />
  );
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...rest} />;
}
