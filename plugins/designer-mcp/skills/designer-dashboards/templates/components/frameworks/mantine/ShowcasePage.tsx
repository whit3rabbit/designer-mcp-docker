import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Activity,
  DollarSign,
  Languages,
  Moon,
  Plus,
  Server,
  Sun,
  Users,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartCard,
  DataTable,
  Dialog,
  IconButton,
  Input,
  KpiCard,
  Select,
  Tabs,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  status: 'Healthy' | 'Degraded' | 'Deploying';
  latencyMs: number;
  owner: string;
}

const SAMPLE_DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-101', service: 'auth-gateway', region: 'us-east-1', status: 'Healthy', latencyMs: 24, owner: 'Platform' },
  { id: 'dep-102', service: 'billing-worker', region: 'eu-west-1', status: 'Healthy', latencyMs: 38, owner: 'Revenue' },
  { id: 'dep-103', service: 'telemetry-ingest', region: 'us-west-2', status: 'Degraded', latencyMs: 112, owner: 'Observability' },
  { id: 'dep-104', service: 'search-indexer', region: 'ap-south-1', status: 'Deploying', latencyMs: 65, owner: 'Search' },
  { id: 'dep-105', service: 'edge-router', region: 'eu-central-1', status: 'Healthy', latencyMs: 19, owner: 'Infra' },
  { id: 'dep-106', service: 'notifications-api', region: 'us-east-1', status: 'Healthy', latencyMs: 31, owner: 'Comms' },
];

const STATUS_TONE = {
  Healthy: 'success',
  Degraded: 'warning',
  Deploying: 'info',
} as const;

export function ShowcasePage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  const [range, setRange] = React.useState('7d');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [serviceName, setServiceName] = React.useState('');
  const [region, setRegion] = React.useState<string | null>('us-east-1');

  const columns = React.useMemo<ColumnDef<DeploymentRow, unknown>[]>(
    () => [
      { accessorKey: 'service', header: 'Service' },
      { accessorKey: 'region', header: 'Region' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue() as DeploymentRow['status'];
          return <Badge tone={STATUS_TONE[val]}>{val}</Badge>;
        },
      },
      {
        accessorKey: 'latencyMs',
        header: 'p95 Latency',
        cell: (info) => `${info.getValue()} ms`,
      },
      { accessorKey: 'owner', header: 'Team' },
    ],
    [],
  );

  const toggleTheme = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const toggleDir = () => {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    document.documentElement.setAttribute('dir', next);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    notifications.show({
      title: 'Deployment queued',
      message: `${serviceName || 'new-service'} scheduled in ${region ?? 'us-east-1'}.`,
    });
    setServiceName('');
    setDialogOpen(false);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Group gap="xs">
              <Title order={2} style={{ color: 'var(--color-text)' }}>
                Mantine + OpenDesign Showcase
              </Title>
              <Badge tone="primary">CSS Modules</Badge>
            </Group>
            <Text size="sm" style={{ color: 'var(--color-text-muted)' }}>
              Zero-Tailwind dashboard primitives bridged to OpenDesign OKLCH variables.
            </Text>
          </div>

          <Group gap="xs">
            <IconButton
              aria-label={`Switch text direction to ${dir === 'ltr' ? 'RTL' : 'LTR'}`}
              onClick={toggleDir}
            >
              <Languages size={18} />
            </IconButton>
            <IconButton
              aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <Button
              leftSection={<Plus size={16} />}
              onClick={() => setDialogOpen(true)}
            >
              New Deployment
            </Button>
          </Group>
        </Group>

        <Alert tone="info" title="OpenDesign Token Bridge Active" withCloseButton>
          Mantine CSS variables automatically adapt to light/dark themes and all 21 OpenDesign presets.
        </Alert>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <KpiCard
            label="Monthly Recurring Revenue"
            value="$142,840"
            delta="+14.2%"
            trend="up"
            subtitle="vs. previous 30 days"
            icon={<DollarSign size={16} />}
          />
          <KpiCard
            label="Active Organizations"
            value="3,419"
            delta="+8.1%"
            trend="up"
            subtitle="218 onboarded this week"
            icon={<Users size={16} />}
          />
          <KpiCard
            label="Global p95 Latency"
            value="42 ms"
            delta="-6.4%"
            trend="up"
            subtitle="Across 6 edge regions"
            icon={<Activity size={16} />}
          />
          <KpiCard
            label="Cluster Saturation"
            value="68.4%"
            delta="+2.1%"
            trend="neutral"
            subtitle="Autoscaling nominal"
            icon={<Server size={16} />}
          />
        </SimpleGrid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <ChartCard
              title="Request Throughput"
              description="Requests per second across primary edge regions"
              type="area"
              ranges={[
                { label: '24h', value: '24h' },
                { label: '7d', value: '7d' },
                { label: '30d', value: '30d' },
              ]}
              rangeValue={range}
              onRangeChange={setRange}
              series={[
                { name: 'US East', data: [31, 40, 28, 51, 42, 64, 58] },
                { name: 'EU West', data: [18, 24, 22, 34, 30, 41, 39] },
              ]}
              options={{
                xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card padding="lg" h="100%">
              <CardHeader>
                <CardTitle>Quick Controls</CardTitle>
                <CardDescription>Form &amp; tab primitives</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="filters"
                  items={[
                    {
                      value: 'filters',
                      label: 'Filters',
                      content: (
                        <Stack gap="sm">
                          <Input label="Workspace Filter" placeholder="e.g. acme-prod" />
                          <Select
                            label="Target Region"
                            value={region}
                            onChange={setRegion}
                            data={[
                              { value: 'us-east-1', label: 'US East (N. Virginia)' },
                              { value: 'eu-west-1', label: 'EU West (Ireland)' },
                              { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
                            ]}
                          />
                          <Button
                            variant="secondary"
                            onClick={() =>
                              notifications.show({
                                title: 'Filters applied',
                                message: `Scoped view to ${region ?? 'all regions'}.`,
                              })
                            }
                          >
                            Apply Scope
                          </Button>
                        </Stack>
                      ),
                    },
                    {
                      value: 'alerts',
                      label: 'Alerts',
                      content: (
                        <Stack gap="sm">
                          <Alert tone="warning" title="Elevated latency">
                            telemetry-ingest in us-west-2 is above 100ms p95.
                          </Alert>
                          <Alert tone="success" title="SSL certificates">
                            All edge certificates renewed automatically.
                          </Alert>
                        </Stack>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </Grid.Col>
        </Grid>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Active Service Deployments</CardTitle>
            <CardDescription>
              Powered by TanStack React Table + Mantine Table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={SAMPLE_DEPLOYMENTS}
              columns={columns}
              searchPlaceholder="Filter services or regions..."
              ariaLabel="Active service deployments"
            />
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Schedule New Deployment"
        description="Deploy a service container using OpenDesign-styled Mantine inputs."
      >
        <form onSubmit={handleCreateService}>
          <Stack gap="md">
            <Input
              label="Service Name"
              placeholder="analytics-worker"
              value={serviceName}
              onChange={(e) => setServiceName(e.currentTarget.value)}
              required
            />
            <Select
              label="Region"
              value={region}
              onChange={setRegion}
              data={[
                { value: 'us-east-1', label: 'us-east-1' },
                { value: 'eu-west-1', label: 'eu-west-1' },
                { value: 'us-west-2', label: 'us-west-2' },
              ]}
            />
            <Group justify="flex-end" gap="sm" mt="sm">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Queue Deployment</Button>
            </Group>
          </Stack>
        </form>
      </Dialog>
    </Container>
  );
}
