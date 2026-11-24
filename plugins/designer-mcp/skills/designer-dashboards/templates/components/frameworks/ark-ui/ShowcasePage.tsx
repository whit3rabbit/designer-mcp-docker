import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Activity, Cpu, Plus, Server, Users } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ChartCard,
  DataTable,
  Dialog,
  Input,
  KpiCard,
  Select,
  Tabs,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'offline';
}

const DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-1', service: 'auth-gateway', region: 'us-east-1', latencyMs: 18, status: 'healthy' },
  { id: 'dep-2', service: 'billing-worker', region: 'eu-west-1', latencyMs: 42, status: 'healthy' },
  { id: 'dep-3', service: 'telemetry-ingest', region: 'us-west-2', latencyMs: 129, status: 'degraded' },
  { id: 'dep-4', service: 'edge-router', region: 'ap-southeast-1', latencyMs: 24, status: 'healthy' },
  { id: 'dep-5', service: 'search-indexer', region: 'eu-central-1', latencyMs: 0, status: 'offline' },
];

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'latencyMs',
    header: 'P95 Latency',
    cell: ({ row }) => `${row.original.latencyMs} ms`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const tone = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'error';
      return <Badge tone={tone}>{status}</Badge>;
    },
  },
];

const REGION_OPTIONS = [
  { label: 'All Regions', value: 'all' },
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'EU West (Ireland)', value: 'eu-west-1' },
  { label: 'AP Southeast (Singapore)', value: 'ap-southeast-1' },
];

export function ShowcasePage() {
  const [region, setRegion] = React.useState('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [serviceName, setServiceName] = React.useState('');

  const filteredRows = React.useMemo(
    () => (region === 'all' ? DEPLOYMENTS : DEPLOYMENTS.filter((row) => row.region === region)),
    [region],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Ark UI Headless Console</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Zag.js state-machine primitives bridged to OpenDesign OKLCH tokens.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '13rem' }}>
            <Select
              aria-label="Filter by region"
              options={REGION_OPTIONS}
              value={region}
              onValueChange={setRegion}
            />
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Provision Service"
            description="Register a new edge microservice in the selected region."
            trigger={
              <Button variant="primary">
                <Plus size={16} aria-hidden />
                New Service
              </Button>
            }
            footer={
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setServiceName('');
                    setDialogOpen(false);
                  }}
                >
                  Create
                </Button>
              </>
            }
          >
            <Input
              label="Service Identifier"
              placeholder="e.g. analytics-aggregator"
              helperText="Lowercase alphanumeric characters and hyphens only."
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </Dialog>
        </div>
      </header>

      <Alert
        tone="info"
        title="State-Machine Driven Accessibility"
        description="All Select, Dialog, Tabs, and Field primitives expose Zag.js [data-state], [data-selected], and [data-focus] attributes."
      />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <KpiCard label="Active Sessions" value="48,290" delta="+12.4%" trend="up" hint="vs last 7d" icon={<Users size={18} aria-hidden />} />
        <KpiCard label="Requests / sec" value="3,840" delta="+4.1%" trend="up" hint="peak 5.2k" icon={<Activity size={18} aria-hidden />} />
        <KpiCard label="Cluster CPU" value="62.8%" delta="-2.3%" trend="down" hint="nominal" icon={<Cpu size={18} aria-hidden />} />
        <KpiCard label="Healthy Nodes" value="24 / 25" delta="96.0%" trend="neutral" hint="1 degraded" icon={<Server size={18} aria-hidden />} />
      </section>

      <Tabs
        defaultValue="overview"
        items={[
          {
            value: 'overview',
            label: 'Telemetry Overview',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                <ChartCard
                  title="Throughput"
                  subtitle="Requests per minute across edge regions"
                  type="area"
                  categories={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']}
                  series={[
                    { name: 'Primary', data: [310, 405, 520, 610, 580, 690] },
                    { name: 'Replica', data: [180, 220, 290, 340, 315, 390] },
                  ]}
                />
                <DataTable
                  title="Edge Deployments"
                  subtitle="Sortable & filterable TanStack Table"
                  data={filteredRows}
                  columns={COLUMNS}
                />
              </div>
            ),
          },
          {
            value: 'settings',
            label: 'Workspace Controls',
            content: (
              <Card>
                <CardHeader title="Token & Machine Configuration" subtitle="Zero-Tailwind OpenDesign CSS variable bridge" />
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '28rem' }}>
                    <Input label="Workspace Slug" defaultValue="rabbit-ark-prod" />
                    <Select label="Default Region" options={REGION_OPTIONS} defaultValue="us-east-1" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="primary">Save Changes</Button>
                      <Button variant="ghost">Reset</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
