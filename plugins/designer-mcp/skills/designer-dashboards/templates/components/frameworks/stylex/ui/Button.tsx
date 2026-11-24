import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { Loader2 } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: tokens.fontSans,
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: tokens.radiusMd,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: {
      default: 'pointer',
      ':disabled': 'not-allowed',
    },
    opacity: {
      default: 1,
      ':disabled': 0.55,
    },
    textDecoration: 'none',
    transitionProperty: 'background-color, border-color, color, opacity, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    userSelect: 'none',
    outlineWidth: {
      default: 0,
      ':focus-visible': '2px',
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': tokens.primary,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': '2px',
    },
  },
  fullWidth: {
    width: '100%',
  },
  sizeXs: {
    height: '28px',
    paddingInline: '8px',
    fontSize: tokens.textXs,
    gap: '4px',
  },
  sizeSm: {
    height: '32px',
    paddingInline: '12px',
    fontSize: tokens.textXs,
    gap: '6px',
  },
  sizeMd: {
    height: '38px',
    paddingInline: '16px',
    fontSize: tokens.textSm,
    gap: '8px',
  },
  sizeLg: {
    height: '44px',
    paddingInline: '20px',
    fontSize: tokens.textBase,
    gap: '8px',
  },
  sizeXl: {
    height: '48px',
    paddingInline: '24px',
    fontSize: tokens.textLg,
    gap: '10px',
  },
  iconXs: { width: '28px', height: '28px', paddingInline: 0 },
  iconSm: { width: '32px', height: '32px', paddingInline: 0 },
  iconMd: { width: '38px', height: '38px', paddingInline: 0 },
  iconLg: { width: '44px', height: '44px', paddingInline: 0 },
  iconXl: { width: '48px', height: '48px', paddingInline: 0 },
  linkUnderline: {
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
  },
  spin: {
    animationName: stylex.keyframes({
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});

const SIZE_MAP: Record<ButtonSize, keyof typeof styles> = {
  xs: 'sizeXs',
  sm: 'sizeSm',
  md: 'sizeMd',
  lg: 'sizeLg',
  xl: 'sizeXl',
};

const ICON_SIZE_MAP: Record<ButtonSize, keyof typeof styles> = {
  xs: 'iconXs',
  sm: 'iconSm',
  md: 'iconMd',
  lg: 'iconLg',
  xl: 'iconXl',
};

function getToneInlineStyle(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
  if (tone === 'neutral') {
    if (variant === 'solid') {
      return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
    }
    if (variant === 'outline') {
      return {
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      };
    }
    if (variant === 'tonal') {
      return { backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-text)' };
    }
    return { backgroundColor: 'transparent', color: 'var(--color-text)' };
  }

  const base = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  switch (variant) {
    case 'solid':
      return { backgroundColor: base, color: 'var(--color-on-solid)' };
    case 'outline':
      return { borderColor: border, backgroundColor: 'transparent', color: base };
    case 'tonal':
      return { backgroundColor: surface, color: base };
    case 'ghost':
    case 'link':
      return { backgroundColor: 'transparent', color: base };
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    tone = 'primary',
    size = 'md',
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled,
    className,
    style,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const sx = stylex.props(
    styles.base,
    iconOnly ? styles[ICON_SIZE_MAP[size]] : styles[SIZE_MAP[size]],
    fullWidth && styles.fullWidth,
    variant === 'link' && styles.linkUnderline,
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={{
        ...sx.style,
        ...getToneInlineStyle(variant, tone),
        ...style,
      }}
    >
      {loading ? <Loader2 size={16} aria-hidden="true" {...stylex.props(styles.spin)} /> : null}
      {children}
    </button>
  );
});
