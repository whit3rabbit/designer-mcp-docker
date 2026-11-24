import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className, ...rest },
  ref,
) {
  const classes = ['op-card', interactive ? 'op-card--interactive' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return <div ref={ref} className={classes} {...rest} />;
});

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['op-card__header', className ?? ''].filter(Boolean).join(' ')} {...rest} />;
}

export function CardTitle({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={['op-card__title', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={['op-card__description', className ?? ''].filter(Boolean).join(' ')} {...rest} />;
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['op-card__content', className ?? ''].filter(Boolean).join(' ')} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['op-card__footer', className ?? ''].filter(Boolean).join(' ')} {...rest} />;
}
