'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'start' | 'end';
  children: React.ReactNode;
}

const SIDE_CLASSES = {
  top: 'bottom-full start-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full start-1/2 -translate-x-1/2 mt-1.5',
  start: 'end-full top-1/2 -translate-y-1/2 me-1.5',
  end: 'start-full top-1/2 -translate-y-1/2 ms-1.5',
};

export function Tooltip({ content, side = 'top', children }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const id = React.useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && (
        <span
          id={id}
          role="tooltip"
          style={{
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 'var(--z-tooltip)',
          }}
          className={clsx(
            'pointer-events-none absolute whitespace-nowrap px-2.5 py-1 text-[11px] font-medium',
            SIDE_CLASSES[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
