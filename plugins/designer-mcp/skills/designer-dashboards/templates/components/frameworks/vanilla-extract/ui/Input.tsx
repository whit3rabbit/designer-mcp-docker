import * as React from 'react';
import {
  fieldError,
  fieldHint,
  fieldLabel,
  fieldWrapper,
  inputControlWrapper,
  inputLeadingIcon,
  inputRecipe,
  type InputVariants,
} from './ui.css';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Omit<InputVariants, 'hasLeadingIcon'> & {
    label?: string;
    hint?: string;
    error?: string;
    leadingIcon?: React.ReactNode;
  };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    leadingIcon,
    size = 'md',
    invalid,
    className,
    ...rest
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isInvalid = Boolean(error) || Boolean(invalid);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  const recipeClass = inputRecipe({
    size,
    invalid: isInvalid,
    hasLeadingIcon: Boolean(leadingIcon),
  });
  const classes = className ? `${recipeClass} ${className}` : recipeClass;

  return (
    <div className={fieldWrapper}>
      {label && (
        <label htmlFor={inputId} className={fieldLabel}>
          {label}
        </label>
      )}
      <div className={inputControlWrapper}>
        {leadingIcon && (
          <span className={inputLeadingIcon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className={classes}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className={fieldError} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className={fieldHint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});
