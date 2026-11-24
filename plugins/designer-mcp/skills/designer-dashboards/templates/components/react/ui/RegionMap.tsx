'use client';

import * as React from 'react';
import { AppIcon } from '../../@core/icons/registry';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

export interface RegionMetric {
  code: string;
  name: string;
  value: number;
  formattedValue?: string;
}

export interface RegionMapProps {
  title: string;
  regions: RegionMetric[];
  unit?: string;
  height?: number;
  loading?: boolean;
  empty?: boolean;
}

const SEQ_TOKENS = [
  'var(--chart-seq-1)',
  'var(--chart-seq-2)',
  'var(--chart-seq-3)',
  'var(--chart-seq-4)',
  'var(--chart-seq-5)',
];

function pickBucketColor(value: number, max: number): string {
  if (max <= 0) return SEQ_TOKENS[0];
  const ratio = Math.min(1, Math.max(0, value / max));
  const idx = Math.min(SEQ_TOKENS.length - 1, Math.floor(ratio * SEQ_TOKENS.length));
  return SEQ_TOKENS[idx];
}

/**
 * Lightweight, zero-bloat region choropleth & breakdown widget bound to
 * design-system sequential tokens (--chart-seq-1..5) with accessible table fallback.
 */
export function RegionMap({
  title,
  regions,
  unit = '',
  height = 280,
  loading = false,
  empty = false,
}: RegionMapProps) {
  const [showTable, setShowTable] = React.useState(false);

  if (!loading && (empty || regions.length === 0)) {
    return <EmptyState title={`No ${title} data`} description="No regional metrics available." />;
  }

  const maxVal = Math.max(...regions.map((r) => r.value), 1);
  const sorted = [...regions].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>Low</span>
          <span className="inline-flex items-center gap-0.5" aria-hidden="true">
            {SEQ_TOKENS.map((tok, i) => (
              <span
                key={i}
                style={{ backgroundColor: tok, borderRadius: 'var(--radius-sm)' }}
                className="inline-block h-2.5 w-4"
              />
            ))}
          </span>
          <span>High</span>
        </div>
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          aria-pressed={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          <AppIcon name="table" size={14} />
          <span>{showTable ? 'Show map' : 'View data table'}</span>
        </Button>
      </div>

      {loading ? (
        <div
          role="status"
          aria-label={`Loading ${title}`}
          style={{ height, backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)' }}
          className="rd-shimmer w-full"
        />
      ) : showTable ? (
        <div
          style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
          className="overflow-x-auto border"
        >
          <table className="w-full border-collapse text-start text-xs">
            <caption className="sr-only">{title} regional breakdown</caption>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-muted)' }}>
                <th className="px-3 py-2 text-start font-semibold">Region</th>
                <th className="px-3 py-2 text-end font-semibold">Value</th>
                <th className="px-3 py-2 text-end font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const pct = ((r.value / Math.max(sorted.reduce((s, x) => s + x.value, 0), 1)) * 100).toFixed(1);
                return (
                  <tr
                    key={r.code}
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    className="border-t"
                  >
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="tabular-nums px-3 py-2 text-end">
                      {r.formattedValue ?? `${r.value}${unit ? ` ${unit}` : ''}`}
                    </td>
                    <td className="tabular-nums px-3 py-2 text-end">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div role="region" aria-label={title} className="space-y-2.5" style={{ minHeight: height }}>
          {sorted.map((r) => {
            const widthPct = Math.max(6, Math.round((r.value / maxVal) * 100));
            const fill = pickBucketColor(r.value, maxVal);
            return (
              <div key={r.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-text)' }} className="font-medium">
                    {r.name}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums">
                    {r.formattedValue ?? `${r.value}${unit ? ` ${unit}` : ''}`}
                  </span>
                </div>
                <div
                  style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-full)' }}
                  className="h-2 w-full overflow-hidden"
                >
                  <div
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: fill,
                      borderRadius: 'var(--radius-full)',
                    }}
                    className="h-full transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
