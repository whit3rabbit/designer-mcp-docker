'use client';

/**
 * MUI v7 + Tailwind CSS v4 Layering & Design-Token Bridge Example
 * Distilled from gogo_v6.3.0, materialize_v13.11.1, vuexy_v10.11.1, modernize_v11.0.0.
 *
 * 1. In your global CSS (before `@import "tailwindcss";`):
 *    `@layer theme, base, mui, components, utilities;`
 *    Wrap MUI styles in `@layer mui` or use `<StyledEngineProvider enableCssLayer>`.
 * 2. Map MUI palette tokens to Designer Dashboards CSS variables (`var(--color-*)`) so
 *    OpenDesign `theme.json` + `build-tokens.mjs` remain the single source of truth.
 * 3. Pair `<html dir={dir}>` with Emotion `stylis-plugin-rtl` for automatic RTL mirroring.
 */

import * as React from 'react';
// Install when using MUI: pnpm add @mui/material @emotion/react @emotion/styled stylis-plugin-rtl
// import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
// import createCache from '@emotion/cache';
// import { CacheProvider } from '@emotion/react';
// import rtlPlugin from 'stylis-plugin-rtl';

export interface MuiBridgeProps {
  mode: 'light' | 'dark';
  dir: 'ltr' | 'rtl';
  children: React.ReactNode;
}

export function getMuiTokenThemeConfig(mode: 'light' | 'dark', dir: 'ltr' | 'rtl') {
  return {
    direction: dir,
    cssVariables: true,
    palette: {
      mode,
      primary: { main: 'var(--color-primary)' },
      background: {
        default: 'var(--color-canvas)',
        paper: 'var(--color-surface)',
      },
      text: {
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-muted)',
      },
      divider: 'var(--color-border)',
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'var(--font-sans)',
    },
  };
}

export function MuiTailwindBridge({ children }: MuiBridgeProps) {
  // Replace with <StyledEngineProvider enableCssLayer><CacheProvider value={cache}><ThemeProvider theme={createTheme(getMuiTokenThemeConfig(mode, dir))}>...
  return <>{children}</>;
}
