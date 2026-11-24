import * as React from 'react';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { FOUC_THEME_SCRIPT } from '../@core/theme/fouc-script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Designer Dashboards Console',
  description: 'OpenDesign-governed SaaS dashboard starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <script dangerouslySetInnerHTML={{ __html: FOUC_THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
