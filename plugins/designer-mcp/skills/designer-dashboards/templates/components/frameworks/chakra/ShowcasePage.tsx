import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Box, Container, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Activity, DollarSign, Moon, Plus, Server, Sun, Users } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  ChartCard,
  DataTable,
  Dialog,
  IconButton,
  Input,
  KpiCard,
  Select,
  Tabs,
  type BadgeTone,
} from './ui';

interface OrderRow {
  id: string;
  customer: string;
  plan: string;
  amount: string;
  status: 'Active' | 'Pending' | 'Failed';
  region: string;
}

const SAMPLE_ORDERS: OrderRow[] = [
  { id: 'ORD-9041', customer: 'Acme Cloud Corp', plan: 'Enterprise', amount: '$4,200', status: 'Active', region: 'us-east-1' },
  { id: 'ORD-9042', customer: 'Nordic Telemetry', plan: 'Growth', amount: '$890', status: 'Active', region: 'eu-north-1' },
  { id: 'ORD-9043', customer: 'Kestrel Robotics', plan: 'Enterprise', amount: '$4,200', status: 'Pending', region: 'us-west-2' },
  { id: 'ORD-9044', customer: 'Vega Logistics', plan: 'Starter', amount: '$190', status: 'Failed', region: 'eu-central-1' },
  { id: 'ORD-9045', customer: 'Solstice AI', plan: 'Growth', amount: '$890', status: 'Active', region: 'ap-southeast-1' },
  { id: 'ORD-9046', customer: 'Meridian FinTech', plan: 'Enterprise', amount: '$4,200', status: 'Active', region: 'us-east-1' },
];

const STATUS_TONE: Record<OrderRow['status'], BadgeTone> = {
  Active: 'success',
  Pending: 'warning',
  Failed: 'error',
};

const ORDER_COLUMNS: ColumnDef<OrderRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: (info) => (
      <Text as="span" fontFamily="var(--font-mono)" fontSize="xs" fontWeight="semibold">
        {String(info.getValue())}
      </Text>
    ),
  },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'amount', header: 'MRR' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const value = info.getValue() as OrderRow['status'];
      return <Badge tone={STATUS_TONE[value]}>{value}</Badge>;
    },
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: (info) => (
      <Text as="span" fontFamily="var(--font-mono)" fontSize="xs" color="var(--color-text-muted)">
        {String(info.getValue())}
      </Text>
    ),
  },
];

export function ShowcasePage() {
  const [environment, setEnvironment] = React.useState('production');
  const [showAlert, setShowAlert] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [reportName, setReportName] = React.useState('');
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    root.setAttribute('data-theme', next ? 'dark' : 'light');
    root.classList.toggle('dark', next);
    try {
      localStorage.setItem('rd-theme', next ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <Box minH="100vh" bg="var(--color-canvas)" color="var(--color-text)" py={6}>
      <Container maxW="1280px" px={{ base: 4, md: 6 }}>
        <Stack gap={6}>
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Box textAlign="start">
              <Flex align="center" gap={2} mb={1}>
                <Heading size="xl" fontWeight="bold" color="var(--color-text)">
                  Operations &amp; Revenue Console
                </Heading>
                <Badge tone="primary">Chakra v3</Badge>
              </Flex>
              <Text fontSize="sm" color="var(--color-text-muted)">
                Ark UI foundation bridged to OpenDesign OKLCH tokens (no Tailwind).
              </Text>
            </Box>

            <Flex align="center" gap={3} flexWrap="wrap">
              <Box w="170px">
                <Select
                  aria-label="Environment"
                  size="sm"
                  value={environment}
                  onValueChange={setEnvironment}
                  options={[
                    { label: 'Production', value: 'production' },
                    { label: 'Staging', value: 'staging' },
                    { label: 'Sandbox', value: 'sandbox' },
                  ]}
                />
              </Box>
              <IconButton
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                variant="outline"
                size="sm"
                icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
                onClick={toggleTheme}
              />
              <Button
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => setDialogOpen(true)}
              >
                New Report
              </Button>
            </Flex>
          </Flex>

          {showAlert && (
            <Alert
              status="info"
              title="OpenDesign Theme Bridge Active"
              description={`Viewing ${environment} telemetry. All Chakra semantic tokens resolve to var(--color-*) custom properties.`}
              onDismiss={() => setShowAlert(false)}
            />
          )}

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
            <KpiCard
              label="Monthly Recurring Revenue"
              value="$148,920"
              delta="+14.2%"
              trend="up"
              caption="vs. prior 30 days"
              icon={<DollarSign size={18} />}
            />
            <KpiCard
              label="Active Workspaces"
              value="2,841"
              delta="+6.8%"
              trend="up"
              caption="112 added this week"
              icon={<Users size={18} />}
            />
            <KpiCard
              label="P95 API Latency"
              value="42 ms"
              delta="-8.1%"
              trend="up"
              caption="within 50ms SLO"
              icon={<Activity size={18} />}
            />
            <KpiCard
              label="Cluster Utilization"
              value="68.4%"
              delta="0.0%"
              trend="flat"
              caption="18 healthy nodes"
              icon={<Server size={18} />}
            />
          </SimpleGrid>

          <Tabs
            defaultValue="overview"
            items={[
              {
                value: 'overview',
                label: 'Overview',
                content: (
                  <SimpleGrid columns={{ base: 1, lg: 3 }} gap={4}>
                    <Box gridColumn={{ lg: 'span 2' }}>
                      <ChartCard
                        title="Revenue & Throughput"
                        subtitle="7-day rolling telemetry"
                        type="area"
                        series={[
                          { name: 'Revenue ($k)', data: [31, 40, 38, 51, 49, 62, 69] },
                          { name: 'Requests (k)', data: [18, 29, 25, 36, 34, 48, 53] },
                        ]}
                        options={{
                          xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                        }}
                      />
                    </Box>
                    <ChartCard
                      title="Plan Mix"
                      subtitle="Active subscriptions"
                      type="donut"
                      series={[48, 34, 18]}
                      options={{
                        labels: ['Enterprise', 'Growth', 'Starter'],
                      }}
                    />
                  </SimpleGrid>
                ),
              },
              {
                value: 'transactions',
                label: 'Transactions',
                content: (
                  <Card title="Recent Subscriptions" subtitle="Sortable & searchable via TanStack Table">
                    <DataTable data={SAMPLE_ORDERS} columns={ORDER_COLUMNS} pageSize={5} />
                  </Card>
                ),
              },
              {
                value: 'settings',
                label: 'Workspace Settings',
                content: (
                  <Card
                    title="Alert Thresholds"
                    subtitle="Configure notification routing for anomalies"
                    footer={
                      <>
                        <Button variant="outline" size="sm">Reset</Button>
                        <Button size="sm">Save Changes</Button>
                      </>
                    }
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Input
                        label="Alert Webhook URL"
                        placeholder="https://hooks.example.com/telemetry"
                        helperText="Receives signed JSON payloads on SLO breach."
                      />
                      <Select
                        label="Digest Cadence"
                        defaultValue="daily"
                        options={[
                          { label: 'Hourly', value: 'hourly' },
                          { label: 'Daily', value: 'daily' },
                          { label: 'Weekly', value: 'weekly' },
                        ]}
                      />
                    </SimpleGrid>
                  </Card>
                ),
              },
            ]}
          />
        </Stack>
      </Container>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create Telemetry Report"
        description="Schedule a recurring export using Chakra UI v3 + Ark UI Dialog."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setReportName('');
              }}
            >
              Create Report
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          <Input
            label="Report Name"
            required
            placeholder="Q4 Infrastructure SLA"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
          <Select
            label="Export Format"
            defaultValue="csv"
            options={[
              { label: 'CSV (.csv)', value: 'csv' },
              { label: 'JSON (.json)', value: 'json' },
              { label: 'PDF Summary (.pdf)', value: 'pdf' },
            ]}
          />
        </Stack>
      </Dialog>
    </Box>
  );
}
