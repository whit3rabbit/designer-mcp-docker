'use client';

import * as React from 'react';
import { AppIcon } from '../@core/icons/registry';
import { Popover } from '../components/ui/Popover';
import { Button } from '../components/ui/Button';
import type { NavItem } from '../configs/navigation.config';

const STORAGE_KEY = 'rd-user-shortcuts';

export interface ShortcutsPopoverProps {
  items: NavItem[];
  onNavigate?: (path: string) => void;
}

/**
 * User-bookmarked quick-access shortcuts popover.
 */
export function ShortcutsPopover({ items, onNavigate }: ShortcutsPopoverProps) {
  const pinnable = React.useMemo(
    () => items.filter((i) => i.path && (i.pinnable || i.pinned)),
    [items],
  );
  const [savedKeys, setSavedKeys] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return pinnable.slice(0, 4).map((i) => i.key);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : pinnable.slice(0, 4).map((i) => i.key);
    } catch {
      return pinnable.slice(0, 4).map((i) => i.key);
    }
  });

  const toggleKey = (key: string) => {
    setSavedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key].slice(0, 6);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <Popover
      trigger={
        <Button variant="ghost" size="sm" iconOnly aria-label="Quick shortcuts">
          <AppIcon name="layout-grid" size={18} />
        </Button>
      }
    >
      <div className="w-72 space-y-3 p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider">Shortcuts</span>
          <span style={{ color: 'var(--color-text-muted)' }} className="text-[11px]">
            {savedKeys.length}/6 pinned
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {pinnable.map((item) => {
            const pinned = savedKeys.includes(item.key);
            return (
              <div
                key={item.key}
                style={{
                  backgroundColor: pinned ? 'var(--color-primary-surface)' : 'var(--color-canvas)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex items-center justify-between gap-1 p-2 text-xs"
              >
                <button
                  type="button"
                  onClick={() => item.path && onNavigate?.(item.path)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-start font-medium"
                >
                  {item.icon && <AppIcon name={item.icon} size={14} className="shrink-0" />}
                  <span className="truncate">{item.title}</span>
                </button>
                <button
                  type="button"
                  aria-label={pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
                  onClick={() => toggleKey(item.key)}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                >
                  <AppIcon name={pinned ? 'star' : 'plus'} size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}
