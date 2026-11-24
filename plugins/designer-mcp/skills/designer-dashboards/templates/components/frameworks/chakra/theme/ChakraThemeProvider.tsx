import * as React from 'react';
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react';

const rabbitChakraConfig = defineConfig({
  globalCss: {
    'html, body': {
      backgroundColor: 'var(--color-canvas)',
      color: 'var(--color-text)',
      fontFamily: 'var(--font-sans)',
    },
    '*:focus-visible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '2px',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-sans)' },
        body: { value: 'var(--font-sans)' },
        mono: { value: 'var(--font-mono)' },
      },
      radii: {
        md: { value: 'var(--radius-md)' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: 'var(--color-canvas)' },
          canvas: { value: 'var(--color-canvas)' },
          surface: { value: 'var(--color-surface)' },
          panel: { value: 'var(--color-surface)' },
          elevated: { value: 'var(--color-surface-elevated)' },
          subtle: { value: 'var(--color-surface-subtle)' },
          muted: { value: 'var(--color-surface-subtle)' },
        },
        fg: {
          DEFAULT: { value: 'var(--color-text)' },
          muted: { value: 'var(--color-text-muted)' },
        },
        border: {
          DEFAULT: { value: 'var(--color-border)' },
          subtle: { value: 'var(--color-border)' },
        },
        accent: {
          DEFAULT: { value: 'var(--color-primary)' },
          solid: { value: 'var(--color-primary)' },
          hover: { value: 'var(--color-primary-hover)' },
          surface: { value: 'var(--color-primary-surface)' },
          border: { value: 'var(--color-primary-border)' },
          contrast: { value: 'var(--color-on-solid)' },
        },
        status: {
          success: { value: 'var(--color-success)' },
          warning: { value: 'var(--color-warning)' },
          error: { value: 'var(--color-error)' },
          info: { value: 'var(--color-info)' },
        },
      },
    },
  },
});

export const rabbitChakraSystem = createSystem(defaultConfig, rabbitChakraConfig);

export interface ChakraThemeProviderProps {
  children: React.ReactNode;
}

export function ChakraThemeProvider({ children }: ChakraThemeProviderProps) {
  return <ChakraProvider value={rabbitChakraSystem}>{children}</ChakraProvider>;
}
