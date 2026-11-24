'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn, FOCUS_RING } from '../theme/cn';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
    'rounded-[var(--radius-md)] transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer',
    FOCUS_RING,
  ].join(' '),
  {
    variants: {
      variant: {
        solid:
          'bg-[var(--color-primary)] text-[var(--color-on-solid)] hover:bg-[var(--color-primary-hover)] shadow-xs',
        outline:
          'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]',
        ghost:
          'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]',
        destructive:
          'bg-[var(--color-error)] text-[var(--color-on-solid)] hover:opacity-90 shadow-xs',
        link: 'bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-9 px-3.5 text-sm gap-2',
        lg: 'h-10 px-4 text-sm gap-2',
      },
      iconOnly: {
        true: 'px-0',
        false: '',
      },
    },
    compoundVariants: [
      { iconOnly: true, size: 'xs', className: 'size-7' },
      { iconOnly: true, size: 'sm', className: 'size-8' },
      { iconOnly: true, size: 'md', className: 'size-9' },
      { iconOnly: true, size: 'lg', className: 'size-10' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconOnly = false,
      loading = false,
      fullWidth = false,
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
        className={cn(
          buttonVariants({ variant, size, iconOnly }),
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
            {!iconOnly && children}
          </>
        ) : (
          children
        )}
      </BaseButton>
    );
  },
);
Button.displayName = 'Button';
