'use client';

import { useRouter } from 'next/navigation';
import { AuthShell, LoginForm } from '../../../@layouts/AuthShell';
import { AdminLoginFlow, RegisterForm } from '../../../@core/auth/AuthSuite';

export function LoginClientView({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  return (
    <AuthShell
      variant="split"
      title="Sign in to your workspace"
      subtitle="Enter your credentials to access the dashboard."
      demoMode={demoMode}
    >
      <LoginForm
        onSuccess={async () => {
          router.push('/dashboard/analytics');
        }}
      />
    </AuthShell>
  );
}

export function RegisterClientView({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  return (
    <AuthShell
      variant="split"
      title="Create your account"
      subtitle="Start your workspace in seconds."
      demoMode={demoMode}
    >
      <RegisterForm onSuccess={() => router.push('/dashboard/analytics')} />
    </AuthShell>
  );
}

export function AdminLoginClientView({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  return (
    <AuthShell
      variant="boxed"
      title="Administrator Sign In"
      subtitle="Restricted access. Administrator role and 2FA verification required."
      demoMode={demoMode}
    >
      <AdminLoginFlow
        onSuccess={() => {
          router.push('/dashboard/analytics');
        }}
      />
    </AuthShell>
  );
}
