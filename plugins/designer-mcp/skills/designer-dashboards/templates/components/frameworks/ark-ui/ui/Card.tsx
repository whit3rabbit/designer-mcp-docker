import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', children, ...props }: CardProps) {
  const classes = ['rd-ark-card', elevated ? 'rd-ark-card--elevated' : '', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={['rd-ark-card__header', className].filter(Boolean).join(' ')} {...props}>
      <div>
        <h3 className="rd-ark-card__title">{title}</h3>
        {subtitle ? <p className="rd-ark-card__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['rd-ark-card__body', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['rd-ark-card__footer', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
}
