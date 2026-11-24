'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  variant?: 'box' | 'border' | 'lift';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<TabsProps['variant']>, string> = {
  box: 'tabs-box',
  border: 'tabs-border',
  lift: 'tabs-lift',
};

const SIZE_CLASS: Record<NonNullable<TabsProps['size']>, string> = {
  xs: 'tabs-xs',
  sm: 'tabs-sm',
  md: 'tabs-md',
  lg: 'tabs-lg',
};

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'box',
  size = 'md',
  className,
}: TabsProps) {
  const baseId = React.useId();
  const [internal, setInternal] = React.useState<string>(
    () => defaultValue ?? items[0]?.id ?? '',
  );
  const activeId = value ?? internal;
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = React.useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id);
      onChange?.(id);
    },
    [value, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabledIndices = items
      .map((item, idx) => (item.disabled ? -1 : idx))
      .filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const currentIdx = items.findIndex((item) => item.id === activeId);
    const pos = Math.max(0, enabledIndices.indexOf(currentIdx));
    const isRtl =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('dir') === 'rtl';

    let nextPos: number | null = null;
    if (e.key === 'ArrowRight') {
      nextPos = isRtl
        ? (pos - 1 + enabledIndices.length) % enabledIndices.length
        : (pos + 1) % enabledIndices.length;
    } else if (e.key === 'ArrowLeft') {
      nextPos = isRtl
        ? (pos + 1) % enabledIndices.length
        : (pos - 1 + enabledIndices.length) % enabledIndices.length;
    } else if (e.key === 'Home') {
      nextPos = 0;
    } else if (e.key === 'End') {
      nextPos = enabledIndices.length - 1;
    }

    if (nextPos !== null) {
      e.preventDefault();
      const targetIdx = enabledIndices[nextPos];
      const targetItem = items[targetIdx];
      if (targetItem) {
        selectTab(targetItem.id);
        tabRefs.current[targetIdx]?.focus();
      }
    }
  };

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={clsx('w-full', className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={clsx('tabs', VARIANT_CLASS[variant], SIZE_CLASS[size])}
      >
        {items.map((item, idx) => {
          const isSelected = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.id)}
              className={clsx('tab', isSelected && 'tab-active font-medium')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          className="mt-4"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
