import * as React from 'react';
import { Group, Modal, Text, type ModalProps } from '@mantine/core';

export interface DialogProps extends Omit<ModalProps, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  title,
  description,
  footer,
  children,
  radius = 'md',
  centered = true,
  closeButtonProps,
  styles,
  ...props
}: DialogProps) {
  return (
    <Modal
      radius={radius}
      centered={centered}
      title={
        <div>
          <Text fw={600} size="lg" style={{ color: 'var(--color-text)' }}>
            {title}
          </Text>
          {description ? (
            <Text size="sm" mt={2} style={{ color: 'var(--color-text-muted)' }}>
              {description}
            </Text>
          ) : null}
        </div>
      }
      closeButtonProps={{
        'aria-label': 'Close dialog',
        ...closeButtonProps,
      }}
      styles={{
        content: {
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        },
        header: {
          backgroundColor: 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border)',
        },
        ...styles,
      }}
      {...props}
    >
      <div style={{ paddingTop: 'var(--mantine-spacing-sm)' }}>{children}</div>
      {footer ? (
        <Group
          justify="flex-end"
          gap="sm"
          mt="lg"
          pt="md"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {footer}
        </Group>
      ) : null}
    </Modal>
  );
}
