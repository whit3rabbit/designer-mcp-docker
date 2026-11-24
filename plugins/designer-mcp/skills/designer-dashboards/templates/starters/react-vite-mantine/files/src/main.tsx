import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MantineProvider,
  createTheme,
  type CSSVariablesResolver,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const openDesignTheme = createTheme({
  fontFamily: 'var(--font-sans)',
  fontFamilyMonospace: 'var(--font-mono)',
  defaultRadius: 'md',
  primaryColor: 'brand',
  colors: {
    brand: [
      'var(--color-primary-surface)',
      'var(--color-primary-surface)',
      'var(--color-primary-border)',
      'var(--color-primary-border)',
      'var(--color-primary)',
      'var(--color-primary)',
      'var(--color-primary)',
      'var(--color-primary-hover)',
      'var(--color-primary-hover)',
      'var(--color-primary-hover)',
    ],
  },
  focusRing: 'auto',
});

const openDesignCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-font-family': 'var(--font-sans)',
    '--mantine-font-family-monospace': 'var(--font-mono)',
    '--mantine-radius-default': 'var(--radius-md)',
    '--mantine-color-body': 'var(--color-canvas)',
    '--mantine-color-text': 'var(--color-text)',
    '--mantine-color-dimmed': 'var(--color-text-muted)',
    '--mantine-color-default': 'var(--color-surface)',
    '--mantine-color-default-hover': 'var(--color-surface-subtle)',
    '--mantine-color-default-color': 'var(--color-text)',
    '--mantine-color-default-border': 'var(--color-border)',
    '--mantine-primary-color-filled': 'var(--color-primary)',
    '--mantine-primary-color-filled-hover': 'var(--color-primary-hover)',
    '--mantine-primary-color-light': 'var(--color-primary-surface)',
    '--mantine-primary-color-light-color': 'var(--color-primary)',
    '--mantine-primary-color-contrast': 'var(--color-on-solid)',
  },
  light: {
    '--mantine-color-body': 'var(--color-canvas)',
    '--mantine-color-text': 'var(--color-text)',
    '--mantine-color-default': 'var(--color-surface)',
    '--mantine-color-default-border': 'var(--color-border)',
  },
  dark: {
    '--mantine-color-body': 'var(--color-canvas)',
    '--mantine-color-text': 'var(--color-text)',
    '--mantine-color-default': 'var(--color-surface)',
    '--mantine-color-default-border': 'var(--color-border)',
  },
});

const initialColorScheme =
  typeof document !== 'undefined' &&
  document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={openDesignTheme}
        cssVariablesResolver={openDesignCssVariablesResolver}
        defaultColorScheme={initialColorScheme}
      >
        <Notifications position="bottom-right" />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
