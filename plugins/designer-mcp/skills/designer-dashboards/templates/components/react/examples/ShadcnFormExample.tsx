'use client';

/**
 * Modern shadcn/ui v4 + React Hook Form + Zod Form Pattern
 * Demonstrates composable InputGroup, ToggleGroup, MaskedInput, FormRepeater, and OptionCardGroup
 * bound strictly to designer-dashboards OpenDesign CSS tokens.
 */

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input, InputGroup, InputGroupAddon } from '../../components/ui/Input';
import { MaskedInput } from '../../components/ui/MaskedInput';
import { OptionCardGroup } from '../../components/ui/Stepper';
import { ToggleGroup } from '../../components/ui/ToggleGroup';

const billingSchema = z.object({
  handle: z.string().min(2, 'Subdomain must be at least 2 characters'),
  cadence: z.enum(['monthly', 'yearly']),
  tier: z.enum(['pro', 'enterprise']),
  cardNumber: z.string().min(19, 'Enter a 16-digit card number'),
});

type BillingFormValues = z.infer<typeof billingSchema>;

export function ShadcnFormExample() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      handle: 'northstar',
      cadence: 'yearly',
      tier: 'pro',
      cardNumber: '',
    },
  });

  const onSubmit = async (values: BillingFormValues) => {
    await new Promise((r) => setTimeout(r, 200));
    toast.success(`Saved ${values.tier} (${values.cadence}) for ${values.handle}.example.dev`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error('Please review highlighted fields.'))}
      noValidate
      className="mx-auto max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Workspace Billing (shadcn v4 Form Pattern)</CardTitle>
          <CardDescription>
            Controlled primitives + Zod schema + OpenDesign CSS-var tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField id="sf-handle" label="Workspace Subdomain" required error={errors.handle?.message}>
            <InputGroup invalid={Boolean(errors.handle)}>
              <InputGroupAddon align="start">https://</InputGroupAddon>
              <Input id="sf-handle" {...register('handle')} />
              <InputGroupAddon align="end">.example.dev</InputGroupAddon>
            </InputGroup>
          </FormField>

          <FormField id="sf-cadence" label="Billing Cadence" error={errors.cadence?.message}>
            <Controller
              control={control}
              name="cadence"
              render={({ field }) => (
                <ToggleGroup
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly (Save 20%)' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="sf-tier" label="Plan Tier" error={errors.tier?.message}>
            <Controller
              control={control}
              name="tier"
              render={({ field }) => (
                <OptionCardGroup
                  name="sf-tier"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  columns={2}
                  options={[
                    { value: 'pro', title: 'Pro Plan', description: 'Unlimited seats & analytics', badge: 'Recommended' },
                    { value: 'enterprise', title: 'Enterprise', description: 'Custom SLA & dedicated VPC' },
                  ]}
                />
              )}
            />
          </FormField>

          <FormField id="sf-card" label="Payment Card" required error={errors.cardNumber?.message}>
            <Controller
              control={control}
              name="cardNumber"
              render={({ field }) => (
                <MaskedInput
                  id="sf-card"
                  preset="credit-card"
                  invalid={Boolean(errors.cardNumber)}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit" variant="solid" tone="primary" loading={isSubmitting}>
            Update Billing
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
