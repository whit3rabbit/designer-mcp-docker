import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { X } from 'lucide-react';
import { tokens } from '../theme/tokens.stylex';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const styles = stylex.create({
  dialog: {
    margin: 'auto',
    padding: 0,
    width: 'min(520px, calc(100vw - 32px))',
    maxHeight: '85dvh',
    backgroundColor: tokens.surfaceElevated,
    color: tokens.text,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.border,
    borderRadius: tokens.radiusLg,
    boxShadow: tokens.shadowLg,
    overflow: 'hidden',
    '::backdrop': {
      backgroundColor: tokens.scrim,
      backdropFilter: 'blur(4px)',
    },
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85dvh',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    paddingBlock: '18px',
    paddingInline: '24px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: tokens.textLg,
    fontWeight: tokens.headingWeight,
    color: tokens.text,
  },
  description: {
    margin: 0,
    fontSize: tokens.textXs,
    color: tokens.textMuted,
  },
  body: {
    paddingBlock: '20px',
    paddingInline: '24px',
    overflowY: 'auto',
    fontSize: tokens.textSm,
    lineHeight: 1.55,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingBlock: '14px',
    paddingInline: '24px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.border,
    backgroundColor: tokens.surfaceSubtle,
  },
});

export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      {...stylex.props(styles.dialog)}
    >
      <div {...stylex.props(styles.inner)}>
        <div {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.titleGroup)}>
            <h2 id={titleId} {...stylex.props(styles.title)}>
              {title}
            </h2>
            {description ? (
              <p id={descId} {...stylex.props(styles.description)}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            tone="neutral"
            size="xs"
            iconOnly
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
        <div {...stylex.props(styles.body)}>{children}</div>
        {footer ? <div {...stylex.props(styles.footer)}>{footer}</div> : null}
      </div>
    </dialog>
  );
}
