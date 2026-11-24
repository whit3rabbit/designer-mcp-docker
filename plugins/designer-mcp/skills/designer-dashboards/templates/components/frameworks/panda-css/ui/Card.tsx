'use client';

import * as React from 'react';
import { css, cva, cx, type RecipeVariantProps } from 'styled-system/css';

export const cardRecipe = cva({
  base: {
    bg: 'surface',
    color: 'text',
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 'lg',
    boxShadow: 'sm',
    transitionProperty: 'border-color, box-shadow, transform',
    transitionDuration: '150ms',
  },
  variants: {
    elevated: {
      true: {
        bg: 'surfaceElevated',
        boxShadow: 'md',
      },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        _hover: {
          borderColor: 'primaryBorder',
          boxShadow: 'md',
        },
      },
    },
  },
  defaultVariants: {
    elevated: false,
    interactive: false,
  },
});

export type CardVariants = RecipeVariantProps<typeof cardRecipe>;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariants {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevated, interactive, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(cardRecipe({ elevated, interactive }), className)}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        css({
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '24px',
        }),
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cx(
        css({
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '1.25',
          letterSpacing: '-0.01em',
          color: 'text',
        }),
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx(
        css({
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'textMuted',
        }),
        className,
      )}
      {...rest}
    />
  );
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        css({
          paddingInline: '24px',
          paddingBottom: '24px',
        }),
        className,
      )}
      {...rest}
    />
  );
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        css({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingInline: '24px',
          paddingBottom: '24px',
        }),
        className,
      )}
      {...rest}
    />
  );
}
