'use client';

import * as React from 'react';
import { Card as HeroCard } from '@heroui/react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'bordered',
    padding = 'md',
    title,
    description,
    headerAction,
    footer,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const surfaceBg =
    variant === 'elevated' ? 'var(--color-surface-elevated)' : 'var(--color-surface)';

  return (
    <HeroCard
      ref={ref}
      style={{
        backgroundColor: surfaceBg,
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={clsx(
        'rounded-[var(--radius-md)] border transition-colors',
        variant === 'elevated' && 'shadow-sm',
        PADDING_CLASSES[padding],
        className,
      )}
      {...rest}
    >
      {(title || description || headerAction) && (
        <HeroCard.Header className="flex items-start justify-between gap-4 pb-3">
          <div className="min-w-0 flex-1">
            {title ? (
              <HeroCard.Title className="text-base font-semibold text-[var(--color-text)]">
                {title}
              </HeroCard.Title>
            ) : null}
            {description ? (
              <HeroCard.Description className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                {description}
              </HeroCard.Description>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </HeroCard.Header>
      )}
      <HeroCard.Content className="p-0">{children}</HeroCard.Content>
      {footer ? (
        <HeroCard.Footer className="mt-4 border-t border-[var(--color-border)] pt-3">
          {footer}
        </HeroCard.Footer>
      ) : null}
    </HeroCard>
  );
});
