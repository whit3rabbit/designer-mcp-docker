'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface AnimatedGradientTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AnimatedGradientText({
  children,
  className,
  style,
  ...rest
}: AnimatedGradientTextProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-full, 9999px)',
        ...style,
      }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 border px-3.5 py-1 text-xs font-medium shadow-xs transition-colors',
        className,
      )}
      {...rest}
    >
      <span
        style={{
          backgroundImage:
            'linear-gradient(90deg, var(--color-primary), var(--color-info), var(--color-primary))',
        }}
        className="animate-magic-gradient bg-clip-text font-semibold text-transparent"
      >
        {children}
      </span>
    </div>
  );
}
