'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type ProfileTab = 'overview' | 'projects' | 'connections';

export function ProfilePage() {
  const [tab, setTab] = React.useState<ProfileTab>('overview');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <aside
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-4 border p-5 lg:col-span-4"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
            className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
          >
            AR
          </div>
          <div>
            <h1 className="text-base font-semibold">Alex Rivera</h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              Principal Systems Architect
            </p>
          </div>
        </div>
        <nav aria-label="Profile sections" className="space-y-1">
          {(['overview', 'projects', 'connections'] as ProfileTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                backgroundColor: tab === t ? 'var(--color-primary-surface)' : 'transparent',
                color: tab === t ? 'var(--color-primary)' : 'inherit',
                borderRadius: 'var(--radius-md)',
              }}
              className="w-full cursor-pointer px-3 py-2 text-start text-sm font-medium capitalize"
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-4 border p-6 lg:col-span-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold capitalize">{tab}</h2>
          <Button size="sm" variant="outline">
            Edit Profile
          </Button>
        </div>
        {tab === 'overview' && (
          <div className="space-y-3 text-sm">
            <p>Leading design-system governance and multi-framework dashboard architecture.</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">Design Systems</Badge>
              <Badge tone="success">WCAG 2.1 AA</Badge>
              <Badge tone="info">TypeScript</Badge>
            </div>
          </div>
        )}
        {tab === 'projects' && <p className="text-sm">3 active platform initiatives tracked this quarter.</p>}
        {tab === 'connections' && <p className="text-sm">Connected with 18 engineering and product leads.</p>}
      </section>
    </div>
  );
}
