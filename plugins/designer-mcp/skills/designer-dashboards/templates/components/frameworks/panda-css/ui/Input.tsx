'use client';

import * as React from 'react';
import { css, cx } from 'styled-system/css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, leadingIcon, trailingIcon, id, className, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' })}>
      {label && (
        <label
          htmlFor={inputId}
          className={css({
            fontSize: '13px',
            fontWeight: '500',
            color: 'text',
          })}
        >
          {label}
        </label>
      )}
      <div className={css({ position: 'relative', display: 'flex', alignItems: 'center' })}>
        {leadingIcon && (
          <span
            aria-hidden="true"
            className={css({
              position: 'absolute',
              insetInlineStart: '12px',
              display: 'inline-flex',
              color: 'textMuted',
              pointerEvents: 'none',
            })}
          >
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId ?? helperId}
          className={cx(
            css({
              width: '100%',
              height: '38px',
              paddingBlock: '8px',
              paddingInlineStart: leadingIcon ? '38px' : '12px',
              paddingInlineEnd: trailingIcon ? '38px' : '12px',
              bg: 'surface',
              color: 'text',
              border: '1px solid',
              borderColor: error ? 'error' : 'border',
              borderRadius: 'md',
              fontFamily: 'sans',
              fontSize: '14px',
              transitionProperty: 'border-color, box-shadow',
              transitionDuration: '150ms',
              _placeholder: { color: 'textMuted' },
              _focusVisible: {
                outline: 'none',
                borderColor: error ? 'error' : 'primary',
                boxShadow: error
                  ? '0 0 0 2px token(colors.errorSurface)'
                  : '0 0 0 2px token(colors.primarySurface)',
              },
              _disabled: {
                opacity: 0.5,
                cursor: 'not-allowed',
                bg: 'surfaceSubtle',
              },
            }),
            className,
          )}
          {...rest}
        />
        {trailingIcon && (
          <span
            aria-hidden="true"
            className={css({
              position: 'absolute',
              insetInlineEnd: '12px',
              display: 'inline-flex',
              color: 'textMuted',
              pointerEvents: 'none',
            })}
          >
            {trailingIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={errorId} role="alert" className={css({ fontSize: '12px', color: 'error' })}>
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={css({ fontSize: '12px', color: 'textMuted' })}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
