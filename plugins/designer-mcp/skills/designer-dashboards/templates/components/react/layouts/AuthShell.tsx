'use client';

import * as React from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useZodForm } from '../@core/auth/useZodForm';
import { AppIcon } from '../@core/icons/registry';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';

export type AuthShellVariant = 'split' | 'basic' | 'boxed';

export interface AuthShellProps {
  variant?: AuthShellVariant;
  brandName?: string;
  title: string;
  subtitle?: string;
  demoMode?: boolean;
  children: React.ReactNode;
}

export function AuthShell({
  variant = 'split',
  brandName = 'Designer Dashboards',
  title,
  subtitle,
  demoMode = false,
  children,
}: AuthShellProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
      }}
      className="flex min-h-screen"
    >
      {variant === 'split' && (
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-solid)',
          }}
          className="hidden flex-col justify-between p-12 lg:flex lg:w-1/2"
        >
          <div className="flex items-center gap-2.5 text-lg font-bold">
            <span>{brandName}</span>
          </div>
          <div className="max-w-md space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Operational clarity, built on verifiable tokens.
            </h2>
            <p className="text-sm opacity-90">
              Single-source navigation, WCAG 2.1 AA accessibility, and FOUC-free dark mode out of the box.
            </p>
          </div>
          <p className="text-xs opacity-75">OpenDesign Governed Dashboard Starter</p>
        </div>
      )}

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: variant === 'boxed' ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          }}
          className="w-full max-w-md border p-8"
        >
          {demoMode && (
            <div
              role="status"
              style={{
                backgroundColor: 'var(--color-warning-surface)',
                borderColor: 'var(--color-warning-border)',
                color: 'var(--color-warning)',
                borderRadius: 'var(--radius-md)',
              }}
              className="mb-5 border px-3 py-2 text-xs font-medium"
            >
              Demo auth mode active. Wire Auth.js, Supabase, or Better Auth before production.
            </div>
          )}

          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSuccess?: (values: LoginValues) => Promise<void> | void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '', remember: true },
  });

  const submit = async (values: LoginValues) => {
    try {
      await onSuccess?.(values);
      toast.success('Signed in successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <FormField id="login-email" label="Email" error={errors.email?.message} required>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('email')}
        />
      </FormField>

      <FormField id="login-password" label="Password" error={errors.password?.message} required>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: errors.password ? 'var(--color-error)' : 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="h-10 w-full border pe-10 ps-3 text-sm"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            style={{ color: 'var(--color-text-muted)' }}
            className="absolute inset-y-0 end-2 flex cursor-pointer items-center px-1"
          >
            <AppIcon name={showPassword ? 'eye-off' : 'eye'} size={16} />
          </button>
        </div>
      </FormField>

      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input type="checkbox" {...register('remember')} />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" style={{ color: 'var(--color-primary)' }} className="font-medium">
          Forgot password?
        </a>
      </div>

      <Button type="submit" variant="solid" tone="primary" size="md" loading={isSubmitting} className="w-full">
        Sign in
      </Button>

      <div className="space-y-2 pt-2 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <p>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ color: 'var(--color-primary)' }} className="font-medium">
            Create account
          </a>
        </p>
        <p>
          Administrator?{' '}
          <a href="/admin/login" style={{ color: 'var(--color-text)' }} className="font-medium underline">
            Admin Portal Sign In
          </a>
        </p>
      </div>
    </form>
  );
}
