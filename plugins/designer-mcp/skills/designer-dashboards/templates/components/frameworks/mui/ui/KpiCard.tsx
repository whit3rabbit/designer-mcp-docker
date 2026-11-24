import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from './Card';
import { Badge, type BadgeTone } from './Badge';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  helperText?: string;
  icon?: React.ReactNode;
}

const TREND_TONE: Record<NonNullable<KpiCardProps['trend']>, BadgeTone> = {
  up: 'success',
  down: 'error',
  neutral: 'neutral',
};

export function KpiCard({
  label,
  value,
  delta,
  trend = 'neutral',
  helperText,
  icon,
}: KpiCardProps) {
  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                bgcolor: 'var(--color-primary-surface)',
                color: 'var(--color-primary)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {icon}
            </Box>
          )}
        </Stack>

        <Typography
          variant="h4"
          component="div"
          fontWeight={700}
          sx={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>

        {(delta || helperText) && (
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            {delta && (
              <Badge
                tone={TREND_TONE[trend]}
                icon={<TrendIcon size={14} aria-hidden="true" />}
                label={delta}
              />
            )}
            {helperText && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
