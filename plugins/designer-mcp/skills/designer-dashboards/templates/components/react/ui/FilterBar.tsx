'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import { DateRangePicker, type DateRangeValue } from './DatePicker';

export interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selectFilters?: Array<{
    key: string;
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
  }>;
  dateRange?: DateRangeValue;
  onDateRangeChange?: (range: DateRangeValue) => void;
  onReset?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  selectFilters = [],
  dateRange,
  onDateRangeChange,
  onReset,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={clsx('flex flex-wrap items-center justify-between gap-3 border p-4', className)}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        {onSearchChange && (
          <div className="w-56">
            <Input
              size="sm"
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              startAdornment={<AppIcon name="search" size={14} />}
            />
          </div>
        )}

        {selectFilters.map((filter) => (
          <div key={filter.key} className="w-40">
            <Select
              aria-label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              options={filter.options}
              placeholder={filter.label}
              className="h-8 text-xs"
            />
          </div>
        ))}

        {dateRange && onDateRangeChange && (
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            showPresets={false}
          />
        )}

        {onReset && (
          <Button variant="ghost" tone="neutral" size="sm" onClick={onReset}>
            <AppIcon name="rotate-ccw" size={14} />
            Reset
          </Button>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
