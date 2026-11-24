'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { AppIcon } from '../../@core/icons/registry';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0 text-[10px]',
  sm: 'px-2.5 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({
  tone = 'primary',
  variant = 'tonal',
  size = 'sm',
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  const color = tone === 'neutral' ? 'var(--color-text)' : `var(--color-${tone})`;
  const surface = tone === 'neutral' ? 'var(--color-canvas)' : `var(--color-${tone}-surface)`;
  const border = tone === 'neutral' ? 'var(--color-border)' : `var(--color-${tone}-border)`;

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: color, color: 'var(--color-on-solid)' }
      : variant === 'outline'
        ? { border: `1px solid ${border}`, color, backgroundColor: 'transparent' }
        : { backgroundColor: surface, color };

  return (
    <span
      style={{ borderRadius: 'var(--radius-full)', ...variantStyle, ...style }}
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold leading-tight',
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {variant === 'dot' && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: color, borderRadius: 'var(--radius-full)' }}
          className="size-1.5 shrink-0"
        />
      )}
      {children}
    </span>
  );
}

export function BadgeDot({
  tone = 'primary',
  label,
  className,
}: {
  tone?: BadgeTone;
  label?: string;
  className?: string;
}) {
  const color = tone === 'neutral' ? 'var(--color-text-muted)' : `var(--color-${tone})`;
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      style={{ backgroundColor: color, borderRadius: 'var(--radius-full)' }}
      className={clsx('inline-block size-2 shrink-0', className)}
    />
  );
}

export function BadgeButton({
  tone = 'primary',
  onRemove,
  removeLabel = 'Remove',
  children,
}: {
  tone?: BadgeTone;
  onRemove: () => void;
  removeLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge tone={tone} variant="tonal" className="pe-1.5">
      <span>{children}</span>
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="cursor-pointer rounded-full p-0.5 hover:opacity-75"
      >
        <AppIcon name="x" size={11} />
      </button>
    </Badge>
  );
}
