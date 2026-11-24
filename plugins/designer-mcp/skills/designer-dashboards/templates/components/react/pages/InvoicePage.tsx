'use client';

import * as React from 'react';
import { AppIcon } from '../../@core/icons/registry';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Separator } from '../../components/ui/Separator';

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  dueAt: string;
  status: 'paid' | 'pending' | 'overdue';
  from: { name: string; address: string; email: string };
  to: { name: string; company: string; address: string; email: string };
  items: InvoiceLineItem[];
  taxRate?: number;
  notes?: string;
}

const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: 'INV-2026-0418',
  issuedAt: 'Nov 15, 2026',
  dueAt: 'Dec 15, 2026',
  status: 'paid',
  from: {
    name: 'Acme Cloud Inc.',
    address: '548 Market St, San Francisco, CA 94104',
    email: 'billing@acme.example',
  },
  to: {
    name: 'Elena Rostova',
    company: 'Northstar Analytics',
    address: '210 Congress Ave, Austin, TX 78701',
    email: 'finance@northstar.example',
  },
  items: [
    { id: '1', description: 'Enterprise Dashboard Suite (Annual Seat × 12)', qty: 12, unitPrice: 49 },
    { id: '2', description: 'Realtime Telemetry Stream Add-on', qty: 1, unitPrice: 199 },
    { id: '3', description: 'Dedicated SLA & Audit Onboarding', qty: 1, unitPrice: 350 },
  ],
  taxRate: 0.08,
  notes: 'Thank you for your business. Wire and ACH payments settle within 2 business days.',
};

function money(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function InvoicePage({ invoice = DEFAULT_INVOICE }: { invoice?: InvoiceData }) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const tax = subtotal * (invoice.taxRate ?? 0);
  const total = subtotal + tax;

  const statusTone =
    invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'error' : 'warning';

  return (
    <div className="anim-in mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div>
          <h1
            style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
            className="text-lg"
          >
            Invoice {invoice.invoiceNumber}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            Print-ready A4 layout governed by @media print rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" tone="neutral" size="sm" onClick={() => window.print()}>
            <AppIcon name="download" size={14} />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <article
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--color-text)',
        }}
        className="rd-card border p-8 print:border-none print:p-0 print:shadow-none"
      >
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xl font-bold">{invoice.from.name}</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs">
              {invoice.from.address}
            </p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              {invoice.from.email}
            </p>
          </div>
          <div className="text-end">
            <Badge tone={statusTone} variant="tonal" className="uppercase">
              {invoice.status}
            </Badge>
            <p className="tabular-nums mt-2 text-lg font-bold">{invoice.invoiceNumber}</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs">
              Issued: {invoice.issuedAt} · Due: {invoice.dueAt}
            </p>
          </div>
        </header>

        <Separator className="my-6" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <p
              style={{ color: 'var(--color-text-muted)' }}
              className="text-[11px] font-semibold uppercase tracking-wider"
            >
              Bill To
            </p>
            <p className="mt-1.5 text-sm font-semibold">{invoice.to.company}</p>
            <p className="text-xs">{invoice.to.name}</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              {invoice.to.address}
            </p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              {invoice.to.email}
            </p>
          </div>
        </section>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-start text-xs">
            <thead>
              <tr
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                className="border-b"
              >
                <th className="py-2.5 pe-4 font-semibold">Description</th>
                <th className="py-2.5 pe-4 text-end font-semibold">Qty</th>
                <th className="py-2.5 pe-4 text-end font-semibold">Unit Price</th>
                <th className="py-2.5 text-end font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderColor: 'var(--color-border)' }}
                  className="border-b"
                >
                  <td className="py-3 pe-4 font-medium">{item.description}</td>
                  <td className="tabular-nums py-3 pe-4 text-end">{item.qty}</td>
                  <td className="tabular-nums py-3 pe-4 text-end">{money(item.unitPrice)}</td>
                  <td className="tabular-nums py-3 text-end font-semibold">
                    {money(item.qty * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-xs">
            <div className="flex justify-between">
              <dt style={{ color: 'var(--color-text-muted)' }}>Subtotal</dt>
              <dd className="tabular-nums font-medium">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: 'var(--color-text-muted)' }}>
                Tax ({Math.round((invoice.taxRate ?? 0) * 100)}%)
              </dt>
              <dd className="tabular-nums font-medium">{money(tax)}</dd>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(total)}</dd>
            </div>
          </dl>
        </div>

        {invoice.notes && (
          <footer
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            className="mt-8 border-t pt-4 text-xs"
          >
            {invoice.notes}
          </footer>
        )}
      </article>
    </div>
  );
}
