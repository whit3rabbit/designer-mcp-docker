'use client';

import * as React from 'react';
import { MasonryGridShell } from '../../@layouts/AppShells';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface NoteCard {
  id: string;
  title: string;
  body: string;
  tag: 'Product' | 'Design' | 'Ops';
  pinned?: boolean;
}

const INITIAL_NOTES: NoteCard[] = [
  { id: 'n1', title: 'Q4 Design Token Audit', body: 'Verify all 21 presets against WCAG 2.1 AA >= 4.5:1 and logical RTL properties.', tag: 'Design', pinned: true },
  { id: 'n2', title: 'Release Checklist', body: '1. Run build-tokens --check\n2. Run verify-dashboard\n3. Tag v2.4 release', tag: 'Ops' },
  { id: 'n3', title: 'Customer Feedback', body: 'Users requested 9+3 side-rail layout for finance and helpdesk dashboards.', tag: 'Product' },
  { id: 'n4', title: 'Print CSS Verification', body: 'Ensure dark-mode CSS vars reset to light ink-safe palette inside @media print.', tag: 'Design' },
];

export function NotesMasonryPage() {
  const [notes] = React.useState(INITIAL_NOTES);
  const [tag, setTag] = React.useState<string>('All');

  const visible = tag === 'All' ? notes : notes.filter((n) => n.tag === tag);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Workspace Notes</h1>
        <div className="flex gap-1.5">
          {['All', 'Product', 'Design', 'Ops'].map((t) => (
            <Button
              key={t}
              size="xs"
              variant={tag === t ? 'solid' : 'outline'}
              tone={tag === t ? 'primary' : 'neutral'}
              onClick={() => setTag(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <MasonryGridShell columns={3}>
        {visible.map((note) => (
          <article
            key={note.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card space-y-2 border p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{note.title}</h2>
              <Badge tone={note.pinned ? 'primary' : 'neutral'}>{note.tag}</Badge>
            </div>
            <p style={{ color: 'var(--color-text-muted)' }} className="whitespace-pre-line text-sm">
              {note.body}
            </p>
          </article>
        ))}
      </MasonryGridShell>
    </div>
  );
}
