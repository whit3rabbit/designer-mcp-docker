'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface DualListboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface DualListboxProps {
  options: DualListboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  availableLabel?: string;
  selectedLabel?: string;
  searchable?: boolean;
  className?: string;
}

/**
 * Dual Listbox / Transfer List (Cuba / DashLite / Vyzor).
 * Moves items between Available and Selected lists with search and bulk actions.
 */
export function DualListbox({
  options,
  value,
  onChange,
  availableLabel = 'Available',
  selectedLabel = 'Selected',
  searchable = true,
  className,
}: DualListboxProps) {
  const [leftQuery, setLeftQuery] = React.useState('');
  const [rightQuery, setRightQuery] = React.useState('');

  const available = options.filter(
    (opt) => !value.includes(opt.value) && opt.label.toLowerCase().includes(leftQuery.toLowerCase()),
  );
  const selected = options.filter(
    (opt) => value.includes(opt.value) && opt.label.toLowerCase().includes(rightQuery.toLowerCase()),
  );

  const addOne = (v: string) => onChange([...value, v]);
  const removeOne = (v: string) => onChange(value.filter((item) => item !== v));
  const addAll = () => onChange(options.map((opt) => opt.value));
  const removeAll = () => onChange([]);

  const renderPanel = (
    title: string,
    items: DualListboxOption[],
    query: string,
    setQuery: (q: string) => void,
    onItemClick: (v: string) => void,
    actionIcon: 'chevron-right' | 'chevron-left',
    actionVerb: string,
  ) => (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
      className="flex flex-1 flex-col overflow-hidden border"
    >
      <div
        style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)' }}
        className="flex items-center justify-between border-b px-3 py-2 text-xs font-semibold"
      >
        <span style={{ color: 'var(--color-text)' }}>{title}</span>
        <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums">
          {items.length}
        </span>
      </div>
      {searchable && (
        <div style={{ borderColor: 'var(--color-border)' }} className="border-b p-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${title.toLowerCase()}...`}
            aria-label={`Filter ${title}`}
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-sm)',
            }}
            className="h-8 w-full border px-2.5 text-xs placeholder:text-[var(--color-text-muted)] focus:outline-none"
          />
        </div>
      )}
      <ul className="max-h-52 min-h-40 flex-1 divide-y divide-[var(--color-border)] overflow-y-auto">
        {items.length === 0 ? (
          <li style={{ color: 'var(--color-text-muted)' }} className="px-3 py-6 text-center text-xs">
            No items
          </li>
        ) : (
          items.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onItemClick(opt.value)}
                aria-label={`${actionVerb} ${opt.label}`}
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-start text-xs transition-colors hover:bg-[var(--color-primary-surface)]"
              >
                <span className="min-w-0">
                  <span style={{ color: 'var(--color-text)' }} className="block truncate font-medium">
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span style={{ color: 'var(--color-text-muted)' }} className="block truncate text-[11px]">
                      {opt.description}
                    </span>
                  )}
                </span>
                <AppIcon name={actionIcon} size={14} className="shrink-0 text-[var(--color-text-muted)] rtl:rotate-180" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div className={clsx('flex flex-col gap-3 sm:flex-row sm:items-stretch', className)}>
      {renderPanel(availableLabel, available, leftQuery, setLeftQuery, addOne, 'chevron-right', 'Select')}
      <div className="flex flex-row items-center justify-center gap-1.5 sm:flex-col">
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Select all items"
          onClick={addAll}
        >
          <AppIcon name="chevron-right" size={14} className="rtl:rotate-180" />
        </Button>
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Remove all items"
          onClick={removeAll}
        >
          <AppIcon name="chevron-left" size={14} className="rtl:rotate-180" />
        </Button>
      </div>
      {renderPanel(selectedLabel, selected, rightQuery, setRightQuery, removeOne, 'chevron-left', 'Remove')}
    </div>
  );
}
