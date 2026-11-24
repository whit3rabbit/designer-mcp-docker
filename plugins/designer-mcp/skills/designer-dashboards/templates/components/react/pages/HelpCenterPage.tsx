'use client';

import * as React from 'react';
import { DocsTocShell } from '../../@layouts/AppShells';
import { Badge } from '../../components/ui/Badge';

const CATEGORIES = [
  { title: 'Getting Started', count: 8, summary: 'Quickstart, tokens, and nav IR setup.' },
  { title: 'Billing & Invoices', count: 5, summary: 'Subscriptions, seats, and A4 print exports.' },
  { title: 'Security & RBAC', count: 6, summary: 'SSO, 2FA, API keys, and authority guards.' },
];

export function HelpCenterPage() {
  const [query, setQuery] = React.useState('');

  return (
    <div className="space-y-8">
      {/* Support Search Hero */}
      <section
        style={{
          backgroundColor: 'var(--color-primary-surface)',
          borderColor: 'var(--color-primary-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="border px-6 py-10 text-center"
      >
        <Badge tone="primary">Help Center</Badge>
        <h1 className="mt-2 text-2xl font-bold">How can we help?</h1>
        <div className="mx-auto mt-4 max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, API docs, or troubleshooting..."
            aria-label="Search help center"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
            className="w-full border px-4 py-2.5 text-sm"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <div
            key={c.title}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card space-y-2 border p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{c.title}</h2>
              <Badge tone="neutral">{c.count}</Badge>
            </div>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
              {c.summary}
            </p>
          </div>
        ))}
      </div>

      {/* 3-Column Knowledge Base Article + ScrollSpy TOC */}
      <DocsTocShell
        nav={
          <nav className="space-y-1 text-sm">
            <p className="mb-2 font-semibold">Knowledge Base</p>
            <a href="#overview" className="block py-1 font-medium">Overview</a>
            <a href="#tokens" style={{ color: 'var(--color-text-muted)' }} className="block py-1">Design Tokens</a>
            <a href="#rbac" style={{ color: 'var(--color-text-muted)' }} className="block py-1">RBAC Guards</a>
          </nav>
        }
        content={
          <div className="space-y-4 text-sm">
            <h2 id="overview" className="text-lg font-semibold">Configuring Workspace Permissions</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Designer Dashboards derives navigation visibility, route guards, and action buttons from a single RBAC authority list.
            </p>
            <h3 id="tokens" className="pt-2 text-base font-semibold">Design Token Parity</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Run <code>build-tokens.mjs</code> to regenerate CSS variables and verify WCAG 2.1 AA contrast.
            </p>
            <h3 id="rbac" className="pt-2 text-base font-semibold">RBAC Guards</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Assign <code>authority: [&apos;admin&apos;]</code> on any Nav IR item to enforce role-based access.
            </p>
          </div>
        }
        toc={
          <div className="space-y-1 text-xs">
            <p className="mb-2 font-semibold uppercase tracking-wider">On this page</p>
            <a href="#overview" className="block py-1">Configuring Permissions</a>
            <a href="#tokens" style={{ color: 'var(--color-text-muted)' }} className="block py-1">Design Token Parity</a>
            <a href="#rbac" style={{ color: 'var(--color-text-muted)' }} className="block py-1">RBAC Guards</a>
          </div>
        }
      />
    </div>
  );
}
