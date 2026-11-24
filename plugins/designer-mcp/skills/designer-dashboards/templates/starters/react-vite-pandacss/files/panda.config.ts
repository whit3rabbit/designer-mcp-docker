import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  conditions: {
    extend: {
      dark: '&:is(.dark, [data-theme="dark"], .dark *, [data-theme="dark"] *)',
      rtl: '&:is([dir="rtl"], [dir="rtl"] *)',
    },
  },
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          canvas: { value: 'var(--color-canvas)' },
          surface: { value: 'var(--color-surface)' },
          surfaceElevated: { value: 'var(--color-surface-elevated)' },
          surfaceSubtle: { value: 'var(--color-surface-subtle)' },
          border: { value: 'var(--color-border)' },
          text: { value: 'var(--color-text)' },
          textMuted: { value: 'var(--color-text-muted)' },
          primary: { value: 'var(--color-primary)' },
          primarySurface: { value: 'var(--color-primary-surface)' },
          primaryBorder: { value: 'var(--color-primary-border)' },
          primaryHover: { value: 'var(--color-primary-hover)' },
          onSolid: { value: 'var(--color-on-solid)' },
          success: { value: 'var(--color-success)' },
          successSurface: { value: 'var(--color-success-surface)' },
          successBorder: { value: 'var(--color-success-border)' },
          warning: { value: 'var(--color-warning)' },
          warningSurface: { value: 'var(--color-warning-surface)' },
          warningBorder: { value: 'var(--color-warning-border)' },
          error: { value: 'var(--color-error)' },
          errorSurface: { value: 'var(--color-error-surface)' },
          errorBorder: { value: 'var(--color-error-border)' },
          info: { value: 'var(--color-info)' },
          infoSurface: { value: 'var(--color-info-surface)' },
          infoBorder: { value: 'var(--color-info-border)' },
          chart1: { value: 'var(--chart-1)' },
          chart2: { value: 'var(--chart-2)' },
          chart3: { value: 'var(--chart-3)' },
          chart4: { value: 'var(--chart-4)' },
          chart5: { value: 'var(--chart-5)' },
          chart6: { value: 'var(--chart-6)' },
          chart7: { value: 'var(--chart-7)' },
          chart8: { value: 'var(--chart-8)' },
          chart9: { value: 'var(--chart-9)' },
          chart10: { value: 'var(--chart-10)' },
        },
        fonts: {
          sans: { value: 'var(--font-sans)' },
          mono: { value: 'var(--font-mono)' },
        },
        radii: {
          sm: { value: 'var(--radius-sm)' },
          md: { value: 'var(--radius-md)' },
          lg: { value: 'var(--radius-lg)' },
        },
        shadows: {
          sm: { value: 'var(--shadow-sm)' },
          md: { value: 'var(--shadow-md)' },
        },
      },
    },
  },
});
