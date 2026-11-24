'use client';

import * as React from 'react';
import type { z } from 'zod';

export type ZodFieldErrors<T> = Partial<Record<keyof T, { message: string }>>;

/**
 * Lightweight, form-engine-agnostic Zod form hook for shared auth primitives.
 * Works identically on react-hook-form and @tanstack/react-form stacks without
 * pulling a second form engine into @core/auth or @layouts/AuthShell.
 */
export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: { defaultValues?: Partial<z.infer<TSchema>> },
) {
  type Values = z.infer<TSchema>;
  const [values, setValues] = React.useState<Record<string, unknown>>(
    () => ({ ...(options?.defaultValues ?? {}) }) as Record<string, unknown>,
  );
  const [errors, setErrors] = React.useState<ZodFieldErrors<Values>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const register = <K extends keyof Values & string>(name: K) => {
    const current = values[name];
    const isBool = typeof current === 'boolean';
    return {
      name,
      ...(isBool ? { checked: Boolean(current) } : { value: (current as string | number | undefined) ?? '' }),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const nextVal = target.type === 'checkbox' ? target.checked : target.value;
        setValues((prev) => ({ ...prev, [name]: nextVal }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
      },
    };
  };

  const handleSubmit =
    (onValid: (data: Values) => Promise<void> | void) =>
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        const nextErrors: ZodFieldErrors<Values> = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof Values | undefined;
          if (field && !nextErrors[field]) {
            nextErrors[field] = { message: issue.message };
          }
        }
        setErrors(nextErrors);
        return;
      }
      setErrors({});
      setIsSubmitting(true);
      try {
        await onValid(parsed.data);
      } finally {
        setIsSubmitting(false);
      }
    };

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  };
}
