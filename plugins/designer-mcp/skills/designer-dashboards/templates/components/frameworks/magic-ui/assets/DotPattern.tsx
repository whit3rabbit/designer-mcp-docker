'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  fade?: boolean;
}

export function DotPattern({
  width = 18,
  height = 18,
  cx = 1,
  cy = 1,
  cr = 1,
  fade = true,
  className,
  style,
  ...rest
}: DotPatternProps) {
  const patternId = React.useId();

  return (
    <svg
      aria-hidden="true"
      style={{
        color: 'var(--color-border)',
        ...(fade
          ? {
              maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
            }
          : undefined),
        ...style,
      }}
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
      {...rest}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
    </svg>
  );
}
