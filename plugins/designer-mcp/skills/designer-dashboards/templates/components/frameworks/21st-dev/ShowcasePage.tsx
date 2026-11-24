'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Blocks,
  CheckCircle2,
  Plus,
  Sparkles,
  Zap,
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
  Input,
  KpiCard,
  Select,
  Tabs,
} from './ui';

interface RegistryComponentRow {
  id: string;
  name: string;
  source: string;
  primitive: string;
  status: 'synced' | 'review' | 'draft';
  a11yScore: number;
  updatedAt: string;
}

const REGISTRY_ROWS: RegistryComponentRow[] = [
  {
    id: 'cmp-01',
    name: 'CommandActionBar',
    source: '@21st-dev/command-bar',
    primitive: '@base-ui/react/dialog',
    status: 'synced',
    a11yScore: 100,
    updatedAt: '2h ago',
  },
  {
    id: 'cmp-02',
    name: 'RevenueAreaCard',
    source: '@21st-dev/metric-area',
    primitive: 'react-apexcharts',
    status: 'synced',
    a11yScore: 98,
    updatedAt: '5h ago',
  },
  {
    id: 'cmp-03',
    name: 'WorkspaceRoleSelect',
    source: '@21st-dev/role-select',
    primitive: '@base-ui/react/select',
    status: 'review',
    a11yScore: 96,
    updatedAt: '1d ago',
  },
  {
    id: 'cmp-04',
    name: 'BillingUsageTable',
    source: '@21st-dev/usage-table',
    primitive: '@tanstack/react-table',
    status: 'synced',
    a11yScore: 100,
    updatedAt: '2d ago',
  },
  {
    id: 'cmp-05',
    name: 'AiPromptDrawer',
    source: '@21st-dev/prompt-drawer',
    primitive: '@base-ui/react/dialog',
    status: 'draft',
    a11yScore: 92,
    updatedAt: '3d ago',
  },
];

const STATUS_TONE: Record<RegistryComponentRow['status'], 'success' | 'warning' | 'neutral'> = {
  synced: 'success',
  review: 'warning',
  draft: 'neutral',
};

const COLUMNS: ColumnDef<RegistryComponentRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Component',
    cell: ({ row }) => (
      <div className="font-medium text-[var(--color-text)]">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'source',
    header: '21st.dev Registry',
    cell: ({ row }) => (
      <code className="rounded bg-[var(--color-surface-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
        {row.original.source}
      </code>
    ),
  },
  {
    accessorKey: 'primitive',
    header: 'Engine / Primitive',
  },
  {
    accessorKey: 'status',
    header: 'Token Sync',
    cell: ({ row }) => (
      <Badge tone={STATUS_TONE[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: 'a11yScore',
    header: 'WCAG AA',
    cell: ({ row }) => <span>{row.original.a11yScore}%</span>,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
  },
];

export function ShowcasePage() {
  const [showBanner, setShowBanner] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState('7d');
  const [componentName, setComponentName] = React.useState('');
  const [registrySlug, setRegistrySlug] = React.useState('@21st-dev/bento-grid');

  const chartCategories =
    timeframe === '7d'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const chartSeries =
    timeframe === '7d'
      ? [
          { name: 'AI Prototypes', data: [18, 24, 21, 32, 39, 35, 44] },
          { name: 'Registry Syncs', data: [12, 16, 19, 25, 29, 31, 38] },
        ]
      : [
          { name: 'AI Prototypes', data: [94, 128, 152, 189] },
          { name: 'Registry Syncs', data: [72, 101, 134, 166] },
        ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              21st.dev Prototyping Studio
            </h1>
            <Badge tone="primary">Base UI + OpenDesign</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            AI-assisted UI prototyping synchronized with OpenDesign OKLCH tokens and WCAG 2.1 AA primitives.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Timeframe"
            value={timeframe}
            onValueChange={setTimeframe}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
            ]}
            className="w-40"
          />
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Import from 21st.dev Registry"
            description="Scaffold a community component and bridge its tokens to design-system/styles.css."
            trigger={
              <Button variant="solid">
                <Plus className="size-4" aria-hidden="true" />
                <span>Add Component</span>
              </Button>
            }
            footer={
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="solid" onClick={() => setDialogOpen(false)}>
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span>Sync Component</span>
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <Input
                label="Component Name"
                placeholder="e.g. UsageQuotaCard"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                helperText="Exported into src/components/ui/ with TypeScript types."
              />
              <Select
                label="Registry Preset"
                value={registrySlug}
                onValueChange={setRegistrySlug}
                options={[
                  { value: '@21st-dev/bento-grid', label: '@21st-dev/bento-grid' },
                  { value: '@21st-dev/command-bar', label: '@21st-dev/command-bar' },
                  { value: '@21st-dev/pricing-table', label: '@21st-dev/pricing-table' },
                ]}
              />
            </div>
          </Dialog>
        </div>
      </header>

      {showBanner ? (
        <Alert
          tone="info"
          title="OpenDesign Token Bridge Active"
          onDismiss={() => setShowBanner(false)}
        >
          All 21st.dev registry imports automatically inherit <code className="font-mono">--color-canvas</code>,{' '}
          <code className="font-mono">--color-surface</code>, and <code className="font-mono">--chart-1..10</code> across light, dark, and RTL modes.
        </Alert>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
        <KpiCard
          title="AI Prototypes Shipped"
          value="189"
          delta="+24.5%"
          trend="up"
          subtitle="vs. prior period"
          icon={<Sparkles className="size-5" />}
        />
        <KpiCard
          title="Registry Components"
          value="42"
          delta="+8"
          trend="up"
          subtitle="Token-synced"
          icon={<Blocks className="size-5" />}
        />
        <KpiCard
          title="Prompt-to-UI Latency"
          value="1.4s"
          delta="-18%"
          trend="up"
          subtitle="Median generation"
          icon={<Zap className="size-5" />}
        />
        <KpiCard
          title="WCAG AA Compliance"
          value="99.2%"
          delta="Verified"
          trend="neutral"
          subtitle="Base UI primitives"
          icon={<CheckCircle2 className="size-5" />}
        />
      </section>

      <Tabs
        defaultValue="overview"
        items={[
          {
            value: 'overview',
            label: 'Velocity & Adoption',
            content: (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <ChartCard
                  className="lg:col-span-2"
                  title="Prototyping Velocity"
                  description="AI-generated screens vs. token-verified registry components"
                  type="area"
                  categories={chartCategories}
                  series={chartSeries}
                  headerAction={
                    <Badge tone="info">
                      <Activity className="size-3.5" aria-hidden="true" />
                      <span>Live Sync</span>
                    </Badge>
                  }
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Single-Engine Guardrails</CardTitle>
                    <CardDescription>Automated checks applied on every import</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-[var(--color-text-muted)]">
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
                      <span className="font-medium text-[var(--color-text)]">No Hardcoded Hexes</span>
                      <Badge tone="success">Passing</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
                      <span className="font-medium text-[var(--color-text)]">RTL Logical Spacing</span>
                      <Badge tone="success">Passing</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
                      <span className="font-medium text-[var(--color-text)]">Base UI Focus Ring</span>
                      <Badge tone="success">Passing</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            value: 'registry',
            label: 'Registry Inventory',
            content: (
              <DataTable
                title="Synced 21st.dev Components"
                description="Community components bridged to Designer Dashboards OpenDesign tokens"
                data={REGISTRY_ROWS}
                columns={COLUMNS}
                searchPlaceholder="Filter components..."
              />
            ),
          },
        ]}
      />
    </div>
  );
}
