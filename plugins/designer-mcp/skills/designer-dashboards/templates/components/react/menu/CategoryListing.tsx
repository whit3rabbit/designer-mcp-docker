'use client';

import * as React from 'react';
import { AppIcon } from '../@core/icons/registry';
import { type NavItem } from '../configs/navigation.config';
import { getCurrentNavItem, resolveLabel } from './useMenu';

export interface CategoryListingProps {
  /** Authority-filtered Nav IR tree */
  items: NavItem[];
  /** Current route pathname (e.g. '/apps' or '/ui') */
  pathname: string;
  onNavigate?: (path: string) => void;
  /** Optional translator; falls back to item.title when omitted */
  t?: (key: string) => string;
  searchPlaceholder?: string;
}

// Auto-generated category landing grid:
// derives a searchable 3-column card directory directly from `currentItem.children`
// so parent routes (/apps, /ui, /pages) stay synchronized with `navigation.config.ts`.
export function CategoryListing({
  items,
  pathname,
  onNavigate,
  t = (k) => k,
  searchPlaceholder = 'Filter section...',
}: CategoryListingProps) {
  const [query, setQuery] = React.useState('');
  const current = React.useMemo(
    () => getCurrentNavItem(items, pathname),
    [items, pathname],
  );
  const children = (current?.children ?? []).filter(
    (child) => child.type !== 'title' && !child.disabled,
  );

  const normalized = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!normalized) return children;
    return children.filter((child) => {
      const label = resolveLabel(child, t).toLowerCase();
      const desc = (child.description ?? '').toLowerCase();
      return label.includes(normalized) || desc.includes(normalized);
    });
  }, [children, normalized, t]);

  if (!current || children.length === 0) return null;

  return (
    <section aria-label={resolveLabel(current, t)} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            style={{ color: 'var(--color-text)' }}
            className="text-lg font-semibold tracking-tight"
          >
            {resolveLabel(current, t)}
          </h2>
          {current.description && (
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
              {current.description}
            </p>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <AppIcon
            name="search"
            size={15}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="w-full border py-1.5 ps-9 pe-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((child) => {
          const label = resolveLabel(child, t);
          const href = child.path ?? '#';
          return (
            <a
              key={child.key}
              href={href}
              target={child.isExternalLink ? '_blank' : undefined}
              rel={child.isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (onNavigate && child.path && !child.isExternalLink) {
                  e.preventDefault();
                  onNavigate(child.path);
                }
              }}
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
              className="group flex items-start gap-3.5 border p-4 transition-colors hover:border-[var(--color-primary)]"
            >
              <span
                style={{
                  backgroundColor: 'var(--color-primary-surface)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex size-10 shrink-0 items-center justify-center"
              >
                <AppIcon name={child.icon ?? 'layout-grid'} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{ color: 'var(--color-text)' }}
                    className="truncate text-sm font-semibold group-hover:text-[var(--color-primary)]"
                  >
                    {label}
                  </span>
                  {child.badge && (
                    <span
                      style={{
                        backgroundColor: `var(--color-${child.badge.color ?? 'primary'}-surface)`,
                        color: `var(--color-${child.badge.color ?? 'primary'})`,
                        borderRadius: 'var(--radius-full)',
                      }}
                      className="px-2 py-0.5 text-[11px] font-semibold"
                    >
                      {child.badge.value}
                    </span>
                  )}
                </div>
                {child.description && (
                  <p
                    style={{ color: 'var(--color-text-muted)' }}
                    className="mt-1 line-clamp-2 text-xs"
                  >
                    {child.description}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
