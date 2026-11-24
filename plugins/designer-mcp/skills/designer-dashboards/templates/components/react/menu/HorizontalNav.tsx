'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../@core/icons/registry';
import { type NavItem } from '../configs/navigation.config';
import {
  getMegaMenuColumns,
  isNavActive,
  isNavSubtreeActive,
} from './useMenu';
import { Popover } from '../components/ui/Popover';

export interface HorizontalNavProps {
  /** Top-level items (already authority-filtered and passed through getHorizontalNav) */
  items: NavItem[];
  pathname: string;
  onNavigate?: (path: string) => void;
  ariaLabel?: string;
}

// Horizontal navbar renderer fed by the same Nav IR as the sidebar
// (one tree, many renderers, never a duplicated horizontal config).
// Groups open dropdown panels; `meta.megaMenu` groups render their `title`
// children as columns.
export function HorizontalNav({
  items,
  pathname,
  onNavigate,
  ariaLabel = 'Horizontal menu',
}: HorizontalNavProps) {
  const navRef = React.useRef<HTMLElement>(null);
  const [visibleCount, setVisibleCount] = React.useState<number>(items.length);
  const itemWidthsRef = React.useRef<number[]>([]);

  // Declarative ResizeObserver overflow (replaces DOM cloneNode anti-pattern):
  // measures top-level item widths once and partitions overflowing items into
  // a "More" popover without losing React event handlers or aria state.
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => {
      const children = Array.from(nav.querySelectorAll<HTMLElement>('[data-hnav-item]'));
      if (children.length > 0 && itemWidthsRef.current.length !== items.length) {
        itemWidthsRef.current = children.map((el) => el.offsetWidth + 4);
      }
      const widths = itemWidthsRef.current;
      if (widths.length === 0) {
        setVisibleCount(items.length);
        return;
      }
      const available = nav.clientWidth;
      const moreButtonReserve = 96;
      let total = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const nextTotal = total + widths[i];
        const needsMore = i < widths.length - 1;
        if (nextTotal + (needsMore ? moreButtonReserve : 0) > available && count > 0) {
          break;
        }
        total = nextTotal;
        count++;
      }
      setVisibleCount(count || items.length);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    measure();
    return () => observer.disconnect();
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  const navigate = (path: string) => onNavigate?.(path);

  const renderLeaf = (item: NavItem, active: boolean) => {
    const href = item.path ?? '#';
    return (
      <a
        href={href}
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
          'flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
          item.disabled && 'pointer-events-none opacity-50',
        )}
      >
        {item.icon && <AppIcon name={item.icon} size={16} className="shrink-0" />}
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <span
            style={{
              backgroundColor: `var(--color-${item.badge.color ?? 'primary'}-surface)`,
              color: `var(--color-${item.badge.color ?? 'primary'})`,
              borderRadius: 'var(--radius-full)',
            }}
            className="px-2 py-0.5 text-[11px] font-semibold"
          >
            {item.badge.value}
          </span>
        )}
      </a>
    );
  };

  // Dropdown body: nested collapses flatten into indented lists (depth is
  // capped at 3 levels by the schema recommendation).
  const renderDropdownItems = (children: NavItem[], depth = 0): React.ReactNode =>
    children
      .filter((child) => child.type !== 'title')
      .map((child) => {
        if ((child.type === 'collapse' || child.type === 'group') && child.children?.length) {
          return (
            <React.Fragment key={child.key}>
              <div
                style={{ color: 'var(--color-text-muted)' }}
                className="flex items-center gap-2 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider"
              >
                {child.icon && <AppIcon name={child.icon} size={13} />}
                {child.title}
              </div>
              {renderDropdownItems(child.children, depth + 1)}
            </React.Fragment>
          );
        }
        return renderLeaf(child, isNavActive(child, pathname));
      });

  // Mega-menu body: `title` children become column headers.
  const renderMegaColumns = (children: NavItem[]): React.ReactNode => {
    const columns = getMegaMenuColumns(children);
    return (
      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, minmax(11rem, 1fr))` }}
      >
        {columns.map((column, index) => (
          <div key={column.header?.key ?? `col-${index}`} className="space-y-1">
            {column.header && (
              <span
                style={{ color: 'var(--color-text-muted)' }}
                className="block pb-1 text-[11px] font-semibold uppercase tracking-wider"
              >
                {column.header.title}
              </span>
            )}
            {column.links.map((link) => renderLeaf(link, isNavActive(link, pathname)))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <nav ref={navRef} aria-label={ariaLabel} className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
      {visibleItems.map((item) => {
        if ((item.type === 'collapse' || item.type === 'group') && item.children?.length) {
          const hasTitleChildren = item.children.some((child) => child.type === 'title');
          const mega = Boolean(item.meta?.megaMenu) && hasTitleChildren;
          return (
            <div key={item.key} data-hnav-item className="shrink-0">
              <Popover
                align="start"
                trigger={
                  <span
                    style={{
                      borderRadius: 'var(--radius-md)',
                      color: isNavSubtreeActive(item, pathname)
                        ? 'var(--color-primary)'
                        : 'var(--color-text)',
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {item.icon && <AppIcon name={item.icon} size={16} className="shrink-0" />}
                    {item.title}
                    <AppIcon name="chevron-down" size={14} />
                  </span>
                }
              >
                {mega ? (
                  renderMegaColumns(item.children!)
                ) : (
                  <div className="min-w-56 space-y-0.5">{renderDropdownItems(item.children!)}</div>
                )}
              </Popover>
            </div>
          );
        }
        return (
          <div key={item.key} data-hnav-item className="shrink-0">
            {renderLeaf(item, isNavActive(item, pathname))}
          </div>
        );
      })}
      {overflowItems.length > 0 && (
        <Popover
          align="end"
          trigger={
            <span
              style={{
                borderRadius: 'var(--radius-md)',
                color: overflowItems.some((item) => isNavSubtreeActive(item, pathname))
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
              }}
              className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <AppIcon name="more-horizontal" size={16} />
              <span>More</span>
            </span>
          }
        >
          <div className="min-w-56 space-y-0.5">{renderDropdownItems(overflowItems)}</div>
        </Popover>
      )}
    </nav>
  );
}
