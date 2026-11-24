'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ApiKeyRow {
  id: string;
  label: string;
  prefix: string;
  scope: string;
  status: 'active' | 'revoked';
}

const INITIAL_KEYS: ApiKeyRow[] = [
  { id: 'k1', label: 'Production CI Deploy', prefix: 'rd_live_9f2a••••', scope: 'read:metrics', status: 'active' },
  { id: 'k2', label: 'Staging Webhook', prefix: 'rd_test_3c18••••', scope: 'write:events', status: 'active' },
];

export function ApiKeysPage() {
  const [keys, setKeys] = React.useState<ApiKeyRow[]>(INITIAL_KEYS);

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)));
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className="rd-card space-y-4 border p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold">API Keys & Integrations</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            Rotate or revoke scoped tokens without interrupting active sessions.
          </p>
        </div>
        <Button
          size="sm"
          variant="solid"
          tone="primary"
          onClick={() =>
            setKeys((prev) => [
              ...prev,
              {
                id: `k-${Date.now()}`,
                label: 'New Scoped Token',
                prefix: 'rd_live_new••••',
                scope: 'read:all',
                status: 'active',
              },
            ])
          }
        >
          Create Token
        </Button>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {keys.map((k) => (
          <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">{k.label}</p>
              <p style={{ color: 'var(--color-text-muted)' }} className="font-mono text-xs">
                {k.prefix} · {k.scope}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={k.status === 'active' ? 'success' : 'error'}>{k.status}</Badge>
              {k.status === 'active' && (
                <Button size="sm" variant="outline" tone="error" onClick={() => revokeKey(k.id)}>
                  Revoke
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
