import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { MotionConfig } from 'motion/react';
import { AppShell } from './@layouts/AppShell';
import { AuthShell, LoginForm } from './@layouts/AuthShell';
import { AdminLoginFlow, RegisterForm } from './@core/auth/AuthSuite';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { ShowcasePage } from './components/framework/ShowcasePage';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppShell pathname={location.pathname} onNavigate={(href) => navigate(href)}>
      {children}
    </AppShell>
  );
}

function LoginView() {
  const navigate = useNavigate();
  return (
    <AuthShell
      variant="split"
      title="Sign in to your workspace"
      subtitle="Enter your credentials to access the dashboard."
      demoMode={import.meta.env.VITE_AUTH_MODE !== 'live'}
    >
      <LoginForm
        onSuccess={async () => {
          navigate('/dashboard/analytics');
        }}
      />
    </AuthShell>
  );
}

function AdminLoginView() {
  const navigate = useNavigate();
  return (
    <AuthShell
      variant="boxed"
      title="Administrator Sign In"
      subtitle="Restricted access. Administrator role and 2FA verification required."
      demoMode={import.meta.env.VITE_AUTH_MODE !== 'live'}
    >
      <AdminLoginFlow onSuccess={() => navigate('/dashboard/analytics')} />
    </AuthShell>
  );
}

function RegisterView() {
  const navigate = useNavigate();
  return (
    <AuthShell
      variant="split"
      title="Create your account"
      subtitle="Start your workspace in seconds."
      demoMode={import.meta.env.VITE_AUTH_MODE !== 'live'}
    >
      <RegisterForm onSuccess={() => navigate('/dashboard/analytics')} />
    </AuthShell>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/admin/login" element={<AdminLoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route
          path="/dashboard/analytics"
          element={
            <DashboardLayout>
              <AnalyticsDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/ui/motion"
          element={
            <DashboardLayout>
              <ShowcasePage />
            </DashboardLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
      </Routes>
    </MotionConfig>
  );
}
