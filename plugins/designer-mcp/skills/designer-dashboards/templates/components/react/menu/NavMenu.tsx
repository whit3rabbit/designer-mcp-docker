'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../@core/icons/registry';
import { type NavItem } from '../configs/navigation.config';
import {
  getPinnedNavItems,
  isNavActive,
  isNavSubtreeActive,
} from './useMenu';

export interface NavMenuProps {
  items: NavItem[];
  pathname: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
  /** 'sidebar' = primary nav (pinned quick-access section); 'panel' = two-column second column */
  variant?: 'sidebar' | 'panel';
  pinnedLabel?: string;
  ariaLabel?: string;
}

// Vertical recursive nav renderer (the corpus's NavGroup/NavCollapse/NavItem
// pattern): section titles, collapsible groups, leaf links with badge/disabled/
// external handling, and icon-rail flyouts when collapsed. One tree, every mode.
export function NavMenu({
  items,
  pathname,
  onNavigate,
  collapsed = false,
  variant = 'sidebar',
  pinnedLabel = 'Pinned',
  ariaLabel = 'Main menu',
}: NavMenuProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [expandedLimits, setExpandedLimits] = React.useState<Record<string, boolean>>({});
  const [openFlyout, setOpenFlyout] = React.useState<string | null>(null);
  const pinnedItems = variant === 'sidebar' ? getPinnedNavItems(items) : [];

  const navigate = (path: string) => {
    onNavigate?.(path);
    setOpenFlyout(null);
  };

  const renderItem = (item: NavItem, depth = 0) => {
    if (item.type === 'title') {
      if (collapsed) return null;
      return (
        <div
          key={item.key}
          style={{ color: 'var(--color-text-muted)' }}
          className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider"
        >
          {item.title}
        </div>
      );
    }

    if ((item.type === 'collapse' || item.type === 'group') && item.children?.length) {
      const expanded = openGroups[item.key] ?? Boolean(item.expanded);
      const limit = item.collapseLimit;
      const showAll = expandedLimits[item.key] ?? false;
      const hasLimit = typeof limit === 'number' && limit > 0 && item.children.length > limit;
      const visibleChildren = hasLimit && !showAll ? item.children.slice(0, limit) : item.children;
      const hiddenCount = hasLimit ? item.children.length - limit : 0;

      return (
        <div key={item.key} className="relative space-y-0.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-expanded={expanded}
              title={collapsed ? item.title : undefined}
              aria-label={collapsed ? item.title : undefined}
              onClick={() => {
                if (collapsed) {
                  setOpenFlyout((prev) => (prev === item.key ? null : item.key));
                } else {
                  setOpenGroups((prev) => ({ ...prev, [item.key]: !expanded }));
                }
              }}
              style={{ color: 'var(--color-text)', borderRadius: 'var(--radius-md)' }}
              className={clsx(
                'flex flex-1 min-w-0 cursor-pointer items-center text-sm font-medium',
                collapsed
                  ? 'justify-center px-2 py-2'
                  : 'justify-between gap-2 px-3 py-2',
                isNavSubtreeActive(item, pathname) &&
                  'text-[var(--color-primary)]',
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                {item.icon && <AppIcon name={item.icon} size={18} className="shrink-0" />}
                {!collapsed && <span className="truncate">{item.title}</span>}
              </span>
              {!collapsed && (
                <AppIcon name={expanded ? 'chevron-down' : 'chevron-right'} size={14} />
              )}
            </button>
            {!collapsed && item.quickCreate && (
              <a
                href={item.quickCreate.path}
                title={item.quickCreate.tooltip}
                aria-label={item.quickCreate.tooltip}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    navigate(item.quickCreate!.path);
                  }
                }}
                style={{ color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}
                className="shrink-0 p-1.5 hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-primary)]"
              >
                <AppIcon name="plus" size={14} />
              </a>
            )}
          </div>
          {collapsed ? (
            openFlyout === item.key && (
              <div
                role="menu"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 'var(--z-dropdown)',
                }}
                className="absolute top-0 start-full ms-1 w-56 border p-2"
              >
                <span
                  style={{ color: 'var(--color-text-muted)' }}
                  className="block px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider"
                >
                  {item.title}
                </span>
                {item.children.map((child) => renderItem(child, depth + 1))}
              </div>
            )
          ) : (
            expanded && (
              <div className="space-y-0.5 ps-4">
                {visibleChildren.map((child) => renderItem(child, depth + 1))}
                {hasLimit && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLimits((prev) => ({ ...prev, [item.key]: !showAll }))
                    }
                    style={{ color: 'var(--color-text-muted)' }}
                    className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:text-[var(--color-primary)]"
                  >
                    {showAll ? 'Show less' : `Show ${hiddenCount} more`}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      );
    }

    const active = isNavActive(item, pathname);
    const href = item.path ?? '#';

    return (
      <a
        key={item.key}
        href={href}
        title={collapsed ? item.title : undefined}
        aria-label={collapsed ? item.title : undefined}
        target={item.isExternalLink ? '_blank' : undefined}
        rel={item.isExternalLink ? 'noopener noreferrer' : undefined}
        aria-current={active ? 'page' : undefined}
        aria-disabled={item.disabled || undefined}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          if (onNavigate && item.path && !item.isExternalLink) {
            e.preventDefault();
            navigate(item.path);
          }
        }}
        style={{
          backgroundColor: active ? 'var(--color-primary-surface)' : 'transparent',
          color: active ? 'var(--color-primary)' : 'inherit',
          borderRadius: 'var(--radius-md)',
        }}
        className={clsx(
          'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2' : undefined,
          item.disabled && 'pointer-events-none opacity-50',
        )}
      >
        {item.icon && <AppIcon name={item.icon} size={18} className="shrink-0" />}
        {!collapsed && <span className="truncate">{item.title}</span>}
        {!collapsed && item.badge && (
          <span
            style={{
              backgroundColor: `var(--color-${item.badge.color ?? 'primary'}-surface)`,
              color: `var(--color-${item.badge.color ?? 'primary'})`,
              borderRadius: 'var(--radius-full)',
            }}
            className="ms-auto px-2 py-0.5 text-[11px] font-semibold"
          >
            {item.badge.value}
          </span>
        )}
      </a>
    );
  };

  return (
    <nav aria-label={ariaLabel} className="space-y-1">
      {pinnedItems.length > 0 && (
        <div className="space-y-0.5 pb-2">
          {!collapsed && (
            <div
              style={{ color: 'var(--color-text-muted)' }}
              className="flex items-center gap-1.5 px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider"
            >
              <AppIcon name="pin" size={12} />
              {pinnedLabel}
            </div>
          )}
          {pinnedItems.map((item) => renderItem(item))}
        </div>
      )}
      {items.map((item) => renderItem(item))}
    </nav>
  );
}
