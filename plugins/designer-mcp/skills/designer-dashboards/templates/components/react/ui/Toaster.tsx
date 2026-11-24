'use client';

import * as React from 'react';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
          zIndex: 'var(--z-toast)' as unknown as number,
        },
      }}
      {...props}
    />
  );
}
