'use client';

import * as React from 'react';
import { ShadcnChartExample } from './ShadcnChartExample';

/**
 * Recharts-backed Charts Gallery page for stacks using Recharts as their single chart engine.
 */
export function ChartsGalleryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Charts Gallery (Recharts + OpenDesign Tokens)</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Theme-aware Recharts compositions bound to --chart-1..10 tokens via ShadcnChart.
        </p>
      </div>
      <ShadcnChartExample />
    </div>
  );
}
