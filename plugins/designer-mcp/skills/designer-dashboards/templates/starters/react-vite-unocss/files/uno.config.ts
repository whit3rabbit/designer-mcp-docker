import { defineConfig, transformerDirectives, transformerVariantGroup } from 'unocss';
import presetWind4 from '@unocss/preset-wind4';

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'class',
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      canvas: 'var(--color-canvas)',
      surface: 'var(--color-surface)',
      'surface-elevated': 'var(--color-surface-elevated)',
      'surface-subtle': 'var(--color-surface-subtle)',
      border: 'var(--color-border)',
      text: 'var(--color-text)',
      'text-muted': 'var(--color-text-muted)',
      primary: {
        DEFAULT: 'var(--color-primary)',
        surface: 'var(--color-primary-surface)',
        border: 'var(--color-primary-border)',
        hover: 'var(--color-primary-hover)',
      },
      'on-solid': 'var(--color-on-solid)',
      success: {
        DEFAULT: 'var(--color-success)',
        surface: 'var(--color-success-surface)',
        border: 'var(--color-success-border)',
        hover: 'var(--color-success-hover)',
      },
      warning: {
        DEFAULT: 'var(--color-warning)',
        surface: 'var(--color-warning-surface)',
        border: 'var(--color-warning-border)',
        hover: 'var(--color-warning-hover)',
      },
      error: {
        DEFAULT: 'var(--color-error)',
        surface: 'var(--color-error-surface)',
        border: 'var(--color-error-border)',
        hover: 'var(--color-error-hover)',
      },
      info: {
        DEFAULT: 'var(--color-info)',
        surface: 'var(--color-info-surface)',
        border: 'var(--color-info-border)',
        hover: 'var(--color-info-hover)',
      },
      scrim: 'var(--color-scrim)',
    },
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },
  },
  shortcuts: {
    'rd-card': 'bg-surface text-text border border-border rounded-lg shadow-sm',
    'rd-surface-elevated': 'bg-surface-elevated text-text border border-border rounded-lg shadow-md',
    'rd-focus-ring':
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'rd-btn-base':
      'inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none rd-focus-ring',
  },
});
