'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface DatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
}

export function DatePicker({ value, onChange, min, max, label, className }: DatePickerProps) {
  return (
    <input
      type="date"
      aria-label={label || 'Select date'}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('h-[38px] border px-3 text-sm', className)}
    />
  );
}

export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  showPresets?: boolean;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  showPresets = true,
  className,
}: DateRangePickerProps) {
  const applyPreset = (days: number) => {
    const end = dayjs().format('YYYY-MM-DD');
    const start = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    onChange({ start, end });
  };

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      <DatePicker
        label="Start date"
        value={value.start}
        max={value.end || undefined}
        onChange={(start) => onChange({ ...value, start })}
      />
      <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">
        to
      </span>
      <DatePicker
        label="End date"
        value={value.end}
        min={value.start || undefined}
        onChange={(end) => onChange({ ...value, end })}
      />
      {showPresets && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" tone="neutral" size="xs" onClick={() => applyPreset(0)}>
            Today
          </Button>
          <Button variant="ghost" tone="neutral" size="xs" onClick={() => applyPreset(7)}>
            7d
          </Button>
          <Button variant="ghost" tone="neutral" size="xs" onClick={() => applyPreset(30)}>
            30d
          </Button>
          <Button
            variant="ghost"
            tone="neutral"
            size="xs"
            onClick={() =>
              onChange({
                start: dayjs().startOf('month').format('YYYY-MM-DD'),
                end: dayjs().format('YYYY-MM-DD'),
              })
            }
          >
            Month
          </Button>
        </div>
      )}
    </div>
  );
}

export interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  className?: string;
}

export function TimePicker({ value, onChange, label, className }: TimePickerProps) {
  return (
    <input
      type="time"
      aria-label={label || 'Select time'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('h-[38px] border px-3 text-sm', className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  DateTimePicker & InlineCalendar (shadcn)                                  */
/* -------------------------------------------------------------------------- */

export interface DateTimePickerProps {
  value: string;
  onChange: (isoDateTime: string) => void;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, min, max, label, className }: DateTimePickerProps) {
  return (
    <input
      type="datetime-local"
      aria-label={label || 'Select date and time'}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('h-[38px] border px-3 text-sm', className)}
    />
  );
}

export interface InlineCalendarProps {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function InlineCalendar({ value, onChange, min, max, className }: InlineCalendarProps) {
  const parsed = value && dayjs(value).isValid() ? dayjs(value) : dayjs();
  const [cursor, setCursor] = React.useState(() => parsed.startOf('month'));
  const todayIso = dayjs().format('YYYY-MM-DD');

  const startOfGrid = cursor.startOf('week');
  const days = Array.from({ length: 42 }, (_, idx) => startOfGrid.add(idx, 'day'));

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={clsx('w-72 border p-3', className)}
    >
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Previous month"
          onClick={() => setCursor((c) => c.subtract(1, 'month'))}
        >
          <AppIcon name="chevron-left" size={14} className="rtl:rotate-180" />
        </Button>
        <span style={{ color: 'var(--color-text)' }} className="text-xs font-semibold">
          {cursor.format('MMMM YYYY')}
        </span>
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          iconOnly
          aria-label="Next month"
          onClick={() => setCursor((c) => c.add(1, 'month'))}
        >
          <AppIcon name="chevron-right" size={14} className="rtl:rotate-180" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} style={{ color: 'var(--color-text-muted)' }} className="py-1 text-[11px] font-medium">
            {day}
          </span>
        ))}
        {days.map((day) => {
          const iso = day.format('YYYY-MM-DD');
          const inMonth = day.month() === cursor.month();
          const isSelected = iso === value;
          const isToday = iso === todayIso;
          const disabled = (min && iso < min) || (max && iso > max);

          return (
            <button
              key={iso}
              type="button"
              disabled={Boolean(disabled)}
              aria-label={day.format('MMMM D, YYYY')}
              aria-pressed={isSelected}
              onClick={() => onChange(iso)}
              style={{
                backgroundColor: isSelected
                  ? 'var(--color-primary)'
                  : isToday
                    ? 'var(--color-primary-surface)'
                    : 'transparent',
                color: isSelected
                  ? 'var(--color-on-solid)'
                  : !inMonth
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              className={clsx(
                'tabular-nums flex size-8 cursor-pointer items-center justify-center text-xs font-medium transition-colors',
                !isSelected && 'hover:bg-[var(--color-canvas)]',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
