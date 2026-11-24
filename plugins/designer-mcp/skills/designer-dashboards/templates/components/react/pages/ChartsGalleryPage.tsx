'use client';

import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { ChartWrapper } from '../../components/ui/ChartWrapper';
import { KpiCard } from '../../components/ui/KpiCard';
import { LiveChart } from '../../components/ui/LiveChart';
import { RegionMap } from '../../components/ui/RegionMap';
import { WidgetCard } from '../../components/ui/WidgetCard';
import { getChartSampleSpec, type ChartPresetKind } from '../../components/ui/chartPresets';

type ChartCategory = 'all' | 'trends' | 'comparison' | 'composition' | 'distribution' | 'financial' | 'realtime';

interface GalleryEntry {
  kind: ChartPresetKind;
  title: string;
  question: string;
  category: Exclude<ChartCategory, 'all'>;
}

const GALLERY_ENTRIES: GalleryEntry[] = [
  { kind: 'line', title: 'Line Trend', question: 'Metric trend over time', category: 'trends' },
  { kind: 'dashedLine', title: 'Dashed Target Line', question: 'Actual vs. target & baseline', category: 'trends' },
  { kind: 'stepline', title: 'Step Line', question: 'Discrete tier or quota changes', category: 'trends' },
  { kind: 'slope', title: 'Slope Chart', question: 'Before/after rank & shift', category: 'trends' },
  { kind: 'area', title: 'Gradient Area', question: 'Cumulative volume over time', category: 'trends' },
  { kind: 'mixed', title: 'Mixed Combo (Bar + Area + Line)', question: 'Multi-scale series correlation', category: 'trends' },
  { kind: 'rangeArea', title: 'Range Area (Confidence Band)', question: 'Min-max envelope + median', category: 'trends' },
  { kind: 'bar', title: 'Grouped Column', question: 'Compare values across categories', category: 'comparison' },
  { kind: 'bullet', title: 'Bullet KPI Target', question: 'Actual vs. target goal marker', category: 'comparison' },
  { kind: 'stackedBar', title: 'Stacked Column', question: 'Parts-of-total over time', category: 'comparison' },
  { kind: 'stackedBar100', title: '100% Stacked Column', question: 'Normalized share over time', category: 'comparison' },
  { kind: 'horizontalBar', title: 'Horizontal Bar', question: 'Ranked category comparison', category: 'comparison' },
  { kind: 'funnel', title: 'Conversion Funnel', question: 'Stage-by-stage drop-off', category: 'comparison' },
  { kind: 'dumbbell', title: 'Dumbbell Range', question: 'Min-max gap per category', category: 'comparison' },
  { kind: 'donut', title: 'Donut (Center Total)', question: 'Category share composition', category: 'composition' },
  { kind: 'semiDonut', title: 'Semi-Circle Donut', question: 'Compact half-donut breakdown', category: 'composition' },
  { kind: 'pie', title: 'Pie', question: 'Simple proportion split', category: 'composition' },
  { kind: 'radialBar', title: 'Radial Progress Rings', question: 'Multi-KPI goal completion', category: 'composition' },
  { kind: 'gauge', title: 'Semi-Circle Gauge', question: 'Single KPI capacity dial', category: 'composition' },
  { kind: 'treemap', title: 'Treemap', question: 'Hierarchical proportional blocks', category: 'composition' },
  { kind: 'radar', title: 'Radar Profile', question: 'Multi-axis profile comparison', category: 'distribution' },
  { kind: 'polarArea', title: 'Polar Area', question: 'Radial magnitude comparison', category: 'distribution' },
  { kind: 'scatter', title: 'Scatter Plot', question: 'Two-variable correlation', category: 'distribution' },
  { kind: 'bubble', title: 'Bubble Chart', question: 'Three-variable (X, Y, Z) cluster', category: 'distribution' },
  { kind: 'heatmap', title: 'Heatmap Matrix', question: 'Intensity across two dimensions', category: 'distribution' },
  { kind: 'boxPlot', title: 'Box Plot', question: 'Quartiles, median & outliers', category: 'distribution' },
  { kind: 'candlestick', title: 'Candlestick (OHLC)', question: 'Financial price movement', category: 'financial' },
  { kind: 'rangeBar', title: 'Timeline / Gantt', question: 'Schedule & duration spans', category: 'financial' },
];

const CATEGORIES: Array<{ id: ChartCategory; label: string }> = [
  { id: 'all', label: 'All Types' },
  { id: 'trends', label: 'Trends & Combo' },
  { id: 'comparison', label: 'Comparison & Funnel' },
  { id: 'composition', label: 'Composition & Gauges' },
  { id: 'distribution', label: 'Distribution & Density' },
  { id: 'financial', label: 'Financial & Timeline' },
  { id: 'realtime', label: 'Live & Geo' },
];

export function ChartsGalleryPage() {
  const [activeCategory, setActiveCategory] = React.useState<ChartCategory>('all');

  const visible = React.useMemo(
    () =>
      activeCategory === 'all'
        ? GALLERY_ENTRIES
        : GALLERY_ENTRIES.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="anim-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Charts &amp; Data Visualization Gallery</h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
            28 ApexCharts presets + LiveChart + RegionMap + KPI sparklines bound to{' '}
            <code>--chart-1..10</code> &amp; <code>--chart-seq-1..5</code> tokens.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter chart types">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'solid' : 'outline'}
              tone={activeCategory === cat.id ? 'primary' : 'neutral'}
              size="xs"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {(activeCategory === 'all' || activeCategory === 'trends') && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KpiCard
            label="Line Sparkline KPI"
            value={48290}
            format="number"
            delta={12.4}
            icon="trending-up"
            tone="primary"
            sparkline={{ type: 'line', data: [24, 32, 29, 41, 38, 52, 64] }}
          />
          <KpiCard
            label="Bar Sparkline KPI"
            value={194200}
            format="currency"
            delta={6.8}
            icon="bar-chart-3"
            tone="success"
            sparkline={{ type: 'bar', data: [18, 26, 22, 35, 31, 44, 39], highlightIndex: 5 }}
          />
          <KpiCard
            label="Radial Sparkline KPI"
            value={84}
            format="percent"
            delta={4.2}
            icon="target"
            tone="info"
            sparkline={{ type: 'radial', data: [84] }}
          />
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'realtime') && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <WidgetCard
            title="Live Streaming Telemetry"
            subtitle="Rolling window with pause/resume & reduced-motion fallback"
            skeletonVariant="chart"
            allowFullscreen
            allowPin
            className="xl:col-span-7"
          >
            <LiveChart title="Live Throughput" height={280} />
          </WidgetCard>
          <WidgetCard
            title="Regional Choropleth"
            subtitle="Sequential --chart-seq-1..5 ramp + accessible table"
            skeletonVariant="chart"
            allowFullscreen
            allowPin
            className="xl:col-span-5"
          >
            <RegionMap
              title="Revenue by Region"
              height={280}
              regions={[
                { code: 'US', name: 'United States', value: 420 },
                { code: 'DE', name: 'Germany', value: 280 },
                { code: 'GB', name: 'United Kingdom', value: 215 },
                { code: 'CA', name: 'Canada', value: 160 },
                { code: 'JP', name: 'Japan', value: 130 },
              ]}
            />
          </WidgetCard>
        </div>
      )}

      {visible.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {visible.map((entry) => {
            const spec = getChartSampleSpec(entry.kind);
            return (
              <WidgetCard
                key={entry.kind}
                title={entry.title}
                subtitle={entry.question}
                skeletonVariant="chart"
                allowFullscreen
                allowPin
              >
                <ChartWrapper title={entry.title} {...spec} />
              </WidgetCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
