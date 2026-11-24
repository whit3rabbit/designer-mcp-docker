'use client';

/**
 * Shadcn + Recharts Overview Example (inspired by Kiranism/next-shadcn-dashboard-starter)
 * Uses designer-dashboards <WidgetCard> + <ChartContainer> + --chart-1..3 design-system tokens.
 * Install: `pnpm add recharts@^3.11.0`
 */

import * as React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { WidgetCard } from '../../components/ui/WidgetCard';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/ShadcnChart';

const MONTHLY_TRAFFIC = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 273, mobile: 190 },
  { month: 'May', desktop: 309, mobile: 130 },
  { month: 'Jun', desktop: 314, mobile: 140 },
];

const TRAFFIC_CONFIG: ChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};

const DEVICE_SHARE = [
  { name: 'Desktop', value: 58, fill: 'var(--chart-1)' },
  { name: 'Mobile', value: 30, fill: 'var(--chart-2)' },
  { name: 'Tablet', value: 12, fill: 'var(--chart-3)' },
];

export function ShadcnChartExample() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <WidgetCard
        title="Traffic Overview (Shadcn Area)"
        subtitle="Recharts AreaChart with --chart-1 / --chart-2 tokens"
        allowFullscreen
        className="xl:col-span-6"
      >
        <ChartContainer config={TRAFFIC_CONFIG} className="h-[280px] aspect-auto">
          <AreaChart data={MONTHLY_TRAFFIC} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="desktop"
              stroke="var(--color-desktop)"
              fill="var(--color-desktop)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="mobile"
              stroke="var(--color-mobile)"
              fill="var(--color-mobile)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </WidgetCard>

      <WidgetCard
        title="Channel Comparison (Shadcn Bar)"
        subtitle="Recharts BarChart with rounded top caps"
        allowFullscreen
        className="xl:col-span-3"
      >
        <ChartContainer config={TRAFFIC_CONFIG} className="h-[280px] aspect-auto">
          <BarChart data={MONTHLY_TRAFFIC}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </WidgetCard>

      <WidgetCard
        title="Device Share (Shadcn Donut)"
        subtitle="Recharts PieChart"
        allowFullscreen
        className="xl:col-span-3"
      >
        <ChartContainer config={TRAFFIC_CONFIG} className="h-[280px] aspect-auto">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={DEVICE_SHARE} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} strokeWidth={0}>
              {DEVICE_SHARE.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </WidgetCard>
    </div>
  );
}
