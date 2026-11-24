'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'elevated' | 'bordered' | 'compact';
}

export function Card({
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'elevated',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        'card bg-base-100 text-base-content',
        variant === 'elevated' && 'shadow-sm border border-[var(--color-border)]',
        variant === 'bordered' && 'card-border border-[var(--color-border)]',
        variant === 'compact' && 'card-sm border border-[var(--color-border)]',
        className,
      )}
      {...rest}
    >
      <div className="card-body gap-4">
        {(title || subtitle || headerAction) && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && <h3 className="card-title text-base font-semibold">{title}</h3>}
              {subtitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="card-actions justify-end pt-2 border-t border-[var(--color-border)]">{footer}</div>}
      </div>
    </div>
  );
}
