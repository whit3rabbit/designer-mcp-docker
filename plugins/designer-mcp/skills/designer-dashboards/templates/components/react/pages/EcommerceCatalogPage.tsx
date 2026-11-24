'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ProductItem {
  id: string;
  name: string;
  category: 'Hardware' | 'Accessories' | 'Software';
  price: number;
  stock: number;
}

const PRODUCTS: ProductItem[] = [
  { id: 'sku-1', name: 'Studio Display 27"', category: 'Hardware', price: 1599, stock: 18 },
  { id: 'sku-2', name: 'Mechanical Keycap Kit', category: 'Accessories', price: 89, stock: 64 },
  { id: 'sku-3', name: 'Telemetry Pro Add-on', category: 'Software', price: 249, stock: 999 },
  { id: 'sku-4', name: 'USB-C Thunderbolt Dock', category: 'Hardware', price: 299, stock: 7 },
  { id: 'sku-5', name: 'Ergonomic Desk Mat', category: 'Accessories', price: 45, stock: 42 },
  { id: 'sku-6', name: 'Audit Export Pack', category: 'Software', price: 129, stock: 999 },
];

export function EcommerceCatalogPage() {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [category, setCategory] = React.useState<string>('All');
  const [cartCount, setCartCount] = React.useState(2);

  const visible = category === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Left 3-col Filter Sidebar (Cuba / OneUI / Ecme / Steex pattern) */}
      <aside
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-5 border p-5 lg:sticky lg:top-20 lg:col-span-3"
      >
        <h2 className="text-sm font-semibold">Filters</h2>
        <div className="space-y-2">
          <p style={{ color: 'var(--color-text-muted)' }} className="text-xs font-semibold uppercase">
            Category
          </p>
          <div className="flex flex-col gap-1.5">
            {['All', 'Hardware', 'Accessories', 'Software'].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={category === cat ? 'tonal' : 'ghost'}
                tone={category === cat ? 'primary' : 'neutral'}
                className="justify-start"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main 9-col Catalog Grid/List */}
      <div className="space-y-4 lg:col-span-9">
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
          className="rd-card flex flex-wrap items-center justify-between gap-3 border px-5 py-3"
        >
          <span className="text-sm font-medium">{visible.length} products</span>
          <div className="flex items-center gap-2">
            <Badge tone="primary">Cart ({cartCount})</Badge>
            <Button size="xs" variant={view === 'grid' ? 'solid' : 'outline'} tone="neutral" onClick={() => setView('grid')}>
              Grid
            </Button>
            <Button size="xs" variant={view === 'list' ? 'solid' : 'outline'} tone="neutral" onClick={() => setView('list')}>
              List
            </Button>
          </div>
        </div>

        <div className={view === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {visible.map((p) => (
            <article
              key={p.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
              className={`rd-card flex border p-5 ${view === 'list' ? 'items-center justify-between gap-4' : 'flex-col justify-between gap-4'}`}
            >
              <div className="space-y-1">
                <Badge tone={p.stock < 10 ? 'warning' : 'neutral'}>{p.category}</Badge>
                <h3 className="text-base font-semibold">{p.name}</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                  {p.stock < 10 ? `Low stock (${p.stock} left)` : 'In stock'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="tabular-nums text-lg font-bold">${p.price}</span>
                <Button size="sm" variant="tonal" tone="primary" onClick={() => setCartCount((c) => c + 1)}>
                  Add to Cart
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
