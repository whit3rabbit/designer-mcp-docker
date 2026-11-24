'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { css } from 'styled-system/css';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger render={trigger as React.ReactElement} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={css({
            position: 'fixed',
            inset: 0,
            bg: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 50,
          })}
        />
        <BaseDialog.Popup
          className={css({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(92vw, 480px)',
            bg: 'surfaceElevated',
            color: 'text',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 'lg',
            boxShadow: 'md',
            padding: '24px',
            zIndex: 51,
            outline: 'none',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '12px',
            })}
          >
            <div>
              <BaseDialog.Title
                className={css({
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'text',
                })}
              >
                {title}
              </BaseDialog.Title>
              {description && (
                <BaseDialog.Description
                  className={css({
                    fontSize: '13px',
                    color: 'textMuted',
                    marginTop: '4px',
                  })}
                >
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              aria-label="Close dialog"
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: 'md',
                color: 'textMuted',
                cursor: 'pointer',
                _hover: { bg: 'surfaceSubtle', color: 'text' },
                _focusVisible: {
                  outline: '2px solid token(colors.primary)',
                  outlineOffset: '2px',
                },
              })}
            >
              <X size={16} aria-hidden="true" />
            </BaseDialog.Close>
          </div>

          <div className={css({ fontSize: '14px', color: 'text' })}>{children}</div>

          {footer && (
            <div
              className={css({
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid',
                borderColor: 'border',
              })}
            >
              {footer}
            </div>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
