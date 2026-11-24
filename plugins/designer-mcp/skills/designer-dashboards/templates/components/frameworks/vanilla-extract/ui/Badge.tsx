import * as React from 'react';
import { badgeRecipe, type BadgeVariants } from './ui.css';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & BadgeVariants;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'tonal', tone = 'primary', size = 'sm', className, children, ...rest },
  ref,
) {
  const recipeClass = badgeRecipe({ variant, tone, size });
  const classes = className ? `${recipeClass} ${className}` : recipeClass;

  return (
    <span ref={ref} className={classes} {...rest}>
      {children}
    </span>
  );
});
