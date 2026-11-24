import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Activity, Cpu, Globe, Languages, Moon, Plus, Server, Sun, Users } from 'lucide-react';
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
  Input,
  KpiCard,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  updatedAt: string;
}

const SAMPLE_DEPLOYMENTS: DeploymentRow[] = [
  {
    id: 'dep-01',
    service: 'edge-gateway',
    region: 'us-east-1',
    status: 'healthy',
    latencyMs: 18,
    updatedAt: '2m ago',
  },
  {
    id: 'dep-02',
    service: 'billing-worker',
    region: 'eu-central-1',
    status: 'healthy',
    latencyMs: 34,
    updatedAt: '11m ago',
  },
  {
    id: 'dep-03',
    service: 'analytics-ingest',
    region: 'ap-southeast-1',
    status: 'degraded',
    latencyMs: 142,
    updatedAt: '27m ago',
  },
  {
    id: 'dep-04',
    service: 'auth-session-store',
    region: 'us-west-2',
    status: 'healthy',
    latencyMs: 21,
    updatedAt: '1h ago',
  },
  {
    id: 'dep-05',
    service: 'media-transcoder',
    region: 'eu-west-1',
    status: 'offline',
    latencyMs: 0,
    updatedAt: '3h ago',
  },
];

const STATUS_BADGE: Record<DeploymentRow['status'], 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  offline: 'error',
};

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  {
    accessorKey: 'service',
    header: 'Service',
    cell: (info) => <span className="font-medium text-text">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: (info) => (
      <span className="font-mono text-xs text-text-muted">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const val = info.getValue() as DeploymentRow['status'];
      return (
        <Badge tone={STATUS_BADGE[val]} dot>
          {val}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'latencyMs',
    header: 'P95 Latency',
    cell: (info) => (
      <span className="font-mono text-xs tabular-nums">{String(info.getValue())} ms</span>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: (info) => <span className="text-xs text-text-muted">{String(info.getValue())}</span>,
  },
];

export function ShowcasePage() {
  const [showAlert, setShowAlert] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );
  const [isRtl, setIsRtl] = React.useState(false);
  const [serviceName, setServiceName] = React.useState('');
  const [region, setRegion] = React.useState('us-east-1');

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const toggleRtl = () => {
    const next = !isRtl;
    setIsRtl(next);
    document.documentElement.setAttribute('dir', next ? 'rtl' : 'ltr');
  };

  return (
    <div className="min-h-screen bg-canvas p-6 text-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-text">
                UnoCSS Operations Console
              </h1>
              <Badge tone="primary" variant="tonal">
                preset-wind4
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Atomic utility-first UI bridged to OpenDesign OKLCH tokens.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              iconOnly
              onClick={toggleRtl}
              aria-label="Toggle RTL direction"
              title="Toggle RTL"
            >
              <Languages className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              iconOnly
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title="Toggle theme"
            >
              {isDark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button variant="solid" tone="primary" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              <span>New Deployment</span>
            </Button>
          </div>
        </header>

        {showAlert ? (
          <Alert
            tone="info"
            title="Zero-runtime atomic CSS active"
            onDismiss={() => setShowAlert(false)}
          >
            All surfaces, borders, and chart palettes resolve from OpenDesign CSS custom properties
            with automatic light/dark and RTL support.
          </Alert>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Active Requests / sec"
            value="42,810"
            delta="+12.4%"
            trend="up"
            subtitle="vs last 24h"
            icon={<Activity className="size-5" />}
          />
          <KpiCard
            title="Cluster CPU Load"
            value="38.2%"
            delta="-4.1%"
            trend="up"
            subtitle="optimal range"
            icon={<Cpu className="size-5" />}
          />
          <KpiCard
            title="Global Edge Nodes"
            value="128"
            delta="0.0%"
            trend="neutral"
            subtitle="3 regions"
            icon={<Globe className="size-5" />}
          />
          <KpiCard
            title="Concurrent Sessions"
            value="9,412"
            delta="-1.8%"
            trend="down"
            subtitle="vs peak hour"
            icon={<Users className="size-5" />}
          />
        </section>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview &amp; Telemetry</TabsTrigger>
            <TabsTrigger value="controls">UI Primitives</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            <ChartCard
              title="Throughput & Error Rate"
              description="Requests per minute across primary edge regions"
              type="area"
              height={260}
              series={[
                { name: 'Throughput (k)', data: [31, 40, 38, 51, 49, 62, 69] },
                { name: 'Cache Hits (k)', data: [24, 32, 30, 41, 40, 52, 58] },
              ]}
              options={{
                xaxis: {
                  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle>Active Service Deployments</CardTitle>
                <CardDescription>
                  Sortable, filterable operational table powered by TanStack React Table.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={SAMPLE_DEPLOYMENTS} columns={COLUMNS} pageSize={5} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants &amp; Tones</CardTitle>
                <CardDescription>
                  Semantic tones mapped to OpenDesign primary, status, and neutral tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="solid" tone="primary">
                  Primary Solid
                </Button>
                <Button variant="tonal" tone="primary">
                  Primary Tonal
                </Button>
                <Button variant="outline" tone="primary">
                  Primary Outline
                </Button>
                <Button variant="solid" tone="success">
                  Success
                </Button>
                <Button variant="tonal" tone="warning">
                  Warning
                </Button>
                <Button variant="solid" tone="error">
                  Error
                </Button>
                <Button variant="ghost" tone="neutral">
                  Ghost Neutral
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Controls</CardTitle>
                <CardDescription>
                  Accessible inputs and selects with RTL-aware logical spacing.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  label="Cluster Endpoint"
                  placeholder="https://api.designer-dashboards.dev"
                  helperText="Used for live telemetry polling."
                  startAdornment={<Server className="size-4" />}
                />
                <Select
                  label="Default Region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  options={[
                    { value: 'us-east-1', label: 'US East (N. Virginia)' },
                    { value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
                    { value: 'ap-southeast-1', label: 'AP Southeast (Singapore)' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Create Service Deployment"
          description="Provision a new edge service using OpenDesign UnoCSS primitives."
          footer={
            <>
              <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                tone="primary"
                onClick={() => {
                  setServiceName('');
                  setDialogOpen(false);
                }}
              >
                Deploy Service
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Service Name"
              placeholder="e.g. telemetry-router"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            <Select
              label="Target Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={[
                { value: 'us-east-1', label: 'US East (N. Virginia)' },
                { value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
                { value: 'ap-southeast-1', label: 'AP Southeast (Singapore)' },
              ]}
            />
          </div>
        </Dialog>
      </div>
    </div>
  );
}
