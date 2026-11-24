'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-base',
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: 'var(--color-success)',
  offline: 'var(--color-text-muted)',
  busy: 'var(--color-error)',
  away: 'var(--color-warning)',
};

function initialsFrom(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className,
  style,
  ...rest
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-primary-surface)',
        color: 'var(--color-primary)',
        borderColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-full)',
        ...style,
      }}
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center overflow-visible font-semibold select-none',
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {showImage ? (
        <img
          src={src ?? ''}
          alt={alt}
          onError={() => setImgError(true)}
          style={{ borderRadius: 'var(--radius-full)' }}
          className="size-full object-cover"
        />
      ) : (
        <span aria-label={alt}>{fallback || initialsFrom(alt) || '?'}</span>
      )}
      {status && (
        <span
          aria-label={`Status: ${status}`}
          style={{
            backgroundColor: STATUS_COLORS[status],
            borderColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-full)',
          }}
          className="absolute bottom-0 end-0 size-2.5 border-2"
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  items,
  max = 4,
  size = 'sm',
}: {
  items: Array<{ alt: string; src?: string | null; fallback?: string }>;
  max?: number;
  size?: AvatarSize;
}) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((item, idx) => (
        <Avatar
          key={`${item.alt}-${idx}`}
          src={item.src}
          alt={item.alt}
          fallback={item.fallback}
          size={size}
          className="ring-2 ring-[var(--color-surface)]"
        />
      ))}
      {overflow > 0 && (
        <span
          style={{
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-full)',
          }}
          className={clsx(
            'tabular-nums inline-flex items-center justify-center border-2 font-semibold',
            SIZE_CLASSES[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
