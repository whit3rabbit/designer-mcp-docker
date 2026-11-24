'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, cx, type RecipeVariantProps } from 'styled-system/css';

export const buttonRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans',
    fontWeight: '600',
    borderRadius: 'md',
    border: '1px solid transparent',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, border-color, color, opacity, transform',
    transitionDuration: '150ms',
    _focusVisible: {
      outline: '2px solid token(colors.primary)',
      outlineOffset: '2px',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    _active: {
      transform: 'scale(0.98)',
    },
  },
  variants: {
    variant: {
      solid: {},
      outline: {
        bg: 'surface',
      },
      tonal: {},
      ghost: {
        bg: 'transparent',
      },
      link: {
        bg: 'transparent',
        border: 'none',
        height: 'auto',
        paddingInline: '0',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
      },
    },
    tone: {
      primary: {},
      success: {},
      warning: {},
      error: {},
      info: {},
      neutral: {},
    },
    size: {
      xs: { height: '28px', paddingInline: '8px', fontSize: '12px', gap: '4px' },
      sm: { height: '32px', paddingInline: '12px', fontSize: '12px', gap: '6px' },
      md: { height: '38px', paddingInline: '16px', fontSize: '14px', gap: '8px' },
      lg: { height: '44px', paddingInline: '20px', fontSize: '14px', gap: '8px' },
      xl: { height: '48px', paddingInline: '24px', fontSize: '16px', gap: '10px' },
    },
    iconOnly: {
      true: {
        paddingInline: '0',
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
  compoundVariants: [
    // Solid variants
    {
      variant: 'solid',
      tone: 'primary',
      css: { bg: 'primary', color: 'onSolid', _hover: { bg: 'primaryHover' } },
    },
    {
      variant: 'solid',
      tone: 'success',
      css: { bg: 'success', color: 'onSolid', _hover: { opacity: 0.9 } },
    },
    {
      variant: 'solid',
      tone: 'warning',
      css: { bg: 'warning', color: 'onSolid', _hover: { opacity: 0.9 } },
    },
    {
      variant: 'solid',
      tone: 'error',
      css: { bg: 'error', color: 'onSolid', _hover: { opacity: 0.9 } },
    },
    {
      variant: 'solid',
      tone: 'info',
      css: { bg: 'info', color: 'onSolid', _hover: { opacity: 0.9 } },
    },
    {
      variant: 'solid',
      tone: 'neutral',
      css: { bg: 'text', color: 'surface', _hover: { opacity: 0.9 } },
    },
    // Outline variants
    {
      variant: 'outline',
      tone: 'primary',
      css: { borderColor: 'primaryBorder', color: 'primary', _hover: { bg: 'primarySurface' } },
    },
    {
      variant: 'outline',
      tone: 'success',
      css: { borderColor: 'successBorder', color: 'success', _hover: { bg: 'successSurface' } },
    },
    {
      variant: 'outline',
      tone: 'warning',
      css: { borderColor: 'warningBorder', color: 'warning', _hover: { bg: 'warningSurface' } },
    },
    {
      variant: 'outline',
      tone: 'error',
      css: { borderColor: 'errorBorder', color: 'error', _hover: { bg: 'errorSurface' } },
    },
    {
      variant: 'outline',
      tone: 'info',
      css: { borderColor: 'infoBorder', color: 'info', _hover: { bg: 'infoSurface' } },
    },
    {
      variant: 'outline',
      tone: 'neutral',
      css: { borderColor: 'border', color: 'text', _hover: { bg: 'surfaceSubtle' } },
    },
    // Tonal variants
    {
      variant: 'tonal',
      tone: 'primary',
      css: { bg: 'primarySurface', color: 'primary', _hover: { borderColor: 'primaryBorder' } },
    },
    {
      variant: 'tonal',
      tone: 'success',
      css: { bg: 'successSurface', color: 'success', _hover: { borderColor: 'successBorder' } },
    },
    {
      variant: 'tonal',
      tone: 'warning',
      css: { bg: 'warningSurface', color: 'warning', _hover: { borderColor: 'warningBorder' } },
    },
    {
      variant: 'tonal',
      tone: 'error',
      css: { bg: 'errorSurface', color: 'error', _hover: { borderColor: 'errorBorder' } },
    },
    {
      variant: 'tonal',
      tone: 'info',
      css: { bg: 'infoSurface', color: 'info', _hover: { borderColor: 'infoBorder' } },
    },
    {
      variant: 'tonal',
      tone: 'neutral',
      css: { bg: 'surfaceSubtle', color: 'text', _hover: { bg: 'border' } },
    },
    // Ghost variants
    {
      variant: 'ghost',
      tone: 'primary',
      css: { color: 'primary', _hover: { bg: 'primarySurface' } },
    },
    {
      variant: 'ghost',
      tone: 'error',
      css: { color: 'error', _hover: { bg: 'errorSurface' } },
    },
    {
      variant: 'ghost',
      tone: 'neutral',
      css: { color: 'text', _hover: { bg: 'surfaceSubtle' } },
    },
    // Link variants
    {
      variant: 'link',
      tone: 'primary',
      css: { color: 'primary', _hover: { color: 'primaryHover' } },
    },
    {
      variant: 'link',
      tone: 'neutral',
      css: { color: 'text', _hover: { color: 'textMuted' } },
    },
    // Icon-only square dimensions
    { iconOnly: true, size: 'xs', css: { width: '28px' } },
    { iconOnly: true, size: 'sm', css: { width: '32px' } },
    { iconOnly: true, size: 'md', css: { width: '38px' } },
    { iconOnly: true, size: 'lg', css: { width: '44px' } },
    { iconOnly: true, size: 'xl', css: { width: '48px' } },
  ],
  defaultVariants: {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    iconOnly: false,
    fullWidth: false,
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonRecipe>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, tone, size, iconOnly, fullWidth, loading, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonRecipe({ variant, tone, size, iconOnly, fullWidth }), className)}
      {...rest}
    >
      {loading && (
        <Loader2
          size={16}
          aria-hidden="true"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      )}
      {children}
    </button>
  );
});
