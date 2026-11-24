'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

const CATALOG: CatalogItem[] = [
  { id: 'p1', name: 'Single Origin Espresso', category: 'Beverages', price: 4.5 },
  { id: 'p2', name: 'Matcha Oat Latte', category: 'Beverages', price: 5.75 },
  { id: 'p3', name: 'Artisan Croissant', category: 'Bakery', price: 4.25 },
  { id: 'p4', name: 'Avocado Sourdough', category: 'Kitchen', price: 11.5 },
  { id: 'p5', name: 'Cold Brew Bottle', category: 'Beverages', price: 6.0 },
  { id: 'p6', name: 'Almond Galette', category: 'Bakery', price: 4.9 },
];

export function PosPage() {
  const [category, setCategory] = React.useState<string>('All');
  const [cart, setCart] = React.useState<Record<string, number>>({ p1: 2, p3: 1 });

  const categories = ['All', 'Beverages', 'Bakery', 'Kitchen'];
  const items = category === 'All' ? CATALOG : CATALOG.filter((i) => i.category === category);

  const addItem = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = CATALOG.find((x) => x.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const tax = subtotal * 0.08;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section className="space-y-4 xl:col-span-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? 'solid' : 'outline'}
              tone={category === cat ? 'primary' : 'neutral'}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item.id)}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
              className="rd-card flex cursor-pointer flex-col justify-between border p-4 text-start transition-colors hover:opacity-90"
            >
              <div>
                <Badge tone="neutral">{item.category}</Badge>
                <p className="mt-2 text-sm font-semibold">{item.name}</p>
              </div>
              <p style={{ color: 'var(--color-primary)' }} className="mt-4 tabular-nums text-base font-bold">
                ${item.price.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </section>

      <aside
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card flex flex-col justify-between border p-5 xl:col-span-4"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Current Ticket</h2>
            <Button size="sm" variant="ghost" onClick={() => setCart({})}>
              Clear
            </Button>
          </div>
          <ul className="space-y-2 text-sm">
            {Object.entries(cart).map(([id, qty]) => {
              const item = CATALOG.find((x) => x.id === id);
              if (!item || qty <= 0) return null;
              return (
                <li key={id} className="flex items-center justify-between">
                  <span>
                    {qty}x {item.name}
                  </span>
                  <span className="tabular-nums font-medium">${(item.price * qty).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 space-y-3 border-t pt-4 text-sm" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
            <span className="tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%)</span>
            <span className="tabular-nums">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">${(subtotal + tax).toFixed(2)}</span>
          </div>
          <Button variant="solid" tone="primary" className="w-full">
            Charge ${(subtotal + tax).toFixed(2)}
          </Button>
        </div>
      </aside>
    </div>
  );
}
