import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, type = 'button', ...props }, ref) => {
    const isDisabled = Boolean(disabled || loading);
    const classes = ['rd-ark-btn', 'rd-ark-focus', `rd-ark-btn--${variant}`, `rd-ark-btn--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        data-disabled={isDisabled ? '' : undefined}
        aria-busy={loading || undefined}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
