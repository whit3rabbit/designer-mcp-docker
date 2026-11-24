'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface MediaAsset {
  id: string;
  title: string;
  category: 'UI' | 'Charts' | 'Brand';
  dimensions: string;
}

const ASSETS: MediaAsset[] = [
  { id: 'g1', title: 'Executive Revenue Overview', category: 'Charts', dimensions: '1600 × 900' },
  { id: 'g2', title: 'SaaS Violet Token Sheet', category: 'Brand', dimensions: '1280 × 800' },
  { id: 'g3', title: 'List-Detail Mail Shell', category: 'UI', dimensions: '1440 × 900' },
  { id: 'g4', title: 'POS Split Terminal', category: 'UI', dimensions: '1440 × 900' },
];

export function GalleryPage() {
  const [category, setCategory] = React.useState('All');
  const [selected, setSelected] = React.useState<MediaAsset | null>(null);

  const visible = category === 'All' ? ASSETS : ASSETS.filter((a) => a.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Media &amp; Asset Gallery</h1>
        <div className="flex gap-1.5">
          {['All', 'UI', 'Charts', 'Brand'].map((c) => (
            <Button
              key={c}
              size="xs"
              variant={category === c ? 'solid' : 'outline'}
              tone={category === c ? 'primary' : 'neutral'}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => setSelected(asset)}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card rd-card-interactive border p-4 text-start"
          >
            <div
              style={{ backgroundColor: 'var(--color-primary-surface)', borderRadius: 'var(--radius-md)' }}
              className="mb-3 flex h-32 items-center justify-center text-xs font-medium"
            >
              {asset.dimensions}
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{asset.title}</p>
              <Badge tone="neutral">{asset.category}</Badge>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card flex items-center justify-between border p-5"
        >
          <div>
            <p className="font-semibold">{selected.title}</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              {selected.category} · {selected.dimensions}
            </p>
          </div>
          <Button size="xs" variant="outline" tone="neutral" onClick={() => setSelected(null)}>
            Close Preview
          </Button>
        </div>
      )}
    </div>
  );
}
