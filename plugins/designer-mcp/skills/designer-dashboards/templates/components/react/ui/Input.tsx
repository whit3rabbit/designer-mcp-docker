'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { AppIcon } from '../../@core/icons/registry';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  invalid?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-[38px] text-sm',
  lg: 'h-11 text-sm',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', invalid = false, startAdornment, endAdornment, className, style, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      {startAdornment && (
        <span
          style={{ color: 'var(--color-text-muted)' }}
          className="pointer-events-none absolute start-3 flex items-center"
        >
          {startAdornment}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
        className={clsx(
          'w-full border px-3 transition-colors placeholder:text-[var(--color-text-muted)]',
          'disabled:cursor-not-allowed disabled:opacity-55',
          SIZE_CLASSES[size],
          startAdornment && 'ps-9',
          endAdornment && 'pe-9',
          className,
        )}
        {...rest}
      />
      {endAdornment && (
        <span
          style={{ color: 'var(--color-text-muted)' }}
          className="absolute end-3 flex items-center"
        >
          {endAdornment}
        </span>
      )}
    </div>
  );
});

export interface InputPasswordProps extends Omit<InputProps, 'type' | 'endAdornment'> {
  showStrength?: boolean;
}

function getPasswordStrength(value: string) {
  const rules = [
    { label: '8+ characters', pass: value.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(value) },
    { label: 'Number', pass: /\d/.test(value) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = rules.filter((r) => r.pass).length;
  return { rules, score };
}

export function InputPassword({ showStrength = false, value, onChange, ...props }: InputPasswordProps) {
  const [visible, setVisible] = React.useState(false);
  const [internal, setInternal] = React.useState('');
  const current = typeof value === 'string' ? value : internal;
  const { rules, score } = getPasswordStrength(current);

  const toneVar =
    score <= 1
      ? 'var(--color-error)'
      : score === 2
        ? 'var(--color-warning)'
        : score === 3
          ? 'var(--color-info)'
          : 'var(--color-success)';

  const strengthLabel =
    score === 0 ? '' : score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';

  return (
    <div className="space-y-2">
      <Input
        {...props}
        value={value}
        onChange={(e) => {
          if (value === undefined) setInternal(e.target.value);
          onChange?.(e);
        }}
        type={visible ? 'text' : 'password'}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="cursor-pointer p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <AppIcon name={visible ? 'eye-off' : 'eye'} size={16} />
          </button>
        }
      />
      {showStrength && current.length > 0 && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: idx < score ? toneVar : 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                }}
                className="h-1.5 flex-1 transition-colors"
              />
            ))}
            {strengthLabel && (
              <span style={{ color: toneVar }} className="ms-1 text-[11px] font-semibold">
                {strengthLabel}
              </span>
            )}
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            {rules.map((rule) => (
              <li
                key={rule.label}
                style={{ color: rule.pass ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                className="flex items-center gap-1"
              >
                <AppIcon name={rule.pass ? 'check' : 'minus'} size={12} />
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  maxCount?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, maxCount, value, className, style, ...rest },
  ref,
) {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-1">
      <textarea
        ref={ref}
        value={value}
        aria-invalid={invalid || undefined}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
        className={clsx(
          'min-h-24 w-full border px-3 py-2 text-sm transition-colors placeholder:text-[var(--color-text-muted)]',
          'disabled:cursor-not-allowed disabled:opacity-55',
          className,
        )}
        {...rest}
      />
      {maxCount !== undefined && (
        <div
          style={{ color: 'var(--color-text-muted)' }}
          className="tabular-nums text-end text-[11px]"
        >
          {currentLength} / {maxCount}
        </div>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  InputGroup (shadcn v4 composable prefix & suffix)                        */
/* -------------------------------------------------------------------------- */

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
}

export function InputGroup({ invalid = false, className, style, children, ...rest }: InputGroupProps) {
  return (
    <div
      role="group"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      className={clsx(
        'flex w-full items-stretch overflow-hidden border transition-colors',
        'focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-soft)]',
        '[&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:focus:ring-0 [&_input]:focus:outline-none',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLSpanElement> {
  align?: 'start' | 'end';
}

export function InputGroupAddon({ align = 'start', className, style, children, ...rest }: InputGroupAddonProps) {
  return (
    <span
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-muted)',
        ...style,
      }}
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 px-3 text-xs font-medium select-none',
        align === 'start' ? 'border-e' : 'border-s',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function InputGroupButton({
  className,
  type = 'button',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-s px-3 text-xs font-semibold transition-colors',
        'hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-55',
        className,
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  CopyInput (One-click clipboard copy with check feedback & toast)          */
/* -------------------------------------------------------------------------- */

export interface CopyInputProps extends Omit<InputProps, 'endAdornment'> {
  value: string;
  copyLabel?: string;
  toastMessage?: string;
}

export function CopyInput({
  value,
  copyLabel = 'Copy to clipboard',
  toastMessage = 'Copied to clipboard',
  readOnly = true,
  className,
  ...rest
}: CopyInputProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Clipboard access unavailable');
    }
  };

  return (
    <InputGroup>
      <Input
        value={value}
        readOnly={readOnly}
        className={clsx('font-mono text-xs', className)}
        {...rest}
      />
      <InputGroupButton onClick={handleCopy} aria-label={copyLabel}>
        <AppIcon name={copied ? 'check' : 'copy'} size={14} />
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </InputGroupButton>
    </InputGroup>
  );
}

/* -------------------------------------------------------------------------- */
/*  FloatingInput & FloatingTextarea (CSS :placeholder-shown floating label)  */
/* -------------------------------------------------------------------------- */

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  id: string;
  label: string;
  invalid?: boolean;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { id, label, invalid = false, className, style, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        placeholder=" "
        aria-invalid={invalid || undefined}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
        className={clsx(
          'peer block h-12 w-full border px-3 pt-4 pb-1 text-sm transition-colors',
          'focus:border-[var(--color-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-55',
          className,
        )}
        {...rest}
      />
      <label
        htmlFor={id}
        style={{ color: invalid ? 'var(--color-error)' : 'var(--color-text-muted)' }}
        className={clsx(
          'pointer-events-none absolute start-3 top-3.5 origin-[0] -translate-y-2.5 scale-75 text-xs font-medium transition-all',
          'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm',
          'peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-[var(--color-primary)]',
        )}
      >
        {label}
      </label>
    </div>
  );
});

export interface FloatingTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  id: string;
  label: string;
  invalid?: boolean;
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(function FloatingTextarea(
  { id, label, invalid = false, className, style, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <textarea
        ref={ref}
        id={id}
        placeholder=" "
        aria-invalid={invalid || undefined}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          ...style,
        }}
        className={clsx(
          'peer block min-h-24 w-full border px-3 pt-5 pb-2 text-sm transition-colors',
          'focus:border-[var(--color-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-55',
          className,
        )}
        {...rest}
      />
      <label
        htmlFor={id}
        style={{ color: invalid ? 'var(--color-error)' : 'var(--color-text-muted)' }}
        className={clsx(
          'pointer-events-none absolute start-3 top-3.5 origin-[0] -translate-y-2.5 scale-75 text-xs font-medium transition-all',
          'peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm',
          'peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-xs peer-focus:text-[var(--color-primary)]',
        )}
      >
        {label}
      </label>
    </div>
  );
});
