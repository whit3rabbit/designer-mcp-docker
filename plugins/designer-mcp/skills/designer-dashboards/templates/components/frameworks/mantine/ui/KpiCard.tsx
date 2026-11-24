import * as React from 'react';
import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from './Card';
import { Badge, type BadgeTone } from './Badge';

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: KpiTrend;
  subtitle?: string;
  icon?: React.ReactNode;
}

const TREND_TONE: Record<KpiTrend, BadgeTone> = {
  up: 'success',
  down: 'error',
  neutral: 'neutral',
};

function TrendIcon({ trend }: { trend: KpiTrend }) {
  if (trend === 'up') return <ArrowUpRight size={14} />;
  if (trend === 'down') return <ArrowDownRight size={14} />;
  return <Minus size={14} />;
}

export function KpiCard({
  label,
  value,
  delta,
  trend = 'neutral',
  subtitle,
  icon,
}: KpiCardProps) {
  return (
    <Card padding="lg">
      <Stack gap="xs">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}
          >
            {label}
          </Text>
          {icon ? (
            <ThemeIcon
              size="md"
              radius="md"
              variant="light"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary)',
              }}
            >
              {icon}
            </ThemeIcon>
          ) : null}
        </Group>

        <Group justify="space-between" align="baseline" gap="xs">
          <Text
            fw={700}
            style={{
              fontSize: '1.5rem',
              lineHeight: 1.2,
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Text>
          {delta ? (
            <Badge tone={TREND_TONE[trend]} leftSection={<TrendIcon trend={trend} />}>
              {delta}
            </Badge>
          ) : null}
        </Group>

        {subtitle ? (
          <Text size="xs" style={{ color: 'var(--color-text-muted)' }}>
            {subtitle}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}
