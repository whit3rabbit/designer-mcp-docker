'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';

export interface InlineEditProps {
  value: string;
  onSave: (nextValue: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Click-to-edit inline field.
 * Saves on Enter or blur; cancels on Escape.
 */
export function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit...',
  ariaLabel = 'Edit value',
  className,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-primary)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-sm)',
        }}
        className={clsx('h-8 w-full border px-2 text-sm focus:outline-none', className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={`${ariaLabel}: ${value || placeholder}`}
      style={{ borderRadius: 'var(--radius-sm)' }}
      className={clsx(
        'group inline-flex cursor-pointer items-center gap-2 px-2 py-1 text-start text-sm transition-colors',
        'hover:bg-[var(--color-canvas)]',
        className,
      )}
    >
      <span style={{ color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
        {value || placeholder}
      </span>
      <AppIcon
        name="pencil"
        size={13}
        className="text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </button>
  );
}
