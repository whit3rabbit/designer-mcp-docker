'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Gauge,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Alert,
  AnimatedNumber,
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
  InView,
  Input,
  KpiCard,
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  Select,
  SlidingNumber,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextEffect,
  TransitionPanel,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'deploying';
  updatedAt: string;
}

const DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-01', service: 'edge-gateway', region: 'us-east-1', latencyMs: 18, status: 'healthy', updatedAt: '2m ago' },
  { id: 'dep-02', service: 'auth-broker', region: 'eu-west-1', latencyMs: 24, status: 'healthy', updatedAt: '11m ago' },
  { id: 'dep-03', service: 'billing-worker', region: 'us-west-2', latencyMs: 62, status: 'degraded', updatedAt: '19m ago' },
  { id: 'dep-04', service: 'telemetry-ingest', region: 'ap-south-1', latencyMs: 31, status: 'deploying', updatedAt: 'Just now' },
  { id: 'dep-05', service: 'search-indexer', region: 'eu-central-1', latencyMs: 21, status: 'healthy', updatedAt: '45m ago' },
  { id: 'dep-06', service: 'webhook-dispatcher', region: 'us-east-1', latencyMs: 15, status: 'healthy', updatedAt: '1h ago' },
];

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  {
    accessorKey: 'service',
    header: 'Service',
    cell: ({ row }) => (
      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
        {row.original.service}
      </span>
    ),
  },
  {
    accessorKey: 'region',
    header: 'Region',
  },
  {
    accessorKey: 'latencyMs',
    header: 'P95 Latency',
    cell: ({ row }) => <span className="tabular-nums">{row.original.latencyMs} ms</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status;
      const tone = s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'info';
      return (
        <Badge tone={tone} dot pulse={s === 'deploying'}>
          {s}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
  },
];

const INSIGHT_PANELS = [
  {
    title: 'Edge Cache Hit Ratio',
    summary: '98.4% hit rate across 14 PoPs (+2.1% vs last week).',
    detail:
      'Stale-while-revalidate headers reduced origin egress by 412 GB over the past 24 hours without increasing P99 tail latency.',
  },
  {
    title: 'Worker Queue Depth',
    summary: '1,240 jobs/sec processed with zero dead-letter retries.',
    detail:
      'Autoscaler added 3 ephemeral workers in us-west-2 during the 14:00 UTC traffic spike and scaled back down in 4 minutes.',
  },
];

export function ShowcasePage() {
  const [range, setRange] = React.useState('7d');
  const [panelIdx, setPanelIdx] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [ruleName, setRuleName] = React.useState('');
  const [ruleSeverity, setRuleSeverity] = React.useState('warning');
  const [tick, setTick] = React.useState(1284);

  const revenue = range === '7d' ? 148920 : range === '30d' ? 612450 : 2190400;
  const activeUsers = range === '7d' ? tick : range === '30d' ? 18420 : 64190;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <Badge tone="primary" dot pulse>
              Live Telemetry
            </Badge>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Motion Primitives Showcase
            </span>
          </div>
          <TextEffect
            as="h1"
            per="word"
            preset="blur"
            className="mt-2 text-2xl font-bold tracking-tight"
          >
            Operational Intelligence Console
          </TextEffect>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Tabs value={range} onValueChange={setRange} variant="segmented" className="w-auto">
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            onClick={() => setTick((t) => t + Math.floor(Math.random() * 19) + 3)}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" aria-hidden="true" />
            New Alert Rule
          </Button>
        </div>
      </div>

      {/* Dismissible Alert */}
      <Alert
        tone="info"
        title="Reduced-motion aware"
        description="All springs, shared-element morphs, and number counters respect prefers-reduced-motion via MotionConfig."
        dismissible
      />

      {/* KPI Row */}
      <InView className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net Revenue"
          value={revenue}
          format="currency"
          delta={12.4}
          icon={<DollarSign className="size-5" />}
          tone="primary"
          sparkline={[42, 48, 45, 56, 61, 59, 72]}
        />
        <KpiCard
          label="Active Sessions"
          value={activeUsers}
          numberMode="sliding"
          delta={8.2}
          icon={<Users className="size-5" />}
          tone="success"
          sparkline={[18, 22, 24, 29, 27, 34, 38]}
        />
        <KpiCard
          label="Conversion Rate"
          value={4.8}
          format="percent"
          delta={1.1}
          icon={<Activity className="size-5" />}
          tone="info"
          sparkline={[3.9, 4.1, 4.0, 4.4, 4.6, 4.7, 4.8]}
        />
        <KpiCard
          label="Mean P95 Latency"
          value={24}
          delta={-6.5}
          deltaLabel="faster"
          icon={<Gauge className="size-5" />}
          tone="warning"
          sparkline={[34, 31, 29, 28, 26, 25, 24]}
        />
      </InView>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" variant="underline">
        <TabsList>
          <TabsTrigger value="overview">Overview &amp; Insights</TabsTrigger>
          <TabsTrigger value="pipelines">Service Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Throughput &amp; Error Budget"
              description="Requests per second across primary edge regions"
              type="area"
              height={290}
              series={[
                { name: 'Requests (k/s)', data: [31, 40, 28, 51, 42, 64, 58] },
                { name: 'Cached (k/s)', data: [24, 32, 22, 41, 35, 54, 50] },
              ]}
              options={{
                xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                stroke: { curve: 'smooth', width: 2 },
              }}
            />

            <div className="flex flex-col gap-4">
              {/* TransitionPanel Demo */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>Live Insights</CardTitle>
                    <div className="flex items-center gap-1">
                      {INSIGHT_PANELS.map((_, idx) => (
                        <Button
                          key={idx}
                          size="xs"
                          variant={panelIdx === idx ? 'solid' : 'ghost'}
                          tone={panelIdx === idx ? 'primary' : 'neutral'}
                          onClick={() => setPanelIdx(idx)}
                        >
                          {idx + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CardDescription>Smoothly switch between diagnostic cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransitionPanel activeIndex={panelIdx}>
                    {INSIGHT_PANELS.map((item) => (
                      <div key={item.title} className="space-y-2 text-start">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {item.title}
                        </p>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                          {item.summary}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </TransitionPanel>
                </CardContent>
              </Card>

              {/* MorphingDialog Demo */}
              <MorphingDialog>
                <MorphingDialogTrigger className="w-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                        <Sparkles className="size-3.5" aria-hidden="true" />
                        Shared-Element Morph
                      </div>
                      <MorphingDialogTitle className="mt-1.5 text-base">
                        Q4 Capacity Forecast
                      </MorphingDialogTitle>
                      <MorphingDialogDescription>
                        Click to expand projected cluster headroom (<AnimatedNumber value={99.94} maximumFractionDigits={2} />% SLA).
                      </MorphingDialogDescription>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                  </div>
                </MorphingDialogTrigger>

                <MorphingDialogContainer>
                  <MorphingDialogContent>
                    <MorphingDialogClose />
                    <MorphingDialogTitle>Q4 Capacity Forecast</MorphingDialogTitle>
                    <MorphingDialogDescription>
                      Projected cluster headroom and regional failover readiness.
                    </MorphingDialogDescription>
                    <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--color-text)' }}>
                      <p>
                        Current multi-region autoscaling maintains{' '}
                        <span className="font-semibold tabular-nums">38%</span> spare compute
                        headroom during peak weekday traffic.
                      </p>
                      <div
                        className="rounded-md border p-3 text-xs"
                        style={{
                          backgroundColor: 'var(--color-surface-subtle)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Recommended action: Pre-warm 2 additional read replicas in eu-west-1 ahead
                        of the scheduled product launch.
                      </div>
                    </div>
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipelines">
          <InView>
            <DataTable
              data={DEPLOYMENTS}
              columns={COLUMNS}
              searchPlaceholder="Filter services or regions..."
            />
          </InView>
        </TabsContent>
      </Tabs>

      {/* Create Alert Rule Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Alert Rule"
        description="Configure threshold notifications for latency or error spikes."
        footer={
          <>
            <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setRuleName('');
              }}
            >
              Save Rule
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Rule Name"
            placeholder="e.g. High P95 Latency on Edge"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            hint="Appears in Slack and PagerDuty incident payloads."
          />
          <Select
            label="Severity"
            value={ruleSeverity}
            onChange={setRuleSeverity}
            options={[
              { value: 'info', label: 'Informational' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Critical (Page On-Call)' },
            ]}
          />
        </div>
      </Dialog>
    </div>
  );
}
