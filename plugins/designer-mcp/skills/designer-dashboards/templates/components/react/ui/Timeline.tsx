'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon, type IconName } from '../../@core/icons/registry';

export type TimelineTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tone?: TimelineTone;
  icon?: IconName;
  meta?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={clsx('relative space-y-5 ps-6', className)}>
      <span
        aria-hidden="true"
        style={{ backgroundColor: 'var(--color-border)' }}
        className="absolute top-2 bottom-2 start-2.5 w-px"
      />
      {items.map((item) => {
        const tone = item.tone ?? 'primary';
        const color = tone === 'neutral' ? 'var(--color-text-muted)' : `var(--color-${tone})`;
        const surface = tone === 'neutral' ? 'var(--color-canvas)' : `var(--color-${tone}-surface)`;

        return (
          <li key={item.id} className="relative">
            <span
              aria-hidden="true"
              style={{
                backgroundColor: surface,
                borderColor: color,
                color,
                borderRadius: 'var(--radius-full)',
              }}
              className="absolute -start-6 top-0.5 flex size-5 items-center justify-center border"
            >
              {item.icon ? (
                <AppIcon name={item.icon} size={11} />
              ) : (
                <span
                  style={{ backgroundColor: color, borderRadius: 'var(--radius-full)' }}
                  className="size-1.5"
                />
              )}
            </span>

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p style={{ color: 'var(--color-text)' }} className="text-xs font-semibold">
                {item.title}
              </p>
              <time
                style={{ color: 'var(--color-text-muted)' }}
                className="tabular-nums text-[11px]"
              >
                {item.timestamp}
              </time>
            </div>

            {item.description && (
              <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs leading-relaxed">
                {item.description}
              </p>
            )}

            {item.meta && (
              <span
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  color: 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-sm)',
                }}
                className="mt-1.5 inline-block px-2 py-0.5 text-[11px] font-medium"
              >
                {item.meta}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
