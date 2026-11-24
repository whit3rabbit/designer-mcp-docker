'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Cpu,
  Layers,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  Alert,
  BackgroundBeams,
  Badge,
  Button,
  Card,
  CardBody,
  CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardItem,
  CardTitle,
  ChartCard,
  DataTable,
  Dialog,
  FloatingDock,
  Input,
  KpiCard,
  MovingBorderBox,
  MovingBorderButton,
  Select,
  Spotlight,
  Tabs,
  type FloatingDockItem,
  type TabItem,
} from './ui';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
  throughput: string;
  status: 'healthy' | 'degraded' | 'scaling';
  updatedAt: string;
}

const INITIAL_DEPLOYMENTS: DeploymentRow[] = [
  {
    id: 'dep-01',
    service: 'edge-inference-v4',
    region: 'us-east-1',
    latencyMs: 18,
    throughput: '42.8k req/s',
    status: 'healthy',
    updatedAt: '2m ago',
  },
  {
    id: 'dep-02',
    service: 'vector-index-sync',
    region: 'eu-central-1',
    latencyMs: 31,
    throughput: '19.4k req/s',
    status: 'scaling',
    updatedAt: '6m ago',
  },
  {
    id: 'dep-03',
    service: 'realtime-stream-hub',
    region: 'ap-northeast-1',
    latencyMs: 24,
    throughput: '31.2k req/s',
    status: 'healthy',
    updatedAt: '11m ago',
  },
  {
    id: 'dep-04',
    service: 'billing-ledger-worker',
    region: 'us-west-2',
    latencyMs: 67,
    throughput: '6.1k req/s',
    status: 'degraded',
    updatedAt: '19m ago',
  },
  {
    id: 'dep-05',
    service: 'auth-token-signer',
    region: 'eu-west-1',
    latencyMs: 12,
    throughput: '54.0k req/s',
    status: 'healthy',
    updatedAt: '25m ago',
  },
];

const STATUS_TONE: Record<DeploymentRow['status'], 'success' | 'warning' | 'info'> = {
  healthy: 'success',
  scaling: 'info',
  degraded: 'warning',
};

export function ShowcasePage() {
  const [deployments, setDeployments] = React.useState<DeploymentRow[]>(INITIAL_DEPLOYMENTS);
  const [activeDock, setActiveDock] = React.useState('overview');
  const [activeTab, setActiveTab] = React.useState('telemetry');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(true);
  const [serviceName, setServiceName] = React.useState('');
  const [region, setRegion] = React.useState('us-east-1');

  const columns = React.useMemo<ColumnDef<DeploymentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'service',
        header: 'Service',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.service}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {row.original.id}
            </span>
          </div>
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
        accessorKey: 'throughput',
        header: 'Throughput',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={STATUS_TONE[row.original.status]} dot>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
      },
    ],
    [],
  );

  const dockItems: FloatingDockItem[] = [
    {
      id: 'overview',
      label: 'Telemetry',
      icon: <Activity className="size-4" />,
      active: activeDock === 'overview',
      onSelect: () => {
        setActiveDock('overview');
        setActiveTab('telemetry');
      },
    },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: <Layers className="size-4" />,
      active: activeDock === 'deployments',
      onSelect: () => {
        setActiveDock('deployments');
        setActiveTab('deployments');
      },
    },
    {
      id: 'primitives',
      label: '3D & Controls',
      icon: <Sparkles className="size-4" />,
      active: activeDock === 'primitives',
      onSelect: () => {
        setActiveDock('primitives');
        setActiveTab('controls');
      },
    },
    {
      id: 'launch',
      label: 'New Service',
      icon: <Rocket className="size-4" />,
      onSelect: () => setDialogOpen(true),
    },
  ];

  const handleCreateDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;
    setDeployments((prev) => [
      {
        id: `dep-0${prev.length + 1}`,
        service: serviceName.trim().toLowerCase().replace(/\s+/g, '-'),
        region,
        latencyMs: 19,
        throughput: '12.5k req/s',
        status: 'scaling',
        updatedAt: 'just now',
      },
      ...prev,
    ]);
    setServiceName('');
    setDialogOpen(false);
  };

  const tabs: TabItem[] = [
    {
      id: 'telemetry',
      label: 'Telemetry & Bento',
      icon: <Activity className="size-4" />,
      content: (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ChartCard
              spotlight
              title="Inference & Edge Throughput"
              description="Requests per second across global POPs (last 7 intervals)"
              type="area"
              categories={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']}
              series={[
                { name: 'Edge Inference', data: [31, 40, 28, 51, 42, 69, 76] },
                { name: 'Vector Sync', data: [15, 22, 19, 34, 29, 44, 52] },
              ]}
              action={<Badge tone="primary">Live</Badge>}
            />
          </div>

          <div className="lg:col-span-4">
            <CardContainer className="w-full">
              <CardBody className="flex flex-col justify-between gap-5">
                <div className="flex items-start justify-between gap-2">
                  <CardItem translateZ={30}>
                    <Badge tone="info" dot>
                      3D Interactive Card
                    </Badge>
                  </CardItem>
                  <CardItem translateZ={40}>
                    <Cpu className="size-5" style={{ color: 'var(--color-primary)' }} />
                  </CardItem>
                </div>

                <div className="space-y-2">
                  <CardItem translateZ={45}>
                    <h3 className="text-lg font-semibold">Neural Edge Cluster</h3>
                  </CardItem>
                  <CardItem translateZ={25}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      Pointer-tracked 3D perspective layers with automatic{' '}
                      <code>prefers-reduced-motion</code> fallback and OpenDesign surface tokens.
                    </p>
                  </CardItem>
                </div>

                <CardItem translateZ={35} className="w-full">
                  <MovingBorderBox innerClassName="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-medium">Cluster Utilization</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary)' }}>
                      84.2%
                    </span>
                  </MovingBorderBox>
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
        </div>
      ),
    },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: <Terminal className="size-4" />,
      badge: deployments.length,
      content: (
        <DataTable
          data={deployments}
          columns={columns}
          searchPlaceholder="Search services or regions…"
          toolbarExtra={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Deploy Service
            </Button>
          }
        />
      ),
    },
    {
      id: 'controls',
      label: 'Interactive Controls',
      icon: <Sparkles className="size-4" />,
      content: (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card spotlight>
            <CardHeader>
              <CardTitle>Button & Badge Variants</CardTitle>
              <CardDescription>
                Motion tap/hover springs, shimmer actions, and semantic OpenDesign tones.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button variant="solid" tone="primary">
                Primary Solid
              </Button>
              <Button variant="shimmer" tone="primary">
                <Sparkles className="size-4" aria-hidden="true" />
                Shimmer CTA
              </Button>
              <Button variant="tonal" tone="success">
                Tonal Success
              </Button>
              <Button variant="outline" tone="neutral">
                Neutral Outline
              </Button>
              <MovingBorderButton onClick={() => setDialogOpen(true)}>
                <Zap className="size-4" aria-hidden="true" />
                Moving Border
              </MovingBorderButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token-Wired Form Primitives</CardTitle>
              <CardDescription>
                WCAG 2.1 AA inputs and selects with RTL-safe logical spacing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Workspace Slug" placeholder="acme-studio" hint="Lowercase alphanumeric" />
              <Select
                label="Target Region"
                value={region}
                onChange={setRegion}
                options={[
                  { value: 'us-east-1', label: 'US East (N. Virginia)' },
                  { value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
                  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col gap-6 pb-24">
      <section
        className="relative overflow-hidden border p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Spotlight className="-top-40 start-0 md:-top-24 md:start-40" />
        <BackgroundBeams />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <Badge tone="primary" variant="tonal" dot>
              Aceternity UI × OpenDesign
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Creative Motion &amp; Bento Telemetry Studio
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Interactive 3D perspective cards, cursor spotlights, animated beams, and floating dock
              navigation — fully wired to OpenDesign light/dark tokens and{' '}
              <code>prefers-reduced-motion</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MovingBorderButton onClick={() => setDialogOpen(true)}>
              <Rocket className="size-4" aria-hidden="true" />
              Launch Pipeline
            </MovingBorderButton>
            <Button variant="outline" tone="neutral" onClick={() => setActiveTab('deployments')}>
              View Deployments
            </Button>
          </div>
        </div>
      </section>

      {alertVisible && (
        <Alert
          tone="info"
          title="Reduced-Motion Aware"
          description="All 3D tilts, spotlights, beams, and dock springs automatically respect prefers-reduced-motion."
          dismissible
          onDismiss={() => setAlertVisible(false)}
        />
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Active Edge Requests"
          value="1.48M"
          delta="+14.2%"
          deltaLabel="vs last 24h"
          trend="up"
          icon={<Zap className="size-4" />}
          sparkline={[24, 30, 28, 36, 44, 41, 56]}
        />
        <KpiCard
          title="Median P95 Latency"
          value="18.4 ms"
          delta="-6.1%"
          deltaLabel="faster"
          trend="up"
          icon={<Activity className="size-4" />}
          sparkline={[32, 29, 27, 25, 22, 20, 18]}
        />
        <KpiCard
          title="Cluster Availability"
          value="99.98%"
          delta="SLA met"
          deltaLabel="30-day rolling"
          trend="flat"
          icon={<ShieldCheck className="size-4" />}
          sparkline={[99.9, 99.95, 99.97, 99.98, 99.98, 99.99, 99.98]}
        />
        <KpiCard
          title="GPU Memory Pressure"
          value="71.3%"
          delta="+4.8%"
          deltaLabel="auto-scaling armed"
          trend="down"
          icon={<Cpu className="size-4" />}
          sparkline={[52, 55, 60, 63, 66, 69, 71]}
        />
      </section>

      <Tabs items={tabs} value={activeTab} onValueChange={setActiveTab} variant="pill" />

      <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingDock items={dockItems} ariaLabel="Showcase quick navigation" />
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Launch New Edge Service"
        description="Provision an animated telemetry endpoint in your selected region."
        footer={
          <>
            <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="launch-service-form">
              Deploy Now
            </Button>
          </>
        }
      >
        <form id="launch-service-form" onSubmit={handleCreateDeployment} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. semantic-router-v2"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />
          <Select
            label="Deployment Region"
            value={region}
            onChange={setRegion}
            options={[
              { value: 'us-east-1', label: 'us-east-1 (N. Virginia)' },
              { value: 'eu-central-1', label: 'eu-central-1 (Frankfurt)' },
              { value: 'ap-northeast-1', label: 'ap-northeast-1 (Tokyo)' },
            ]}
          />
        </form>
      </Dialog>
    </div>
  );
}
