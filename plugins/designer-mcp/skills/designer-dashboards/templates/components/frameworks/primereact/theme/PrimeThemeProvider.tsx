import * as React from 'react';
import { PrimeReactProvider, type APIOptions } from 'primereact/api';

export type ThemeMode = 'light' | 'dark';
export type TextDirection = 'ltr' | 'rtl';

export interface PrimeThemeContextValue {
  theme: ThemeMode;
  dir: TextDirection;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setDir: (dir: TextDirection) => void;
  toggleDir: () => void;
}

const PrimeThemeContext = React.createContext<PrimeThemeContextValue | null>(null);

export function usePrimeTheme(): PrimeThemeContextValue {
  const ctx = React.useContext(PrimeThemeContext);
  if (!ctx) {
    throw new Error('usePrimeTheme must be used within a PrimeThemeProvider');
  }
  return ctx;
}

export interface PrimeThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultDir?: TextDirection;
  primeConfig?: Partial<APIOptions>;
}

const BRIDGE_STYLE: React.CSSProperties & Record<string, string> = {
  '--primary-color': 'var(--color-primary)',
  '--primary-color-text': 'var(--color-on-solid)',
  '--surface-ground': 'var(--color-canvas)',
  '--surface-section': 'var(--color-canvas)',
  '--surface-card': 'var(--color-surface)',
  '--surface-overlay': 'var(--color-surface-elevated)',
  '--surface-border': 'var(--color-border)',
  '--surface-hover': 'var(--color-surface-subtle)',
  '--text-color': 'var(--color-text)',
  '--text-color-secondary': 'var(--color-text-muted)',
  '--highlight-bg': 'var(--color-primary-surface)',
  '--highlight-text-color': 'var(--color-primary)',
  '--border-radius': 'var(--radius-md)',
  '--font-family': 'var(--font-sans)',
  backgroundColor: 'var(--color-canvas)',
  color: 'var(--color-text)',
  minHeight: '100vh',
};

function resolveInitialTheme(fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') return fallback;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  const stored = window.localStorage.getItem('rd-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : fallback;
}

export function PrimeThemeProvider({
  children,
  defaultTheme = 'light',
  defaultDir = 'ltr',
  primeConfig,
}: PrimeThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => resolveInitialTheme(defaultTheme));
  const [dir, setDirState] = React.useState<TextDirection>(defaultDir);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('rd-theme', theme);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  const setTheme = React.useCallback((mode: ThemeMode) => setThemeState(mode), []);
  const toggleTheme = React.useCallback(
    () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    [],
  );
  const setDir = React.useCallback((nextDir: TextDirection) => setDirState(nextDir), []);
  const toggleDir = React.useCallback(
    () => setDirState((prev) => (prev === 'rtl' ? 'ltr' : 'rtl')),
    [],
  );

  const apiOptions: Partial<APIOptions> = React.useMemo(
    () => ({
      ripple: true,
      inputStyle: 'outlined',
      ...primeConfig,
    }),
    [primeConfig],
  );

  const value = React.useMemo<PrimeThemeContextValue>(
    () => ({ theme, dir, setTheme, toggleTheme, setDir, toggleDir }),
    [theme, dir, setTheme, toggleTheme, setDir, toggleDir],
  );

  return (
    <PrimeReactProvider value={apiOptions}>
      <PrimeThemeContext.Provider value={value}>
        <div dir={dir} style={BRIDGE_STYLE}>
          {children}
        </div>
      </PrimeThemeContext.Provider>
    </PrimeReactProvider>
  );
}
