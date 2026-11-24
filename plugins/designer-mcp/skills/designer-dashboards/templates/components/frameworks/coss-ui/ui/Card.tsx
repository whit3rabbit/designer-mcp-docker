import * as React from 'react';
import { cn, DENSITY_PADDING, type Density } from '../theme/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text)]',
        elevated
          ? 'bg-[var(--color-surface-elevated)] shadow-sm'
          : 'bg-[var(--color-surface)]',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density = 'comfortable', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-start justify-between gap-4 border-b border-[var(--color-border)]',
        DENSITY_PADDING[density],
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-sm font-semibold tracking-tight text-[var(--color-text)]',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-[var(--color-text-muted)] mt-0.5', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('shrink-0 flex items-center gap-2', className)} {...props} />
));
CardAction.displayName = 'CardAction';

export const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density = 'comfortable', ...props }, ref) => (
    <div ref={ref} className={cn(DENSITY_PADDING[density], className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, density = 'comfortable', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-3 border-t border-[var(--color-border)]',
        DENSITY_PADDING[density],
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';
