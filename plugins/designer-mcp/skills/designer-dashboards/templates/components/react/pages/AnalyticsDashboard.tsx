'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatNumber } from '../../@core/i18n/format';
import {
  fetchAnalyticsSnapshot,
  type AnalyticsSnapshot,
  type PageMetric,
} from './analyticsRepository';
import { KpiCard } from '../../components/ui/KpiCard';
import { WidgetCard } from '../../components/ui/WidgetCard';
import { ChartWrapper } from '../../components/ui/ChartWrapper';
import { DataGrid } from '../../components/ui/DataGrid';

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
            <ChartWrapper
              title="Traffic Overview"
              type="area"
              height={300}
              categories={snapshot.trafficSeries.categories}
              series={[
                { name: 'Sessions', data: snapshot.trafficSeries.sessions },
                { name: 'Signups', data: snapshot.trafficSeries.signups },
              ]}
            />
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
            <ChartWrapper
              title="Device Breakdown"
              type="donut"
              height={300}
              categories={snapshot.devices.labels}
              series={snapshot.devices.shares}
            />
          )}
        </WidgetCard>
      </div>

      <WidgetCard title="Top Landing Pages" subtitle="Sortable, filterable, CSV-exportable table">
        <DataGrid
          data={snapshot?.topPages ?? []}
          columns={COLUMNS}
          loading={loading}
          selectable
          searchPlaceholder="Filter landing pages..."
          exportFilename="top-landing-pages.csv"
        />
      </WidgetCard>
    </div>
  );
}
