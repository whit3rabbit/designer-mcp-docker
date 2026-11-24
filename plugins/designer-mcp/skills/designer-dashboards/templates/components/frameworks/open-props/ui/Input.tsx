import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, startAdornment, endAdornment, className, ...rest },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const inputClasses = [
    'op-input',
    startAdornment ? 'op-input--with-start' : '',
    endAdornment ? 'op-input--with-end' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="op-field">
      {label && (
        <label htmlFor={inputId} className="op-field__label">
          {label}
        </label>
      )}
      <div className="op-input-wrap">
        {startAdornment && (
          <span className="op-input__adornment op-input__adornment--start" aria-hidden="true">
            {startAdornment}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClasses}
          {...rest}
        />
        {endAdornment && (
          <span className="op-input__adornment op-input__adornment--end" aria-hidden="true">
            {endAdornment}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="op-field__error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="op-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
});
