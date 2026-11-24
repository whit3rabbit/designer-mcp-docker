'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

export interface WidgetCardTab {
  id: string;
  label: string;
}

export interface WidgetCardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  skeletonVariant?: 'chart' | 'table' | 'list';
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  allowFullscreen?: boolean;
  allowPin?: boolean;
  collapsible?: boolean;
  onRefresh?: () => void;
  tabs?: WidgetCardTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  periodOptions?: string[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function WidgetCard({
  title,
  subtitle,
  headerAction,
  footer,
  loading = false,
  skeletonVariant = 'chart',
  empty = false,
  emptyTitle = 'No data available',
  emptyDescription = 'Try adjusting your filters or date range.',
  emptyAction,
  allowFullscreen = false,
  allowPin = false,
  collapsible = false,
  onRefresh,
  tabs,
  activeTab,
  onTabChange,
  periodOptions,
  selectedPeriod,
  onPeriodChange,
  className,
  children,
}: WidgetCardProps) {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  return (
    <section
      aria-label={title}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: pinned ? 'var(--color-primary-border)' : 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: fullscreen ? 'var(--z-modal)' : undefined,
      }}
      className={clsx(
        'rd-card flex flex-col border transition-shadow',
        fullscreen && 'fixed inset-4 overflow-auto',
        className,
      )}
    >
      <header
        style={{ borderColor: 'var(--color-border)' }}
        className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4"
      >
        <div className="min-w-0">
          <h2
            style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
            className="truncate text-base leading-snug"
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--color-text-muted)' }} className="mt-0.5 text-xs">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {periodOptions && periodOptions.length > 0 && (
            <div
              role="group"
              aria-label={`${title} period`}
              style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
              className="inline-flex border p-0.5"
            >
              {periodOptions.map((period) => {
                const active = period === (selectedPeriod ?? periodOptions[0]);
                return (
                  <button
                    key={period}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPeriodChange?.(period)}
                    style={{
                      backgroundColor: active ? 'var(--color-primary-surface)' : 'transparent',
                      color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    className="px-2 py-0.5 text-xs font-medium transition-colors"
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          )}
          {headerAction}
          {onRefresh && (
            <Button
              variant="ghost"
              tone="neutral"
              size="xs"
              iconOnly
              aria-label={`Refresh ${title}`}
              onClick={onRefresh}
            >
              <AppIcon name="refresh-cw" size={14} />
            </Button>
          )}
          {collapsible && (
            <Button
              variant="ghost"
              tone="neutral"
              size="xs"
              iconOnly
              aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              <AppIcon name={collapsed ? 'chevron-down' : 'chevron-up'} size={14} />
            </Button>
          )}
          {allowPin && (
            <Button
              variant={pinned ? 'tonal' : 'ghost'}
              tone={pinned ? 'primary' : 'neutral'}
              size="xs"
              iconOnly
              aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}
              aria-pressed={pinned}
              onClick={() => setPinned((p) => !p)}
            >
              <AppIcon name="pin" size={14} />
            </Button>
          )}
          {allowFullscreen && (
            <Button
              variant="ghost"
              tone="neutral"
              size="xs"
              iconOnly
              aria-label={fullscreen ? `Exit fullscreen for ${title}` : `Expand ${title}`}
              aria-pressed={fullscreen}
              onClick={() => setFullscreen((f) => !f)}
            >
              <AppIcon name={fullscreen ? 'minimize' : 'maximize'} size={14} />
            </Button>
          )}
        </div>

        {tabs && tabs.length > 0 && (
          <div role="tablist" aria-label={`${title} views`} className="flex w-full gap-1 pt-1">
            {tabs.map((tab) => {
              const active = tab.id === (activeTab ?? tabs[0].id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange?.(tab.id)}
                  style={{
                    backgroundColor: active ? 'var(--color-primary-surface)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  className="px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {!collapsed && (
        <div className="@container flex-1 p-6" aria-live={loading ? 'polite' : undefined}>
          {loading ? (
            <div className="space-y-3" role="status" aria-label={`Loading ${title}`}>
              {skeletonVariant === 'table' ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    className="rd-shimmer h-8 w-full"
                  />
                ))
              ) : skeletonVariant === 'list' ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div style={{ borderRadius: 'var(--radius-full)' }} className="rd-shimmer size-8 shrink-0" />
                    <div style={{ borderRadius: 'var(--radius-sm)' }} className="rd-shimmer h-4 flex-1" />
                  </div>
                ))
              ) : (
                <>
                  <div style={{ borderRadius: 'var(--radius-sm)' }} className="rd-shimmer h-4 w-1/3" />
                  <div style={{ borderRadius: 'var(--radius-md)' }} className="rd-shimmer h-48 w-full" />
                </>
              )}
            </div>
          ) : empty ? (
            <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
          ) : (
            children
          )}
        </div>
      )}

      {footer && !collapsed && (
        <footer
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          className="border-t px-6 py-3 text-xs"
        >
          {footer}
        </footer>
      )}
    </section>
  );
}
