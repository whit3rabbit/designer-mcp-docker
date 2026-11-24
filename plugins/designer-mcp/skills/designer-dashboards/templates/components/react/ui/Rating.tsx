'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  label?: string;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  label = 'Rating',
  className,
}: RatingProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div role="radiogroup" aria-label={label} className={clsx('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, idx) => {
        const star = idx + 1;
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={Math.round(value) === star}
            aria-label={`${star} of ${max} stars`}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(star)}
            style={{ color: filled ? 'var(--color-warning)' : 'var(--color-border)' }}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
