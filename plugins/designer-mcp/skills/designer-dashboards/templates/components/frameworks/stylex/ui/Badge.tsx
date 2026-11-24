import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../theme/tokens.stylex';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: tokens.fontSans,
    fontWeight: 500,
    lineHeight: 1.2,
    borderRadius: tokens.radiusFull,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    whiteSpace: 'nowrap',
  },
  xs: {
    paddingBlock: '2px',
    paddingInline: '6px',
    fontSize: tokens.text2xs,
  },
  sm: {
    paddingBlock: '3px',
    paddingInline: '10px',
    fontSize: tokens.textXs,
  },
  md: {
    paddingBlock: '4px',
    paddingInline: '12px',
    fontSize: tokens.textSm,
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: tokens.radiusFull,
    flexShrink: 0,
  },
});

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
        ? { borderColor: border, color, backgroundColor: 'transparent' }
        : { backgroundColor: surface, color };

  const sx = stylex.props(styles.base, styles[size]);

  return (
    <span
      {...rest}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={{ ...sx.style, ...variantStyle, ...style }}
    >
      {variant === 'dot' ? (
        <span
          aria-hidden="true"
          {...stylex.props(styles.dot)}
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
    </span>
  );
}
