import * as React from 'react';
import {
  MantineProvider,
  createTheme,
  useMantineColorScheme,
  type CSSVariablesResolver,
  type MantineColorScheme,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

/**
 * OpenDesign-backed Mantine theme.
 * Maps Designer Dashboards CSS custom properties without hardcoded hex values.
 */
export const openDesignMantineTheme = createTheme({
  fontFamily: 'var(--font-sans)',
  fontFamilyMonospace: 'var(--font-mono)',
  defaultRadius: 'md',
  primaryColor: 'brand',
  focusRing: 'auto',
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
  headings: {
    fontFamily: 'var(--font-sans)',
  },
});

/**
 * Resolves Mantine CSS variables to OpenDesign semantic tokens in both light and dark modes.
 */
export const openDesignCssVariablesResolver: CSSVariablesResolver = () => ({
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
    '--mantine-color-placeholder': 'var(--color-text-muted)',
    '--mantine-color-error': 'var(--color-error)',
    '--mantine-primary-color-filled': 'var(--color-primary)',
    '--mantine-primary-color-filled-hover': 'var(--color-primary-hover)',
    '--mantine-primary-color-light': 'var(--color-primary-surface)',
    '--mantine-primary-color-light-hover': 'var(--color-primary-surface)',
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

function readDomColorScheme(): MantineColorScheme {
  if (typeof document === 'undefined') return 'light';
  const root = document.documentElement;
  const isDark =
    root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
  return isDark ? 'dark' : 'light';
}

function ThemeSyncObserver() {
  const { setColorScheme } = useMantineColorScheme();

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const next = readDomColorScheme();
      setColorScheme(next);
      root.setAttribute('data-mantine-color-scheme', next);
    };

    sync();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          (m.attributeName === 'data-theme' || m.attributeName === 'class')
        ) {
          sync();
          break;
        }
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, [setColorScheme]);

  return null;
}

export interface MantineThemeProviderProps {
  children: React.ReactNode;
  defaultColorScheme?: MantineColorScheme;
  notificationsPosition?:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center';
}

/**
 * Root Mantine provider wired to OpenDesign tokens, dark-mode DOM observer, and Notifications.
 */
export function MantineThemeProvider({
  children,
  defaultColorScheme,
  notificationsPosition = 'bottom-right',
}: MantineThemeProviderProps) {
  const initialScheme = defaultColorScheme ?? readDomColorScheme();

  return (
    <MantineProvider
      theme={openDesignMantineTheme}
      cssVariablesResolver={openDesignCssVariablesResolver}
      defaultColorScheme={initialScheme}
    >
      <ThemeSyncObserver />
      <Notifications position={notificationsPosition} />
      {children}
    </MantineProvider>
  );
}
