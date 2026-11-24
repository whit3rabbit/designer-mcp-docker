'use client';

import * as React from 'react';
import { AppIcon } from '../../@core/icons/registry';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface FileItem {
  id: string;
  name: string;
  kind: 'folder' | 'pdf' | 'image' | 'sheet';
  size: string;
  updated: string;
}

const FILES: FileItem[] = [
  { id: 'f1', name: 'Brand Assets', kind: 'folder', size: '14 items', updated: '2h ago' },
  { id: 'f2', name: 'Q4-Financial-Report.pdf', kind: 'pdf', size: '2.4 MB', updated: 'Yesterday' },
  { id: 'f3', name: 'Dashboard-Hero.png', kind: 'image', size: '840 KB', updated: 'Nov 19' },
  { id: 'f4', name: 'Revenue-Cohort.xlsx', kind: 'sheet', size: '1.1 MB', updated: 'Nov 16' },
];

export function FileManagerPage() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = React.useState<FileItem>(FILES[0]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Workspace</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span>Shared Drive</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={view === 'grid' ? 'solid' : 'outline'}
              aria-label="Grid view"
              onClick={() => setView('grid')}
            >
              <AppIcon name="layout-grid" size={14} />
            </Button>
            <Button
              size="sm"
              variant={view === 'list' ? 'solid' : 'outline'}
              aria-label="List view"
              onClick={() => setView('list')}
            >
              <AppIcon name="list" size={14} />
            </Button>
          </div>
        </div>

        <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
          {FILES.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setSelected(file)}
              style={{
                backgroundColor: selected.id === file.id ? 'var(--color-primary-surface)' : 'var(--color-surface)',
                borderColor: selected.id === file.id ? 'var(--color-primary)' : 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
              className="rd-card flex w-full cursor-pointer items-center justify-between border p-4 text-start transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <AppIcon name={file.kind === 'folder' ? 'folder' : 'file-text'} size={20} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{file.name}</p>
                  <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                    {file.size} · {file.updated}
                  </p>
                </div>
              </div>
              <Badge tone="neutral">{file.kind}</Badge>
            </button>
          ))}
        </div>
      </div>

      <aside
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-4 border p-5 xl:col-span-3"
      >
        <h2 className="text-sm font-semibold">Storage & Inspector</h2>
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)' }} className="p-3">
          <div className="flex justify-between text-xs font-medium">
            <span>Used Storage</span>
            <span className="tabular-nums">64.2 / 100 GB</span>
          </div>
          <div style={{ backgroundColor: 'var(--color-border)' }} className="mt-2 h-2 overflow-hidden rounded-full">
            <div style={{ backgroundColor: 'var(--color-primary)', width: '64%' }} className="h-full rounded-full" />
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-semibold">{selected.name}</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Type: {selected.kind}</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Size: {selected.size}</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Modified: {selected.updated}</p>
        </div>
      </aside>
    </div>
  );
}
