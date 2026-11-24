'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'Analytics' | 'Messaging' | 'Payments';
  description: string;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  { id: 'stripe', name: 'Stripe Billing', category: 'Payments', description: 'Sync invoices, MRR, and webhooks.', connected: true },
  { id: 'slack', name: 'Slack Alerts', category: 'Messaging', description: 'Route SLA and anomaly alerts to channels.', connected: true },
  { id: 'posthog', name: 'PostHog Telemetry', category: 'Analytics', description: 'Stream product events and funnels.', connected: false },
  { id: 'github', name: 'GitHub Actions', category: 'Analytics', description: 'Track deployment frequency and rollbacks.', connected: false },
];

export function IntegrationsPage() {
  const [items, setItems] = React.useState(INITIAL_INTEGRATIONS);
  const [category, setCategory] = React.useState('All');

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)));

  const visible = category === 'All' ? items : items.filter((i) => i.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Connected Apps &amp; Integrations</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Connect external data sources, billing providers, and notification webhooks.
          </p>
        </div>
        <div className="flex gap-1.5">
          {['All', 'Analytics', 'Messaging', 'Payments'].map((c) => (
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((app) => (
          <article
            key={app.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card flex flex-col justify-between gap-4 border p-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{app.name}</h2>
                <Badge tone={app.connected ? 'success' : 'neutral'}>
                  {app.connected ? 'Connected' : app.category}
                </Badge>
              </div>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                {app.description}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant={app.connected ? 'outline' : 'solid'}
                tone={app.connected ? 'neutral' : 'primary'}
                onClick={() => toggle(app.id)}
              >
                {app.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
