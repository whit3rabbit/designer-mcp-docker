import * as React from 'react';

export type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

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
  const surface = tone === 'neutral' ? 'var(--color-surface-subtle)' : `var(--color-${tone}-surface)`;
  const border = tone === 'neutral' ? 'var(--color-border)' : `var(--color-${tone}-border)`;

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: color, color: 'var(--color-on-solid)' }
      : variant === 'outline'
        ? { border: `var(--op-border-width) solid ${border}`, color, backgroundColor: 'transparent' }
        : { backgroundColor: surface, color, border: `var(--op-border-width) solid ${border}` };

  return (
    <span
      className={['op-badge', `op-badge--${size}`, className ?? ''].filter(Boolean).join(' ')}
      style={{ ...variantStyle, ...style }}
      {...rest}
    >
      {variant === 'dot' && (
        <span aria-hidden="true" className="op-badge__dot" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  );
}
