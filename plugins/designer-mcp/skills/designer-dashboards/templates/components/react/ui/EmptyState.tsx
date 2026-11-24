'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type EmptyIllustration =
  | 'no-data'
  | 'not-found'
  | 'access-denied'
  | 'search-empty'
  | 'error'
  | 'launch';

export interface EmptyStateProps {
  illustration?: EmptyIllustration;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  compact?: boolean;
}

function IllustrationSvg({ kind }: { kind: EmptyIllustration }) {
  if (kind === 'access-denied' || kind === 'error') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <circle cx="28" cy="28" r="24" fill="var(--color-error-surface)" />
        <path
          d="M28 16L38 20V28C38 34 33.5 38.8 28 41C22.5 38.8 18 34 18 28V20L28 16Z"
          stroke="var(--color-error)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M24 24L32 32M32 24L24 32" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'not-found' || kind === 'search-empty') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <circle cx="28" cy="28" r="24" fill="var(--color-warning-surface)" />
        <circle cx="26" cy="26" r="9" stroke="var(--color-warning)" strokeWidth="2" />
        <path d="M33 33L39 39" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'launch') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <circle cx="28" cy="28" r="24" fill="var(--color-success-surface)" />
        <path d="M28 16L34 28L28 34L22 28L28 16Z" stroke="var(--color-success)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M25 36L28 40L31 36" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="24" fill="var(--color-primary-surface)" />
      <rect x="17" y="19" width="22" height="18" rx="3" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M21 25H35M21 30H29" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  illustration = 'no-data',
  title = 'No data available',
  description = 'Try adjusting your filters or date range.',
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', compact ? 'py-6' : 'py-10')}>
      <div className="mb-3">
        <IllustrationSvg kind={illustration} />
      </div>
      <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">
        {title}
      </p>
      <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 max-w-xs text-xs">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
