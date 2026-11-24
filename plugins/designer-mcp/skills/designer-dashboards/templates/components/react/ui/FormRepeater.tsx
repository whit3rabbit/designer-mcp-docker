'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';

export interface FormRepeaterProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  minItems?: number;
  maxItems?: number;
  className?: string;
}

/**
 * Dynamic Form Repeater / Field Array container (11/17 dashboards: invoice lines, variants, invites).
 * Pairs cleanly with react-hook-form `useFieldArray` or local state.
 */
export function FormRepeater<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel = 'Add item',
  emptyLabel = 'No items added yet.',
  minItems = 0,
  maxItems,
  className,
}: FormRepeaterProps<T>) {
  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className={clsx('space-y-3', className)}>
      {items.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            borderRadius: 'var(--radius-md)',
          }}
          className="border border-dashed px-4 py-6 text-center text-xs"
        >
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
              className="flex items-start gap-3 border p-3"
            >
              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  tone="error"
                  size="xs"
                  iconOnly
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => onRemove(index)}
                >
                  <AppIcon name="trash-2" size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <Button type="button" variant="outline" tone="primary" size="sm" onClick={onAdd}>
          <AppIcon name="plus" size={14} />
          <span>{addLabel}</span>
        </Button>
      )}
    </div>
  );
}
