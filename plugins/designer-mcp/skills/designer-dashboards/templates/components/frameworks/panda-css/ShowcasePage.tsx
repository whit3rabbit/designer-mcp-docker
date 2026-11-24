'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Activity, DollarSign, Plus, ShieldCheck, Users } from 'lucide-react';
import { css } from 'styled-system/css';
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

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  status: 'healthy' | 'degraded' | 'building';
  latencyMs: number;
  updatedAt: string;
}

const DEPLOYMENTS: DeploymentRow[] = [
  { id: 'dep-101', service: 'edge-gateway', region: 'us-east-1', status: 'healthy', latencyMs: 18, updatedAt: '2m ago' },
  { id: 'dep-102', service: 'auth-worker', region: 'eu-west-1', status: 'healthy', latencyMs: 24, updatedAt: '7m ago' },
  { id: 'dep-103', service: 'analytics-ingest', region: 'ap-south-1', status: 'degraded', latencyMs: 142, updatedAt: '14m ago' },
  { id: 'dep-104', service: 'billing-webhook', region: 'us-west-2', status: 'building', latencyMs: 0, updatedAt: 'Just now' },
];

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const tone = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'info';
      return (
        <Badge tone={tone} dot>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    cell: ({ row }) => (
      <span className={css({ fontFamily: 'mono', fontSize: '12px' })}>
        {row.original.latencyMs ? `${row.original.latencyMs} ms` : '—'}
      </span>
    ),
  },
  { accessorKey: 'updatedAt', header: 'Updated' },
];

export function ShowcasePage() {
  const [region, setRegion] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [serviceName, setServiceName] = React.useState('');
  const [showBanner, setShowBanner] = React.useState(true);

  const filteredDeployments = React.useMemo(
    () => (region === 'all' ? DEPLOYMENTS : DEPLOYMENTS.filter((d) => d.region === region)),
    [region],
  );

  return (
    <main
      className={css({
        minHeight: '100vh',
        bg: 'canvas',
        color: 'text',
        paddingBlock: '32px',
        paddingInline: { base: '16px', md: '32px' },
      })}
    >
      <div
        className={css({
          maxWidth: '1280px',
          marginInline: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        })}
      >
        <header
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          })}
        >
          <div>
            <h1 className={css({ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em' })}>
              Panda CSS + Base UI Console
            </h1>
            <p className={css({ fontSize: '14px', color: 'textMuted', marginTop: '4px' })}>
              Zero-runtime atomic CSS compiled at build time with OpenDesign semantic tokens.
            </p>
          </div>

          <div className={css({ display: 'flex', alignItems: 'center', gap: '10px' })}>
            <div className={css({ width: '180px' })}>
              <Select
                aria-label="Filter by region"
                value={region}
                onValueChange={(val) => setRegion(val ?? 'all')}
                options={[
                  { value: 'all', label: 'All regions' },
                  { value: 'us-east-1', label: 'us-east-1' },
                  { value: 'us-west-2', label: 'us-west-2' },
                  { value: 'eu-west-1', label: 'eu-west-1' },
                  { value: 'ap-south-1', label: 'ap-south-1' },
                ]}
              />
            </div>

            <Dialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Deploy New Service"
              description="Provision a zero-runtime edge service in your workspace."
              trigger={
                <Button variant="solid" tone="primary">
                  <Plus size={16} aria-hidden="true" />
                  New Service
                </Button>
              }
              footer={
                <>
                  <Button variant="outline" tone="neutral" onClick={() => setDialogOpen(false)}>
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
                    Create Service
                  </Button>
                </>
              }
            >
              <Input
                label="Service Identifier"
                placeholder="e.g. search-indexer"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                helperText="Lowercase alphanumeric characters and hyphens only."
              />
            </Dialog>
          </div>
        </header>

        {showBanner && (
          <Alert
            tone="info"
            title="Zero-runtime CSS extraction active"
            onDismiss={() => setShowBanner(false)}
          >
            All styles are statically extracted into `@layer utilities` and bridged to OpenDesign
            CSS custom properties.
          </Alert>
        )}

        <section
          aria-label="Key metrics"
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: '16px',
          })}
        >
          <KpiCard
            title="Monthly Recurring Revenue"
            value="$84,290"
            delta="+14.2%"
            trend="up"
            subtitle="vs last 30d"
            icon={<DollarSign size={18} />}
          />
          <KpiCard
            title="Active Workspaces"
            value="3,412"
            delta="+6.8%"
            trend="up"
            subtitle="vs last 30d"
            icon={<Users size={18} />}
          />
          <KpiCard
            title="P95 Edge Latency"
            value="21 ms"
            delta="-3.1%"
            trend="up"
            subtitle="faster than baseline"
            icon={<Activity size={18} />}
          />
          <KpiCard
            title="SLA Compliance"
            value="99.98%"
            delta="0.00%"
            trend="flat"
            subtitle="30-day rolling"
            icon={<ShieldCheck size={18} />}
          />
        </section>

        <Tabs
          items={[
            {
              value: 'overview',
              label: 'Overview',
              content: (
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
                    gap: '16px',
                  })}
                >
                  <ChartCard
                    title="Request Throughput"
                    description="Edge requests per minute across active regions"
                    type="area"
                    series={[
                      { name: 'Edge Gateway', data: [42, 48, 55, 51, 63, 72, 68] },
                      { name: 'Auth Worker', data: [21, 24, 28, 27, 34, 38, 36] },
                    ]}
                    options={{
                      xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                    }}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle>Recipe Variants</CardTitle>
                      <CardDescription>
                        Panda CSS `cva` button and badge recipes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '12px' })}>
                      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '8px' })}>
                        <Button variant="solid" tone="primary" size="sm">Solid</Button>
                        <Button variant="tonal" tone="primary" size="sm">Tonal</Button>
                        <Button variant="outline" tone="neutral" size="sm">Outline</Button>
                        <Button variant="ghost" tone="neutral" size="sm">Ghost</Button>
                      </div>
                      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '8px' })}>
                        <Badge tone="success" dot>Operational</Badge>
                        <Badge tone="warning" dot>Degraded</Badge>
                        <Badge tone="error" dot>Incident</Badge>
                        <Badge tone="info" dot>Deploying</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ),
            },
            {
              value: 'deployments',
              label: 'Deployments',
              content: (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Deployments</CardTitle>
                    <CardDescription>
                      Sortable and filterable TanStack Table styled with Panda CSS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={filteredDeployments}
                      columns={COLUMNS}
                      searchPlaceholder="Search services or regions..."
                    />
                  </CardContent>
                </Card>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}
