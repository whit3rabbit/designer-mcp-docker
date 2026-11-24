'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { SpotlightCard } from '../assets/Spotlight';
import { Badge } from './Badge';

export interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
  sparkline?: number[];
  spotlight?: boolean;
  className?: string;
}

function buildSparklinePath(points: number[], width = 96, height = 32): string {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  return points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function KpiCard({
  title,
  value,
  delta,
  deltaLabel,
  trend = 'flat',
  icon,
  sparkline,
  spotlight = true,
  className,
}: KpiCardProps) {
  const reducedMotion = Boolean(useReducedMotion());

  const trendTone = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const strokeColor =
    trend === 'up'
      ? 'var(--color-success)'
      : trend === 'down'
        ? 'var(--color-error)'
        : 'var(--color-primary)';

  const body = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {title}
        </span>
        {icon && (
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'var(--color-primary-surface)',
              color: 'var(--color-primary)',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-2xl font-bold tracking-tight tabular-nums"
          style={{ color: 'var(--color-text)' }}
        >
          {value}
        </motion.div>

        {sparkline && sparkline.length > 1 && (
          <svg
            aria-hidden="true"
            width="96"
            height="32"
            viewBox="0 0 96 32"
            className="shrink-0 overflow-visible"
          >
            <path
              d={buildSparklinePath(sparkline)}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {(delta || deltaLabel) && (
        <div className="flex items-center gap-2 text-xs">
          {delta && (
            <Badge tone={trendTone} variant="tonal" size="sm">
              <TrendIcon className="size-3" aria-hidden="true" />
              <span>{delta}</span>
            </Badge>
          )}
          {deltaLabel && (
            <span style={{ color: 'var(--color-text-muted)' }}>{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );

  if (spotlight) {
    return <SpotlightCard className={clsx('p-5', className)}>{body}</SpotlightCard>;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className={clsx('border p-5', className)}
    >
      {body}
    </div>
  );
}
