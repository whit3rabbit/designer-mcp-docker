'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_ORDERS } from '../analytics/ordersRepository';

export function OrdersPage() {
  const [selectedId, setSelectedId] = React.useState(MOCK_ORDERS[0].id);
  const order = MOCK_ORDERS.find((o) => o.id === selectedId) ?? MOCK_ORDERS[0];
  const subtotal = order.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Order #{order.id}</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Placed on {order.date} · {order.customer}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {MOCK_ORDERS.map((o) => (
            <Button
              key={o.id}
              size="sm"
              variant={o.id === order.id ? 'solid' : 'outline'}
              tone={o.id === order.id ? 'primary' : 'neutral'}
              onClick={() => setSelectedId(o.id)}
            >
              {o.id}
            </Button>
          ))}
          <Button size="sm" variant="outline" tone="neutral" onClick={() => window.print()}>
            Print Order
          </Button>
        </div>
      </div>

      {/* 8+4 Order Detail Split */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card border p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Line Items</h2>
              <Badge tone={order.status === 'Shipped' ? 'success' : 'primary'}>{order.status}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }} className="border-b text-xs uppercase">
                    <th className="py-2 text-start">Item</th>
                    <th className="py-2 text-end">Qty</th>
                    <th className="py-2 text-end">Unit</th>
                    <th className="py-2 text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.sku} style={{ borderColor: 'var(--color-border)' }} className="border-b last:border-b-0">
                      <td className="py-3">
                        <p className="font-medium">{item.name}</p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{item.sku}</p>
                      </td>
                      <td className="tabular-nums py-3 text-end">{item.qty}</td>
                      <td className="tabular-nums py-3 text-end">${item.unitPrice.toFixed(2)}</td>
                      <td className="tabular-nums py-3 text-end font-semibold">${(item.qty * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ borderColor: 'var(--color-border)' }} className="mt-4 flex justify-end border-t pt-4">
              <div className="w-56 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                  <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card border p-6"
          >
            <h2 className="mb-4 text-base font-semibold">Fulfillment Timeline</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Order confirmed &amp; invoice issued</span>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">Nov 21 · 09:14</span>
              </li>
              <li className="flex items-center justify-between">
                <span>License keys provisioned</span>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">Nov 21 · 09:16</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Dispatched to billing contact</span>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">Nov 22 · 11:02</span>
              </li>
            </ol>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card space-y-2 border p-5 text-sm"
          >
            <h2 className="font-semibold">Customer Details</h2>
            <p className="font-medium">{order.customer}</p>
            <p style={{ color: 'var(--color-text-muted)' }}>{order.email}</p>
          </div>
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card space-y-2 border p-5 text-sm"
          >
            <h2 className="font-semibold">Shipping &amp; Billing Address</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{order.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
