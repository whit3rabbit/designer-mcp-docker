'use client';

import * as React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const PLANS = [
  {
    name: 'Starter',
    monthly: 19,
    annual: 15,
    description: 'Essential analytics and RBAC for small teams.',
    features: ['Up to 5 seats', '30-day audit log', 'Email support'],
  },
  {
    name: 'Growth',
    monthly: 49,
    annual: 39,
    popular: true,
    description: 'Full multi-layout console, SSO, and AI assistant.',
    features: ['Unlimited seats', 'SAML / OIDC SSO', '1-year audit log', 'Priority SLA'],
  },
  {
    name: 'Enterprise',
    monthly: 129,
    annual: 99,
    description: 'Dedicated clusters, custom tokens, and compliance.',
    features: ['Custom data residency', 'SOC2 / HIPAA BAA', 'Dedicated solutions engineer'],
  },
];

export function PricingPage() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="text-2xl font-bold">Transparent Workspace Pricing</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Switch between monthly and annual billing anytime.
        </p>
        <div className="inline-flex gap-2">
          <Button size="sm" variant={!annual ? 'solid' : 'outline'} onClick={() => setAnnual(false)}>
            Monthly
          </Button>
          <Button size="sm" variant={annual ? 'solid' : 'outline'} onClick={() => setAnnual(true)}>
            Annual (Save 20%)
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <section
            key={plan.name}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: plan.popular ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 'var(--radius-lg)',
            }}
            className="rd-card flex flex-col justify-between border p-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{plan.name}</h2>
                {plan.popular && <Badge tone="primary">Popular</Badge>}
              </div>
              <p className="tabular-nums text-3xl font-bold">
                ${annual ? plan.annual : plan.monthly}
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs font-normal">
                  {' '}
                  / seat / mo
                </span>
              </p>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                {plan.description}
              </p>
              <ul className="space-y-2 pt-2 text-sm">
                {plan.features.map((feat) => (
                  <li key={feat}>• {feat}</li>
                ))}
              </ul>
            </div>
            <Button variant={plan.popular ? 'solid' : 'outline'} tone="primary" className="mt-6 w-full">
              Choose {plan.name}
            </Button>
          </section>
        ))}
      </div>
    </div>
  );
}
