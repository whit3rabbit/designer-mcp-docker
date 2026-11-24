import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../theme/tokens.stylex';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
}

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  label: {
    fontFamily: tokens.fontSans,
    fontSize: tokens.textXs,
    fontWeight: 500,
    color: tokens.text,
  },
  fieldWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  iconSlot: {
    position: 'absolute',
    insetInlineStart: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    color: tokens.textMuted,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: '38px',
    paddingBlock: 0,
    paddingInline: '12px',
    fontFamily: tokens.fontSans,
    fontSize: tokens.textSm,
    color: tokens.text,
    backgroundColor: tokens.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: tokens.border,
      ':focus-visible': tokens.primary,
    },
    borderRadius: tokens.radiusMd,
    outlineStyle: 'none',
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: '150ms',
    boxShadow: {
      default: 'none',
      ':focus-visible': `0 0 0 3px ${tokens.primaryFocus}`,
    },
    opacity: {
      default: 1,
      ':disabled': 0.6,
    },
  },
  withLeadingIcon: {
    paddingInlineStart: '36px',
  },
  inputError: {
    borderColor: tokens.error,
  },
  helper: {
    margin: 0,
    fontSize: tokens.textXs,
    color: tokens.textMuted,
  },
  errorText: {
    margin: 0,
    fontSize: tokens.textXs,
    color: tokens.error,
  },
});

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, helperText, error, leadingIcon, className, style, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const hasMessage = Boolean(error || helperText);

  const inputSx = stylex.props(
    styles.input,
    Boolean(leadingIcon) && styles.withLeadingIcon,
    Boolean(error) && styles.inputError,
  );

  return (
    <div {...stylex.props(styles.wrapper)}>
      {label ? (
        <label htmlFor={inputId} {...stylex.props(styles.label)}>
          {label}
        </label>
      ) : null}
      <div {...stylex.props(styles.fieldWrap)}>
        {leadingIcon ? (
          <span aria-hidden="true" {...stylex.props(styles.iconSlot)}>
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hasMessage ? helperId : undefined}
          {...rest}
          className={[inputSx.className, className].filter(Boolean).join(' ')}
          style={{ ...inputSx.style, ...style }}
        />
      </div>
      {error ? (
        <p id={helperId} role="alert" {...stylex.props(styles.errorText)}>
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} {...stylex.props(styles.helper)}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
