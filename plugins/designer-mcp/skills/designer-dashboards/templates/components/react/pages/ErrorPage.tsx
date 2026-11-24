'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export type ErrorStatusCode = 401 | 403 | 404 | 500;

export interface ErrorPageProps {
  code?: ErrorStatusCode;
  title?: string;
  description?: string;
  homeHref?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const COPY: Record<ErrorStatusCode, { title: string; description: string; tone: 'warning' | 'error' | 'info' }> = {
  401: {
    title: 'Authentication required',
    description: 'Your session has expired or you need to sign in to access this workspace.',
    tone: 'warning',
  },
  403: {
    title: 'Access denied',
    description: 'Your current role does not have permission to view this resource.',
    tone: 'error',
  },
  404: {
    title: 'Page not found',
    description: 'The requested dashboard route does not exist or has been moved.',
    tone: 'info',
  },
  500: {
    title: 'Something went wrong',
    description: 'An unexpected server error occurred. Try refreshing or contact support.',
    tone: 'error',
  },
};

export function ErrorPage({
  code = 404,
  title,
  description,
  homeHref = '/dashboard/analytics',
  onAction,
  actionLabel = 'Return to Dashboard',
}: ErrorPageProps) {
  const defaults = COPY[code];

  return (
    <main
      style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text)' }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <Badge tone={defaults.tone} variant="tonal" className="tabular-nums mb-3">
        HTTP {code}
      </Badge>
      <h1
        style={{ fontWeight: 'var(--font-heading-weight)' }}
        className="text-3xl tracking-tight"
      >
        {title ?? defaults.title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)' }} className="mt-2 max-w-md text-sm">
        {description ?? defaults.description}
      </p>
      <div className="mt-6 flex items-center gap-3">
        {onAction ? (
          <Button variant="solid" tone="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : (
          <a href={homeHref}>
            <Button variant="solid" tone="primary">
              {actionLabel}
            </Button>
          </a>
        )}
      </div>
    </main>
  );
}
