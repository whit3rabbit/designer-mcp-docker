'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { AppIcon, ICON_REGISTRY, type IconName } from '../../@core/icons/registry';
import { WidgetCard } from '../../components/ui/WidgetCard';
import { Button } from '../../components/ui/Button';

const SIZES = [16, 18, 20, 24] as const;
const STROKES = [1.25, 1.5, 1.75] as const;

export function IconCatalogPage() {
  const [query, setQuery] = React.useState('');
  const [size, setSize] = React.useState<number>(20);
  const [strokeWidth, setStrokeWidth] = React.useState<number>(1.5);

  const allKeys = React.useMemo(() => Object.keys(ICON_REGISTRY).sort() as IconName[], []);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allKeys.filter((k) => k.toLowerCase().includes(q)) : allKeys;
  }, [allKeys, query]);

  const copySnippet = async (name: IconName) => {
    const snippet = `<AppIcon name="${name}" size={${size}} strokeWidth={${strokeWidth}} />`;
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success(`Copied ${snippet}`);
    } catch {
      toast.info(snippet);
    }
  };

  return (
    <div className="anim-in space-y-6">
      <WidgetCard
        title="Icon Registry Catalog"
        subtitle={`${filtered.length} of ${allKeys.length} bundled Lucide icons (ISC license, offline sprite + React components)`}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <span
              style={{ color: 'var(--color-text-muted)' }}
              className="pointer-events-none absolute inset-y-0 start-3 flex items-center"
            >
              <AppIcon name="search" size={15} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter icons by key..."
              aria-label="Filter icons by key"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              className="h-9 w-full border pe-3 ps-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--color-text-muted)' }} className="font-medium">
                Size:
              </span>
              {SIZES.map((s) => (
                <Button
                  key={s}
                  variant={size === s ? 'tonal' : 'ghost'}
                  tone={size === s ? 'primary' : 'neutral'}
                  size="xs"
                  onClick={() => setSize(s)}
                >
                  {s}px
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--color-text-muted)' }} className="font-medium">
                Stroke:
              </span>
              {STROKES.map((st) => (
                <Button
                  key={st}
                  variant={strokeWidth === st ? 'tonal' : 'ghost'}
                  tone={strokeWidth === st ? 'primary' : 'neutral'}
                  size="xs"
                  onClick={() => setStrokeWidth(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => copySnippet(name)}
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 border p-4 text-center transition-transform active:scale-[0.98]"
            >
              <AppIcon name={name} size={size} strokeWidth={strokeWidth} />
              <span
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                className="w-full truncate text-[11px]"
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      </WidgetCard>
    </div>
  );
}
