'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap font-medium',
    'rounded-[var(--radius-md)] transition-colors select-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        solid:
          'bg-[var(--color-primary)] text-[var(--color-on-solid)] hover:bg-[var(--color-primary-hover)] shadow-xs',
        outline:
          'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]',
        tonal:
          'border border-[var(--color-primary-border)] bg-[var(--color-primary-surface)] text-[var(--color-primary)] hover:opacity-90',
        ghost:
          'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]',
        destructive:
          'bg-[var(--color-error)] text-[var(--color-on-solid)] hover:opacity-90 shadow-xs',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-9 px-4 text-sm gap-2',
        lg: 'h-11 px-5 text-sm gap-2',
        icon: 'size-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={twMerge(clsx(buttonVariants({ variant, size, fullWidth }), className))}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </BaseButton>
    );
  },
);

Button.displayName = 'Button';
export { buttonVariants };
