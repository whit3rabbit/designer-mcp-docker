'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export type StatusPageKind = 'maintenance' | 'coming-soon' | 'system-status';

export interface StatusPagesProps {
  kind?: StatusPageKind;
}

export function StatusPages({ kind: initialKind = 'maintenance' }: StatusPagesProps) {
  const [kind, setKind] = React.useState<StatusPageKind>(initialKind);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex justify-center gap-2">
        {(['maintenance', 'coming-soon', 'system-status'] as StatusPageKind[]).map((k) => (
          <Button
            key={k}
            size="xs"
            variant={kind === k ? 'solid' : 'outline'}
            tone={kind === k ? 'primary' : 'neutral'}
            onClick={() => setKind(k)}
          >
            {k}
          </Button>
        ))}
      </div>

      {kind === 'maintenance' && (
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card space-y-3 border p-8 text-center"
        >
          <Badge tone="warning">Scheduled Maintenance</Badge>
          <h1 className="text-2xl font-bold">We&apos;ll be right back</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Database index upgrades are underway. Expected completion in 15 minutes.
          </p>
        </section>
      )}

      {kind === 'coming-soon' && (
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card space-y-4 border p-8 text-center"
        >
          <Badge tone="primary">Launching Soon</Badge>
          <h1 className="text-2xl font-bold">Autonomous Reporting v3</h1>
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              ['12', 'Days'],
              ['08', 'Hours'],
              ['42', 'Mins'],
              ['19', 'Secs'],
            ].map(([val, label]) => (
              <div
                key={label}
                style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)' }}
                className="p-3"
              >
                <p className="tabular-nums text-xl font-bold">{val}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {kind === 'system-status' && (
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card space-y-4 border p-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">System Status</h1>
            <Badge tone="success">All Systems Operational</Badge>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ['API Gateway', '99.99%'],
              ['Analytics Ingestion', '99.97%'],
              ['Auth & SSO', '100.00%'],
            ].map(([svc, uptime]) => (
              <li
                key={svc}
                style={{ borderColor: 'var(--color-border)' }}
                className="flex items-center justify-between border-b py-2 last:border-b-0"
              >
                <span>{svc}</span>
                <span className="tabular-nums text-xs font-semibold">{uptime}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
