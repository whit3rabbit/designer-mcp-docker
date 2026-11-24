import { definePreset } from 'unocss';

export interface OpenDesignPresetOptions {
  /**
   * Optional prefix for semantic shortcuts (defaults to 'rd').
   */
  shortcutPrefix?: string;
}

/**
 * Reusable UnoCSS preset bridging OpenDesign OKLCH CSS custom properties
 * (`--color-*`, `--font-*`, `--radius-*`) into UnoCSS `theme` & `shortcuts`.
 *
 * Works seamlessly with `@unocss/preset-wind4` and supports light/dark mode
 * (`[data-theme="dark"]` / `.dark`) and RTL (`dir="rtl"`) without hardcoded colors.
 */
export function presetOpenDesign(options: OpenDesignPresetOptions = {}) {
  const prefix = options.shortcutPrefix ?? 'rd';

  return definePreset({
    name: 'preset-opendesign',
    theme: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-subtle': 'var(--color-surface-subtle)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'on-solid': 'var(--color-on-solid)',
        scrim: 'var(--color-scrim)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          surface: 'var(--color-primary-surface)',
          border: 'var(--color-primary-border)',
          hover: 'var(--color-primary-hover)',
          pressed: 'var(--color-primary-pressed)',
        },
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
      [`${prefix}-card`]: 'bg-surface text-text border border-border rounded-lg shadow-sm',
      [`${prefix}-surface-elevated`]:
        'bg-surface-elevated text-text border border-border rounded-lg shadow-md',
      [`${prefix}-surface-subtle`]: 'bg-surface-subtle text-text border border-border rounded-md',
      [`${prefix}-focus-ring`]:
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      [`${prefix}-btn-base`]:
        `inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${prefix}-focus-ring`,
      [`${prefix}-input-base`]:
        `w-full bg-surface text-text placeholder:text-text-muted border border-border rounded-md transition-colors duration-150 ${prefix}-focus-ring disabled:opacity-50 disabled:cursor-not-allowed`,
    },
    preflights: [
      {
        getCSS: () => `
          :focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }
        `,
      },
    ],
  });
}

export default presetOpenDesign;
