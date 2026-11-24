'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface CartLine {
  id: string;
  name: string;
  qty: number;
  price: number;
}

const CART_ITEMS: CartLine[] = [
  { id: 'c1', name: 'Enterprise Analytics Seat (Annual)', qty: 2, price: 240 },
  { id: 'c2', name: 'Priority SLA Add-on', qty: 1, price: 180 },
];

export function CheckoutPage() {
  const [step, setStep] = React.useState<'shipping' | 'payment' | 'review'>('shipping');
  const [promo, setPromo] = React.useState('');
  const [discount, setDiscount] = React.useState(0);

  const subtotal = CART_ITEMS.reduce((sum, i) => sum + i.qty * i.price, 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* 8-col Checkout Steps (Vuexy / Materialize / Steex / Tailwink / Sandbox) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-6 border p-6 lg:col-span-8"
      >
        <div className="flex flex-wrap items-center gap-2 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          {(['shipping', 'payment', 'review'] as const).map((s, idx) => (
            <Button
              key={s}
              size="sm"
              variant={step === s ? 'solid' : 'outline'}
              tone={step === s ? 'primary' : 'neutral'}
              onClick={() => setStep(s)}
            >
              {idx + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {step === 'shipping' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Full Name</span>
              <input
                type="text"
                defaultValue="Elena Vance"
                style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                className="w-full border px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Work Email</span>
              <input
                type="email"
                defaultValue="elena@acme.io"
                style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                className="w-full border px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">Billing Address</span>
              <input
                type="text"
                defaultValue="742 Evergreen Terrace, Austin, TX 78701"
                style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
                className="w-full border px-3 py-2"
              />
            </label>
            <div className="flex justify-end sm:col-span-2">
              <Button size="sm" variant="solid" tone="primary" onClick={() => setStep('payment')}>
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4 text-sm">
            <p className="font-medium">Payment Method</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div style={{ borderColor: 'var(--color-primary-border)', backgroundColor: 'var(--color-primary-surface)', borderRadius: 'var(--radius-md)' }} className="border p-4">
                <p className="font-semibold">Corporate Card</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">Visa ending in 4242</p>
              </div>
              <div style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }} className="border p-4">
                <p className="font-semibold">ACH / Wire Invoice</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">Net-30 Enterprise terms</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button size="sm" variant="outline" tone="neutral" onClick={() => setStep('shipping')}>Back</Button>
              <Button size="sm" variant="solid" tone="primary" onClick={() => setStep('review')}>Review Order</Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 text-sm">
            <Badge tone="success">Ready to Submit</Badge>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Confirming places an order for {CART_ITEMS.length} line items billed to Elena Vance (elena@acme.io).
            </p>
            <div className="flex justify-between">
              <Button size="sm" variant="outline" tone="neutral" onClick={() => setStep('payment')}>Back</Button>
              <Button size="sm" variant="solid" tone="primary">Place Order</Button>
            </div>
          </div>
        )}
      </div>

      {/* 4-col Sticky Order Summary */}
      <aside
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
        className="rd-card space-y-4 border p-6 lg:sticky lg:top-20 lg:col-span-4"
      >
        <h2 className="text-base font-semibold">Order Summary</h2>
        <ul className="space-y-2 text-sm">
          {CART_ITEMS.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span style={{ color: 'var(--color-text-muted)' }}>{item.qty}x {item.name}</span>
              <span className="tabular-nums font-medium">${(item.qty * item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (promo.trim()) setDiscount(50);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Promo code"
            aria-label="Promo code"
            style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}
            className="flex-1 border px-3 py-1.5 text-xs"
          />
          <Button type="submit" size="xs" variant="outline" tone="neutral">Apply</Button>
        </form>
        <div style={{ borderColor: 'var(--color-border)' }} className="space-y-1 border-t pt-3 text-sm">
          {discount > 0 && (
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>Promo Discount</span>
              <span className="tabular-nums">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
