'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Activity, CalendarCheck2, Clock, Plus, Sparkles, Users } from 'lucide-react';
import { DENSITY_GAP, type Density } from './theme/cn';
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

interface BookingRow {
  id: string;
  customer: string;
  eventType: string;
  host: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  duration: string;
  date: string;
}

const BOOKINGS: BookingRow[] = [
  { id: 'BK-1042', customer: 'Elena Rostova', eventType: 'Product Demo (30m)', host: 'Maya Lin', status: 'Confirmed', duration: '30m', date: 'Today, 14:00' },
  { id: 'BK-1043', customer: 'Marcus Vance', eventType: 'Architecture Review', host: 'Devon Park', status: 'Pending', duration: '45m', date: 'Today, 15:30' },
  { id: 'BK-1044', customer: 'Sora Takahashi', eventType: 'Onboarding Sync', host: 'Maya Lin', status: 'Confirmed', duration: '30m', date: 'Tomorrow, 09:00' },
  { id: 'BK-1045', customer: 'Liam O’Connor', eventType: 'Enterprise Discovery', host: 'Aria Patel', status: 'Confirmed', duration: '60m', date: 'Tomorrow, 11:00' },
  { id: 'BK-1046', customer: 'Nadia Al-Mansoor', eventType: 'Quick Triage', host: 'Devon Park', status: 'Cancelled', duration: '15m', date: 'Fri, 10:15' },
  { id: 'BK-1047', customer: 'Jonas Lindqvist', eventType: 'Security Audit', host: 'Aria Patel', status: 'Confirmed', duration: '45m', date: 'Fri, 13:00' },
  { id: 'BK-1048', customer: 'Chloe Moreau', eventType: 'Product Demo (30m)', host: 'Maya Lin', status: 'Pending', duration: '30m', date: 'Mon, 16:00' },
];

const STATUS_TONE: Record<BookingRow['status'], 'success' | 'warning' | 'error'> = {
  Confirmed: 'success',
  Pending: 'warning',
  Cancelled: 'error',
};

export function ShowcasePage() {
  const [density, setDensity] = React.useState<Density>('comfortable');
  const [timeframe, setTimeframe] = React.useState('30d');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [showNotice, setShowNotice] = React.useState(true);
  const [eventTitle, setEventTitle] = React.useState('');

  const columns = React.useMemo<ColumnDef<BookingRow, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'customer', header: 'Customer' },
      { accessorKey: 'eventType', header: 'Event Type' },
      { accessorKey: 'host', header: 'Host' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge tone={STATUS_TONE[status]} dot>
              {status}
            </Badge>
          );
        },
      },
      { accessorKey: 'duration', header: 'Duration' },
      { accessorKey: 'date', header: 'Scheduled' },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
              Workspace Overview
            </h1>
            <Badge tone="primary">coss ui</Badge>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Minimal SaaS product workspace built with Base UI primitives, Tailwind v4, and OpenDesign tokens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <Select
              ariaLabel="Density"
              value={density}
              onValueChange={(v) => setDensity(v as Density)}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'spacious', label: 'Spacious' },
              ]}
            />
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="New Event Type"
            description="Create a crisp scheduling link for your workspace."
            trigger={
              <Button variant="solid" size="md">
                <Plus className="size-4" aria-hidden="true" />
                New Event Type
              </Button>
            }
            footer={
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  onClick={() => {
                    setDialogOpen(false);
                    setEventTitle('');
                  }}
                >
                  Create Link
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input
                label="Event title"
                placeholder="e.g. 30-min Product Discovery"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                description="Shown on your public booking page."
              />
              <Select
                label="Default duration"
                defaultValue="30"
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '45', label: '45 minutes' },
                  { value: '60', label: '60 minutes' },
                ]}
              />
            </div>
          </Dialog>
        </div>
      </header>

      {showNotice && (
        <Alert
          tone="info"
          title="Calendar sync active"
          onDismiss={() => setShowNotice(false)}
        >
          Two-way availability checks are running every 60 seconds across 4 connected team calendars.
        </Alert>
      )}

      {/* KPI Grid */}
      <section aria-label="Key metrics" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${DENSITY_GAP[density]}`}>
        <KpiCard
          label="Confirmed Bookings"
          value="1,284"
          delta="+14.2%"
          trend="up"
          subtitle="vs. previous 30 days"
          density={density}
          icon={<CalendarCheck2 className="size-4" />}
        />
        <KpiCard
          label="Completion Rate"
          value="96.4%"
          delta="+1.8%"
          trend="up"
          subtitle="No-show rate down to 3.6%"
          density={density}
          icon={<Activity className="size-4" />}
        />
        <KpiCard
          label="Avg. Lead Time"
          value="2.4d"
          delta="-0.3d"
          trend="neutral"
          subtitle="Time from request to slot"
          density={density}
          icon={<Clock className="size-4" />}
        />
        <KpiCard
          label="Active Hosts"
          value="38"
          delta="-2.5%"
          trend="down"
          subtitle="3 hosts on PTO this week"
          density={density}
          icon={<Users className="size-4" />}
        />
      </section>

      {/* Tabs: Analytics & Bookings */}
      <Tabs
        defaultValue="bookings"
        items={[
          {
            value: 'bookings',
            label: 'Bookings',
            badge: BOOKINGS.length,
            content: (
              <div className="space-y-6">
                <ChartCard
                  title="Booking Volume"
                  description="Confirmed vs. cancelled sessions over the selected window"
                  type="area"
                  height={240}
                  density={density}
                  categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  series={[
                    { name: 'Confirmed', data: [42, 58, 65, 74, 81, 39, 48] },
                    { name: 'Cancelled', data: [4, 6, 3, 5, 4, 2, 3] },
                  ]}
                  action={
                    <div className="w-32">
                      <Select
                        ariaLabel="Timeframe"
                        value={timeframe}
                        onValueChange={setTimeframe}
                        options={[
                          { value: '7d', label: 'Last 7 days' },
                          { value: '30d', label: 'Last 30 days' },
                          { value: '90d', label: 'Last 90 days' },
                        ]}
                      />
                    </div>
                  }
                />

                <DataTable
                  data={BOOKINGS}
                  columns={columns}
                  density={density}
                  searchPlaceholder="Search bookings, hosts, or event types…"
                />
              </div>
            ),
          },
          {
            value: 'workflows',
            label: 'Workflows',
            icon: <Sparkles className="size-3.5" />,
            content: (
              <Card>
                <CardHeader density={density}>
                  <div>
                    <CardTitle>Automated Reminders</CardTitle>
                    <CardDescription>
                      Zero-latency SMS and email triggers before scheduled events.
                    </CardDescription>
                  </div>
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                </CardHeader>
                <CardContent density={density} className="space-y-3">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    All team event types send a 24-hour email reminder and a 15-minute calendar push notification.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Configure Templates
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Delivery Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
