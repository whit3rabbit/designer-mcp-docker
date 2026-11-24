'use client';

/**
 * Split-Pane Map + Fleet/Asset Sidebar Shell (`leaflet` / `maplibre-gl`)
 * Distilled from materialize_v13.11.1, vuexy_v10.11.1, midone_v5.0.5.
 *
 * Install: `pnpm add leaflet @types/leaflet` (or `maplibre-gl`)
 * Uses token-themed sidebar + responsive split-pane without hardcoded colors.
 */

import * as React from 'react';

export interface FleetVehicle {
  id: string;
  label: string;
  status: 'en-route' | 'idle' | 'delayed';
  coords: [number, number];
}

export interface MapSplitExampleProps {
  vehicles: FleetVehicle[];
  renderMap: (selected: FleetVehicle) => React.ReactNode;
}

export function MapSplitExample({ vehicles, renderMap }: MapSplitExampleProps) {
  const [selected, setSelected] = React.useState<FleetVehicle>(vehicles[0]);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className="rd-card grid min-h-[560px] grid-cols-1 overflow-hidden border lg:grid-cols-12"
    >
      <aside
        style={{ borderColor: 'var(--color-border)' }}
        className="space-y-2 overflow-y-auto border-b p-4 lg:col-span-4 lg:border-b-0 lg:border-e"
      >
        <h2 className="text-sm font-semibold">Active Fleet ({vehicles.length})</h2>
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setSelected(v)}
                style={{
                  backgroundColor: selected?.id === v.id ? 'var(--color-primary-surface)' : 'var(--color-canvas)',
                  color: selected?.id === v.id ? 'var(--color-primary)' : 'inherit',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex w-full cursor-pointer items-center justify-between p-3 text-start text-sm font-medium"
              >
                <span>{v.label}</span>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs capitalize">
                  {v.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section aria-label="Fleet map" className="min-h-[360px] lg:col-span-8">
        {selected && renderMap(selected)}
      </section>
    </div>
  );
}
