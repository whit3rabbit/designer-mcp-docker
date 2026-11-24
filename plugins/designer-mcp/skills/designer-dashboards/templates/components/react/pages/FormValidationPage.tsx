'use client';

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { FormRepeater } from '../../components/ui/FormRepeater';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  workspace: z.string().min(3, 'Workspace slug must be at least 3 characters'),
  adminEmail: z.string().email('Enter a valid email address'),
  seatLimit: z.coerce.number().min(1, 'Minimum 1 seat').max(500, 'Maximum 500 seats'),
  members: z
    .array(
      z.object({
        email: z.string().email('Enter a valid member email'),
        role: z.string().min(1, 'Role is required'),
      }),
    )
    .min(1, 'Add at least one team member'),
});

type FormValues = z.infer<typeof schema>;

export function FormValidationPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      workspace: '',
      adminEmail: '',
      seatLimit: 10,
      members: [{ email: 'alex@acme.example', role: 'Admin' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 200));
    toast.success(`Validated "${values.workspace}" (${values.members.length} members, ${values.seatLimit} seats)`);
  };

  return (
    <div className="anim-in mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit(onSubmit, () => toast.error('Validation failed. Check highlighted fields.'))}
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>Schema Validation & Field Array (react-hook-form + zod)</CardTitle>
            <CardDescription>Colocated Zod schema with aria-invalid, aria-describedby, FormRepeater, and toast feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField id="v-ws" label="Workspace slug" required error={errors.workspace?.message}>
              <Input id="v-ws" placeholder="acme-prod" {...register('workspace')} />
            </FormField>
            <FormField id="v-email" label="Admin email" required error={errors.adminEmail?.message}>
              <Input id="v-email" type="email" placeholder="admin@acme.example" {...register('adminEmail')} />
            </FormField>
            <FormField id="v-seats" label="Seat limit" required error={errors.seatLimit?.message}>
              <Input id="v-seats" type="number" {...register('seatLimit')} />
            </FormField>

            <div className="space-y-2 pt-2">
              <span style={{ color: 'var(--color-text)' }} className="block text-xs font-semibold">
                Team Invites (Dynamic Repeater)
              </span>
              <FormRepeater
                items={fields}
                minItems={1}
                addLabel="Add member"
                onAdd={() => append({ email: '', role: 'Editor' })}
                onRemove={(idx) => remove(idx)}
                renderItem={(_item, idx) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      id={`v-member-email-${idx}`}
                      label="Member email"
                      error={errors.members?.[idx]?.email?.message}
                    >
                      <Input
                        id={`v-member-email-${idx}`}
                        placeholder="teammate@acme.example"
                        {...register(`members.${idx}.email`)}
                      />
                    </FormField>
                    <FormField
                      id={`v-member-role-${idx}`}
                      label="Role"
                      error={errors.members?.[idx]?.role?.message}
                    >
                      <Input id={`v-member-role-${idx}`} placeholder="Editor" {...register(`members.${idx}.role`)} />
                    </FormField>
                  </div>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" variant="solid" tone="primary" loading={isSubmitting}>
              Validate & Save
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
