'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface DirectoryMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Active' | 'Invited';
}

const MEMBERS: DirectoryMember[] = [
  { id: 'u1', name: 'Elena Vance', role: 'Admin', department: 'Engineering', status: 'Active' },
  { id: 'u2', name: 'Marcus Chen', role: 'Editor', department: 'Design Systems', status: 'Active' },
  { id: 'u3', name: 'Nadia Al-Mansoor', role: 'Admin', department: 'Product', status: 'Active' },
  { id: 'u4', name: 'Liam O\'Connor', role: 'Viewer', department: 'Finance', status: 'Invited' },
];

export function UserDirectoryPage() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Team Directory</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            {MEMBERS.length} workspace members across engineering, design, and operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="xs" variant={view === 'grid' ? 'solid' : 'outline'} tone="neutral" onClick={() => setView('grid')}>
            Grid
          </Button>
          <Button size="xs" variant={view === 'list' ? 'solid' : 'outline'} tone="neutral" onClick={() => setView('list')}>
            List
          </Button>
        </div>
      </div>

      <div className={view === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' : 'space-y-3'}>
        {MEMBERS.map((m) => (
          <article
            key={m.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className={`rd-card flex border p-5 ${view === 'list' ? 'items-center justify-between gap-4' : 'flex-col gap-3'}`}
          >
            <div>
              <h2 className="text-sm font-semibold">{m.name}</h2>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                {m.department} · {m.role}
              </p>
            </div>
            <Badge tone={m.status === 'Active' ? 'success' : 'warning'}>{m.status}</Badge>
          </article>
        ))}
      </div>
    </div>
  );
}
