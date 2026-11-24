'use client';

import * as React from 'react';
import { Col, Flex, Row, Space, Typography } from 'antd';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Building2,
  CreditCard,
  Download,
  Languages,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Users,
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
  type BadgeTone,
} from './ui';

interface TenantRecord {
  id: string;
  name: string;
  region: string;
  plan: 'Enterprise' | 'Growth' | 'Starter';
  seats: number;
  mrr: number;
  status: 'active' | 'trial' | 'suspended';
  updatedAt: string;
}

const INITIAL_TENANTS: TenantRecord[] = [
  { id: 'TN-1042', name: 'Northstar Logistics', region: 'us-east-1', plan: 'Enterprise', seats: 148, mrr: 14800, status: 'active', updatedAt: '2026-11-22' },
  { id: 'TN-1041', name: 'Vanguard BioLabs', region: 'eu-central-1', plan: 'Enterprise', seats: 96, mrr: 9600, status: 'active', updatedAt: '2026-11-22' },
  { id: 'TN-1040', name: 'Kestrel FinTech', region: 'us-west-2', plan: 'Growth', seats: 42, mrr: 2520, status: 'trial', updatedAt: '2026-11-21' },
  { id: 'TN-1039', name: 'Solstice Retail Group', region: 'ap-southeast-1', plan: 'Enterprise', seats: 210, mrr: 21000, status: 'active', updatedAt: '2026-11-20' },
  { id: 'TN-1038', name: 'Meridian Freight', region: 'eu-west-1', plan: 'Starter', seats: 14, mrr: 490, status: 'suspended', updatedAt: '2026-11-19' },
  { id: 'TN-1037', name: 'Helios Energy Ops', region: 'us-east-1', plan: 'Growth', seats: 64, mrr: 3840, status: 'active', updatedAt: '2026-11-18' },
];

const STATUS_TONE: Record<TenantRecord['status'], BadgeTone> = {
  active: 'success',
  trial: 'info',
  suspended: 'error',
};

export function ShowcasePage() {
  const [tenants, setTenants] = React.useState<TenantRecord[]>(INITIAL_TENANTS);
  const [selectedCount, setSelectedCount] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newRegion, setNewRegion] = React.useState('us-east-1');
  const [newPlan, setNewPlan] = React.useState<TenantRecord['plan']>('Growth');
  const [formError, setFormError] = React.useState<string | undefined>();
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark',
  );
  const [isRtl, setIsRtl] = React.useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl',
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    root.setAttribute('data-theme', next ? 'dark' : 'light');
    root.classList.toggle('dark', next);
    try {
      localStorage.setItem('rd-theme', next ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  };

  const toggleDirection = () => {
    const next = !isRtl;
    setIsRtl(next);
    document.documentElement.setAttribute('dir', next ? 'rtl' : 'ltr');
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Organization name is required.');
      return;
    }
    const created: TenantRecord = {
      id: `TN-${1043 + tenants.length}`,
      name: newName.trim(),
      region: newRegion,
      plan: newPlan,
      seats: newPlan === 'Enterprise' ? 100 : newPlan === 'Growth' ? 35 : 10,
      mrr: newPlan === 'Enterprise' ? 10000 : newPlan === 'Growth' ? 2100 : 350,
      status: 'active',
      updatedAt: '2026-11-23',
    };
    setTenants((prev) => [created, ...prev]);
    setNewName('');
    setFormError(undefined);
    setDialogOpen(false);
  };

  const columns = React.useMemo<ColumnDef<TenantRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Tenant ID',
        cell: ({ getValue }) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Organization',
        cell: ({ getValue }) => <span style={{ fontWeight: 600 }}>{String(getValue())}</span>,
      },
      {
        accessorKey: 'region',
        header: 'Region',
      },
      {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ getValue }) => {
          const plan = getValue() as TenantRecord['plan'];
          return (
            <Badge tone={plan === 'Enterprise' ? 'primary' : 'neutral'} variant="outline" size="xs">
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'seats',
        header: 'Seats',
      },
      {
        accessorKey: 'mrr',
        header: 'MRR',
        cell: ({ getValue }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(Number(getValue())),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as TenantRecord['status'];
          return (
            <Badge tone={STATUS_TONE[status]} variant="dot" size="sm">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
      },
    ],
    [],
  );

  return (
    <Flex vertical gap={20}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div>
          <Typography.Title level={3} style={{ margin: 0, color: 'var(--color-text)' }}>
            Enterprise Operations Console
          </Typography.Title>
          <Typography.Text style={{ color: 'var(--color-text-muted)' }}>
            Ant Design + OpenDesign OKLCH tokens · Data-heavy admin workspace
          </Typography.Text>
        </div>

        <Space wrap>
          <Button
            variant="outline"
            tone="neutral"
            iconOnly
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </Button>
          <Button
            variant="outline"
            tone="neutral"
            onClick={toggleDirection}
            aria-label={isRtl ? 'Switch to LTR layout' : 'Switch to RTL layout'}
          >
            <Languages size={16} aria-hidden="true" />
            <span>{isRtl ? 'RTL' : 'LTR'}</span>
          </Button>
          <Button variant="solid" tone="primary" onClick={() => setDialogOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            <span>New Tenant</span>
          </Button>
        </Space>
      </Flex>

      <Alert tone="info" variant="tonal" title="Scheduled Maintenance Window" dismissible>
        EU-Central-1 read replicas will undergo zero-downtime index compaction on Sunday at 02:00 UTC.
      </Alert>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="Monthly Recurring Revenue"
            value={52250}
            format="currency"
            delta={14.2}
            deltaLabel="vs last month"
            tone="primary"
            icon={<CreditCard size={18} aria-hidden="true" />}
            sparkline={[38, 41, 40, 44, 47, 49, 52]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="Active Provisioned Seats"
            value={574}
            format="number"
            delta={8.6}
            deltaLabel="across 6 orgs"
            tone="success"
            icon={<Users size={18} aria-hidden="true" />}
            sparkline={[480, 495, 510, 525, 540, 560, 574]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="API SLA Compliance"
            value={99.96}
            format="percent"
            delta={0.1}
            deltaLabel="30d rolling"
            tone="info"
            icon={<ShieldCheck size={18} aria-hidden="true" />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="Median Query Latency"
            value="42 ms"
            delta={-11.4}
            deltaLabel="faster p50"
            tone="warning"
            icon={<Activity size={18} aria-hidden="true" />}
            sparkline={[54, 51, 49, 46, 45, 43, 42]}
          />
        </Col>
      </Row>

      <Tabs
        variant="segmented"
        defaultValue="tenants"
        items={[
          {
            key: 'tenants',
            label: 'Tenant Directory',
            icon: <Building2 size={15} aria-hidden="true" />,
            children: (
              <Card
                title="Provisioned Organizations"
                subtitle="Sortable, filterable, multi-select TanStack Table rendered with Ant Design"
                headerExtra={
                  <Button variant="outline" tone="neutral" size="sm">
                    <Download size={14} aria-hidden="true" />
                    <span>Export CSV{selectedCount > 0 ? ` (${selectedCount})` : ''}</span>
                  </Button>
                }
              >
                <DataTable
                  data={tenants}
                  columns={columns}
                  selectable
                  pageSize={5}
                  searchPlaceholder="Filter by organization, ID, or region…"
                  onSelectionChange={(rows) => setSelectedCount(rows.length)}
                />
              </Card>
            ),
          },
          {
            key: 'analytics',
            label: 'Usage Telemetry',
            icon: <Activity size={15} aria-hidden="true" />,
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <ChartCard
                    title="API Throughput & Ingestion Volume"
                    subtitle="Requests per minute (thousands) across primary clusters"
                    type="area"
                    categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                    series={[
                      { name: 'US-East', data: [42, 48, 51, 56, 63, 49, 58] },
                      { name: 'EU-Central', data: [28, 32, 35, 39, 41, 33, 37] },
                    ]}
                  />
                </Col>
                <Col xs={24} lg={8}>
                  <ChartCard
                    title="Revenue by Tier"
                    subtitle="Current billing cycle distribution"
                    type="donut"
                    series={[45400, 6360, 490]}
                    options={{
                      labels: ['Enterprise', 'Growth', 'Starter'],
                    }}
                  />
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setFormError(undefined);
        }}
        title="Provision New Tenant"
        description="Create an isolated workspace with OpenDesign defaults."
        size="sm"
        footer={
          <Space>
            <Button variant="outline" tone="neutral" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" tone="primary" onClick={handleCreateTenant}>
              Create Tenant
            </Button>
          </Space>
        }
      >
        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Organization Name"
            placeholder="e.g. Borealis Systems"
            required
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (formError) setFormError(undefined);
            }}
            error={formError}
          />
          <Select
            label="Primary Region"
            value={newRegion}
            onChange={(val) => setNewRegion(val)}
            options={[
              { label: 'US East (us-east-1)', value: 'us-east-1' },
              { label: 'US West (us-west-2)', value: 'us-west-2' },
              { label: 'EU Central (eu-central-1)', value: 'eu-central-1' },
              { label: 'AP Southeast (ap-southeast-1)', value: 'ap-southeast-1' },
            ]}
          />
          <Select
            label="Subscription Plan"
            value={newPlan}
            onChange={(val) => setNewPlan(val)}
            options={[
              { label: 'Enterprise ($100/seat)', value: 'Enterprise' },
              { label: 'Growth ($60/seat)', value: 'Growth' },
              { label: 'Starter ($35/seat)', value: 'Starter' },
            ]}
          />
        </form>
      </Dialog>
    </Flex>
  );
}
