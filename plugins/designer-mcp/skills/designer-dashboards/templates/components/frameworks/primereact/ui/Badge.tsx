import * as React from 'react';
import { Tag, type TagProps } from 'primereact/tag';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends Omit<TagProps, 'severity' | 'value'> {
  tone?: BadgeTone;
  children: React.ReactNode;
}

const TONE_STYLES: Record<BadgeTone, React.CSSProperties> = {
  neutral: {
    backgroundColor: 'var(--color-surface-subtle)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-surface)',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary-border)',
  },
  success: {
    backgroundColor: 'color-mix(in oklch, var(--color-success) 14%, transparent)',
    color: 'var(--color-success)',
    border: '1px solid color-mix(in oklch, var(--color-success) 32%, transparent)',
  },
  warning: {
    backgroundColor: 'color-mix(in oklch, var(--color-warning) 14%, transparent)',
    color: 'var(--color-warning)',
    border: '1px solid color-mix(in oklch, var(--color-warning) 32%, transparent)',
  },
  error: {
    backgroundColor: 'color-mix(in oklch, var(--color-error) 14%, transparent)',
    color: 'var(--color-error)',
    border: '1px solid color-mix(in oklch, var(--color-error) 32%, transparent)',
  },
  info: {
    backgroundColor: 'color-mix(in oklch, var(--color-info) 14%, transparent)',
    color: 'var(--color-info)',
    border: '1px solid color-mix(in oklch, var(--color-info) 32%, transparent)',
  },
};

export function Badge({ tone = 'neutral', rounded = true, style, children, ...rest }: BadgeProps) {
  return (
    <Tag
      rounded={rounded}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.55rem',
        lineHeight: 1.25,
        ...TONE_STYLES[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
