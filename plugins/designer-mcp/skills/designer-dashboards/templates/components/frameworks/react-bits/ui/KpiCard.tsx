'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { SpotlightCard } from '../assets/SpotlightCard';
import { Badge } from './Badge';
import { useMotionPreferences } from '../theme/motionConfig';

export interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  caption?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  trend = 'flat',
  caption,
  icon,
  className,
}: KpiCardProps) {
  const { prefersReducedMotion, getTransition, variants } = useMotionPreferences();

  const trendTone = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={getTransition()}
      className={className}
    >
      <SpotlightCard className="h-full p-5 text-start">
        <div className="flex items-start justify-between gap-3">
          <span style={{ color: 'var(--color-text-muted)' }} className="text-xs font-medium">
            {label}
          </span>
          {icon && (
            <span
              aria-hidden="true"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
              }}
              className="flex size-8 shrink-0 items-center justify-center"
            >
              {icon}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <motion.span
            key={String(value)}
            initial={prefersReducedMotion ? false : { opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ duration: 0.25 })}
            style={{ color: 'var(--color-text)' }}
            className="text-2xl font-bold tracking-tight tabular-nums"
          >
            {value}
          </motion.span>

          {delta && (
            <Badge tone={trendTone} variant="tonal">
              <TrendIcon className="size-3" aria-hidden="true" />
              {delta}
            </Badge>
          )}
        </div>

        {caption && (
          <p style={{ color: 'var(--color-text-muted)' }} className="mt-2 text-xs">
            {caption}
          </p>
        )}
      </SpotlightCard>
    </motion.div>
  );
}
