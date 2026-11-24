import * as React from 'react';
import { cardHeader, cardRecipe, cardSubtitle, cardTitle, type CardVariants } from './ui.css';

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  CardVariants & {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
  };

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', title, subtitle, actions, className, children, ...rest },
  ref,
) {
  const recipeClass = cardRecipe({ variant, padding });
  const classes = className ? `${recipeClass} ${className}` : recipeClass;

  return (
    <div ref={ref} className={classes} {...rest}>
      {(title || subtitle || actions) && (
        <div className={cardHeader}>
          <div>
            {title && <h3 className={cardTitle}>{title}</h3>}
            {subtitle && <p className={cardSubtitle}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
});
