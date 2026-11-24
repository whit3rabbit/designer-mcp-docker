'use client';

import * as React from 'react';
import { css, cva, cx, type RecipeVariantProps } from 'styled-system/css';

export const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '9999px',
    border: '1px solid transparent',
    fontFamily: 'sans',
    fontWeight: '600',
    lineHeight: '1',
    whiteSpace: 'nowrap',
  },
  variants: {
    tone: {
      primary: { bg: 'primarySurface', color: 'primary', borderColor: 'primaryBorder' },
      success: { bg: 'successSurface', color: 'success', borderColor: 'successBorder' },
      warning: { bg: 'warningSurface', color: 'warning', borderColor: 'warningBorder' },
      error: { bg: 'errorSurface', color: 'error', borderColor: 'errorBorder' },
      info: { bg: 'infoSurface', color: 'info', borderColor: 'infoBorder' },
      neutral: { bg: 'surfaceSubtle', color: 'textMuted', borderColor: 'border' },
    },
    size: {
      sm: { paddingBlock: '3px', paddingInline: '8px', fontSize: '11px' },
      md: { paddingBlock: '4px', paddingInline: '10px', fontSize: '12px' },
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'md',
  },
});

export type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, BadgeVariants {
  dot?: boolean;
}

export function Badge({ tone, size, dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(badgeRecipe({ tone, size }), className)} {...rest}>
      {dot && (
        <span
          aria-hidden="true"
          className={css({
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            bg: 'currentColor',
          })}
        />
      )}
      {children}
    </span>
  );
}
