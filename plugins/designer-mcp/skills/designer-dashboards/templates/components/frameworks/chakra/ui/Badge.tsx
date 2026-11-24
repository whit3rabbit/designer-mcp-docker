import * as React from 'react';
import { Badge as ChakraBadge, type BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends Omit<ChakraBadgeProps, 'colorPalette'> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, { bg: string; color: string; borderColor: string }> = {
  neutral: {
    bg: 'var(--color-surface-subtle)',
    color: 'var(--color-text-muted)',
    borderColor: 'var(--color-border)',
  },
  primary: {
    bg: 'var(--color-primary-surface)',
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary-border)',
  },
  success: {
    bg: 'color-mix(in oklab, var(--color-success) 14%, transparent)',
    color: 'var(--color-success)',
    borderColor: 'color-mix(in oklab, var(--color-success) 35%, transparent)',
  },
  warning: {
    bg: 'color-mix(in oklab, var(--color-warning) 16%, transparent)',
    color: 'var(--color-warning)',
    borderColor: 'color-mix(in oklab, var(--color-warning) 35%, transparent)',
  },
  error: {
    bg: 'color-mix(in oklab, var(--color-error) 14%, transparent)',
    color: 'var(--color-error)',
    borderColor: 'color-mix(in oklab, var(--color-error) 35%, transparent)',
  },
  info: {
    bg: 'color-mix(in oklab, var(--color-info) 14%, transparent)',
    color: 'var(--color-info)',
    borderColor: 'color-mix(in oklab, var(--color-info) 35%, transparent)',
  },
};

export function Badge({ tone = 'neutral', children, ...rest }: BadgeProps) {
  const style = toneStyles[tone];
  return (
    <ChakraBadge
      px={2.5}
      py={0.5}
      fontSize="xs"
      fontWeight="medium"
      borderRadius="full"
      borderWidth="1px"
      bg={style.bg}
      color={style.color}
      borderColor={style.borderColor}
      display="inline-flex"
      alignItems="center"
      gap={1}
      {...rest}
    >
      {children}
    </ChakraBadge>
  );
}
