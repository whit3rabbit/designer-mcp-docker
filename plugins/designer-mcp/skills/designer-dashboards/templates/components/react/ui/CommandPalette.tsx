'use client';

import * as React from 'react';
import { AppIcon } from '../../@core/icons/registry';
import type { NavSearchEntry } from '../../@menu/useMenu';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  entries: NavSearchEntry[];
  onSelect: (path: string) => void;
}

export function CommandPalette({ open, onClose, entries, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
      if (open && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        (e.group?.toLowerCase().includes(q) ?? false),
    );
  }, [entries, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center p-4 pt-20"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 bg-[var(--color-scrim)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        className="relative w-full max-w-lg overflow-hidden border"
      >
        <div
          style={{ borderColor: 'var(--color-border)' }}
          className="flex items-center gap-2 border-b px-4 py-3"
        >
          <AppIcon name="search" size={16} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && filtered[activeIndex]) {
                e.preventDefault();
                onSelect(filtered[activeIndex].path);
                onClose();
              }
            }}
            placeholder="Jump to page or command..."
            aria-label="Search navigation commands"
            className="w-full bg-transparent text-sm outline-none"
          />
          <kbd
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-xs)',
            }}
            className="border px-1.5 py-0.5 text-[10px] font-semibold"
          >
            ESC
          </kbd>
        </div>

        <ul role="listbox" className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li style={{ color: 'var(--color-text-muted)' }} className="px-3 py-6 text-center text-xs">
              No matching pages.
            </li>
          ) : (
            filtered.map((item, idx) => (
              <li key={item.key} role="option" aria-selected={idx === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  style={{
                    backgroundColor:
                      idx === activeIndex ? 'var(--color-primary-surface)' : 'transparent',
                    color: idx === activeIndex ? 'var(--color-primary)' : 'var(--color-text)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-start text-sm"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {item.icon && <AppIcon name={item.icon} size={16} />}
                    <span className="font-medium">{item.title}</span>
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                    {item.group ?? item.path}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
