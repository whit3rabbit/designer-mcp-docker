import { createThemeContract } from '@vanilla-extract/css';

/**
 * Strongly-typed bridge to Designer Dashboards OpenDesign CSS custom properties
 * compiled into `design-system/styles.css` (light & `[data-theme="dark"]` / `.dark`).
 */
export const vars = {
  color: {
    canvas: 'var(--color-canvas)',
    surface: 'var(--color-surface)',
    surfaceElevated: 'var(--color-surface-elevated)',
    surfaceSubtle: 'var(--color-surface-subtle)',
    border: 'var(--color-border)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    primary: 'var(--color-primary)',
    primarySurface: 'var(--color-primary-surface)',
    primaryBorder: 'var(--color-primary-border)',
    primaryHover: 'var(--color-primary-hover)',
    onSolid: 'var(--color-on-solid)',
    success: 'var(--color-success)',
    successSurface: 'var(--color-success-surface)',
    successBorder: 'var(--color-success-border)',
    warning: 'var(--color-warning)',
    warningSurface: 'var(--color-warning-surface)',
    warningBorder: 'var(--color-warning-border)',
    error: 'var(--color-error)',
    errorSurface: 'var(--color-error-surface)',
    errorBorder: 'var(--color-error-border)',
    info: 'var(--color-info)',
    infoSurface: 'var(--color-info-surface)',
    infoBorder: 'var(--color-info-border)',
  },
  font: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
  radius: {
    sm: 'var(--radius-sm, 0.25rem)',
    md: 'var(--radius-md, 0.5rem)',
    lg: 'var(--radius-lg, 0.75rem)',
    full: '9999px',
  },
  chart: {
    1: 'var(--chart-1)',
    2: 'var(--chart-2)',
    3: 'var(--chart-3)',
    4: 'var(--chart-4)',
    5: 'var(--chart-5)',
    6: 'var(--chart-6)',
    7: 'var(--chart-7)',
    8: 'var(--chart-8)',
    9: 'var(--chart-9)',
    10: 'var(--chart-10)',
  },
} as const;

/**
 * Optional `createThemeContract` for component-scoped overrides that still
 * default to OpenDesign tokens when applied via `createTheme`.
 */
export const componentThemeContract = createThemeContract({
  controlHeightMd: null,
  cardShadow: null,
  dialogBackdrop: null,
});

export type OpenDesignVars = typeof vars;
