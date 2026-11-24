'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | 'ellipsis'> = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className,
}: PaginationProps) {
  const pages = getPageNumbers(page, Math.max(1, pageCount));

  return (
    <nav
      aria-label="Pagination"
      className={clsx('flex flex-wrap items-center justify-between gap-3', className)}
    >
      {onPageSizeChange && pageSize ? (
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="rd-page-size" style={{ color: 'var(--color-text-muted)' }}>
            Rows per page
          </label>
          <select
            id="rd-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="h-8 border px-2 text-xs"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <AppIcon name="chevron-left" size={14} className="rtl:rotate-180" />
        </Button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`e-${idx}`}
              style={{ color: 'var(--color-text-muted)' }}
              className="px-1.5 text-xs"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'solid' : 'ghost'}
              tone={p === page ? 'primary' : 'neutral'}
              size="xs"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className="tabular-nums min-w-7 px-2"
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <AppIcon name="chevron-right" size={14} className="rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  );
}
