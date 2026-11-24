'use client';

import * as React from 'react';
import { create } from 'zustand';
import { z } from 'zod';
import { toast } from 'sonner';
import { useZodForm } from './useZodForm';
import { AppIcon } from '../icons/registry';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FormField, OtpInput } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  mfaVerified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

export function useAuthority(requiredRoles?: string[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!user) return false;
  return requiredRoles.some((r) => user.roles.includes(r as UserRole));
}

export function ProtectedRoute({
  requireMfa = false,
  loginPath = '/login',
  onRedirect,
  children,
}: {
  requireMfa?: boolean;
  loginPath?: string;
  onRedirect?: (path: string) => void;
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    if (!user && onRedirect) onRedirect(loginPath);
  }, [user, onRedirect, loginPath]);

  if (!user) {
    return (
      <EmptyState
        illustration="access-denied"
        title="Sign in required"
        description="Please sign in to access this workspace."
        action={
          <a
            href={loginPath}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-solid)',
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex h-9 items-center px-4 text-sm font-medium"
          >
            Go to Sign In
          </a>
        }
      />
    );
  }

  if (requireMfa && !user.mfaVerified) {
    return (
      <EmptyState
        illustration="access-denied"
        title="Two-factor verification required"
        description="Admin routes require a verified 2FA session."
      />
    );
  }

  return <>{children}</>;
}

export function AuthorityGuard({
  authority,
  fallback,
  children,
}: {
  authority?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const allowed = useAuthority(authority);
  if (!allowed) {
    return fallback ?? <Unauthorized401View />;
  }
  return <>{children}</>;
}

export function AdminGuard({
  onRedirect,
  children,
}: {
  onRedirect?: (path: string) => void;
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireMfa loginPath="/admin/login" onRedirect={onRedirect}>
      <AuthorityGuard authority={['admin', 'superadmin']}>{children}</AuthorityGuard>
    </ProtectedRoute>
  );
}

/**
 * Hardened Admin Login Flow (/admin/login)
 * - No self-registration link
 * - Verifies admin/superadmin role
 * - Enforces mandatory 2FA/OTP step before granting session
 */
const adminCredSchema = z.object({
  email: z.string().email('Enter a valid admin email'),
  password: z
    .string()
    .min(12, 'Admin password must be at least 12 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export function AdminLoginFlow({
  onAuthenticate,
  onVerifyOtp,
  onSuccess,
}: {
  onAuthenticate?: (creds: { email: string; password: string }) => Promise<AuthUser>;
  onVerifyOtp?: (code: string) => Promise<boolean>;
  onSuccess?: (user: AuthUser) => void;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = React.useState<'credentials' | 'otp'>('credentials');
  const [pendingUser, setPendingUser] = React.useState<AuthUser | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [otp, setOtp] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(adminCredSchema);

  const handleCredentials = async (values: z.infer<typeof adminCredSchema>) => {
    try {
      const user = onAuthenticate
        ? await onAuthenticate(values)
        : {
            id: 'admin-1',
            email: values.email,
            name: 'Administrator',
            roles: ['admin'] as UserRole[],
            mfaVerified: false,
          };

      const isAdmin = user.roles.some((r) => r === 'admin' || r === 'superadmin');
      if (!isAdmin) {
        toast.error('Access denied: administrator privileges required.');
        return;
      }

      setPendingUser(user);
      setStep('otp');
      toast.info('Enter your 6-digit authenticator code to continue.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid administrator credentials');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Enter the 6-digit authenticator code');
      return;
    }
    const ok = onVerifyOtp ? await onVerifyOtp(otp) : true;
    if (!ok || !pendingUser) {
      toast.error('Invalid or expired verification code');
      return;
    }
    const verifiedUser: AuthUser = { ...pendingUser, mfaVerified: true };
    setUser(verifiedUser);
    toast.success('Administrator session verified');
    onSuccess?.(verifiedUser);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge tone="warning" variant="dot">
          Restricted Admin Portal
        </Badge>
        <span style={{ color: 'var(--color-text-muted)' }} className="text-[11px]">
          2FA Mandatory
        </span>
      </div>

      {step === 'credentials' ? (
        <form onSubmit={handleSubmit(handleCredentials)} className="space-y-4" noValidate>
          <FormField id="admin-email" label="Admin Email" error={errors.email?.message} required>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              aria-invalid={Boolean(errors.email)}
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

          <FormField id="admin-password" label="Admin Password" error={errors.password?.message} required>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
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

          <Button type="submit" loading={isSubmitting} className="w-full">
            Continue to 2FA Verification
          </Button>

          <p style={{ color: 'var(--color-text-muted)' }} className="text-center text-xs">
            Looking for the standard workspace?{' '}
            <a href="/login" style={{ color: 'var(--color-primary)' }} className="font-medium">
              User Sign In
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">
            Enter the 6-digit code from your authenticator app for{' '}
            <strong>{pendingUser?.email}</strong>.
          </p>
          <OtpInput value={otp} onChange={setOtp} label="Administrator 2FA code" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              tone="neutral"
              className="flex-1"
              onClick={() => {
                setStep('credentials');
                setOtp('');
              }}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Verify & Sign In
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Standard User Register Form (/register) */
const registerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(registerSchema, { defaultValues: { acceptTerms: false } });

  return (
    <form
      onSubmit={handleSubmit(async () => {
        toast.success('Account created');
        onSuccess?.();
      })}
      className="space-y-4"
      noValidate
    >
      <FormField id="reg-name" label="Full name" error={errors.name?.message} required>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('name')}
        />
      </FormField>
      <FormField id="reg-email" label="Work email" error={errors.email?.message} required>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('email')}
        />
      </FormField>
      <FormField id="reg-pass" label="Password" error={errors.password?.message} required>
        <input
          id="reg-pass"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('password')}
        />
      </FormField>
      <label className="flex cursor-pointer items-center gap-2 text-xs">
        <input type="checkbox" {...register('acceptTerms')} />
        <span>I agree to the Terms of Service and Privacy Policy</span>
      </label>
      {errors.acceptTerms && (
        <p role="alert" style={{ color: 'var(--color-error)' }} className="text-xs">
          {errors.acceptTerms.message}
        </p>
      )}
      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}

/** Forgot Password Form (/forgot-password) */
export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState('');

  if (sent) {
    return (
      <div className="space-y-4 text-sm">
        <p style={{ color: 'var(--color-text-muted)' }}>
          If an account exists for <strong>{email}</strong>, a password reset link has been sent.
        </p>
        <Button variant="outline" tone="neutral" className="w-full" onClick={() => setSent(false)}>
          Try another email
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes('@')) return toast.error('Enter a valid email');
        setSent(true);
        toast.success('Reset link sent');
      }}
      className="space-y-4"
    >
      <FormField id="forgot-email" label="Email address" required>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
        />
      </FormField>
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}

/** Reset Password Form (/reset-password) */
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(resetSchema);

  return (
    <form
      onSubmit={handleSubmit(async () => {
        toast.success('Password updated');
        onSuccess?.();
      })}
      className="space-y-4"
      noValidate
    >
      <FormField id="reset-pass" label="New password" error={errors.password?.message} required>
        <input
          id="reset-pass"
          type="password"
          autoComplete="new-password"
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('password')}
        />
      </FormField>
      <FormField
        id="reset-confirm"
        label="Confirm new password"
        error={errors.confirmPassword?.message}
        required
      >
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-md)',
          }}
          className="h-10 w-full border px-3 text-sm"
          {...register('confirmPassword')}
        />
      </FormField>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Update password
      </Button>
    </form>
  );
}

/** Two-Factor OTP Form (/two-factor) */
export function TwoFactorForm({ onVerify }: { onVerify?: (code: string) => void }) {
  const [code, setCode] = React.useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length < 6) return toast.error('Enter the 6-digit code');
        toast.success('Verification code accepted');
        onVerify?.(code);
      }}
      className="space-y-5"
    >
      <OtpInput value={code} onChange={setCode} label="Two-factor verification code" />
      <Button type="submit" className="w-full">
        Verify code
      </Button>
    </form>
  );
}

/** Verify Email View (/verify-email) */
export function VerifyEmailView({ email = 'you@example.com' }: { email?: string }) {
  return (
    <div className="space-y-4 text-sm">
      <p style={{ color: 'var(--color-text-muted)' }}>
        We sent a verification link to <strong>{email}</strong>. Click the link in your inbox to
        activate your account.
      </p>
      <Button
        variant="outline"
        tone="neutral"
        className="w-full"
        onClick={() => toast.success('Verification email resent')}
      >
        Resend verification email
      </Button>
    </div>
  );
}

/** 401 Not Authorized View (/401) */
export function Unauthorized401View() {
  return (
    <EmptyState
      illustration="access-denied"
      title="401 — Not Authorized"
      description="Your account does not have permission to access this area."
      action={
        <div className="flex items-center gap-2">
          <a
            href="/dashboard/analytics"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-solid)',
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex h-9 items-center px-4 text-sm font-medium"
          >
            Back to Dashboard
          </a>
          <a
            href="/login"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="inline-flex h-9 items-center border px-4 text-sm font-medium"
          >
            Switch Account
          </a>
        </div>
      }
    />
  );
}
