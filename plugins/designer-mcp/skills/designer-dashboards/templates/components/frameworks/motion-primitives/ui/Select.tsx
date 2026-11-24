'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  label,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  className,
  id,
}: SelectProps) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const listboxId = `${selectId}-listbox`;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
  const value = controlledValue ?? uncontrolled;
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const commitValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next);
      onChange?.(next);
      setOpen(false);
    },
    [controlledValue, onChange],
  );

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        const idx = Math.max(0, options.findIndex((o) => o.value === value));
        setActiveIndex(idx);
        setOpen(true);
      } else {
        const opt = options[activeIndex];
        if (opt && !opt.disabled) commitValue(opt.value);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    }
  };

  return (
    <div ref={containerRef} className={clsx('relative flex w-full flex-col gap-1.5 text-start', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {label}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error) || undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          color: selectedOption ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderRadius: 'var(--radius-md)',
        }}
        className="flex h-[38px] w-full items-center justify-between gap-2 border px-3 text-sm transition-colors hover:border-[var(--color-primary-border)] disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden="true"
          style={{ color: 'var(--color-text-muted)' }}
          className="shrink-0"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 'var(--z-dropdown, 50)',
            }}
            className="absolute top-full mt-1.5 max-h-60 w-full overflow-auto border p-1"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = idx === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => !opt.disabled && commitValue(opt.value)}
                  style={{
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-surface)'
                      : isFocused
                        ? 'var(--color-surface-subtle)'
                        : 'transparent',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                  className={clsx(
                    'flex items-center justify-between gap-2 px-2.5 py-2 text-sm transition-colors',
                    opt.disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
