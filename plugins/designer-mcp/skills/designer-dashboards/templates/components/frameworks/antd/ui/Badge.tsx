'use client';

import * as React from 'react';
import { Tag } from 'antd';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const SIZE_STYLES: Record<BadgeSize, React.CSSProperties> = {
  xs: { fontSize: 11, lineHeight: '16px', paddingInline: 6, paddingBlock: 0 },
  sm: { fontSize: 12, lineHeight: '20px', paddingInline: 8, paddingBlock: 1 },
  md: { fontSize: 13, lineHeight: '22px', paddingInline: 10, paddingBlock: 2 },
};

export function Badge({
  tone = 'primary',
  variant = 'tonal',
  size = 'sm',
  style,
  children,
  ...rest
}: BadgeProps) {
  const color = tone === 'neutral' ? 'var(--color-text)' : `var(--color-${tone})`;
  const surface = tone === 'neutral' ? 'var(--color-surface-subtle)' : `var(--color-${tone}-surface)`;
  const border = tone === 'neutral' ? 'var(--color-border)' : `var(--color-${tone}-border)`;

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: color, borderColor: color, color: 'var(--color-on-solid)' }
      : variant === 'outline'
        ? { backgroundColor: 'transparent', borderColor: border, color }
        : { backgroundColor: surface, borderColor: 'transparent', color };

  return (
    <Tag
      bordered={variant === 'outline'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginInlineEnd: 0,
        borderRadius: 9999,
        fontWeight: 500,
        ...SIZE_STYLES[size],
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {variant === 'dot' && (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </Tag>
  );
}
