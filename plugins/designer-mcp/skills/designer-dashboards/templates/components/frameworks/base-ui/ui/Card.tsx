'use client';

import * as React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevated = false, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx('bui-card', elevated && 'bui-card--elevated', className)}
      {...props}
    >
      {children}
    </div>
  );
});

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({ title, description, action, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={clsx('bui-card__header', className)} {...props}>
      <div>
        {title && <h3 className="bui-card__title">{title}</h3>}
        {description && <p className="bui-card__description">{description}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('bui-card__content', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('bui-card__footer', className)} {...props}>
      {children}
    </div>
  );
}
