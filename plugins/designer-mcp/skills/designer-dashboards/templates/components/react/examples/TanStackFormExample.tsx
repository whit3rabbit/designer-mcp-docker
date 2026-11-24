'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';

const workspaceSchema = z.object({
  workspaceName: z.string().min(2, 'Enter at least 2 characters'),
  billingEmail: z.string().email('Enter a valid email address'),
  seatLimit: z.coerce.number().int().min(1, 'At least 1 seat').max(5000, 'Max 5,000 seats'),
});

/**
 * TanStack Form + Zod example for stacks using @tanstack/react-form as the single form engine.
 */
export function TanStackFormExample() {
  const form = useForm({
    defaultValues: {
      workspaceName: 'Acme Ops',
      billingEmail: 'ops@acme.example',
      seatLimit: 25,
    },
    onSubmit: async ({ value }) => {
      const parsed = workspaceSchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message || 'Validation failed');
        return;
      }
      toast.success(`Saved workspace "${parsed.data.workspaceName}"`);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Settings (TanStack Form + Zod)</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <form.Field
            name="workspaceName"
            validators={{
              onChange: ({ value }) => {
                const res = workspaceSchema.shape.workspaceName.safeParse(value);
                return res.success ? undefined : res.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormField
                id="ts-workspace-name"
                label="Workspace Name"
                error={field.state.meta.errors[0]}
                required
              >
                <Input
                  id="ts-workspace-name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="billingEmail"
            validators={{
              onChange: ({ value }) => {
                const res = workspaceSchema.shape.billingEmail.safeParse(value);
                return res.success ? undefined : res.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormField
                id="ts-billing-email"
                label="Billing Email"
                error={field.state.meta.errors[0]}
                required
              >
                <Input
                  id="ts-billing-email"
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="seatLimit"
            validators={{
              onChange: ({ value }) => {
                const res = workspaceSchema.shape.seatLimit.safeParse(value);
                return res.success ? undefined : res.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormField id="ts-seat-limit" label="Seat Limit" error={field.state.meta.errors[0]} required>
                <Input
                  id="ts-seat-limit"
                  type="number"
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </FormField>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" variant="solid" tone="primary" disabled={!canSubmit} loading={isSubmitting}>
                Save Workspace
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
