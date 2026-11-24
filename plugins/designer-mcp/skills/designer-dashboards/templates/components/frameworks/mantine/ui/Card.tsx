import * as React from 'react';
import {
  Card as MantineCard,
  Group,
  Stack,
  Text,
  Title,
  type CardProps as MantineCardProps,
} from '@mantine/core';

export interface CardProps
  extends MantineCardProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'style'> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, style, padding = 'lg', ...props }, ref) => (
    <MantineCard
      ref={ref}
      withBorder
      padding={padding}
      radius="md"
      style={{
        backgroundColor: elevated
          ? 'var(--color-surface-elevated)'
          : 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        ...style,
      }}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({
  children,
  action,
  style,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Group justify="space-between" align="flex-start" mb="sm" style={style}>
      <Stack gap={2}>{children}</Stack>
      {action ? <div>{action}</div> : null}
    </Group>
  );
}

export function CardTitle({
  children,
  order = 4,
}: {
  children: React.ReactNode;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <Title order={order} style={{ color: 'var(--color-text)' }}>
      {children}
    </Title>
  );
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return (
    <Text size="sm" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </Text>
  );
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <div style={style}>{children}</div>;
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Group
      justify="flex-end"
      gap="sm"
      mt="md"
      pt="md"
      style={{
        borderTop: '1px solid var(--color-border)',
        ...style,
      }}
    >
      {children}
    </Group>
  );
}
