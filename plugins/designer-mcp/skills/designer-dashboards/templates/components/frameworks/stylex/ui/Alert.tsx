import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';
import { Button } from './Button';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertVariant = 'tonal' | 'solid' | 'outline' | 'borderless';

export interface AlertProps {
  tone?: AlertTone;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBlock: '12px',
    paddingInline: '16px',
    borderRadius: tokens.radiusMd,
    borderWidth: '1px',
    borderStyle: 'solid',
    fontFamily: tokens.fontSans,
    fontSize: tokens.textSm,
    lineHeight: 1.5,
  },
  iconWrap: {
    flexShrink: 0,
    marginTop: '2px',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    marginBottom: '2px',
    fontWeight: 600,
    fontSize: tokens.textSm,
  },
});

const TONE_ICONS: Record<AlertTone, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  tone = 'info',
  variant = 'tonal',
  title,
  dismissible = false,
  onDismiss,
  className,
  style,
  children,
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  const Icon = TONE_ICONS[tone];

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? {
          backgroundColor: `var(--color-${tone})`,
          borderColor: `var(--color-${tone})`,
          color: 'var(--color-on-solid)',
        }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            borderColor: `var(--color-${tone}-border)`,
            color: `var(--color-${tone})`,
          }
        : variant === 'borderless'
          ? {
              backgroundColor: `var(--color-${tone}-surface)`,
              borderColor: 'transparent',
              color: `var(--color-${tone})`,
            }
          : {
              backgroundColor: `var(--color-${tone}-surface)`,
              borderColor: `var(--color-${tone}-border)`,
              color: `var(--color-${tone})`,
            };

  const sx = stylex.props(styles.root);

  return (
    <div
      role="alert"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={{ ...sx.style, ...variantStyle, ...style }}
    >
      <span {...stylex.props(styles.iconWrap)}>
        <Icon size={18} aria-hidden />
      </span>
      <div {...stylex.props(styles.body)}>
        {title ? <p {...stylex.props(styles.title)}>{title}</p> : null}
        <div>{children}</div>
      </div>
      {dismissible ? (
        <Button
          variant="ghost"
          tone={tone}
          size="xs"
          iconOnly
          aria-label="Dismiss alert"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          <X size={14} aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
