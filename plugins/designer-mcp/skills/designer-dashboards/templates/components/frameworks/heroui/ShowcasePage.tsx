'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  DollarSign,
  Languages,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { HeroUIThemeProvider, useHeroUITheme } from './theme/HeroUIThemeProvider';
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

interface WorkspaceRow {
  id: string;
  workspace: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  mrr: number;
  seats: number;
  status: 'Active' | 'Trial' | 'At Risk';
}

const WORKSPACES: WorkspaceRow[] = [
  { id: 'ws-1', workspace: 'Acme Cloud', plan: 'Enterprise', mrr: 14800, seats: 142, status: 'Active' },
  { id: 'ws-2', workspace: 'Northstar AI', plan: 'Pro', mrr: 3200, seats: 38, status: 'Active' },
  { id: 'ws-3', workspace: 'Lumen Robotics', plan: 'Enterprise', mrr: 19400, seats: 210, status: 'Active' },
  { id: 'ws-4', workspace: 'Vanguard FinTech', plan: 'Pro', mrr: 2850, seats: 29, status: 'Trial' },
  { id: 'ws-5', workspace: 'Helios Bio', plan: 'Starter', mrr: 490, seats: 8, status: 'At Risk' },
  { id: 'ws-6', workspace: 'Kestrel Media', plan: 'Pro', mrr: 4100, seats: 54, status: 'Active' },
];

const COLUMNS: ColumnDef<WorkspaceRow, unknown>[] = [
  {
    accessorKey: 'workspace',
    header: 'Workspace',
    cell: ({ row }) => (
      <span className="font-medium text-[var(--color-text)]">{row.original.workspace}</span>
    ),
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => (
      <Badge tone={row.original.plan === 'Enterprise' ? 'primary' : 'neutral'} variant="soft" size="sm">
        {row.original.plan}
      </Badge>
    ),
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
          row.original.mrr,
        )}
      </span>
    ),
  },
  {
    accessorKey: 'seats',
    header: 'Seats',
    cell: ({ row }) => <span className="tabular-nums">{row.original.seats}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status;
      const tone = s === 'Active' ? 'success' : s === 'Trial' ? 'info' : 'warning';
      return (
        <Badge tone={tone} variant="soft" size="sm" dot>
          {s}
        </Badge>
      );
    },
  },
];

function ShowcaseContent() {
  const { resolvedTheme, toggleTheme, dir, toggleDir } = useHeroUITheme();
  const [range, setRange] = React.useState('30d');
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [showBanner, setShowBanner] = React.useState(true);

  return (
    <div
      style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-text)' }}
      className="min-h-screen p-6 md:p-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Revenue & Usage Overview</h1>
              <Badge tone="primary" variant="soft" size="sm" dot>
                HeroUI v3
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              React Aria + Tailwind CSS v4 bridged to OpenDesign OKLCH tokens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              aria-label="Date range"
              value={range}
              onChange={setRange}
              options={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
              ]}
              className="w-40"
            />
            <Button
              variant="outline"
              tone="neutral"
              size="md"
              iconOnly
              aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onPress={toggleTheme}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              size="md"
              iconOnly
              aria-label={`Switch text direction (current: ${dir.toUpperCase()})`}
              onPress={toggleDir}
            >
              <Languages className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="solid" tone="primary" size="md" onPress={() => setInviteOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              <span>New Workspace</span>
            </Button>
          </div>
        </header>

        {showBanner ? (
          <Alert
            tone="info"
            title="HeroUI v3 + OpenDesign Token Bridge Active"
            description="All surfaces, borders, focus rings, and chart palettes adapt automatically across all 21 OpenDesign presets."
            onDismiss={() => setShowBanner(false)}
          />
        ) : null}

        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Monthly Recurring Revenue"
            value={44840}
            format="currency"
            delta={14.2}
            deltaLabel="vs prior period"
            tone="primary"
            icon={<DollarSign className="size-5" />}
            sparkline={[28, 31, 30, 35, 38, 41, 45]}
          />
          <KpiCard
            label="Active Workspaces"
            value={1284}
            format="number"
            delta={8.6}
            deltaLabel="vs prior period"
            tone="success"
            icon={<Users className="size-5" />}
            sparkline={[980, 1020, 1090, 1140, 1190, 1240, 1284]}
          />
          <KpiCard
            label="API P95 Latency"
            value="42 ms"
            delta={-11.4}
            deltaLabel="faster"
            tone="info"
            icon={<Zap className="size-5" />}
            sparkline={[62, 58, 55, 51, 48, 44, 42]}
          />
          <KpiCard
            label="Net Retention"
            value={118.4}
            format="percent"
            delta={2.1}
            deltaLabel="NDR"
            tone="warning"
            icon={<Activity className="size-5" />}
            sparkline={[112, 113, 115, 114, 116, 117, 118.4]}
          />
        </section>

        <Tabs
          defaultValue="overview"
          items={[
            {
              id: 'overview',
              label: 'Revenue & Workspaces',
              badge: <Badge tone="primary" variant="soft" size="sm">Live</Badge>,
              content: (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  <ChartCard
                    className="lg:col-span-2"
                    title="MRR Growth"
                    description="Recurring revenue trajectory"
                    type="area"
                    series={[
                      { name: 'MRR ($k)', data: [28, 31, 34, 37, 40, 44.8] },
                      { name: 'Expansion ($k)', data: [6, 7, 8, 9.5, 11, 13.2] },
                    ]}
                    options={{
                      xaxis: { categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] },
                    }}
                  />
                  <DataTable
                    className="lg:col-span-3"
                    title="Top Workspaces"
                    description="Sortable & filterable via TanStack React Table"
                    data={WORKSPACES}
                    columns={COLUMNS}
                  />
                </div>
              ),
            },
            {
              id: 'components',
              label: 'UI Primitives',
              content: (
                <Card
                  title="HeroUI v3 Component Matrix"
                  description="Accessible React Aria primitives styled with OpenDesign tokens"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="solid" tone="primary">Primary Solid</Button>
                    <Button variant="tonal" tone="primary">Primary Tonal</Button>
                    <Button variant="outline" tone="neutral">Neutral Outline</Button>
                    <Button variant="ghost" tone="success">
                      <Sparkles className="size-4" aria-hidden="true" />
                      <span>Success Ghost</span>
                    </Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </Card>
              ),
            },
          ]}
        />

        <Dialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          title="Create Workspace"
          description="Provision a new SaaS tenant with HeroUI v3 + OpenDesign defaults."
          footer={
            <>
              <Button variant="outline" tone="neutral" onPress={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                tone="primary"
                onPress={() => {
                  setInviteOpen(false);
                  setInviteEmail('');
                }}
              >
                Create Workspace
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Owner Email"
              placeholder="founder@company.com"
              value={inviteEmail}
              onChange={setInviteEmail}
              description="An invitation link will be sent immediately."
            />
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export function ShowcasePage() {
  return (
    <HeroUIThemeProvider>
      <ShowcaseContent />
    </HeroUIThemeProvider>
  );
}
