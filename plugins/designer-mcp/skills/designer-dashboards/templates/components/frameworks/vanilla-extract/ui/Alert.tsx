import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './Button';
import { alertBody, alertDescription, alertRecipe, alertTitle, type AlertVariants } from './ui.css';

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  AlertVariants & {
    title?: string;
    description?: React.ReactNode;
    onDismiss?: () => void;
  };

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export function Alert({
  tone = 'info',
  title,
  description,
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const Icon = ICONS[tone ?? 'info'];
  const recipeClass = alertRecipe({ tone });
  const classes = className ? `${recipeClass} ${className}` : recipeClass;

  return (
    <div role="alert" className={classes} {...rest}>
      <Icon size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div className={alertBody}>
        {title && <p className={alertTitle}>{title}</p>}
        {description && <p className={alertDescription}>{description}</p>}
        {children}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          iconOnly
          aria-label="Dismiss alert"
          onClick={onDismiss}
        >
          <X size={16} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
