'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ActivityEvent {
  id: string;
  group: 'Today' | 'Yesterday';
  actor: string;
  action: string;
  category: 'Security' | 'Billing' | 'Deploy';
  time: string;
}

const EVENTS: ActivityEvent[] = [
  { id: 'e1', group: 'Today', actor: 'Elena Vance', action: 'Rotated production API key pk_live_8421', category: 'Security', time: '10:15' },
  { id: 'e2', group: 'Today', actor: 'CI Bot', action: 'Published v2.4.0 build to edge', category: 'Deploy', time: '08:40' },
  { id: 'e3', group: 'Yesterday', actor: 'Marcus Chen', action: 'Upgraded workspace to Enterprise Annual', category: 'Billing', time: '16:22' },
];

export function TimelineActivityPage() {
  const [filter, setFilter] = React.useState<string>('All');
  const visible = filter === 'All' ? EVENTS : EVENTS.filter((e) => e.category === filter);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Activity &amp; Audit Log</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Chronological workspace events across security, billing, and deployments.
          </p>
        </div>
        <div className="flex gap-1.5">
          {['All', 'Security', 'Billing', 'Deploy'].map((cat) => (
            <Button
              key={cat}
              size="xs"
              variant={filter === cat ? 'solid' : 'outline'}
              tone={filter === cat ? 'primary' : 'neutral'}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {(['Today', 'Yesterday'] as const).map((group) => {
        const items = visible.filter((e) => e.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="space-y-3">
            <h2 style={{ color: 'var(--color-text-muted)' }} className="text-xs font-semibold uppercase tracking-wider">
              {group}
            </h2>
            <ol
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
              className="rd-card divide-y border"
            >
              {items.map((item) => (
                <li key={item.id} style={{ borderColor: 'var(--color-border)' }} className="flex items-start justify-between gap-4 p-4 text-sm">
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold">{item.actor}</span>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>{item.action}</span>
                    </p>
                    <Badge tone={item.category === 'Security' ? 'warning' : item.category === 'Deploy' ? 'success' : 'primary'}>
                      {item.category}
                    </Badge>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }} className="tabular-nums text-xs">
                    {item.time}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
