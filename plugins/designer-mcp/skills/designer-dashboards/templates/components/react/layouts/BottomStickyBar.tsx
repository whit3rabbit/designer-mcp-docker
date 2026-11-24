'use client';

import * as React from 'react';

export interface BottomStickyBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky bottom action bar for Create/Edit forms.
 * Adapts cleanly across vertical, collapsed, and content-overlay shells.
 */
export function BottomStickyBar({ children, className = '' }: BottomStickyBarProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        zIndex: 'var(--z-sticky, 30)',
      }}
      className={`sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 print:hidden ${className}`}
    >
      {children}
    </div>
  );
}
