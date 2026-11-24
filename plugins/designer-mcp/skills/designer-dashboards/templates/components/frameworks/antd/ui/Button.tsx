'use client';

import * as React from 'react';
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'variant' | 'size' | 'color'> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const SIZE_MAP: Record<ButtonSize, AntButtonProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large',
};

function getToneStyles(variant: ButtonVariant, tone: ButtonTone): React.CSSProperties {
  if (tone === 'neutral') {
    if (variant === 'solid') {
      return {
        backgroundColor: 'var(--color-text)',
        borderColor: 'var(--color-text)',
        color: 'var(--color-surface)',
      };
    }
    if (variant === 'outline') {
      return {
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      };
    }
    if (variant === 'tonal') {
      return {
        backgroundColor: 'var(--color-surface-subtle)',
        borderColor: 'transparent',
        color: 'var(--color-text)',
      };
    }
    return {
      color: 'var(--color-text)',
    };
  }

  const color = `var(--color-${tone})`;
  const surface = `var(--color-${tone}-surface)`;
  const border = `var(--color-${tone}-border)`;

  if (variant === 'solid') {
    return {
      backgroundColor: color,
      borderColor: color,
      color: 'var(--color-on-solid)',
    };
  }
  if (variant === 'outline') {
    return {
      borderColor: border,
      backgroundColor: 'transparent',
      color,
    };
  }
  if (variant === 'tonal') {
    return {
      backgroundColor: surface,
      borderColor: 'transparent',
      color,
    };
  }
  return {
    color,
  };
}

function getAntType(variant: ButtonVariant): AntButtonProps['type'] {
  switch (variant) {
    case 'solid':
      return 'primary';
    case 'outline':
      return 'default';
    case 'tonal':
      return 'default';
    case 'ghost':
      return 'text';
    case 'link':
      return 'link';
  }
}

export function Button({
  variant = 'solid',
  tone = 'primary',
  size = 'md',
  iconOnly = false,
  fullWidth = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  const toneStyle = tone === 'primary' && variant === 'solid' ? undefined : getToneStyles(variant, tone);

  return (
    <AntButton
      type={getAntType(variant)}
      size={SIZE_MAP[size]}
      block={fullWidth}
      shape={iconOnly ? 'circle' : 'default'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 500,
        ...(size === 'xl' ? { height: 44, paddingInline: iconOnly ? 0 : 22, fontSize: 15 } : {}),
        ...(size === 'xs' ? { height: 26, paddingInline: iconOnly ? 0 : 8, fontSize: 12 } : {}),
        ...toneStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </AntButton>
  );
}
