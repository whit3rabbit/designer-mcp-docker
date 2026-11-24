import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../theme/tokens.stylex';

const styles = stylex.create({
  card: {
    backgroundColor: tokens.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.border,
    borderRadius: tokens.radiusLg,
    boxShadow: tokens.shadowSm,
    color: tokens.text,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingBlock: '20px',
    paddingInline: '24px',
  },
  title: {
    margin: 0,
    fontSize: tokens.textBase,
    fontWeight: tokens.headingWeight,
    lineHeight: 1.25,
    color: tokens.text,
  },
  description: {
    margin: 0,
    fontSize: tokens.textXs,
    lineHeight: 1.5,
    color: tokens.textMuted,
  },
  content: {
    paddingBlockEnd: '20px',
    paddingInline: '24px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.border,
    paddingBlock: '14px',
    paddingInline: '24px',
  },
});

function mergeSx(
  sx: ReturnType<typeof stylex.props>,
  className?: string,
  style?: React.CSSProperties,
) {
  return {
    className: [sx.className, className].filter(Boolean).join(' '),
    style: { ...sx.style, ...style },
  };
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, style, ...rest }, ref) {
    const merged = mergeSx(stylex.props(styles.card), className, style);
    return <div ref={ref} {...rest} {...merged} />;
  },
);

export function CardHeader({ className, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const merged = mergeSx(stylex.props(styles.header), className, style);
  return <div {...rest} {...merged} />;
}

export function CardTitle({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const merged = mergeSx(stylex.props(styles.title), className, style);
  return (
    <h3 {...rest} {...merged}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  style,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const merged = mergeSx(stylex.props(styles.description), className, style);
  return <p {...rest} {...merged} />;
}

export function CardContent({ className, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const merged = mergeSx(stylex.props(styles.content), className, style);
  return <div {...rest} {...merged} />;
}

export function CardFooter({ className, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const merged = mergeSx(stylex.props(styles.footer), className, style);
  return <div {...rest} {...merged} />;
}
