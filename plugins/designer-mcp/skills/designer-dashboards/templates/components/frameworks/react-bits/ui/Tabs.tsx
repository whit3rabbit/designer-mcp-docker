'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_SNAPPY, useMotionPreferences } from '../theme/motionConfig';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onValueChange, className }: TabsProps) {
  const layoutGroupId = React.useId();
  const { prefersReducedMotion, getTransition } = useMotionPreferences();
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id ?? '');
  const activeId = value ?? internal;

  const setActive = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const idx = enabled.findIndex((item) => item.id === activeId);
    if (idx === -1) return;

    const isRtl =
      typeof document !== 'undefined' &&
      (document.documentElement.dir === 'rtl' ||
        e.currentTarget.closest('[dir="rtl"]') !== null);

    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

    if (e.key === nextKey) {
      e.preventDefault();
      setActive(enabled[(idx + 1) % enabled.length].id);
    } else if (e.key === prevKey) {
      e.preventDefault();
      setActive(enabled[(idx - 1 + enabled.length) % enabled.length].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(enabled[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(enabled[enabled.length - 1].id);
    }
  };

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'var(--color-surface-subtle)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
        className="inline-flex w-fit flex-wrap items-center gap-1 border p-1"
      >
        {items.map((item) => {
          const isActive = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${layoutGroupId}-panel-${item.id}`}
              id={`${layoutGroupId}-tab-${item.id}`}
              disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(item.id)}
              style={{
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderRadius: 'calc(var(--radius-md) - 2px)',
              }}
              className="relative inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isActive && (
                <motion.span
                  layoutId={prefersReducedMotion ? undefined : `${layoutGroupId}-pill`}
                  transition={getTransition(SPRING_SNAPPY)}
                  aria-hidden="true"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-sm)',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                  }}
                  className="absolute inset-0 z-0"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${layoutGroupId}-panel-${activeItem.id}`}
          aria-labelledby={`${layoutGroupId}-tab-${activeItem.id}`}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
