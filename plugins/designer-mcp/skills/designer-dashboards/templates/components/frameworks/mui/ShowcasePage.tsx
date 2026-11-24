import * as React from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { Activity, DollarSign, Download, Plus, ShieldCheck, Users } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  ChartCard,
  DataTable,
  Dialog,
  Input,
  KpiCard,
  Select,
  Tabs,
  type BadgeTone,
} from './ui';

interface TenantRecord {
  id: string;
  organization: string;
  region: string;
  plan: 'Enterprise' | 'Scale' | 'Core';
  mrr: number;
  status: 'Active' | 'Review' | 'Suspended';
  uptime: string;
}

const TENANTS: TenantRecord[] = [
  { id: 'TN-1042', organization: 'Northstar Logistics', region: 'us-east-1', plan: 'Enterprise', mrr: 18400, status: 'Active', uptime: '99.99%' },
  { id: 'TN-1043', organization: 'Meridian Health Systems', region: 'eu-central-1', plan: 'Enterprise', mrr: 24900, status: 'Active', uptime: '99.98%' },
  { id: 'TN-1044', organization: 'Kestrel Robotics', region: 'ap-northeast-1', plan: 'Scale', mrr: 7200, status: 'Review', uptime: '99.91%' },
  { id: 'TN-1045', organization: 'Vanguard Financial', region: 'us-west-2', plan: 'Enterprise', mrr: 31500, status: 'Active', uptime: '100.0%' },
  { id: 'TN-1046', organization: 'Solstice Retail Group', region: 'eu-west-1', plan: 'Core', mrr: 2900, status: 'Suspended', uptime: '98.40%' },
  { id: 'TN-1047', organization: 'Helios Energy Cloud', region: 'us-east-1', plan: 'Scale', mrr: 9400, status: 'Active', uptime: '99.95%' },
];

const STATUS_TONE: Record<TenantRecord['status'], BadgeTone> = {
  Active: 'success',
  Review: 'warning',
  Suspended: 'error',
};

const COLUMNS: ColumnDef<TenantRecord, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Tenant ID',
    cell: (info) => (
      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {String(info.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: (info) => <Badge tone="neutral" label={String(info.getValue())} />,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: (info) => <Badge tone="primary" label={String(info.getValue())} />,
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: (info) => (
      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
        ${Number(info.getValue()).toLocaleString()}
      </Typography>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const status = info.getValue() as TenantRecord['status'];
      return <Badge tone={STATUS_TONE[status]} label={status} />;
    },
  },
  {
    accessorKey: 'uptime',
    header: 'SLA Uptime',
  },
];

export function ShowcasePage() {
  const [regionFilter, setRegionFilter] = React.useState('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [orgName, setOrgName] = React.useState('');
  const [orgPlan, setOrgPlan] = React.useState('Enterprise');

  const filteredTenants = React.useMemo(
    () =>
      regionFilter === 'all'
        ? TENANTS
        : TENANTS.filter((t) => t.region === regionFilter),
    [regionFilter],
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <div>
          <Typography variant="h4" fontWeight={700}>
            Enterprise Operations Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Material UI v7 + OpenDesign OKLCH tokens (no Tailwind CSS)
          </Typography>
        </div>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Select
            label="Region"
            value={regionFilter}
            onChange={(e) => setRegionFilter(String(e.target.value))}
            fullWidth={false}
            sx={{ minWidth: 160 }}
            options={[
              { value: 'all', label: 'All Regions' },
              { value: 'us-east-1', label: 'us-east-1' },
              { value: 'us-west-2', label: 'us-west-2' },
              { value: 'eu-central-1', label: 'eu-central-1' },
              { value: 'eu-west-1', label: 'eu-west-1' },
              { value: 'ap-northeast-1', label: 'ap-northeast-1' },
            ]}
          />
          <Button variant="outline" startIcon={<Download size={16} aria-hidden="true" />}>
            Export
          </Button>
          <Button
            variant="primary"
            startIcon={<Plus size={16} aria-hidden="true" />}
            onClick={() => setDialogOpen(true)}
          >
            New Tenant
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" title="SOC 2 Type II Audit Window">
        Automated compliance snapshots are scheduled every 6 hours across all active enterprise clusters.
      </Alert>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Monthly Recurring Revenue"
            value="$94,300"
            delta="+14.2%"
            trend="up"
            helperText="vs. prior 30 days"
            icon={<DollarSign size={18} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Active Enterprise Seats"
            value="12,840"
            delta="+6.8%"
            trend="up"
            helperText="across 48 organizations"
            icon={<Users size={18} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="P95 API Latency"
            value="42 ms"
            delta="-3.1%"
            trend="up"
            helperText="global edge median"
            icon={<Activity size={18} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Policy Compliance"
            value="99.94%"
            delta="0.0%"
            trend="neutral"
            helperText="0 critical findings"
            icon={<ShieldCheck size={18} />}
          />
        </Grid>
      </Grid>

      <Tabs
        items={[
          {
            value: 'overview',
            label: 'Revenue & Utilization',
            content: (
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <ChartCard
                    title="Net Revenue & Compute Cost"
                    subtitle="Trailing 6 months (USD thousands)"
                    type="area"
                    series={[
                      { name: 'Net Revenue', data: [64, 71, 76, 82, 89, 94.3] },
                      { name: 'Infra Cost', data: [18, 19, 20, 21, 22, 22.8] },
                    ]}
                    options={{
                      xaxis: { categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] },
                      stroke: { curve: 'smooth', width: 2 },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <ChartCard
                    title="Plan Mix"
                    subtitle="Share of active MRR"
                    type="donut"
                    series={[74.8, 16.6, 8.6]}
                    options={{
                      labels: ['Enterprise', 'Scale', 'Core'],
                      legend: { position: 'bottom' },
                    }}
                  />
                </Grid>
              </Grid>
            ),
          },
          {
            value: 'tenants',
            label: 'Tenant Directory',
            content: (
              <DataTable
                title="Enterprise Tenants"
                subtitle="Live SLA and billing status"
                data={filteredTenants}
                columns={COLUMNS}
              />
            ),
          },
        ]}
      />

      <DataTable
        title="Active Cluster Directory"
        subtitle="Sortable & filterable via TanStack Table + MUI Table"
        data={filteredTenants}
        columns={COLUMNS}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Provision Enterprise Tenant"
        description="Create an isolated workspace with dedicated KMS encryption keys."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setOrgName('');
                setDialogOpen(false);
              }}
            >
              Provision Workspace
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Input
            label="Organization Name"
            placeholder="e.g. Apex Global Holdings"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Select
            label="Subscription Tier"
            value={orgPlan}
            onChange={(e) => setOrgPlan(String(e.target.value))}
            options={[
              { value: 'Enterprise', label: 'Enterprise (Dedicated VPC)' },
              { value: 'Scale', label: 'Scale (Multi-AZ)' },
              { value: 'Core', label: 'Core (Standard)' },
            ]}
          />
        </Stack>
      </Dialog>
    </Stack>
  );
}
