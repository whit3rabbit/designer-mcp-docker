import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { ChevronDown } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
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
  controlWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    width: '100%',
    height: '38px',
    paddingBlock: 0,
    paddingInlineStart: '12px',
    paddingInlineEnd: '36px',
    appearance: 'none',
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
    cursor: 'pointer',
    boxShadow: {
      default: 'none',
      ':focus-visible': `0 0 0 3px ${tokens.primaryFocus}`,
    },
  },
  selectError: {
    borderColor: tokens.error,
  },
  chevron: {
    position: 'absolute',
    insetInlineEnd: '12px',
    color: tokens.textMuted,
    pointerEvents: 'none',
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

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, helperText, error, options, className, style, ...rest },
  ref,
) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const helperId = `${selectId}-helper`;
  const hasMessage = Boolean(error || helperText);

  const sx = stylex.props(styles.select, Boolean(error) && styles.selectError);

  return (
    <div {...stylex.props(styles.wrapper)}>
      {label ? (
        <label htmlFor={selectId} {...stylex.props(styles.label)}>
          {label}
        </label>
      ) : null}
      <div {...stylex.props(styles.controlWrap)}>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hasMessage ? helperId : undefined}
          {...rest}
          className={[sx.className, className].filter(Boolean).join(' ')}
          style={{ ...sx.style, ...style }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" {...stylex.props(styles.chevron)} />
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
