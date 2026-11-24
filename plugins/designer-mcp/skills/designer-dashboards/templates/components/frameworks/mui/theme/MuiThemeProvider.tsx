import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, type ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type TextDirection = 'ltr' | 'rtl';

interface MuiThemeContextValue {
  mode: ThemeMode;
  dir: TextDirection;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setDir: (dir: TextDirection) => void;
  toggleDir: () => void;
}

const MuiThemeContext = React.createContext<MuiThemeContextValue | null>(null);

export function useMuiThemeMode(): MuiThemeContextValue {
  const ctx = React.useContext(MuiThemeContext);
  if (!ctx) {
    throw new Error('useMuiThemeMode must be used within MuiThemeProvider');
  }
  return ctx;
}

function readInitialMode(): ThemeMode {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function readInitialDir(): TextDirection {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}

function buildOpenDesignMuiOptions(mode: ThemeMode, dir: TextDirection): ThemeOptions {
  const sharedPalette = {
    primary: {
      main: 'var(--color-primary)',
      light: 'var(--color-primary-surface)',
      dark: 'var(--color-primary-hover)',
      contrastText: 'var(--color-on-solid)',
    },
    secondary: {
      main: 'var(--color-surface-elevated)',
      light: 'var(--color-surface-subtle)',
      dark: 'var(--color-surface)',
      contrastText: 'var(--color-text)',
    },
    success: {
      main: 'var(--color-success)',
      light: 'var(--color-surface-subtle)',
      dark: 'var(--color-success)',
      contrastText: 'var(--color-on-solid)',
    },
    warning: {
      main: 'var(--color-warning)',
      light: 'var(--color-surface-subtle)',
      dark: 'var(--color-warning)',
      contrastText: 'var(--color-text)',
    },
    error: {
      main: 'var(--color-error)',
      light: 'var(--color-surface-subtle)',
      dark: 'var(--color-error)',
      contrastText: 'var(--color-on-solid)',
    },
    info: {
      main: 'var(--color-info)',
      light: 'var(--color-surface-subtle)',
      dark: 'var(--color-info)',
      contrastText: 'var(--color-on-solid)',
    },
    background: {
      default: 'var(--color-canvas)',
      paper: 'var(--color-surface)',
    },
    text: {
      primary: 'var(--color-text)',
      secondary: 'var(--color-text-muted)',
    },
    divider: 'var(--color-border)',
  };

  return {
    direction: dir,
    cssVariables: true,
    palette: {
      mode,
      ...sharedPalette,
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: 'var(--font-sans)',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.015em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-md)',
            '&:focus-visible': {
              outline: '2px solid var(--color-primary)',
              outlineOffset: '2px',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary-border)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-elevated)',
          },
        },
      },
    },
  };
}

export interface MuiThemeProviderProps {
  children: React.ReactNode;
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const [mode, setModeState] = React.useState<ThemeMode>(readInitialMode);
  const [dir, setDirState] = React.useState<TextDirection>(readInitialDir);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    try {
      localStorage.setItem('rd-theme', next);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, []);

  const toggleMode = React.useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const setDir = React.useCallback((next: TextDirection) => {
    setDirState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', next);
    }
  }, []);

  const toggleDir = React.useCallback(() => {
    setDir(dir === 'ltr' ? 'rtl' : 'ltr');
  }, [dir, setDir]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const nextMode = readInitialMode();
      const nextDir = readInitialDir();
      setModeState((prev) => (prev !== nextMode ? nextMode : prev));
      setDirState((prev) => (prev !== nextDir ? nextDir : prev));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'dir'],
    });
    return () => observer.disconnect();
  }, []);

  const theme = React.useMemo(
    () => createTheme(buildOpenDesignMuiOptions(mode, dir)),
    [mode, dir],
  );

  const contextValue = React.useMemo<MuiThemeContextValue>(
    () => ({ mode, dir, setMode, toggleMode, setDir, toggleDir }),
    [mode, dir, setMode, toggleMode, setDir, toggleDir],
  );

  return (
    <MuiThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MuiThemeContext.Provider>
  );
}
