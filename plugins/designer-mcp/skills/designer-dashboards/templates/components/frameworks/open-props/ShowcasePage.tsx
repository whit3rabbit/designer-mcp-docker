import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
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
import './theme/open-props-bridge.css';
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
  type BadgeTone,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  status: 'healthy' | 'degraded' | 'building';
  latencyMs: number;
  requestsPerMin: number;
}

const INITIAL_ROWS: DeploymentRow[] = [
  { id: 'dep-1', service: 'edge-gateway', region: 'us-east-1', status: 'healthy', latencyMs: 18, requestsPerMin: 14200 },
  { id: 'dep-2', service: 'billing-worker', region: 'eu-west-1', status: 'healthy', latencyMs: 42, requestsPerMin: 3180 },
  { id: 'dep-3', service: 'analytics-ingest', region: 'us-west-2', status: 'degraded', latencyMs: 129, requestsPerMin: 8940 },
  { id: 'dep-4', service: 'auth-session', region: 'ap-south-1', status: 'healthy', latencyMs: 27, requestsPerMin: 6410 },
  { id: 'dep-5', service: 'report-renderer', region: 'eu-central-1', status: 'building', latencyMs: 64, requestsPerMin: 1250 },
  { id: 'dep-6', service: 'webhook-dispatcher', region: 'us-east-1', status: 'healthy', latencyMs: 31, requestsPerMin: 5300 },
];

const STATUS_TONE: Record<DeploymentRow['status'], BadgeTone> = {
  healthy: 'success',
  degraded: 'warning',
  building: 'info',
};

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge tone={STATUS_TONE[status]} variant="dot" size="sm">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'latencyMs',
    header: 'p95 Latency',
    cell: ({ row }) => <span>{row.original.latencyMs} ms</span>,
  },
  {
    accessorKey: 'requestsPerMin',
    header: 'Throughput',
    cell: ({ row }) => <span>{row.original.requestsPerMin.toLocaleString()} rpm</span>,
  },
];

export function ShowcasePage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light',
  );
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');
  const [showAlert, setShowAlert] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [rows, setRows] = React.useState<DeploymentRow[]>(INITIAL_ROWS);
  const [newService, setNewService] = React.useState('');
  const [newRegion, setNewRegion] = React.useState('us-east-1');
  const [formError, setFormError] = React.useState<string | undefined>();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const toggleDirection = () => {
    const next = dir === 'ltr' ? 'rtl' : 'ltr';
    setDir(next);
    document.documentElement.setAttribute('dir', next);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim()) {
      setFormError('Service name is required.');
      return;
    }
    setRows((prev) => [
      {
        id: `dep-${Date.now()}`,
        service: newService.trim(),
        region: newRegion,
        status: 'building',
        latencyMs: 35,
        requestsPerMin: 900,
      },
      ...prev,
    ]);
    setNewService('');
    setFormError(undefined);
    setDialogOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
        paddingInline: 'var(--op-space-lg)',
        paddingBlock: 'var(--op-space-xl)',
      }}
    >
      <div
        style={{
          maxWidth: '76rem',
          marginInline: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--op-space-lg)',
        }}
      >
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--op-space-md)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-xs)' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                Open Props + OpenDesign Showcase
              </h1>
              <Badge tone="primary" variant="tonal" size="sm">
                JIT Tokens
              </Badge>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Zero-runtime CSS token primitives with WCAG AA OpenDesign themes, ApexCharts, and TanStack Table.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-xs)' }}>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              iconOnly
              aria-label={`Switch text direction to ${dir === 'ltr' ? 'RTL' : 'LTR'}`}
              onClick={toggleDirection}
            >
              <Languages size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              iconOnly
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </Button>
            <Button
              variant="solid"
              tone="primary"
              size="sm"
              startIcon={<Plus size={16} aria-hidden="true" />}
              onClick={() => setDialogOpen(true)}
            >
              Deploy Service
            </Button>
          </div>
        </header>

        {showAlert && (
          <Alert
            tone="info"
            title="postcss-jit-props enabled"
            description="Only the Open Props custom properties referenced in open-props-bridge.css are emitted in the production bundle."
            onDismiss={() => setShowAlert(false)}
          />
        )}

        <section
          aria-label="Key metrics"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            gap: 'var(--op-space-md)',
          }}
        >
          <KpiCard
            label="Monthly Revenue"
            value="$142,840"
            delta="+14.2%"
            deltaTone="success"
            subtitle="vs. previous 30 days"
            icon={<DollarSign size={16} />}
          />
          <KpiCard
            label="Active Workspaces"
            value="3,419"
            delta="+8.1%"
            deltaTone="primary"
            subtitle="Across 42 regions"
            icon={<Users size={16} />}
          />
          <KpiCard
            label="API Latency (p95)"
            value="42 ms"
            delta="-6.4%"
            deltaTone="info"
            subtitle="Global edge average"
            icon={<Activity size={16} />}
          />
          <KpiCard
            label="Cluster Nodes"
            value="128"
            delta="99.98%"
            deltaTone="success"
            subtitle="Healthy uptime SLA"
            icon={<Server size={16} />}
          />
        </section>

        <Tabs
          ariaLabel="Dashboard sections"
          items={[
            {
              id: 'overview',
              label: 'Traffic & Deployments',
              content: (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
                    gap: 'var(--op-space-md)',
                  }}
                >
                  <ChartCard
                    title="Request Throughput"
                    description="Requests per minute across edge clusters"
                    type="area"
                    series={[
                      { name: 'Edge Gateway', data: [31, 40, 28, 51, 42, 68, 74] },
                      { name: 'API Workers', data: [19, 25, 22, 34, 30, 44, 49] },
                    ]}
                    options={{
                      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                      stroke: { curve: 'smooth', width: 2 },
                    }}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Services</CardTitle>
                      <CardDescription>Sortable and filterable via TanStack Table</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataTable data={rows} columns={COLUMNS} pageSize={4} />
                    </CardContent>
                  </Card>
                </div>
              ),
            },
            {
              id: 'tokens',
              label: 'Token Primitives',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>Button &amp; Badge Variants</CardTitle>
                    <CardDescription>
                      Styled with Open Props radii/shadows/easings and OpenDesign OKLCH tones
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-md)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--op-space-xs)' }}>
                      <Button variant="solid" tone="primary">Primary Solid</Button>
                      <Button variant="tonal" tone="primary">Primary Tonal</Button>
                      <Button variant="outline" tone="neutral">Neutral Outline</Button>
                      <Button variant="ghost" tone="success">Success Ghost</Button>
                      <Button variant="solid" tone="error" loading>Deploying</Button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--op-space-xs)' }}>
                      <Badge tone="primary" variant="solid">Primary</Badge>
                      <Badge tone="success" variant="dot">Operational</Badge>
                      <Badge tone="warning" variant="tonal">Degraded</Badge>
                      <Badge tone="error" variant="outline">Incident</Badge>
                      <Badge tone="info" variant="tonal">v1.7.16</Badge>
                    </div>
                  </CardContent>
                </Card>
              ),
            },
          ]}
        />

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Deploy New Service"
          description="Register a service in the Open Props telemetry table."
          footer={
            <>
              <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="deploy-service-form" variant="solid" tone="primary">
                Create Deployment
              </Button>
            </>
          }
        >
          <form
            id="deploy-service-form"
            onSubmit={handleCreateService}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-md)' }}
          >
            <Input
              label="Service Name"
              placeholder="e.g. search-indexer"
              value={newService}
              onChange={(e) => {
                setNewService(e.target.value);
                if (formError) setFormError(undefined);
              }}
              error={formError}
            />
            <Select
              label="Target Region"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              options={[
                { value: 'us-east-1', label: 'US East (us-east-1)' },
                { value: 'us-west-2', label: 'US West (us-west-2)' },
                { value: 'eu-west-1', label: 'EU West (eu-west-1)' },
                { value: 'ap-south-1', label: 'Asia Pacific (ap-south-1)' },
              ]}
            />
          </form>
        </Dialog>
      </div>
    </div>
  );
}
