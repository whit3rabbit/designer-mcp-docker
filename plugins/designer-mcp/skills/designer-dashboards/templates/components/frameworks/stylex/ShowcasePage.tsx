import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  DollarSign,
  Languages,
  Moon,
  Plus,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { tokens } from './theme/tokens.stylex';
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
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'incident';
}

const SAMPLE_DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-01', service: 'edge-gateway', region: 'us-east-1', latencyMs: 18, status: 'healthy' },
  { id: 'dep-02', service: 'billing-worker', region: 'eu-central-1', latencyMs: 42, status: 'healthy' },
  { id: 'dep-03', service: 'realtime-ingest', region: 'ap-northeast-1', latencyMs: 114, status: 'degraded' },
  { id: 'dep-04', service: 'auth-session', region: 'us-west-2', latencyMs: 21, status: 'healthy' },
  { id: 'dep-05', service: 'webhook-relay', region: 'eu-west-1', latencyMs: 265, status: 'incident' },
  { id: 'dep-06', service: 'search-indexer', region: 'us-east-1', latencyMs: 34, status: 'healthy' },
];

const styles = stylex.create({
  page: {
    maxWidth: '1280px',
    marginInline: 'auto',
    paddingBlock: '28px',
    paddingInline: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    color: tokens.text,
    fontFamily: tokens.fontSans,
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: tokens.text2xl,
    fontWeight: tokens.headingWeight,
  },
  subtitle: {
    margin: 0,
    marginTop: '4px',
    fontSize: tokens.textSm,
    color: tokens.textMuted,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
});

const STATUS_TONE: Record<DeploymentRow['status'], 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  incident: 'error',
};

export function ShowcasePage() {
  const [dark, setDark] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [regionFilter, setRegionFilter] = React.useState('all');

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const toggleRtl = () => {
    const next = !rtl;
    setRtl(next);
    document.documentElement.setAttribute('dir', next ? 'rtl' : 'ltr');
  };

  const columns = React.useMemo<ColumnDef<DeploymentRow, unknown>[]>(
    () => [
      { accessorKey: 'service', header: 'Service' },
      { accessorKey: 'region', header: 'Region' },
      {
        accessorKey: 'latencyMs',
        header: 'P95 Latency',
        cell: ({ getValue }) => `${getValue<number>()} ms`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<DeploymentRow['status']>();
          return (
            <Badge variant="dot" tone={STATUS_TONE[status]}>
              {status}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const filteredRows = React.useMemo(
    () =>
      regionFilter === 'all'
        ? SAMPLE_DEPLOYMENTS
        : SAMPLE_DEPLOYMENTS.filter((r) => r.region.startsWith(regionFilter)),
    [regionFilter],
  );

  return (
    <main {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>StyleX Analytics Console</h1>
          <p {...stylex.props(styles.subtitle)}>
            Compile-time atomic CSS bridged to OpenDesign OKLCH tokens.
          </p>
        </div>
        <div {...stylex.props(styles.actions)}>
          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            iconOnly
            aria-label={rtl ? 'Switch to LTR layout' : 'Switch to RTL layout'}
            onClick={toggleRtl}
          >
            <Languages size={16} aria-hidden="true" />
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
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            New Deployment
          </Button>
        </div>
      </header>

      <Alert tone="info" title="OpenDesign + StyleX Bridge Active" dismissible>
        All StyleX tokens in <code>tokens.stylex.ts</code> resolve dynamically to OpenDesign CSS
        custom properties.
      </Alert>

      <section aria-label="Key metrics" {...stylex.props(styles.kpiGrid)}>
        <KpiCard
          label="Monthly Recurring Revenue"
          value={148200}
          format="currency"
          delta={12.4}
          tone="primary"
          icon={<DollarSign size={18} />}
          sparkline={[98, 104, 112, 119, 128, 141, 148]}
        />
        <KpiCard
          label="Active Workspaces"
          value={3842}
          format="number"
          delta={6.8}
          tone="success"
          icon={<Users size={18} />}
          sparkline={[3100, 3290, 3410, 3580, 3690, 3780, 3842]}
        />
        <KpiCard
          label="P95 Edge Latency"
          value="24 ms"
          delta={-8.2}
          tone="info"
          icon={<Zap size={18} />}
          sparkline={[31, 29, 28, 27, 25, 25, 24]}
        />
        <KpiCard
          label="Error Budget Burn"
          value={1.4}
          format="percent"
          delta={-0.3}
          tone="warning"
          icon={<Activity size={18} />}
          sparkline={[2.1, 1.9, 1.8, 1.6, 1.5, 1.4]}
        />
      </section>

      <Tabs defaultValue="overview" variant="segmented">
        <TabsList aria-label="Dashboard sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="settings">Quick Filter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div {...stylex.props(styles.chartsGrid)}>
            <ChartCard
              title="Throughput & Latency"
              description="Requests per second across edge POPs"
              type="area"
              series={[
                { name: 'Requests/s', data: [420, 510, 490, 620, 710, 680, 790] },
                { name: 'Cache Hits/s', data: [380, 460, 445, 575, 660, 635, 740] },
              ]}
              options={{
                xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
              }}
            />
            <ChartCard
              title="Traffic by Region"
              description="Share of global edge invocations"
              type="donut"
              series={[48, 31, 21]}
              options={{
                labels: ['North America', 'Europe', 'Asia-Pacific'],
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <DataTable
            data={filteredRows}
            columns={columns}
            caption="Edge service deployments"
            searchPlaceholder="Search services or regions..."
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Filter</CardTitle>
              <CardDescription>
                Filter the deployments table using accessible StyleX form controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div {...stylex.props(styles.formGrid)}>
                <Select
                  label="Region Prefix"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Regions' },
                    { value: 'us', label: 'US Regions' },
                    { value: 'eu', label: 'EU Regions' },
                    { value: 'ap', label: 'APAC Regions' },
                  ]}
                />
                <Input
                  label="Environment Tag"
                  placeholder="production"
                  helperText="Matches OpenDesign surface & focus-ring tokens."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Deployment"
        description="Provision a new edge service using StyleX + OpenDesign primitives."
        footer={
          <>
            <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Deploy</Button>
          </>
        }
      >
        <div {...stylex.props(styles.dialogForm)}>
          <Input label="Service Name" placeholder="metrics-collector" />
          <Select
            label="Target Region"
            defaultValue="us-east-1"
            options={[
              { value: 'us-east-1', label: 'us-east-1 (N. Virginia)' },
              { value: 'eu-central-1', label: 'eu-central-1 (Frankfurt)' },
              { value: 'ap-northeast-1', label: 'ap-northeast-1 (Tokyo)' },
            ]}
          />
        </div>
      </Dialog>
    </main>
  );
}
