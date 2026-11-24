import * as React from 'react';
import { Card as ChakraCard, Box, Flex } from '@chakra-ui/react';

export interface CardProps extends Omit<ChakraCard.RootProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  elevated?: boolean;
}

export function Card({
  title,
  subtitle,
  headerAction,
  footer,
  elevated = false,
  children,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <ChakraCard.Root
      bg={elevated ? 'var(--color-surface-elevated)' : 'var(--color-surface)'}
      color="var(--color-text)"
      borderWidth="1px"
      borderColor="var(--color-border)"
      borderRadius="var(--radius-md)"
      boxShadow={elevated ? 'md' : 'xs'}
      {...rest}
    >
      {hasHeader && (
        <ChakraCard.Header
          pb={3}
          borderBottomWidth="1px"
          borderColor="var(--color-border)"
        >
          <Flex align="flex-start" justify="space-between" gap={4}>
            <Box textAlign="start">
              {title && (
                <ChakraCard.Title fontSize="md" fontWeight="semibold" color="var(--color-text)">
                  {title}
                </ChakraCard.Title>
              )}
              {subtitle && (
                <ChakraCard.Description fontSize="sm" color="var(--color-text-muted)" mt={0.5}>
                  {subtitle}
                </ChakraCard.Description>
              )}
            </Box>
            {headerAction && <Box flexShrink={0}>{headerAction}</Box>}
          </Flex>
        </ChakraCard.Header>
      )}

      <ChakraCard.Body>{children}</ChakraCard.Body>

      {footer && (
        <ChakraCard.Footer
          pt={3}
          borderTopWidth="1px"
          borderColor="var(--color-border)"
          justifyContent="flex-end"
          gap={2}
        >
          {footer}
        </ChakraCard.Footer>
      )}
    </ChakraCard.Root>
  );
}
