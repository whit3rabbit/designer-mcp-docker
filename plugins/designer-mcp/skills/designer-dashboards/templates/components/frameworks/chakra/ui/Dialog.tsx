import * as React from 'react';
import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  return (
    <ChakraDialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      size={size}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <ChakraDialog.Backdrop bg="rgba(15, 23, 42, 0.55)" backdropFilter="blur(2px)" />
        <ChakraDialog.Positioner>
          <ChakraDialog.Content
            bg="var(--color-surface-elevated)"
            color="var(--color-text)"
            borderWidth="1px"
            borderColor="var(--color-border)"
            borderRadius="var(--radius-md)"
            boxShadow="xl"
          >
            <ChakraDialog.Header
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={3}
              borderBottomWidth="1px"
              borderColor="var(--color-border)"
            >
              <div>
                <ChakraDialog.Title fontSize="lg" fontWeight="semibold" color="var(--color-text)">
                  {title}
                </ChakraDialog.Title>
                {description && (
                  <ChakraDialog.Description fontSize="sm" color="var(--color-text-muted)" mt={1}>
                    {description}
                  </ChakraDialog.Description>
                )}
              </div>
              <ChakraDialog.CloseTrigger asChild>
                <IconButton
                  aria-label="Close dialog"
                  variant="ghost"
                  size="sm"
                  icon={<X size={16} />}
                />
              </ChakraDialog.CloseTrigger>
            </ChakraDialog.Header>

            <ChakraDialog.Body py={4}>{children}</ChakraDialog.Body>

            {footer && (
              <ChakraDialog.Footer
                borderTopWidth="1px"
                borderColor="var(--color-border)"
                justifyContent="flex-end"
                gap={2}
              >
                {footer}
              </ChakraDialog.Footer>
            )}
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}
