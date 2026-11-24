import * as React from 'react';

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
  onChange?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  ariaLabel = 'Tabs',
  className,
}: TabsProps) {
  const baseId = React.useId();
  const [internal, setInternal] = React.useState<string>(() => defaultValue ?? items[0]?.id ?? '');
  const activeId = value ?? internal;
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabledIndices = items
      .map((item, idx) => (!item.disabled ? idx : -1))
      .filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const currentIdx = items.findIndex((item) => item.id === activeId);
    const pos = enabledIndices.indexOf(currentIdx);
    const isRtl =
      typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl';

    let nextPos = -1;
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

    if (nextPos !== -1) {
      e.preventDefault();
      const targetIndex = enabledIndices[nextPos];
      const targetItem = items[targetIndex];
      if (targetItem) {
        selectTab(targetItem.id);
        tabRefs.current[targetIndex]?.focus();
      }
    }
  };

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="op-tabs__list"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const selected = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className="op-tab"
              onClick={() => selectTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          className="op-tabs__panel"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
