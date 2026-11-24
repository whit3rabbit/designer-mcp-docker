'use client';

import * as React from 'react';

export type DaisyThemeMode = 'system' | 'light' | 'dark';
export type ResolvedDaisyTheme = 'rabbit-light' | 'rabbit-dark';
export type TextDirection = 'ltr' | 'rtl';

export interface DaisyThemeContextValue {
  mode: DaisyThemeMode;
  resolvedTheme: ResolvedDaisyTheme;
  isDark: boolean;
  dir: TextDirection;
  setMode: (mode: DaisyThemeMode) => void;
  toggleTheme: () => void;
  setDir: (dir: TextDirection) => void;
  toggleDir: () => void;
}

const DaisyThemeContext = React.createContext<DaisyThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'rd-theme';
const DIR_STORAGE_KEY = 'rd-dir';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStoredMode(): DaisyThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
  } catch {
    // ignore storage errors
  }
  return 'system';
}

function readStoredDir(): TextDirection {
  if (typeof window === 'undefined') return 'ltr';
  try {
    const val = window.localStorage.getItem(DIR_STORAGE_KEY);
    if (val === 'rtl' || val === 'ltr') return val;
  } catch {
    // ignore storage errors
  }
  return 'ltr';
}

export interface DaisyThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: DaisyThemeMode;
  defaultDir?: TextDirection;
}

export function DaisyThemeProvider({
  children,
  defaultMode,
  defaultDir,
}: DaisyThemeProviderProps) {
  const [mode, setModeState] = React.useState<DaisyThemeMode>(
    () => defaultMode ?? readStoredMode(),
  );
  const [dir, setDirState] = React.useState<TextDirection>(
    () => defaultDir ?? readStoredDir(),
  );
  const [systemDark, setSystemDark] = React.useState<boolean>(() => getSystemPrefersDark());

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  const resolvedTheme: ResolvedDaisyTheme = isDark ? 'rabbit-dark' : 'rabbit-light';

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.classList.toggle('dark', isDark);
    root.setAttribute('dir', dir);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      window.localStorage.setItem(DIR_STORAGE_KEY, dir);
    } catch {
      // ignore storage errors
    }
  }, [resolvedTheme, isDark, mode, dir]);

  const setMode = React.useCallback((next: DaisyThemeMode) => {
    setModeState(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setModeState((prev) => {
      const currentlyDark = prev === 'dark' || (prev === 'system' && getSystemPrefersDark());
      return currentlyDark ? 'light' : 'dark';
    });
  }, []);

  const setDir = React.useCallback((next: TextDirection) => {
    setDirState(next);
  }, []);

  const toggleDir = React.useCallback(() => {
    setDirState((prev) => (prev === 'ltr' ? 'rtl' : 'ltr'));
  }, []);

  const value = React.useMemo<DaisyThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      isDark,
      dir,
      setMode,
      toggleTheme,
      setDir,
      toggleDir,
    }),
    [mode, resolvedTheme, isDark, dir, setMode, toggleTheme, setDir, toggleDir],
  );

  return <DaisyThemeContext.Provider value={value}>{children}</DaisyThemeContext.Provider>;
}

export function useDaisyTheme(): DaisyThemeContextValue {
  const ctx = React.useContext(DaisyThemeContext);
  if (!ctx) {
    throw new Error('useDaisyTheme must be used within a DaisyThemeProvider');
  }
  return ctx;
}
