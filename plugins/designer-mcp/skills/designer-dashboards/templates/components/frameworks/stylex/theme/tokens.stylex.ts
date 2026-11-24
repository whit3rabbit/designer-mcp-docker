import * as stylex from '@stylexjs/stylex';

/**
 * OpenDesign -> StyleX variable bridge.
 * Values reference OpenDesign CSS custom properties compiled in `design-system/styles.css`,
 * so light/dark mode (`[data-theme="dark"]` / `.dark`) and all 21 WCAG AA presets apply automatically.
 */
export const tokens = stylex.defineVars({
  // Surfaces & borders
  canvas: 'var(--color-canvas)',
  surface: 'var(--color-surface)',
  surfaceElevated: 'var(--color-surface-elevated)',
  surfaceSubtle: 'var(--color-surface-subtle)',
  border: 'var(--color-border)',
  scrim: 'var(--color-scrim)',

  // Text
  text: 'var(--color-text)',
  textMuted: 'var(--color-text-muted)',
  onSolid: 'var(--color-on-solid)',

  // Primary
  primary: 'var(--color-primary)',
  primarySurface: 'var(--color-primary-surface)',
  primaryBorder: 'var(--color-primary-border)',
  primaryHover: 'var(--color-primary-hover)',
  primaryPressed: 'var(--color-primary-pressed)',
  primaryFocus: 'var(--color-primary-focus)',

  // Secondary
  secondary: 'var(--color-secondary)',
  secondarySurface: 'var(--color-secondary-surface)',
  secondaryBorder: 'var(--color-secondary-border)',
  secondaryHover: 'var(--color-secondary-hover)',

  // Semantic tones
  success: 'var(--color-success)',
  successSurface: 'var(--color-success-surface)',
  successBorder: 'var(--color-success-border)',
  successHover: 'var(--color-success-hover)',

  warning: 'var(--color-warning)',
  warningSurface: 'var(--color-warning-surface)',
  warningBorder: 'var(--color-warning-border)',
  warningHover: 'var(--color-warning-hover)',

  error: 'var(--color-error)',
  errorSurface: 'var(--color-error-surface)',
  errorBorder: 'var(--color-error-border)',
  errorHover: 'var(--color-error-hover)',

  info: 'var(--color-info)',
  infoSurface: 'var(--color-info-surface)',
  infoBorder: 'var(--color-info-border)',
  infoHover: 'var(--color-info-hover)',

  // Typography
  fontSans: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
  text2xs: 'var(--text-2xs)',
  textXs: 'var(--text-xs)',
  textSm: 'var(--text-sm)',
  textBase: 'var(--text-base)',
  textLg: 'var(--text-lg)',
  textXl: 'var(--text-xl)',
  text2xl: 'var(--text-2xl)',
  headingWeight: 'var(--font-heading-weight)',

  // Radii
  radiusSm: 'var(--radius-sm)',
  radiusMd: 'var(--radius-md)',
  radiusLg: 'var(--radius-lg)',
  radiusFull: '9999px',

  // Shadows
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',

  // Charts
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
  chartGrid: 'var(--chart-grid)',
  chartTooltipBg: 'var(--chart-tooltip-bg)',
  chartTooltipBorder: 'var(--chart-tooltip-border)',
});
