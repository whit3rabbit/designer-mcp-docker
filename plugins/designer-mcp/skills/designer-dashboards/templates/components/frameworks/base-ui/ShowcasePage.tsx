'use client';

import * as React from 'react';
import { Popover } from '@base-ui/react/popover';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Bell,
  DollarSign,
  Languages,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';
import './theme/baseui.css';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
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

const SAMPLE_ROWS: DeploymentRow[] = [
  { id: 'dep-01', service: 'edge-gateway', region: 'us-east-1', status: 'healthy', latencyMs: 18, updatedAt: '2m ago' },
  { id: 'dep-02', service: 'billing-worker', region: 'eu-central-1', status: 'healthy', latencyMs: 42, updatedAt: '8m ago' },
  { id: 'dep-03', service: 'search-indexer', region: 'ap-southeast-1', status: 'degraded', latencyMs: 184, updatedAt: '14m ago' },
  { id: 'dep-04', service: 'auth-broker', region: 'us-west-2', status: 'healthy', latencyMs: 24, updatedAt: '21m ago' },
  { id: 'dep-05', service: 'telemetry-ingest', region: 'eu-west-1', status: 'building', latencyMs: 65, updatedAt: '29m ago' },
];

const REGION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'eu-central-1', label: 'EU Central (Frankfurt)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
];

const STATUS_BADGE_TONE = {
  healthy: 'success',
  degraded: 'warning',
  building: 'info',
} as const;

export function ShowcasePage() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [isRtl, setIsRtl] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(true);
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [projectError, setProjectError] = React.useState('');

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
    document.documentElement.setAttribute('dir', next ? 'rtl' : 'ltr');
  };

  const filteredRows = React.useMemo(() => {
    if (!selectedRegion || selectedRegion === 'all') return SAMPLE_ROWS;
    return SAMPLE_ROWS.filter((row) => row.region === selectedRegion);
  }, [selectedRegion]);

  const columns = React.useMemo<ColumnDef<DeploymentRow, unknown>[]>(
    () => [
      {
        accessorKey: 'service',
        header: 'Service',
        cell: (info) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {String(info.getValue())}
          </span>
        ),
      },
      { accessorKey: 'region', header: 'Region' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue() as DeploymentRow['status'];
          return (
            <Badge tone={STATUS_BADGE_TONE[val]} dot>
              {val}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'latencyMs',
        header: 'P95 Latency',
        cell: (info) => <span>{String(info.getValue())} ms</span>,
      },
      { accessorKey: 'updatedAt', header: 'Updated' },
    ],
    [],
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setProjectError('Workspace name is required.');
      return;
    }
    setProjectError('');
    setProjectName('');
    setDialogOpen(false);
  };

  return (
    <main className="bui-page">
      <header className="bui-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              Base UI Operations Console
            </h1>
            <Badge tone="primary" variant="tonal">
              @base-ui/react
            </Badge>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Headless accessible primitives styled with OpenDesign OKLCH tokens.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Popover.Root>
            <Popover.Trigger
              render={
                <Button variant="outline" tone="neutral" size="sm" iconOnly aria-label="Notifications">
                  <Bell size={16} aria-hidden="true" />
                </Button>
              }
            />
            <Popover.Portal>
              <Popover.Positioner className="bui-popover-positioner" sideOffset={8} align="end">
                <Popover.Popup className="bui-popover-popup">
                  <Popover.Title className="bui-popover-title">Cluster Notifications</Popover.Title>
                  <Popover.Description className="bui-popover-desc">
                    All 4 control-plane regions are operating within SLA thresholds.
                  </Popover.Description>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>

          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            onClick={toggleRtl}
            leftIcon={<Languages size={15} aria-hidden="true" />}
          >
            {isRtl ? 'LTR' : 'RTL'}
          </Button>

          <Button
            variant="outline"
            tone="neutral"
            size="sm"
            iconOnly
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </Button>

          <Button
            variant="solid"
            tone="primary"
            size="sm"
            leftIcon={<Plus size={15} aria-hidden="true" />}
            onClick={() => setDialogOpen(true)}
          >
            New Workspace
          </Button>
        </div>
      </header>

      {showAlert && (
        <Alert
          tone="info"
          title="Headless Design System Active"
          description="All interactive states use Base UI data attributes (data-open, data-selected, data-disabled) bridged to OpenDesign CSS variables."
          onDismiss={() => setShowAlert(false)}
        />
      )}

      <section className="bui-grid-4" aria-label="Key metrics">
        <KpiCard
          label="Monthly Recurring Revenue"
          value="$148,920"
          delta="+14.2%"
          trend="up"
          subtitle="vs last 30 days"
          icon={<DollarSign size={18} />}
        />
        <KpiCard
          label="Active Workspaces"
          value="3,842"
          delta="+6.8%"
          trend="up"
          subtitle="98.4% retention"
          icon={<Users size={18} />}
        />
        <KpiCard
          label="Median API Latency"
          value="28 ms"
          delta="-4.1%"
          trend="up"
          subtitle="global edge"
          icon={<Activity size={18} />}
        />
        <KpiCard
          label="Security Compliance"
          value="99.98%"
          delta="0.0%"
          trend="flat"
          subtitle="SOC2 & WCAG AA"
          icon={<ShieldCheck size={18} />}
        />
      </section>

      <section className="bui-grid-2" aria-label="Analytics charts">
        <ChartCard
          title="Request Throughput"
          description="Requests per minute across edge POPs"
          type="area"
          series={[
            { name: 'Production', data: [420, 490, 510, 580, 630, 690, 740] },
            { name: 'Staging', data: [120, 140, 135, 160, 155, 180, 195] },
          ]}
          options={{
            xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          }}
        />
        <ChartCard
          title="Traffic by Protocol"
          description="Distribution across transport layers"
          type="bar"
          series={[
            { name: 'Share (%)', data: [58, 27, 15] },
          ]}
          options={{
            xaxis: { categories: ['HTTPS/3', 'gRPC', 'WebSocket'] },
          }}
        />
      </section>

      <Card>
        <CardHeader
          title="Primitives & Telemetry"
          description="Switch tabs using keyboard arrow keys (Base UI Tabs)."
        />
        <CardContent>
          <Tabs
            variant="underline"
            items={[
              {
                value: 'deployments',
                label: 'Deployments',
                content: (
                  <DataTable
                    data={filteredRows}
                    columns={columns}
                    searchPlaceholder="Search services…"
                    toolbarEnd={
                      <div style={{ width: 220 }}>
                        <Select
                          aria-label="Filter by region"
                          options={REGION_OPTIONS}
                          value={selectedRegion}
                          onValueChange={setSelectedRegion}
                        />
                      </div>
                    }
                  />
                ),
              },
              {
                value: 'forms',
                label: 'Form Primitives',
                content: (
                  <div className="bui-grid-2" style={{ maxWidth: 720 }}>
                    <Input
                      label="API Endpoint"
                      placeholder="https://api.example.com/v1"
                      description="Validated via Base UI Field.Root"
                      required
                    />
                    <Select
                      label="Default Region"
                      options={REGION_OPTIONS.slice(1)}
                      defaultValue="us-east-1"
                      description="Accessible listbox with keyboard navigation"
                    />
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create Workspace"
        description="Provision an isolated tenant environment with OpenDesign token presets."
        footer={
          <>
            <Button variant="outline" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-workspace-form" variant="solid" tone="primary">
              Create Workspace
            </Button>
          </>
        }
      >
        <form id="create-workspace-form" onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Workspace Name"
            placeholder="e.g. acme-observability"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (projectError) setProjectError('');
            }}
            error={projectError}
            required
          />
          <Select
            label="Primary Region"
            options={REGION_OPTIONS.slice(1)}
            defaultValue="us-east-1"
          />
        </form>
      </Dialog>
    </main>
  );
}
