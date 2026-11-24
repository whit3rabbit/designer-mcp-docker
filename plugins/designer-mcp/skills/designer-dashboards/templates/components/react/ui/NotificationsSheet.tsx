'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon, type IconName } from '../../@core/icons/registry';
import { Badge } from './Badge';
import { Button } from './Button';
import { Drawer } from './Drawer';
import { EmptyState } from './EmptyState';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon?: IconName;
}

export interface NotificationsSheetProps {
  items: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationsSheet({
  items,
  onMarkRead,
  onMarkAllRead,
}: NotificationsSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const unreadCount = items.filter((n) => !n.read).length;
  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;

  return (
    <>
      <div className="relative inline-flex">
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label={`Notifications (${unreadCount} unread)`}
          onClick={() => setOpen(true)}
        >
          <AppIcon name="bell" size={18} />
        </Button>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'var(--color-on-solid)',
              borderRadius: 'var(--radius-full)',
            }}
            className="tabular-nums pointer-events-none absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center text-[10px] font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Notifications"
        description={`${unreadCount} unread updates`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant={filter === 'all' ? 'tonal' : 'ghost'}
                tone={filter === 'all' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setFilter('all')}
              >
                All ({items.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'tonal' : 'ghost'}
                tone={filter === 'unread' ? 'primary' : 'neutral'}
                size="xs"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>
            {unreadCount > 0 && onMarkAllRead && (
              <Button variant="ghost" tone="primary" size="xs" onClick={onMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="All caught up"
              description="No unread notifications right now."
            />
          ) : (
            <ul className="space-y-2.5">
              {visible.map((item) => {
                const tone = item.tone ?? 'primary';
                return (
                  <li
                    key={item.id}
                    style={{
                      backgroundColor: item.read ? 'var(--color-surface)' : 'var(--color-canvas)',
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    className={clsx('border p-3 transition-colors')}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        style={{
                          backgroundColor: `var(--color-${tone}-surface)`,
                          color: `var(--color-${tone})`,
                          borderRadius: 'var(--radius-md)',
                        }}
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center"
                      >
                        <AppIcon name={item.icon ?? 'bell'} size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p style={{ color: 'var(--color-text)' }} className="truncate text-xs font-semibold">
                            {item.title}
                          </p>
                          {!item.read && <Badge tone="primary" variant="dot">New</Badge>}
                        </div>
                        <p style={{ color: 'var(--color-text-muted)' }} className="mt-0.5 text-xs">
                          {item.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span style={{ color: 'var(--color-text-muted)' }}>{item.timestamp}</span>
                          {!item.read && onMarkRead && (
                            <button
                              type="button"
                              onClick={() => onMarkRead(item.id)}
                              style={{ color: 'var(--color-primary)' }}
                              className="cursor-pointer font-medium hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Drawer>
    </>
  );
}
