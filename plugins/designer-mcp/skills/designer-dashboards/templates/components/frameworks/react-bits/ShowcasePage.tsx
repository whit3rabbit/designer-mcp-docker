'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Languages,
  Moon,
  Sparkles,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import { AuroraBackground } from './assets/AuroraBackground';
import { ClickSpark } from './assets/ClickSpark';
import { MagnetButton } from './assets/MagnetButton';
import { SplitText } from './assets/SplitText';
import { SpotlightCard } from './assets/SpotlightCard';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { ChartCard } from './ui/ChartCard';
import { DataTable } from './ui/DataTable';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { KpiCard } from './ui/KpiCard';
import { Select } from './ui/Select';
import { Tabs } from './ui/Tabs';
import { useMotionPreferences } from './theme/motionConfig';

interface DeploymentRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'idle';
}

const DEPLOYMENTS: DeploymentRow[] = [
  { id: '1', service: 'aurora-edge-gateway', region: 'us-east-1', latencyMs: 18, status: 'healthy' },
  { id: '2', service: 'shader-telemetry-api', region: 'eu-central-1', latencyMs: 24, status: 'healthy' },
  { id: '3', service: 'realtime-ingest-worker', region: 'ap-northeast-1', latencyMs: 63, status: 'degraded' },
  { id: '4', service: 'token-compiler-job', region: 'us-west-2', latencyMs: 12, status: 'healthy' },
  { id: '5', service: 'archive-snapshot-sync', region: 'eu-west-1', latencyMs: 41, status: 'idle' },
];

const COLUMNS: ColumnDef<DeploymentRow, unknown>[] = [
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
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
      const tone = s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'neutral';
      return (
        <Badge tone={tone} dot pulse={s === 'healthy'}>
          {s}
        </Badge>
      );
    },
  },
];

export function ShowcasePage() {
  const { prefersReducedMotion } = useMotionPreferences();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const [auroraMode, setAuroraMode] = React.useState<'canvas' | 'css'>('canvas');
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );
  const [isRtl, setIsRtl] = React.useState(() =>
    typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false,
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('rd-theme', next ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  };

  const toggleRtl = () => {
    const next = !isRtl;
    setIsRtl(next);
    document.documentElement.dir = next ? 'rtl' : 'ltr';
  };

  return (
    <ClickSpark className="min-h-screen">
      <AuroraBackground mode={auroraMode} className="min-h-screen">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-start">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary" dot pulse>
                  React Bits + OpenDesign
                </Badge>
                <Badge tone={prefersReducedMotion ? 'warning' : 'info'} variant="outline">
                  {prefersReducedMotion ? 'Reduced Motion Active' : 'Full Motion Active'}
                </Badge>
              </div>
              <SplitText
                as="h1"
                text="Animated Visual Command"
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              />
              <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-sm">
                Token-driven shader backgrounds, cursor spotlights, magnetic actions, and accessible data views.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                tone="neutral"
                size="sm"
                iconOnly
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
              </Button>

              <Button
                variant="outline"
                tone="neutral"
                size="sm"
                onClick={toggleRtl}
                aria-label={isRtl ? 'Switch to LTR layout' : 'Switch to RTL layout'}
              >
                <Languages className="size-4" aria-hidden="true" />
                {isRtl ? 'LTR' : 'RTL'}
              </Button>

              <MagnetButton onClick={() => setDialogOpen(true)}>
                <Sparkles className="size-4" aria-hidden="true" />
                Launch Action
              </MagnetButton>
            </div>
          </header>

          {showAlert && (
            <Alert
              tone="info"
              title="Click anywhere for ClickSpark"
              description="AuroraBackground, SpotlightCard, SplitText, and MagnetButton all bridge to OpenDesign CSS variables and honor prefers-reduced-motion."
              onClose={() => setShowAlert(false)}
            />
          )}

          {/* KPI Grid */}
          <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Active Sessions"
              value="24,890"
              delta="+14.2%"
              trend="up"
              caption="vs. previous 7 days"
              icon={<Users className="size-4" />}
            />
            <KpiCard
              label="Shader Frame Time"
              value="1.8 ms"
              delta="-0.4 ms"
              trend="up"
              caption="60 fps budget"
              icon={<Zap className="size-4" />}
            />
            <KpiCard
              label="Edge Throughput"
              value="98.4k/s"
              delta="+6.1%"
              trend="up"
              caption="global POPs"
              icon={<Activity className="size-4" />}
            />
            <KpiCard
              label="Error Budget"
              value="99.97%"
              delta="0.00%"
              trend="flat"
              caption="30-day SLO"
              icon={<Sparkles className="size-4" />}
            />
          </section>

          {/* Tabs: Analytics / Controls */}
          <Tabs
            defaultValue="analytics"
            items={[
              {
                id: 'analytics',
                label: 'Analytics',
                content: (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ChartCard
                      title="Interaction Velocity"
                      description="Token-colored ApexCharts series reacting to theme changes"
                      type="area"
                      categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                      series={[
                        { name: 'Sessions', data: [410, 520, 490, 680, 740, 810, 920] },
                        { name: 'Conversions', data: [140, 190, 175, 240, 290, 310, 365] },
                      ]}
                    />
                    <SpotlightCard className="flex flex-col justify-between p-6 text-start">
                      <div>
                        <CardTitle>Background Engine</CardTitle>
                        <CardDescription className="mt-1">
                          Switch between Canvas 2D shader-style blobs and pure CSS radial gradients.
                        </CardDescription>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Select
                          label="Aurora Mode"
                          value={auroraMode}
                          onChange={(e) => setAuroraMode(e.target.value as 'canvas' | 'css')}
                          options={[
                            { value: 'canvas', label: 'Canvas 2D Shader' },
                            { value: 'css', label: 'Pure CSS Gradients' },
                          ]}
                        />
                        <Input
                          label="Workspace Tag"
                          defaultValue="react-bits-v1"
                          hint="Synced with OpenDesign tokens"
                        />
                      </div>
                    </SpotlightCard>
                  </div>
                ),
              },
              {
                id: 'deployments',
                label: 'Deployments',
                content: (
                  <DataTable
                    title="Edge Service Telemetry"
                    data={DEPLOYMENTS}
                    columns={COLUMNS}
                    searchPlaceholder="Search services or regions..."
                  />
                ),
              },
              {
                id: 'primitives',
                label: 'UI Primitives',
                content: (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interactive States & Tones</CardTitle>
                      <CardDescription>
                        All buttons, badges, and inputs use OpenDesign OKLCH tokens.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3">
                      <Button variant="solid" tone="primary">Primary</Button>
                      <Button variant="tonal" tone="success">Success</Button>
                      <Button variant="outline" tone="warning">Warning</Button>
                      <Button variant="ghost" tone="error">Error</Button>
                      <MagnetButton variant="outline">Magnetic</MagnetButton>
                    </CardContent>
                  </Card>
                ),
              },
            ]}
          />

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="React Bits Action Modal"
            description="Accessible focus-trapped dialog with Motion spring transitions."
            footer={
              <>
                <Button variant="ghost" tone="neutral" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="solid" tone="primary" onClick={() => setDialogOpen(false)}>
                  Confirm
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <Input label="Deployment Name" placeholder="e.g. aurora-prod-01" />
              <Select
                label="Target Environment"
                defaultValue="production"
                options={[
                  { value: 'staging', label: 'Staging' },
                  { value: 'production', label: 'Production' },
                ]}
              />
            </div>
          </Dialog>
        </main>
      </AuroraBackground>
    </ClickSpark>
  );
}
