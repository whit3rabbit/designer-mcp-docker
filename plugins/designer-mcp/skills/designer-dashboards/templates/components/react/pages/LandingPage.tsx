'use client';

import * as React from 'react';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';

export function LandingPage() {
  const [annual, setAnnual] = React.useState(true);

  const plans = [
    {
      name: 'Starter',
      price: annual ? 19 : 24,
      description: 'For solo founders and internal tools.',
      features: ['Up to 5 team members', '21 OpenDesign themes', 'WCAG AA audit CLI'],
      featured: false,
    },
    {
      name: 'Growth',
      price: annual ? 49 : 59,
      description: 'For SaaS teams shipping customer-facing analytics.',
      features: ['Unlimited dashboards', 'Server-mode DataGrid + ApexCharts', 'SSO & RBAC guards'],
      featured: true,
    },
    {
      name: 'Enterprise',
      price: annual ? 129 : 149,
      description: 'Dedicated SLA, audit logs, and multi-region deploy.',
      features: ['Custom design-system sync', 'SAML / OIDC', '24/7 priority support'],
      featured: false,
    },
  ];

  return (
    <div className="anim-in mx-auto max-w-6xl space-y-16 py-8">
      <section className="space-y-4 text-center">
        <Badge tone="primary" variant="tonal">OpenDesign Powered</Badge>
        <h1
          style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
          className="mx-auto max-w-2xl text-4xl tracking-tight"
        >
          Ship accessible, themeable dashboards in minutes
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="mx-auto max-w-xl text-sm">
          Unified design tokens, RTL-safe layouts, and production-ready primitives sharing one theme contract.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="solid" tone="primary" size="lg">Get Started</Button>
          <Button variant="outline" tone="neutral" size="lg">View Documentation</Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
              className="text-2xl"
            >
              Simple, transparent pricing
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
              Save 20% with annual billing.
            </p>
          </div>
          <Switch checked={annual} onCheckedChange={setAnnual} label="Annual billing" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              style={
                plan.featured
                  ? { borderColor: 'var(--color-primary)', boxShadow: 'var(--shadow-md)' }
                  : undefined
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured && <Badge tone="primary" variant="solid">Popular</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="tabular-nums text-3xl font-bold">
                  ${plan.price}
                  <span style={{ color: 'var(--color-text-muted)' }} className="text-xs font-normal">
                    /mo
                  </span>
                </p>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((f) => (
                    <li key={f} style={{ color: 'var(--color-text-muted)' }}>
                      • {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.featured ? 'solid' : 'outline'}
                  tone={plan.featured ? 'primary' : 'neutral'}
                  className="w-full"
                >
                  Choose {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-4">
        <h2
          style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
          className="text-center text-2xl"
        >
          Frequently Asked Questions
        </h2>
        <Accordion defaultValue={['q1']}>
          <AccordionItem value="q1" title="Does this reuse my dashboard design tokens?">
            Yes. Every color, radius, shadow, and typography scale is read directly from design-system/styles.css.
          </AccordionItem>
          <AccordionItem value="q2" title="Is dark mode and RTL supported?">
            Yes. Both light/dark themes and RTL logical properties work automatically across all sections.
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
