'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'pill',
  className,
}: TabsProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const indicatorId = React.useId();
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? items[0]?.id ?? '');
  const activeId = value ?? internalValue;
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = (id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

    if (e.key !== nextKey && e.key !== prevKey) return;
    e.preventDefault();
    const dir = e.key === nextKey ? 1 : -1;
    let next = (index + dir + items.length) % items.length;
    while (items[next]?.disabled && next !== index) {
      next = (next + dir + items.length) % items.length;
    }
    if (!items[next]?.disabled) {
      selectTab(items[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={
          variant === 'pill'
            ? {
                backgroundColor: 'var(--color-surface-subtle)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }
            : { borderColor: 'var(--color-border)' }
        }
        className={clsx(
          'inline-flex flex-wrap items-center gap-1',
          variant === 'pill' ? 'w-fit border p-1' : 'border-b',
        )}
      >
        {items.map((item, idx) => {
          const isActive = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${indicatorId}-panel-${item.id}`}
              id={`${indicatorId}-tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderRadius: variant === 'pill' ? 'var(--radius-sm)' : undefined,
              }}
              className={clsx(
                'relative inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-45',
                variant === 'underline' && 'pb-2.5',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={reducedMotion ? undefined : `tabs-indicator-${indicatorId}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  aria-hidden="true"
                  style={
                    variant === 'pill'
                      ? {
                          backgroundColor: 'var(--color-surface)',
                          boxShadow: 'var(--shadow-sm)',
                          borderRadius: 'var(--radius-sm)',
                        }
                      : {
                          backgroundColor: 'var(--color-primary)',
                        }
                  }
                  className={clsx(
                    'absolute',
                    variant === 'pill' ? 'inset-0 z-0' : 'inset-x-0 bottom-0 h-0.5',
                  )}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: isActive
                        ? 'var(--color-primary-surface)'
                        : 'var(--color-surface)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${indicatorId}-panel-${activeItem.id}`}
          aria-labelledby={`${indicatorId}-tab-${activeItem.id}`}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
