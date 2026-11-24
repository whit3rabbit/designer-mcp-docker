'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, invalid = false, className, style, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
        className={clsx(
          'h-[38px] w-full appearance-none border ps-3 pe-9 text-sm transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-55',
          className,
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        style={{ color: 'var(--color-text-muted)' }}
        className="pointer-events-none absolute inset-y-0 end-3 flex items-center"
      >
        <AppIcon name="chevron-down" size={16} />
      </span>
    </div>
  );
});

export interface ComboboxProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No matching options',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderRadius: 'var(--radius-md)',
        }}
        className="flex h-[38px] w-full cursor-pointer items-center justify-between border px-3 text-sm"
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <AppIcon name="chevron-down" size={16} />
      </button>

      {open && (
        <div
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 'var(--z-dropdown)',
          }}
          className="absolute start-0 mt-1.5 w-full border p-2"
        >
          <div className="relative mb-2">
            <AppIcon
              name="search"
              size={14}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              aria-label={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-sm)',
              }}
              className="h-8 w-full border ps-8 pe-2 text-xs"
            />
          </div>
          <ul role="listbox" className="max-h-48 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li style={{ color: 'var(--color-text-muted)' }} className="px-2 py-3 text-center text-xs">
                {emptyText}
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setQuery('');
                      }}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-primary-surface)' : 'transparent',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      className="flex w-full cursor-pointer items-center justify-between px-2.5 py-1.5 text-start text-xs font-medium hover:bg-[var(--color-canvas)]"
                    >
                      <span>{opt.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add tag and press Enter...',
  className,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('');

  const addTag = (raw: string) => {
    const clean = raw.trim();
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
    }
    setDraft('');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
      className={clsx('flex flex-wrap items-center gap-1.5 border p-2', className)}
    >
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            backgroundColor: 'var(--color-primary-surface)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
          }}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="cursor-pointer hover:opacity-75"
          >
            <AppIcon name="x" size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        aria-label={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(draft);
          } else if (e.key === 'Backspace' && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        style={{ color: 'var(--color-text)' }}
        className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-xs outline-none placeholder:text-[var(--color-text-muted)]"
      />
    </div>
  );
}
