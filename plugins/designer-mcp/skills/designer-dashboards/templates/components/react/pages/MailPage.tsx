'use client';

import * as React from 'react';
import { ListDetailShell } from '../../@layouts/AppShells';
import { AppIcon } from '../../@core/icons/registry';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface MailThread {
  id: string;
  folder: 'inbox' | 'starred' | 'sent';
  sender: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread?: boolean;
}

const SAMPLE_MAIL: MailThread[] = [
  {
    id: 'm1',
    folder: 'inbox',
    sender: 'Elena Rostova',
    subject: 'Q4 Design Token Audit Sign-off',
    preview: 'All 21 presets passed WCAG AA contrast checks...',
    body: 'All 21 presets passed WCAG AA contrast checks in build-tokens.mjs. Ready to ship the release.',
    time: '09:42',
    unread: true,
  },
  {
    id: 'm2',
    folder: 'inbox',
    sender: 'Marcus Vance',
    subject: 'Enterprise SSO SAML Metadata',
    preview: 'Attached the IdP XML metadata for staging...',
    body: 'Attached the IdP XML metadata for staging. Please verify role mapping for admin and analyst.',
    time: 'Yesterday',
  },
  {
    id: 'm3',
    folder: 'starred',
    sender: 'Billing Ops',
    subject: 'Invoice #INV-2048 Paid',
    preview: 'Payment of $2,400.00 settled via Stripe...',
    body: 'Payment of $2,400.00 settled via Stripe. Receipt PDF is archived in Billing.',
    time: 'Nov 20',
  },
];

export function MailPage() {
  const [folder, setFolder] = React.useState<'inbox' | 'starred' | 'sent'>('inbox');
  const [selectedId, setSelectedId] = React.useState<string>('m1');

  const visible = SAMPLE_MAIL.filter((m) => m.folder === folder);
  const active = visible.find((m) => m.id === selectedId) ?? visible[0];

  return (
    <ListDetailShell
      sidebar={
        <div className="space-y-3">
          <Button variant="solid" tone="primary" className="w-full">
            <AppIcon name="plus" size={16} />
            Compose
          </Button>
          <nav aria-label="Mail folders" className="space-y-1">
            {(['inbox', 'starred', 'sent'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                style={{
                  backgroundColor: folder === f ? 'var(--color-primary-surface)' : 'transparent',
                  color: folder === f ? 'var(--color-primary)' : 'inherit',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm font-medium capitalize"
              >
                <span>{f}</span>
                {f === 'inbox' && <Badge tone="primary">1</Badge>}
              </button>
            ))}
          </nav>
        </div>
      }
      list={
        <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {visible.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelectedId(m.id)}
                style={{
                  backgroundColor: active?.id === m.id ? 'var(--color-primary-surface)' : 'transparent',
                }}
                className="w-full cursor-pointer p-4 text-start transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{m.sender}</span>
                  <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                    {m.time}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium">{m.subject}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="mt-0.5 truncate text-xs">
                  {m.preview}
                </p>
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li style={{ color: 'var(--color-text-muted)' }} className="p-6 text-center text-sm">
              No messages in {folder}.
            </li>
          )}
        </ul>
      }
      detail={
        active ? (
          <article className="space-y-4">
            <header className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="text-lg font-semibold">{active.subject}</h2>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                  From {active.sender} · {active.time}
                </p>
              </div>
              <Button variant="outline" size="sm" aria-label="Reply">
                <AppIcon name="corner-up-left" size={14} />
                Reply
              </Button>
            </header>
            <p className="text-sm leading-relaxed">{active.body}</p>
          </article>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Select a thread to read.
          </p>
        )
      }
    />
  );
}
