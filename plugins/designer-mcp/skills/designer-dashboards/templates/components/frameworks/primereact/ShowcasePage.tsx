import * as React from 'react';
import { Activity, DollarSign, Languages, Moon, Plus, ShieldCheck, Sun, Users } from 'lucide-react';
import { usePrimeTheme } from './theme/PrimeThemeProvider';
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
  type DataTableColumn,
} from './ui';

interface EnterpriseAccount extends Record<string, unknown> {
  id: string;
  organization: string;
  region: string;
  tier: 'Enterprise' | 'Growth' | 'Starter';
  mrr: number;
  seats: number;
  status: 'Active' | 'Trial' | 'At Risk';
  updatedAt: string;
}

const INITIAL_ACCOUNTS: EnterpriseAccount[] = [
  { id: 'ACC-1041', organization: 'Northstar Logistics', region: 'NA-East', tier: 'Enterprise', mrr: 18400, seats: 240, status: 'Active', updatedAt: '2026-11-22' },
  { id: 'ACC-1042', organization: 'Helios Biotech', region: 'EU-Central', tier: 'Enterprise', mrr: 24900, seats: 310, status: 'Active', updatedAt: '2026-11-21' },
  { id: 'ACC-1043', organization: 'Vanguard Retail Group', region: 'NA-West', tier: 'Growth', mrr: 6200, seats: 85, status: 'Trial', updatedAt: '2026-11-20' },
  { id: 'ACC-1044', organization: 'Meridian FinTech', region: 'APAC-SG', tier: 'Enterprise', mrr: 31500, seats: 420, status: 'Active', updatedAt: '2026-11-19' },
  { id: 'ACC-1045', organization: 'Cinder Cloud Ops', region: 'EU-West', tier: 'Growth', mrr: 4800, seats: 62, status: 'At Risk', updatedAt: '2026-11-18' },
  { id: 'ACC-1046', organization: 'Aurora Energy Grid', region: 'NA-East', tier: 'Enterprise', mrr: 22100, seats: 275, status: 'Active', updatedAt: '2026-11-17' },
  { id: 'ACC-1047', organization: 'Kestrel Aerospace', region: 'EU-Central', tier: 'Starter', mrr: 1950, seats: 24, status: 'Active', updatedAt: '2026-11-16' },
  { id: 'ACC-1048', organization: 'Solstice Media', region: 'NA-West', tier: 'Growth', mrr: 7400, seats: 96, status: 'Trial', updatedAt: '2026-11-15' },
  { id: 'ACC-1049', organization: 'Boreal Robotics', region: 'APAC-JP', tier: 'Enterprise', mrr: 19800, seats: 215, status: 'Active', updatedAt: '2026-11-14' },
];

const STATUS_TONE: Record<EnterpriseAccount['status'], BadgeTone> = {
  Active: 'success',
  Trial: 'info',
  'At Risk': 'warning',
};

const REGION_OPTIONS = [
  { label: 'NA-East', value: 'NA-East' },
  { label: 'NA-West', value: 'NA-West' },
  { label: 'EU-Central', value: 'EU-Central' },
  { label: 'EU-West', value: 'EU-West' },
  { label: 'APAC-SG', value: 'APAC-SG' },
];

const TIER_OPTIONS = [
  { label: 'Enterprise', value: 'Enterprise' },
  { label: 'Growth', value: 'Growth' },
  { label: 'Starter', value: 'Starter' },
];

export function ShowcasePage() {
  const { theme, dir, toggleTheme, toggleDir } = usePrimeTheme();
  const [accounts, setAccounts] = React.useState<EnterpriseAccount[]>(INITIAL_ACCOUNTS);
  const [selected, setSelected] = React.useState<EnterpriseAccount[]>([]);
  const [showBanner, setShowBanner] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [orgName, setOrgName] = React.useState('');
  const [region, setRegion] = React.useState('NA-East');
  const [tier, setTier] = React.useState<EnterpriseAccount['tier']>('Enterprise');
  const [formError, setFormError] = React.useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setFormError('Organization name is required.');
      return;
    }
    const next: EnterpriseAccount = {
      id: `ACC-${1050 + accounts.length}`,
      organization: orgName.trim(),
      region,
      tier,
      mrr: tier === 'Enterprise' ? 18000 : tier === 'Growth' ? 6000 : 1800,
      seats: tier === 'Enterprise' ? 200 : tier === 'Growth' ? 75 : 20,
      status: 'Trial',
      updatedAt: '2026-11-23',
    };
    setAccounts((prev) => [next, ...prev]);
    setOrgName('');
    setFormError('');
    setDialogOpen(false);
  };

  const columns = React.useMemo<DataTableColumn<EnterpriseAccount>[]>(
    () => [
      { field: 'id', header: 'Account ID', width: '8rem' },
      { field: 'organization', header: 'Organization' },
      { field: 'region', header: 'Region' },
      { field: 'tier', header: 'Plan Tier' },
      {
        field: 'mrr',
        header: 'MRR',
        align: 'right',
        body: (row) => (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
              row.mrr,
            )}
          </span>
        ),
      },
      { field: 'seats', header: 'Seats', align: 'right' },
      {
        field: 'status',
        header: 'Status',
        body: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
      },
      { field: 'updatedAt', header: 'Last Updated' },
    ],
    [],
  );

  return (
    <main
      style={{
        maxWidth: '84rem',
        margin: '0 auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Enterprise Operations Console
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            PrimeReact DataTable, ApexCharts, and OpenDesign OKLCH tokens
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDir}
            aria-label={`Switch text direction (current: ${dir.toUpperCase()})`}
          >
            <Languages size={16} aria-hidden="true" style={{ marginInlineEnd: '0.375rem' }} />
            {dir.toUpperCase()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun size={16} aria-hidden="true" style={{ marginInlineEnd: '0.375rem' }} />
            ) : (
              <Moon size={16} aria-hidden="true" style={{ marginInlineEnd: '0.375rem' }} />
            )}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={16} aria-hidden="true" style={{ marginInlineEnd: '0.375rem' }} />
            New Account
          </Button>
        </div>
      </header>

      {showBanner ? (
        <Alert
          tone="info"
          title="PrimeReact + OpenDesign Token Bridge Active"
          dismissible
          onDismiss={() => setShowBanner(false)}
        >
          All PrimeReact surfaces, borders, and focus rings inherit OpenDesign OKLCH variables in real time.
        </Alert>
      ) : null}

      <section
        aria-label="Key Performance Indicators"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
          gap: '1rem',
        }}
      >
        <KpiCard
          label="Monthly Recurring Revenue"
          value={137050}
          format="currency"
          delta={14.2}
          deltaLabel="vs last month"
          tone="primary"
          icon={<DollarSign size={18} aria-hidden="true" />}
          sparkline={[98, 104, 112, 118, 125, 131, 137]}
        />
        <KpiCard
          label="Active Enterprise Seats"
          value={1727}
          format="number"
          delta={8.6}
          deltaLabel="vs last month"
          tone="success"
          icon={<Users size={18} aria-hidden="true" />}
          sparkline={[1340, 1410, 1490, 1550, 1610, 1680, 1727]}
        />
        <KpiCard
          label="SLA Compliance"
          value={99.94}
          format="percent"
          delta={0.12}
          deltaLabel="30d avg"
          tone="info"
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          sparkline={[99.8, 99.85, 99.9, 99.91, 99.93, 99.94]}
        />
        <KpiCard
          label="Open Risk Alerts"
          value={3}
          format="number"
          delta={-25.0}
          deltaLabel="vs last week"
          tone="warning"
          icon={<Activity size={18} aria-hidden="true" />}
          sparkline={[7, 6, 5, 5, 4, 3]}
        />
      </section>

      <section
        aria-label="Analytics Charts"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
          gap: '1rem',
        }}
      >
        <ChartCard
          title="Revenue & Net Retention"
          subtitle="Trailing 6-month enterprise ARR trajectory ($k)"
          type="area"
          series={[
            { name: 'Expansion ARR', data: [84, 92, 101, 114, 126, 137] },
            { name: 'Base ARR', data: [72, 75, 79, 83, 88, 94] },
          ]}
          options={{
            xaxis: { categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'] },
          }}
        />
        <ChartCard
          title="Revenue by Plan Tier"
          subtitle="Current active subscription distribution"
          type="donut"
          series={[64, 26, 10]}
          options={{
            labels: ['Enterprise', 'Growth', 'Starter'],
            legend: { position: 'bottom' },
          }}
        />
      </section>

      <Tabs
        items={[
          {
            id: 'accounts',
            label: 'Accounts & Ledger',
            content: (
              <DataTable
                title={`Enterprise Accounts (${accounts.length})`}
                data={accounts}
                columns={columns}
                selection={selected}
                onSelectionChange={setSelected}
                toolbarActions={
                  selected.length > 0 ? (
                    <Badge tone="primary">{selected.length} selected</Badge>
                  ) : undefined
                }
              />
            ),
          },
          {
            id: 'governance',
            label: 'Access & Governance',
            content: (
              <Card
                title="Policy Enforcement"
                subtitle="Role-based access control and audit log retention"
              >
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  SAML 2.0 single sign-on, SCIM directory sync, and immutable 365-day audit trails are enabled across
                  all Enterprise tier workspaces.
                </p>
              </Card>
            ),
          },
        ]}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Provision Enterprise Account"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="create-account-form">
              Create Account
            </Button>
          </div>
        }
      >
        <form
          id="create-account-form"
          onSubmit={handleCreateAccount}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}
        >
          <Input
            label="Organization Name"
            placeholder="e.g. Acme Global Corp"
            value={orgName}
            onChange={(e) => {
              setOrgName(e.target.value);
              if (formError) setFormError('');
            }}
            error={formError}
          />
          <Select
            label="Primary Region"
            options={REGION_OPTIONS}
            value={region}
            onValueChange={setRegion}
          />
          <Select
            label="Subscription Tier"
            options={TIER_OPTIONS}
            value={tier}
            onValueChange={(val) => setTier(val)}
          />
        </form>
      </Dialog>
    </main>
  );
}
