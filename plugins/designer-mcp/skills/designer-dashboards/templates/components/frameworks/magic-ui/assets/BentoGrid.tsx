'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowRight } from 'lucide-react';
import { BorderBeam } from './BorderBeam';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

const GRID_COLUMNS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function BentoGrid({ columns = 3, className, children, ...rest }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[minmax(14rem,auto)] gap-4',
        GRID_COLUMNS[columns],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description: string;
  icon?: React.ReactNode;
  background?: React.ReactNode;
  cta?: string;
  href?: string;
  onAction?: () => void;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  beam?: boolean;
}

const COL_SPANS: Record<1 | 2 | 3, string> = {
  1: 'lg:col-span-1',
  2: 'md:col-span-2 lg:col-span-2',
  3: 'md:col-span-2 lg:col-span-3',
};

const ROW_SPANS: Record<1 | 2, string> = {
  1: 'row-span-1',
  2: 'md:row-span-2',
};

export function BentoCard({
  name,
  description,
  icon,
  background,
  cta,
  href,
  onAction,
  colSpan = 1,
  rowSpan = 1,
  beam = false,
  className,
  style,
  children,
  ...rest
}: BentoCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text)',
        ...style,
      }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden border p-6 transition-shadow duration-200 hover:shadow-md',
        COL_SPANS[colSpan],
        ROW_SPANS[rowSpan],
        className,
      )}
      {...rest}
    >
      {beam && <BorderBeam duration={12} size={180} />}

      {background && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-75 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        >
          {background}
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col gap-3">
        {icon && (
          <div
            style={{
              backgroundColor: 'var(--color-primary-surface)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex size-10 items-center justify-center border"
          >
            {icon}
          </div>
        )}

        <div className="space-y-1">
          <h3
            style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
            className="text-base tracking-tight"
          >
            {name}
          </h3>
          <p
            style={{ color: 'var(--color-text-muted)' }}
            className="max-w-prose text-xs leading-relaxed"
          >
            {description}
          </p>
        </div>

        {children && <div className="mt-2 flex-1">{children}</div>}
      </div>

      {(cta || href || onAction) && (
        <div className="relative z-10 mt-4 pt-2">
          {href ? (
            <a
              href={href}
              style={{ color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-transform duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <span>{cta ?? 'Explore'}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              style={{ color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-transform duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <span>{cta ?? 'Explore'}</span>
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
