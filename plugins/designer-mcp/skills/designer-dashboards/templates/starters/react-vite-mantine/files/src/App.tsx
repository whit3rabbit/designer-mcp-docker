import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import {
  ActionIcon,
  AppShell,
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Languages, Moon, Sparkles, Sun } from 'lucide-react';

function DashboardHome() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');

  const toggleTheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('rd-theme', next);
    } catch {
      // ignore storage errors
    }
  };

  const toggleDirection = () => {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    document.documentElement.setAttribute('dir', next);
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Title order={4} style={{ color: 'var(--color-text)' }}>
              Designer Dashboards Mantine
            </Title>
            <Badge
              variant="light"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)',
              }}
            >
              OpenDesign Tokens
            </Badge>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={toggleDirection}
              aria-label={`Switch text direction to ${dir === 'ltr' ? 'RTL' : 'LTR'}`}
            >
              <Languages size={18} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={toggleTheme}
              aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--color-canvas)' }}>
        <Container size="lg" py="md">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={2} style={{ color: 'var(--color-text)' }}>
                  Analytics Overview
                </Title>
                <Text size="sm" style={{ color: 'var(--color-text-muted)' }}>
                  Powered by Mantine CSS Modules + OpenDesign OKLCH tokens.
                </Text>
              </div>
              <Button
                leftSection={<Sparkles size={16} />}
                onClick={() =>
                  notifications.show({
                    title: 'Mantine Notifications Active',
                    message: 'OpenDesign theme tokens are bridged to Mantine.',
                  })
                }
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-solid)',
                }}
              >
                Trigger Notification
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {[
                { label: 'Monthly Revenue', value: '$142,840', delta: '+14.2%' },
                { label: 'Active Workspaces', value: '3,419', delta: '+8.1%' },
                { label: 'API Latency (p95)', value: '42 ms', delta: '-6.4%' },
                { label: 'Uptime SLA', value: '99.98%', delta: '+0.02%' },
              ].map((kpi) => (
                <Card
                  key={kpi.label}
                  withBorder
                  padding="lg"
                  radius="md"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <Text size="xs" tt="uppercase" fw={600} style={{ color: 'var(--color-text-muted)' }}>
                    {kpi.label}
                  </Text>
                  <Group justify="space-between" align="baseline" mt="xs">
                    <Text size="xl" fw={700} style={{ color: 'var(--color-text)' }}>
                      {kpi.value}
                    </Text>
                    <Badge
                      variant="light"
                      style={{
                        backgroundColor: 'var(--color-primary-surface)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {kpi.delta}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="/dashboard/analytics" element={<DashboardHome />} />
      <Route path="*" element={<Navigate to="/dashboard/analytics" replace />} />
    </Routes>
  );
}
