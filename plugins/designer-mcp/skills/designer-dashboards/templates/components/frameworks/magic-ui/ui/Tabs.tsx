'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

export interface TabItem {
  value: string;
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

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: TabsProps) {
  const layoutId = React.useId();
  const baseId = React.useId();
  const prefersReducedMotion = useReducedMotion();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const firstEnabled = items.find((i) => !i.disabled)?.value ?? items[0]?.value ?? '';
  const [internal, setInternal] = React.useState(defaultValue ?? firstEnabled);
  const active = value ?? internal;

  const selectTab = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledIndices = items
      .map((item, idx) => (item.disabled ? -1 : idx))
      .filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const currentPos = enabledIndices.indexOf(index);
    const isRtl =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('dir') === 'rtl';

    let nextPos = -1;
    if (e.key === 'ArrowRight') {
      nextPos = isRtl
        ? (currentPos - 1 + enabledIndices.length) % enabledIndices.length
        : (currentPos + 1) % enabledIndices.length;
    } else if (e.key === 'ArrowLeft') {
      nextPos = isRtl
        ? (currentPos + 1) % enabledIndices.length
        : (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
    } else if (e.key === 'Home') {
      nextPos = 0;
    } else if (e.key === 'End') {
      nextPos = enabledIndices.length - 1;
    }

    if (nextPos !== -1) {
      e.preventDefault();
      const targetIdx = enabledIndices[nextPos];
      const targetItem = items[targetIdx];
      if (targetItem) {
        selectTab(targetItem.value);
        tabRefs.current[targetIdx]?.focus();
      }
    }
  };

  const activeItem = items.find((i) => i.value === active) ?? items[0];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          backgroundColor: 'var(--color-surface-subtle)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 border p-1"
      >
        {items.map((item, idx) => {
          const isSelected = item.value === activeItem?.value;
          const tabId = `${baseId}-tab-${item.value}`;
          const panelId = `${baseId}-panel-${item.value}`;

          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                color: isSelected ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-md)',
              }}
              className={cn(
                'relative inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
                'disabled:pointer-events-none disabled:opacity-45',
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId={prefersReducedMotion ? undefined : `magic-tab-${layoutId}`}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 380, damping: 30 }
                  }
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-sm)',
                    borderRadius: 'var(--radius-md)',
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
          id={`${baseId}-panel-${activeItem.value}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeItem.value}`}
          tabIndex={0}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
