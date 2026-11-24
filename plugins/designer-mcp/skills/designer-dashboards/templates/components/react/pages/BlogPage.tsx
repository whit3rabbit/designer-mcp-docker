'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface BlogPost {
  id: string;
  title: string;
  category: 'Engineering' | 'Design' | 'Release';
  date: string;
  readTime: string;
  excerpt: string;
}

const POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Scaling Container-Query Dashboards Across 16 Verticals',
    category: 'Engineering',
    date: 'Nov 20, 2026',
    readTime: '5 min read',
    excerpt: 'How @container rules and 12-column recipes eliminate per-vertical layout duplication.',
  },
  {
    id: 'b2',
    title: 'OpenDesign Token Parity & WCAG 2.1 AA Contrast Gates',
    category: 'Design',
    date: 'Nov 16, 2026',
    readTime: '4 min read',
    excerpt: 'Automated lightness ladders and dark-mode ink-safe print resets in build-tokens.mjs.',
  },
  {
    id: 'b3',
    title: 'Designer Dashboards v2.4: 11 Multi-Framework App Shells',
    category: 'Release',
    date: 'Nov 12, 2026',
    readTime: '3 min read',
    excerpt: 'Introducing WorkspaceRailShell, MapSplitShell, AffixFormShell, and ResizableSplitShell.',
  },
];

export function BlogPage() {
  const [category, setCategory] = React.useState<string>('All');
  const [activePost, setActivePost] = React.useState<BlogPost | null>(null);

  const visible = category === 'All' ? POSTS : POSTS.filter((p) => p.category === category);

  if (activePost) {
    return (
      <article
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card mx-auto max-w-3xl space-y-4 border p-8"
      >
        <Button size="xs" variant="ghost" tone="neutral" onClick={() => setActivePost(null)}>
          ← Back to all posts
        </Button>
        <div className="flex items-center gap-2">
          <Badge tone="primary">{activePost.category}</Badge>
          <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            {activePost.date} · {activePost.readTime}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{activePost.title}</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-base leading-relaxed">
          {activePost.excerpt}
        </p>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Editorial &amp; Changelog</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Product announcements, engineering deep-dives, and design system notes.
          </p>
        </div>
        <div className="flex gap-1.5">
          {['All', 'Engineering', 'Design', 'Release'].map((c) => (
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {visible.map((post) => (
          <article
            key={post.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card flex flex-col justify-between gap-4 border p-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge tone="primary">{post.category}</Badge>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">{post.readTime}</span>
              </div>
              <h2 className="text-base font-semibold">{post.title}</h2>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">{post.excerpt}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">{post.date}</span>
              <Button size="xs" variant="tonal" tone="primary" onClick={() => setActivePost(post)}>
                Read Article
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
