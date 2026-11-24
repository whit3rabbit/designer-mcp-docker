'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { css, cva, cx, type RecipeVariantProps } from 'styled-system/css';

export const alertRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBlock: '12px',
    paddingInline: '16px',
    borderRadius: 'md',
    border: '1px solid',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  variants: {
    tone: {
      info: { bg: 'infoSurface', borderColor: 'infoBorder', color: 'text' },
      success: { bg: 'successSurface', borderColor: 'successBorder', color: 'text' },
      warning: { bg: 'warningSurface', borderColor: 'warningBorder', color: 'text' },
      error: { bg: 'errorSurface', borderColor: 'errorBorder', color: 'text' },
    },
  },
  defaultVariants: {
    tone: 'info',
  },
});

const TONE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} as const;

const TONE_ICON_COLOR = {
  info: css({ color: 'info', flexShrink: 0, marginTop: '2px' }),
  success: css({ color: 'success', flexShrink: 0, marginTop: '2px' }),
  warning: css({ color: 'warning', flexShrink: 0, marginTop: '2px' }),
  error: css({ color: 'error', flexShrink: 0, marginTop: '2px' }),
} as const;

export type AlertVariants = RecipeVariantProps<typeof alertRecipe>;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, AlertVariants {
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  tone = 'info',
  title,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cx(alertRecipe({ tone }), className)}
      {...rest}
    >
      <Icon size={18} aria-hidden="true" className={TONE_ICON_COLOR[tone]} />
      <div className={css({ flex: 1, minWidth: 0 })}>
        {title && (
          <div className={css({ fontWeight: '600', marginBottom: children ? '2px' : '0' })}>
            {title}
          </div>
        )}
        {children && <div className={css({ color: 'textMuted', fontSize: '13px' })}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: 'sm',
            color: 'textMuted',
            cursor: 'pointer',
            _hover: { bg: 'surfaceSubtle', color: 'text' },
            _focusVisible: { outline: '2px solid token(colors.primary)', outlineOffset: '2px' },
          })}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
