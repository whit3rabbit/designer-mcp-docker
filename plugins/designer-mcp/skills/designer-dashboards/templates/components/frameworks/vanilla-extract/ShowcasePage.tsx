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
  status: 'healthy' | 'degraded' | 'incident';
  requestsPerMin: number;
}

const SAMPLE_DEPLOYMENTS: DeploymentRow[] = [
  { id: '1', service: 'api-gateway', region: 'us-east-1', latencyMs: 24, status: 'healthy', requestsPerMin: 18420 },
  { id: '2', service: 'billing-worker', region: 'eu-west-1', latencyMs: 68, status: 'healthy', requestsPerMin: 4190 },
  { id: '3', service: 'search-indexer', region: 'us-west-2', latencyMs: 142, status: 'degraded', requestsPerMin: 2810 },
  { id: '4', service: 'auth-session', region: 'ap-south-1', latencyMs: 31, status: 'healthy', requestsPerMin: 11250 },
  { id: '5', service: 'webhook-relay', region: 'eu-central-1', latencyMs: 310, status: 'incident', requestsPerMin: 940 },
  { id: '6', service: 'analytics-ingest', region: 'us-east-1', latencyMs: 19, status: 'healthy', requestsPerMin: 27600 },
];

const STATUS_TONE: Record<DeploymentRow['status'], 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  incident: 'error',
};

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status]} variant="tonal" size="sm">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'latencyMs',
    header: 'P95 Latency',
    cell: ({ row }) => `${row.original.latencyMs} ms`,
  },
  {
    accessorKey: 'requestsPerMin',
    header: 'Req / min',
    cell: ({ row }) => row.original.requestsPerMin.toLocaleString(),
  },
];

export function ShowcasePage() {
  const [dark, setDark] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState('all');

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.setAttribute('data-theme', next ? 'dark' : 'light');
    root.classList.toggle('dark', next);
  };

  const toggleRtl = () => {
    const next = !rtl;
    setRtl(next);
    document.documentElement.setAttribute('dir', next ? 'rtl' : 'ltr');
  };

  const filteredRows = React.useMemo(() => {
    return SAMPLE_DEPLOYMENTS.filter((row) => {
      const matchesSearch =
        !search.trim() ||
        row.service.toLowerCase().includes(search.toLowerCase()) ||
        row.region.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = regionFilter === 'all' || row.region.startsWith(regionFilter);
      return matchesSearch && matchesRegion;
    });
  }, [search, regionFilter]);

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text)',
        padding: '1.5rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ maxWidth: '80rem', marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                vanilla-extract + Ark UI Console
              </h1>
              <Badge tone="primary" variant="tonal">
                Zero-Runtime CSS
              </Badge>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Typed CSS-in-TS recipes bridged to OpenDesign OKLCH tokens.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              leadingIcon={<Languages size={15} aria-hidden="true" />}
              onClick={toggleRtl}
            >
              {rtl ? 'LTR' : 'RTL'}
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              size="sm"
              iconOnly
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
            >
              {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </Button>
            <Button
              variant="solid"
              tone="primary"
              size="sm"
              leadingIcon={<Plus size={15} aria-hidden="true" />}
              onClick={() => setDialogOpen(true)}
            >
              New Monitor
            </Button>
          </div>
        </header>

        {showAlert && (
          <Alert
            tone="info"
            title="Zero-runtime stylesheet active"
            description="All component variants are compiled at build time by @vanilla-extract/vite-plugin and react to OpenDesign theme presets via CSS custom properties."
            onDismiss={() => setShowAlert(false)}
          />
        )}

        <section
          aria-label="Key performance indicators"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <KpiCard
            label="Monthly Recurring Revenue"
            value={142800}
            format="currency"
            delta={12.4}
            deltaLabel="vs last mo"
            tone="primary"
            icon={<DollarSign size={18} />}
            sparkline={[92, 98, 105, 112, 128, 134, 142]}
          />
          <KpiCard
            label="Active Workspaces"
            value={3842}
            format="number"
            delta={6.1}
            tone="success"
            icon={<Users size={18} />}
            sparkline={{ type: 'bar', data: [40, 52, 48, 61, 58, 70, 76] }}
          />
          <KpiCard
            label="SLA Availability"
            value={99.94}
            format="percent"
            delta={0.2}
            tone="info"
            icon={<Activity size={18} />}
            sparkline={{ type: 'radial', data: [99] }}
          />
          <KpiCard
            label="P95 Edge Latency"
            value="42 ms"
            delta={-8.5}
            deltaLabel="faster"
            tone="warning"
            icon={<Zap size={18} />}
            sparkline={[62, 58, 55, 51, 49, 44, 42]}
          />
        </section>

        <Tabs
          defaultValue="overview"
          items={[
            {
              value: 'overview',
              label: 'Overview',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <ChartCard
                    title="Request Throughput"
                    subtitle="Requests per minute across edge POPs"
                    type="area"
                    series={[
                      { name: 'API Gateway', data: [31, 40, 38, 51, 49, 62, 69] },
                      { name: 'Analytics', data: [22, 28, 34, 39, 44, 48, 54] },
                    ]}
                    options={{
                      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                    }}
                  />

                  <Card
                    title="Service Health"
                    subtitle="Live telemetry from edge deployments"
                    actions={
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '13rem' }}>
                          <Input
                            size="sm"
                            placeholder="Filter services..."
                            aria-label="Filter services"
                            leadingIcon={<Search size={14} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                        <div style={{ width: '10rem' }}>
                          <Select
                            value={regionFilter}
                            onValueChange={setRegionFilter}
                            options={[
                              { label: 'All Regions', value: 'all' },
                              { label: 'US Regions', value: 'us-' },
                              { label: 'EU Regions', value: 'eu-' },
                              { label: 'AP Regions', value: 'ap-' },
                            ]}
                          />
                        </div>
                      </div>
                    }
                  >
                    <DataTable data={filteredRows} columns={COLUMNS} pageSize={5} />
                  </Card>
                </div>
              ),
            },
            {
              value: 'tokens',
              label: 'Recipes & Tokens',
              content: (
                <Card title="Button & Badge Recipes" subtitle="Typed @vanilla-extract/recipes variants">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Button variant="solid" tone="primary">Solid Primary</Button>
                    <Button variant="tonal" tone="primary">Tonal Primary</Button>
                    <Button variant="outline" tone="neutral">Outline Neutral</Button>
                    <Button variant="ghost" tone="error">Ghost Error</Button>
                    <Button variant="solid" tone="success" loading>Saving</Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Badge tone="primary" variant="solid">Primary</Badge>
                    <Badge tone="success" variant="tonal">Success</Badge>
                    <Badge tone="warning" variant="tonal">Warning</Badge>
                    <Badge tone="error" variant="outline">Error</Badge>
                    <Badge tone="info" variant="tonal">Info</Badge>
                    <Badge tone="neutral" variant="outline">Neutral</Badge>
                  </div>
                </Card>
              ),
            },
          ]}
        />

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Create Service Monitor"
          description="Configure an uptime check using Ark UI Dialog and vanilla-extract."
          footer={
            <>
              <Button variant="outline" tone="neutral" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="solid" tone="primary" onClick={() => setDialogOpen(false)}>
                Save Monitor
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Input label="Service Name" placeholder="e.g. checkout-api" />
            <Select
              label="Target Region"
              defaultValue="us-east-1"
              options={[
                { label: 'US East (us-east-1)', value: 'us-east-1' },
                { label: 'EU West (eu-west-1)', value: 'eu-west-1' },
                { label: 'Asia Pacific (ap-south-1)', value: 'ap-south-1' },
              ]}
            />
          </div>
        </Dialog>
      </div>
    </main>
  );
}
