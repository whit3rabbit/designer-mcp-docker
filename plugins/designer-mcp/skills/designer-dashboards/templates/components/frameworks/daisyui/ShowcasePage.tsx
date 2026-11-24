'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  DollarSign,
  Languages,
  Moon,
  Plus,
  Search,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { DaisyThemeProvider, useDaisyTheme } from './theme/DaisyThemeProvider';
import {
  Alert,
  Badge,
  Button,
  Card,
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
  owner: string;
}

const SAMPLE_ROWS: DeploymentRow[] = [
  { id: 'DEP-1041', service: 'auth-gateway', region: 'us-east-1', latencyMs: 18, status: 'healthy', owner: 'Platform' },
  { id: 'DEP-1042', service: 'billing-worker', region: 'eu-central-1', latencyMs: 42, status: 'healthy', owner: 'FinOps' },
  { id: 'DEP-1043', service: 'analytics-ingest', region: 'us-west-2', latencyMs: 134, status: 'degraded', owner: 'Data' },
  { id: 'DEP-1044', service: 'notify-relay', region: 'ap-south-1', latencyMs: 26, status: 'healthy', owner: 'Comms' },
  { id: 'DEP-1045', service: 'search-indexer', region: 'eu-west-1', latencyMs: 0, status: 'offline', owner: 'Core' },
  { id: 'DEP-1046', service: 'edge-router', region: 'us-east-1', latencyMs: 11, status: 'healthy', owner: 'Infra' },
];

const STATUS_TONE: Record<DeploymentRow['status'], 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  offline: 'error',
};

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    cell: ({ row }) => <span className="tabular-nums">{row.original.latencyMs} ms</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status]} variant="soft" size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'owner', header: 'Team' },
];

function ShowcaseContent() {
  const { isDark, dir, toggleTheme, toggleDir } = useDaisyTheme();
  const [showAlert, setShowAlert] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [envFilter, setEnvFilter] = React.useState('production');
  const [serviceName, setServiceName] = React.useState('');

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">daisyUI v5 Command Center</h1>
            <Badge tone="primary" variant="soft" size="sm">
              OpenDesign Bridge
            </Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            CSS-first Tailwind v4 components themed via @plugin &quot;daisyui/theme&quot;.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            onClick={toggleDir}
            aria-label={`Switch text direction to ${dir === 'ltr' ? 'RTL' : 'LTR'}`}
          >
            <Languages className="size-4" aria-hidden="true" />
            {dir.toUpperCase()}
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            iconOnly
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </Button>
          <Button tone="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New Service
          </Button>
        </div>
      </header>

      {showAlert && (
        <Alert
          tone="info"
          variant="soft"
          title="Theme tokens synchronized"
          onDismiss={() => setShowAlert(false)}
        >
          daisyUI v5 semantic tokens are bridged to Designer Dashboards OpenDesign CSS custom properties.
        </Alert>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Key metrics">
        <KpiCard
          label="Monthly Recurring Revenue"
          value={148200}
          format="currency"
          delta={12.4}
          deltaLabel="vs last month"
          tone="primary"
          icon={<DollarSign className="size-5" />}
          sparkline={[98, 104, 112, 108, 125, 138, 148]}
        />
        <KpiCard
          label="Active Workspaces"
          value={3842}
          format="number"
          delta={6.8}
          deltaLabel="vs last week"
          tone="success"
          icon={<Users className="size-5" />}
          sparkline={[3100, 3250, 3400, 3520, 3690, 3842]}
        />
        <KpiCard
          label="P95 API Latency"
          value="34 ms"
          delta={-8.2}
          deltaLabel="faster"
          tone="info"
          icon={<Zap className="size-5" />}
          sparkline={[46, 44, 41, 39, 37, 34]}
        />
        <KpiCard
          label="Uptime SLA"
          value={99.94}
          format="percent"
          delta={0.02}
          deltaLabel="30d window"
          tone="warning"
          icon={<Activity className="size-5" />}
        />
      </section>

      <Tabs
        variant="box"
        items={[
          {
            id: 'overview',
            label: 'Analytics Overview',
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <ChartCard
                    className="lg:col-span-2"
                    title="Request Throughput"
                    subtitle="Requests per minute across edge regions"
                    type="area"
                    series={[
                      { name: 'Production', data: [31, 40, 28, 51, 42, 69, 74] },
                      { name: 'Staging', data: [11, 18, 15, 22, 19, 25, 29] },
                    ]}
                    options={{
                      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                      stroke: { curve: 'smooth', width: 2 },
                      dataLabels: { enabled: false },
                    }}
                  />
                  <ChartCard
                    title="Traffic by Tier"
                    subtitle="Active cluster distribution"
                    type="donut"
                    series={[54, 28, 18]}
                    options={{
                      labels: ['Enterprise', 'Growth', 'Starter'],
                      legend: { position: 'bottom' },
                    }}
                  />
                </div>

                <Card title="Service Deployments" subtitle="Live cluster health and latency">
                  <DataTable data={SAMPLE_ROWS} columns={COLUMNS} pageSize={5} />
                </Card>
              </div>
            ),
          },
          {
            id: 'controls',
            label: 'UI Primitives',
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Buttons & Badges" subtitle="Semantic tones and variants">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button tone="primary">Primary</Button>
                      <Button tone="secondary" variant="soft">Secondary Soft</Button>
                      <Button tone="success" variant="outline">Success Outline</Button>
                      <Button tone="warning" variant="ghost">Warning Ghost</Button>
                      <Button tone="error" loading>Loading</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="primary">Primary</Badge>
                      <Badge tone="info" variant="outline">Info</Badge>
                      <Badge tone="success" variant="soft">Healthy</Badge>
                      <Badge tone="warning" variant="soft">Degraded</Badge>
                      <Badge tone="error" variant="solid">Critical</Badge>
                    </div>
                  </div>
                </Card>

                <Card title="Form Controls" subtitle="Accessible fieldset inputs">
                  <div className="space-y-3">
                    <Input
                      label="Search Endpoints"
                      placeholder="e.g. auth-gateway"
                      startIcon={<Search className="size-4" />}
                      hint="Matches service name or region"
                    />
                    <Select
                      label="Target Environment"
                      value={envFilter}
                      onChange={(e) => setEnvFilter(e.target.value)}
                      options={[
                        { label: 'Production (us-east-1)', value: 'production' },
                        { label: 'Staging (eu-central-1)', value: 'staging' },
                        { label: 'Development', value: 'dev' },
                      ]}
                    />
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Register New Service"
        description="Provision a monitored endpoint in the selected environment."
        footer={
          <>
            <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                setDialogOpen(false);
                setServiceName('');
              }}
            >
              Create Service
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Service Name"
            placeholder="payments-api"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
          <Select
            label="Region"
            defaultValue="us-east-1"
            options={[
              { label: 'us-east-1', value: 'us-east-1' },
              { label: 'eu-central-1', value: 'eu-central-1' },
              { label: 'ap-south-1', value: 'ap-south-1' },
            ]}
          />
        </div>
      </Dialog>
    </div>
  );
}

export function ShowcasePage() {
  return (
    <DaisyThemeProvider>
      <ShowcaseContent />
    </DaisyThemeProvider>
  );
}
