'use client';

import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { css } from 'styled-system/css';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

export interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  subtitle?: string;
  icon?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  delta,
  trend = 'flat',
  subtitle,
  icon,
}: KpiCardProps) {
  const tone = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';
  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card>
      <CardContent className={css({ paddingTop: '20px' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '12px',
          })}
        >
          <span className={css({ fontSize: '13px', fontWeight: '500', color: 'textMuted' })}>
            {title}
          </span>
          {icon && (
            <span
              aria-hidden="true"
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: 'md',
                bg: 'primarySurface',
                color: 'primary',
              })}
            >
              {icon}
            </span>
          )}
        </div>

        <div
          className={css({
            fontSize: '26px',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            color: 'text',
            fontFamily: 'sans',
          })}
        >
          {value}
        </div>

        {(delta || subtitle) && (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              flexWrap: 'wrap',
            })}
          >
            {delta && (
              <Badge tone={tone} size="sm">
                <TrendIcon size={12} aria-hidden="true" />
                {delta}
              </Badge>
            )}
            {subtitle && (
              <span className={css({ fontSize: '12px', color: 'textMuted' })}>{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
