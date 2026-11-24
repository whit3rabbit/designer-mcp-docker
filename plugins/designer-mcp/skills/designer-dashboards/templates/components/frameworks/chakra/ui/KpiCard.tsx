import * as React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

export type KpiTrend = 'up' | 'down' | 'flat';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: KpiTrend;
  caption?: string;
  icon?: React.ReactNode;
}

const trendToneMap: Record<KpiTrend, 'success' | 'error' | 'neutral'> = {
  up: 'success',
  down: 'error',
  flat: 'neutral',
};

export function KpiCard({
  label,
  value,
  delta,
  trend = 'flat',
  caption,
  icon,
}: KpiCardProps) {
  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card>
      <Flex align="flex-start" justify="space-between" gap={3}>
        <Box textAlign="start">
          <Text fontSize="xs" fontWeight="medium" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="var(--color-text)" mt={1} fontFamily="var(--font-sans)">
            {value}
          </Text>
        </Box>
        {icon && (
          <Flex
            align="center"
            justify="center"
            w={9}
            h={9}
            borderRadius="var(--radius-md)"
            bg="var(--color-primary-surface)"
            color="var(--color-primary)"
            borderWidth="1px"
            borderColor="var(--color-primary-border)"
            flexShrink={0}
            aria-hidden="true"
          >
            {icon}
          </Flex>
        )}
      </Flex>

      {(delta || caption) && (
        <Flex align="center" gap={2} mt={3} flexWrap="wrap">
          {delta && (
            <Badge tone={trendToneMap[trend]}>
              <TrendIcon size={12} aria-hidden="true" />
              {delta}
            </Badge>
          )}
          {caption && (
            <Text fontSize="xs" color="var(--color-text-muted)">
              {caption}
            </Text>
          )}
        </Flex>
      )}
    </Card>
  );
}
