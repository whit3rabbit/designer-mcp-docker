'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Cpu,
  DollarSign,
  Globe,
  Layers,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import {
  Alert,
  AnimatedGradientText,
  Badge,
  BentoCard,
  BentoGrid,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartCard,
  DataTable,
  Dialog,
  DotPattern,
  Input,
  KpiCard,
  NumberTicker,
  Select,
  Tabs,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  status: 'healthy' | 'degraded' | 'building';
  latencyMs: number;
  requestsPerMin: number;
}

const DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-1', service: 'edge-gateway', region: 'us-east-1', status: 'healthy', latencyMs: 18, requestsPerMin: 48200 },
  { id: 'dep-2', service: 'telemetry-ingest', region: 'eu-central-1', status: 'healthy', latencyMs: 24, requestsPerMin: 31940 },
  { id: 'dep-3', service: 'inference-worker', region: 'us-west-2', status: 'building', latencyMs: 42, requestsPerMin: 12450 },
  { id: 'dep-4', service: 'billing-ledger', region: 'ap-southeast-1', status: 'healthy', latencyMs: 31, requestsPerMin: 8920 },
  { id: 'dep-5', service: 'search-indexer', region: 'eu-west-1', status: 'degraded', latencyMs: 112, requestsPerMin: 15600 },
  { id: 'dep-6', service: 'webhook-relay', region: 'us-east-2', status: 'healthy', latencyMs: 21, requestsPerMin: 22100 },
  { id: 'dep-7', service: 'auth-broker', region: 'eu-central-1', status: 'healthy', latencyMs: 14, requestsPerMin: 54300 },
];

const STATUS_TONE: Record<DeploymentRow['status'], 'success' | 'warning' | 'info'> = {
  healthy: 'success',
  degraded: 'warning',
  building: 'info',
};

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  {
    accessorKey: 'service',
    header: 'Service',
    cell: ({ row }) => (
      <span style={{ color: 'var(--color-text)' }} className="font-mono font-semibold">
        {row.original.service}
      </span>
    ),
  },
  {
    accessorKey: 'region',
    header: 'Region',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status]} variant="dot" size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'latencyMs',
    header: 'P95 Latency',
    cell: ({ row }) => <span className="tabular-nums">{row.original.latencyMs} ms</span>,
  },
  {
    accessorKey: 'requestsPerMin',
    header: 'Req / min',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {new Intl.NumberFormat().format(row.original.requestsPerMin)}
      </span>
    ),
  },
];

export function ShowcasePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [regionFilter, setRegionFilter] = React.useState('all');
  const [serviceName, setServiceName] = React.useState('');

  const filteredRows = React.useMemo(
    () =>
      regionFilter === 'all'
        ? DEPLOYMENTS
        : DEPLOYMENTS.filter((row) => row.region.startsWith(regionFilter)),
    [regionFilter],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 text-start">
          <AnimatedGradientText>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Magic UI + OpenDesign Telemetry
            </span>
          </AnimatedGradientText>
          <h1
            style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
            className="text-2xl tracking-tight md:text-3xl"
          >
            Animated Bento Command Center
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            Motion-driven KPIs, bento grids, and real-time cluster telemetry synced to OpenDesign tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" tone="neutral" size="md">
            Export Snapshot
          </Button>
          <Button variant="shimmer" tone="primary" size="md" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New Deployment
          </Button>
        </div>
      </header>

      <Alert tone="info" variant="tonal" title="Reduced Motion Aware" dismissible>
        All BorderBeam, NumberTicker, and shimmer animations automatically adapt to{' '}
        <code className="font-mono">prefers-reduced-motion: reduce</code> and support RTL layouts.
      </Alert>

      <section aria-label="Key performance indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Monthly Recurring Revenue"
          value={284500}
          format="currency"
          delta={14.2}
          deltaLabel="vs last 30d"
          tone="primary"
          beam
          icon={<DollarSign className="size-5" aria-hidden="true" />}
          sparkline={[42, 48, 45, 53, 61, 68, 76]}
        />
        <KpiCard
          label="Active Workspaces"
          value={12480}
          format="number"
          delta={8.6}
          deltaLabel="vs last 30d"
          tone="info"
          icon={<Users className="size-5" aria-hidden="true" />}
          sparkline={{ type: 'bar', data: [20, 32, 28, 45, 52, 64, 59] }}
        />
        <KpiCard
          label="Global Edge Uptime"
          value={99.98}
          format="raw"
          delta={0.04}
          deltaLabel="SLA target 99.9%"
          tone="success"
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          sparkline={{ type: 'radial', data: [99.98] }}
        />
        <KpiCard
          label="Median P95 Latency"
          value="24 ms"
          format="raw"
          delta={-12.5}
          deltaLabel="faster"
          tone="warning"
          icon={<Zap className="size-5" aria-hidden="true" />}
          sparkline={[38, 35, 33, 29, 27, 25, 24]}
        />
      </section>

      <Tabs
        defaultValue="bento"
        items={[
          {
            value: 'bento',
            label: 'Bento Overview',
            icon: <Layers className="size-3.5" aria-hidden="true" />,
            content: (
              <div className="flex flex-col gap-6">
                <BentoGrid columns={3}>
                  <BentoCard
                    colSpan={2}
                    beam
                    name="Global Edge Throughput"
                    description="Live requests processed across 38 edge PoPs with automated failover."
                    icon={<Globe className="size-5" aria-hidden="true" />}
                    cta="Inspect edge nodes"
                    onAction={() => setDialogOpen(true)}
                    background={<DotPattern className="opacity-60" />}
                  >
                    <div className="mt-4 flex flex-wrap items-baseline gap-6">
                      <div>
                        <div className="text-3xl font-bold">
                          <NumberTicker value={193510} />
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                          Requests / minute
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">
                          <NumberTicker value={38} />
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }} className="text-xs">
                          Active PoPs
                        </div>
                      </div>
                    </div>
                  </BentoCard>

                  <BentoCard
                    name="Compute Saturation"
                    description="Cluster CPU & memory headroom across primary worker pools."
                    icon={<Cpu className="size-5" aria-hidden="true" />}
                    cta="Scale pool"
                    onAction={() => setDialogOpen(true)}
                    background={<DotPattern width={14} height={14} className="opacity-50" />}
                  >
                    <div className="mt-4 flex items-center gap-3">
                      <Badge tone="success" variant="tonal">
                        Optimal 42%
                      </Badge>
                      <Badge tone="info" variant="outline">
                        Auto-scale ON
                      </Badge>
                    </div>
                  </BentoCard>
                </BentoGrid>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ChartCard
                    className="lg:col-span-2"
                    title="Throughput & Error Budget"
                    description="7-day rolling request volume (thousands)"
                    type="area"
                    categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                    series={[
                      { name: 'Edge Requests', data: [142, 168, 159, 184, 210, 198, 224] },
                      { name: 'Cache Hits', data: [118, 140, 134, 158, 182, 174, 196] },
                    ]}
                    beam
                  />
                  <ChartCard
                    title="Traffic by Region"
                    description="Share of global edge volume"
                    type="donut"
                    series={[44, 31, 17, 8]}
                    options={{
                      labels: ['North America', 'Europe', 'Asia-Pacific', 'Latin America'],
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            value: 'deployments',
            label: 'Deployments',
            icon: <Rocket className="size-3.5" aria-hidden="true" />,
            content: (
              <Card>
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 text-start">
                    <CardTitle>Active Service Deployments</CardTitle>
                    <CardDescription>
                      Sortable and filterable cluster inventory powered by TanStack Table.
                    </CardDescription>
                  </div>
                  <div className="w-48">
                    <Select
                      aria-label="Filter by region"
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      options={[
                        { label: 'All Regions', value: 'all' },
                        { label: 'US Regions', value: 'us-' },
                        { label: 'EU Regions', value: 'eu-' },
                        { label: 'APAC Regions', value: 'ap-' },
                      ]}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable columns={COLUMNS} data={filteredRows} searchPlaceholder="Search services…" />
                </CardContent>
              </Card>
            ),
          },
          {
            value: 'telemetry',
            label: 'Live Stream',
            icon: <Activity className="size-3.5" aria-hidden="true" />,
            content: (
              <Card beam>
                <CardHeader>
                  <CardTitle>Cluster Event Stream</CardTitle>
                  <CardDescription>
                    Real-time health checks and autoscaler decisions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert tone="success" variant="tonal" title="us-east-1 healthy">
                    All 14 edge replicas passed synthetic health probes with 18ms median latency.
                  </Alert>
                  <Alert tone="warning" variant="outline" title="eu-west-1 elevated latency">
                    search-indexer P95 latency reached 112ms; replica autoscaling triggered.
                  </Alert>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Trigger New Deployment"
        description="Deploy a service revision to the global edge mesh."
        footer={
          <>
            <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="shimmer" tone="primary" onClick={() => setDialogOpen(false)}>
              Deploy Revision
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. edge-gateway-v2"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            hint="Lowercase alphanumeric and hyphens only."
          />
          <Select
            label="Target Region"
            defaultValue="us-east-1"
            options={[
              { label: 'us-east-1 (N. Virginia)', value: 'us-east-1' },
              { label: 'eu-central-1 (Frankfurt)', value: 'eu-central-1' },
              { label: 'ap-southeast-1 (Singapore)', value: 'ap-southeast-1' },
            ]}
          />
        </div>
      </Dialog>
    </div>
  );
}
