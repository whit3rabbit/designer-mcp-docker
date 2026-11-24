'use client';

import * as React from 'react';
import { Button } from '../components/ui/Button';

export interface TourStep {
  id: string;
  title: string;
  body: string;
}

export interface TourGuideProps {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

/**
 * Lightweight token-themed onboarding tour dialog (shepherd.js alternative without extra deps).
 */
export function TourGuide({ steps, open, onClose }: TourGuideProps) {
  const [index, setIndex] = React.useState(0);
  if (!open || steps.length === 0) return null;
  const current = steps[index] ?? steps[0];
  const isLast = index >= steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${index + 1} of ${steps.length}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 'var(--z-modal, 50)',
      }}
      className="fixed end-6 bottom-6 w-80 border p-5 shadow-xl"
    >
      <p style={{ color: 'var(--color-text-muted)' }} className="text-[11px] font-semibold uppercase tracking-wider">
        Step {index + 1} of {steps.length}
      </p>
      <h3 className="mt-1 text-sm font-semibold">{current.title}</h3>
      <p style={{ color: 'var(--color-text-muted)' }} className="mt-1.5 text-xs leading-relaxed">
        {current.body}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Skip
        </Button>
        <div className="flex gap-2">
          {index > 0 && (
            <Button size="sm" variant="outline" onClick={() => setIndex((i) => i - 1)}>
              Back
            </Button>
          )}
          <Button
            size="sm"
            variant="solid"
            tone="primary"
            onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
          >
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
