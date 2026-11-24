'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatNumber } from '../../@core/i18n/format';
import {
  fetchAnalyticsSnapshot,
  type AnalyticsSnapshot,
  type PageMetric,
} from './analyticsRepository';
import { KpiCard } from '../../components/ui/KpiCard';
import { WidgetCard } from '../../components/ui/WidgetCard';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/ShadcnChart';
import { DataGrid } from '../../components/ui/DataGrid';

const TRAFFIC_CONFIG: ChartConfig = {
  sessions: { label: 'Sessions', color: 'var(--chart-1)' },
  signups: { label: 'Signups', color: 'var(--chart-2)' },
};

const DEVICE_CONFIG: ChartConfig = {
  value: { label: 'Share', color: 'var(--chart-1)' },
};

const COLUMNS: ColumnDef<PageMetric, unknown>[] = [
  { accessorKey: 'path', header: 'Landing Page' },
  {
    accessorKey: 'views',
    header: 'Views',
    cell: ({ getValue }) => formatNumber(Number(getValue())),
  },
  {
    accessorKey: 'conversionRate',
    header: 'Conversion',
    cell: ({ getValue }) => `${Number(getValue()).toFixed(1)}%`,
  },
  {
    accessorKey: 'revenue',
    header: 'Attributed Revenue',
    cell: ({ getValue }) => formatCurrency(Number(getValue())),
  },
];

export function AnalyticsDashboard() {
  const [snapshot, setSnapshot] = React.useState<AnalyticsSnapshot | null>(null);

  React.useEffect(() => {
    let active = true;
    fetchAnalyticsSnapshot().then((data) => {
      if (active) setSnapshot(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const loading = !snapshot;
  const trafficData = React.useMemo(
    () =>
      snapshot
        ? snapshot.trafficSeries.categories.map((month, i) => ({
            month,
            sessions: snapshot.trafficSeries.sessions[i] ?? 0,
            signups: snapshot.trafficSeries.signups[i] ?? 0,
          }))
        : [],
    [snapshot],
  );
  const deviceData = React.useMemo(
    () =>
      snapshot
        ? snapshot.devices.labels.map((name, i) => ({
            name,
            value: snapshot.devices.shares[i] ?? 0,
            fill: `var(--chart-${(i % 10) + 1})`,
          }))
        : [],
    [snapshot],
  );

  return (
    <div className="anim-in space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Users"
          value={snapshot ? formatNumber(snapshot.kpis.activeUsers) : '—'}
          delta={12.4}
          icon="users"
          tone="primary"
          sparkline={[28, 34, 31, 40, 44, 42, 48]}
          loading={loading}
        />
        <KpiCard
          label="Sessions"
          value={snapshot ? formatNumber(snapshot.kpis.sessions) : '—'}
          delta={8.2}
          icon="activity"
          tone="info"
          sparkline={[90, 95, 102, 110, 108, 121, 129]}
          loading={loading}
        />
        <KpiCard
          label="Bounce Rate"
          value={snapshot ? `${snapshot.kpis.bounceRate}%` : '—'}
          delta={-2.8}
          icon="arrow-down-right"
          tone="warning"
          loading={loading}
        />
        <KpiCard
          label="Revenue (30d)"
          value={snapshot ? formatCurrency(snapshot.kpis.revenue30d) : '—'}
          delta={18.6}
          icon="dollar-sign"
          tone="success"
          sparkline={[110, 125, 132, 148, 154, 162, 171]}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <WidgetCard
          title="Traffic Overview"
          subtitle="Sessions vs qualified signups (last 7 months)"
          allowFullscreen
          allowPin
          loading={loading}
          className="xl:col-span-8"
        >
          {snapshot && (
            <ChartContainer config={TRAFFIC_CONFIG} className="h-[300px] aspect-auto">
              <AreaChart data={trafficData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="var(--color-sessions)"
                  fill="var(--color-sessions)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="var(--color-signups)"
                  fill="var(--color-signups)"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </WidgetCard>

        <WidgetCard
          title="Device Breakdown"
          subtitle="Share of active sessions"
          allowPin
          loading={loading}
          className="xl:col-span-4"
        >
          {snapshot && (
            <ChartContainer config={DEVICE_CONFIG} className="h-[300px] aspect-auto">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                  {deviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </WidgetCard>
      </div>

      <WidgetCard title="Top Landing Pages" subtitle="Server-mode ready data grid" allowFullscreen loading={loading}>
        <DataGrid
          data={snapshot?.topPages ?? []}
          columns={COLUMNS}
          searchPlaceholder="Filter landing pages..."
          loading={loading}
        />
      </WidgetCard>
    </div>
  );
}
