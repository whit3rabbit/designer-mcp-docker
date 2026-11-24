import * as React from 'react';
import { Alert as ChakraAlert } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export type AlertStatus = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<ChakraAlert.RootProps, 'title' | 'status'> {
  status?: AlertStatus;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onDismiss?: () => void;
}

const statusBorderColor: Record<AlertStatus, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

export function Alert({
  status = 'info',
  title,
  description,
  onDismiss,
  children,
  ...rest
}: AlertProps) {
  const accent = statusBorderColor[status];

  return (
    <ChakraAlert.Root
      status={status}
      bg="var(--color-surface-elevated)"
      color="var(--color-text)"
      borderWidth="1px"
      borderColor="var(--color-border)"
      borderInlineStartWidth="4px"
      borderInlineStartColor={accent}
      borderRadius="var(--radius-md)"
      p={3.5}
      alignItems="flex-start"
      {...rest}
    >
      <ChakraAlert.Indicator color={accent} mt={0.5} />
      <ChakraAlert.Content flex="1" textAlign="start">
        {title && (
          <ChakraAlert.Title fontWeight="semibold" fontSize="sm" color="var(--color-text)">
            {title}
          </ChakraAlert.Title>
        )}
        {(description || children) && (
          <ChakraAlert.Description fontSize="sm" color="var(--color-text-muted)" mt={title ? 0.5 : 0}>
            {description ?? children}
          </ChakraAlert.Description>
        )}
      </ChakraAlert.Content>
      {onDismiss && (
        <IconButton
          aria-label="Dismiss alert"
          variant="ghost"
          size="sm"
          icon={<X size={16} />}
          onClick={onDismiss}
        />
      )}
    </ChakraAlert.Root>
  );
}
