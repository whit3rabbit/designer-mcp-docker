'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '../../../@layouts/AppShell';

export default function PrivateDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppShell pathname={pathname} onNavigate={(href) => router.push(href)}>
      {children}
    </AppShell>
  );
}
