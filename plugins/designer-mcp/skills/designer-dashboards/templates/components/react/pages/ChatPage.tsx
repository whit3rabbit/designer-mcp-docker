'use client';

import * as React from 'react';
import { ThreadedStreamShell } from '../../@layouts/AppShells';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ChatThread {
  id: string;
  name: string;
  role: string;
  unread: number;
  messages: { id: string; sender: 'them' | 'me'; text: string; time: string }[];
}

const THREADS: ChatThread[] = [
  {
    id: 't1',
    name: 'Nadia Al-Mansoor',
    role: 'Design Systems Lead',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', text: 'Did the WCAG AA contrast audit pass on the new glass card skin?', time: '09:42' },
      { id: 'm2', sender: 'me', text: 'Yes — all 8 light/dark surface pairs passed >= 4.5:1.', time: '09:44' },
    ],
  },
  {
    id: 't2',
    name: 'Platform Ops',
    role: 'Release Channel',
    unread: 0,
    messages: [
      { id: 'm3', sender: 'them', text: 'Next.js 16 build pipeline is green.', time: 'Yesterday' },
    ],
  },
];

export function ChatPage() {
  const [threads, setThreads] = React.useState<ChatThread[]>(THREADS);
  const [activeId, setActiveId] = React.useState(THREADS[0].id);
  const [draft, setDraft] = React.useState('');
  const [showInspector, setShowInspector] = React.useState(true);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              messages: [...t.messages, { id: String(Date.now()), sender: 'me', text: draft.trim(), time: 'Now' }],
            }
          : t,
      ),
    );
    setDraft('');
  };

  return (
    <ThreadedStreamShell
      fixedHeight
      threadsSidebar={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <Button size="xs" variant="ghost" tone="neutral" onClick={() => setShowInspector((v) => !v)}>
              {showInspector ? 'Hide Info' : 'Info'}
            </Button>
          </div>
          <ul className="space-y-1">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  style={{
                    backgroundColor: t.id === active.id ? 'var(--color-primary-surface)' : 'transparent',
                    borderRadius: 'var(--radius-md)',
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-start text-sm"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{t.role}</p>
                  </div>
                  {t.unread > 0 && <Badge tone="primary">{t.unread}</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      }
      stream={
        <div className="space-y-3">
          {active.messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div
                style={{
                  backgroundColor: m.sender === 'me' ? 'var(--color-primary)' : 'var(--color-canvas)',
                  color: m.sender === 'me' ? 'var(--color-on-solid)' : 'var(--color-text)',
                  borderRadius: 'var(--radius-lg)',
                }}
                className="max-w-md px-4 py-2.5 text-sm"
              >
                {m.text}
              </div>
              <span style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-[11px]">
                {m.time}
              </span>
            </div>
          ))}
        </div>
      }
      composer={
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${active.name}...`}
            aria-label="Message input"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
            className="flex-1 border px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" variant="solid" tone="primary">
            Send
          </Button>
        </form>
      }
      inspector={
        showInspector ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">{active.name}</p>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{active.role}</p>
            </div>
            <div style={{ borderColor: 'var(--color-border)' }} className="border-t pt-3">
              <p style={{ color: 'var(--color-text-muted)' }} className="mb-2 text-xs font-semibold uppercase">
                Shared Files
              </p>
              <p className="text-xs">design-tokens-audit.json</p>
            </div>
          </div>
        ) : undefined
      }
    />
  );
}
