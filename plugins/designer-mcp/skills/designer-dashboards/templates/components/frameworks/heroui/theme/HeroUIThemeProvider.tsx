'use client';

import * as React from 'react';
import { I18nProvider } from 'react-aria-components';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type TextDirection = 'ltr' | 'rtl';

export interface HeroUIThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  dir: TextDirection;
  setDir: (dir: TextDirection) => void;
  toggleDir: () => void;
  locale: string;
  setLocale: (locale: string) => void;
}

const HeroUIThemeContext = React.createContext<HeroUIThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'rd-theme';
const DIR_STORAGE_KEY = 'rd-dir';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredTheme(defaultTheme: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') return defaultTheme;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return defaultTheme;
}

function readStoredDir(defaultDir: TextDirection): TextDirection {
  if (typeof window === 'undefined') return defaultDir;
  try {
    const stored = window.localStorage.getItem(DIR_STORAGE_KEY);
    if (stored === 'ltr' || stored === 'rtl') return stored;
  } catch {
    // Ignore storage access errors
  }
  const attr = document.documentElement.getAttribute('dir');
  return attr === 'rtl' ? 'rtl' : defaultDir;
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.classList.toggle('dark', resolved === 'dark');
}

function applyDirToDocument(dir: TextDirection) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('dir', dir);
}

export interface HeroUIThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultDir?: TextDirection;
  defaultLocale?: string;
}

export function HeroUIThemeProvider({
  children,
  defaultTheme = 'system',
  defaultDir = 'ltr',
  defaultLocale = 'en-US',
}: HeroUIThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => readStoredTheme(defaultTheme));
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() => getSystemTheme());
  const [dir, setDirState] = React.useState<TextDirection>(() => readStoredDir(defaultDir));
  const [locale, setLocale] = React.useState<string>(defaultLocale);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  React.useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  React.useEffect(() => {
    applyDirToDocument(dir);
  }, [dir]);

  const setTheme = React.useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const setDir = React.useCallback((nextDir: TextDirection) => {
    setDirState(nextDir);
    try {
      window.localStorage.setItem(DIR_STORAGE_KEY, nextDir);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleDir = React.useCallback(() => {
    setDir(dir === 'rtl' ? 'ltr' : 'rtl');
  }, [dir, setDir]);

  const value = React.useMemo<HeroUIThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      dir,
      setDir,
      toggleDir,
      locale,
      setLocale,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, dir, setDir, toggleDir, locale],
  );

  return (
    <HeroUIThemeContext.Provider value={value}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </HeroUIThemeContext.Provider>
  );
}

export function useHeroUITheme(): HeroUIThemeContextValue {
  const ctx = React.useContext(HeroUIThemeContext);
  if (!ctx) {
    throw new Error('useHeroUITheme must be used within a HeroUIThemeProvider');
  }
  return ctx;
}
