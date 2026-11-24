'use client';

/**
 * Optional Shadcn-compatible Recharts adapter (recharts@^3.11.0)
 * Bound to designer-dashboards design-system tokens (--chart-1..10, --color-surface-elevated, --color-border).
 * Install `recharts` ONLY if choosing Recharts instead of ApexCharts (single-engine rule).
 */

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { clsx } from 'clsx';

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: { light: string; dark: string };
  };
};

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error('useChart must be used within a <ChartContainer />');
  return ctx;
}

export interface ChartContainerProps extends React.ComponentProps<'div'> {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}

export function ChartContainer({ id, className, children, config, style, ...props }: ChartContainerProps) {
  const uid = React.useId().replace(/:/g, '');
  const chartId = `chart-${id || uid}`;
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const sync = () =>
      setIsDark(
        document.documentElement.getAttribute('data-theme') === 'dark' ||
          document.documentElement.classList.contains('dark'),
      );
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => observer.disconnect();
  }, []);

  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      const color = item.theme ? (isDark ? item.theme.dark : item.theme.light) : item.color;
      if (color) vars[`--color-${key}`] = color;
    }
    return vars;
  }, [config, isDark]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        style={{ ...cssVars, ...style } as React.CSSProperties}
        className={clsx(
          'flex aspect-video w-full justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-[var(--color-text-muted)]',
          '[&_.recharts-cartesian-grid_line]:stroke-[var(--chart-grid)]',
          '[&_.recharts-polar-grid_[stroke]]:stroke-[var(--chart-grid)]',
          '[&_.recharts-surface]:outline-none',
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;
export const ChartLegend = RechartsPrimitive.Legend;

interface TooltipPayloadItem {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  indicator?: 'dot' | 'line';
  className?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  indicator = 'dot',
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--chart-tooltip-bg)',
        borderColor: 'var(--chart-tooltip-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}
      className={clsx('min-w-[140px] border px-3 py-2 text-xs', className)}
    >
      {!hideLabel && label !== undefined && (
        <p className="mb-1.5 font-semibold" style={{ color: 'var(--color-text)' }}>
          {String(label)}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, idx) => {
          const key = String(item.dataKey || item.name || idx);
          const itemCfg = config[key];
          const swatch = item.color || itemCfg?.color || `var(--chart-${(idx % 10) + 1})`;
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: swatch, borderRadius: 'var(--radius-full)' }}
                  className={indicator === 'line' ? 'h-0.5 w-2.5' : 'size-2'}
                />
                <span>{itemCfg?.label ?? item.name ?? key}</span>
              </span>
              <span className="tabular-nums font-semibold">{String(item.value ?? '')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LegendPayloadItem {
  value?: string;
  dataKey?: string | number;
  color?: string;
}

export function ChartLegendContent({
  payload,
  className,
}: {
  payload?: LegendPayloadItem[];
  className?: string;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className={clsx('flex flex-wrap items-center justify-center gap-4 pt-3 text-xs', className)}>
      {payload.map((item, idx) => {
        const key = String(item.dataKey || item.value || idx);
        const itemCfg = config[key];
        const swatch = item.color || itemCfg?.color || `var(--chart-${(idx % 10) + 1})`;
        return (
          <div key={key} className="inline-flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <span
              aria-hidden="true"
              style={{ backgroundColor: swatch, borderRadius: 'var(--radius-sm)' }}
              className="size-2.5"
            />
            <span>{itemCfg?.label ?? item.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
}
