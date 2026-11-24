import type { ApexOptions } from 'apexcharts';
import type { SupportedChartType } from './ChartWrapper.vue';

export type ChartDataPoint =
  | number
  | [number, number]
  | { x: string | number; y: number | number[]; z?: number; fillColor?: string };

export type ChartSeries =
  | Array<{ name: string; type?: 'line' | 'area' | 'column' | 'bar'; data: ChartDataPoint[] }>
  | number[];

export type ChartPresetKind =
  | SupportedChartType
  | 'stackedBar'
  | 'stackedBar100'
  | 'horizontalBar'
  | 'dumbbell'
  | 'sparkline';

export interface ChartPresetSpec {
  type: SupportedChartType;
  height: number;
  categories?: string[];
  series: ChartSeries;
  options: ApexOptions;
  donutTitle?: string;
  donutText?: string;
}

function isPlainObj(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function deepMerge(base: ApexOptions, override?: ApexOptions): ApexOptions {
  if (!override) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObj(v) && isPlainObj(out[k])) {
      out[k] = deepMerge(out[k] as ApexOptions, v as ApexOptions);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as ApexOptions;
}

export function getChartPreset(kind: ChartPresetKind, overrides?: ApexOptions): ApexOptions {
  const presets: Record<ChartPresetKind, ApexOptions> = {
    line: { stroke: { curve: 'smooth', width: 2.5 }, markers: { size: 0, hover: { size: 5 } } },
    dashedLine: { stroke: { curve: 'smooth', width: [2.5, 2, 2], dashArray: [0, 6, 4] }, markers: { size: 0, hover: { size: 5 } } },
    stepline: { stroke: { curve: 'stepline', width: 2.5 }, markers: { size: 0, hover: { size: 5 } } },
    slope: { plotOptions: { line: { isSlopeChart: true } }, stroke: { width: 2.5 }, markers: { size: 5 }, dataLabels: { enabled: true } },
    area: {
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 95, 100] } },
    },
    bar: { plotOptions: { bar: { borderRadius: 4, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'all', columnWidth: '48%' } } },
    bullet: { plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '42%' } } },
    stackedBar: {
      chart: { stacked: true },
      plotOptions: { bar: { borderRadius: 4, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'all', columnWidth: '44%' } },
    },
    stackedBar100: {
      chart: { stacked: true, stackType: '100%' },
      plotOptions: { bar: { borderRadius: 4, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'all', columnWidth: '44%' } },
    },
    horizontalBar: { plotOptions: { bar: { horizontal: true, borderRadius: 4, borderRadiusApplication: 'end', barHeight: '55%' } } },
    dumbbell: {
      plotOptions: { bar: { isDumbbell: true, columnWidth: 4, dumbbellColors: [['var(--chart-1)', 'var(--chart-2)']] } },
      legend: { show: true, showForSingleSeries: true, position: 'bottom' },
    },
    funnel: {
      plotOptions: { bar: { horizontal: true, isFunnel: true, distributed: true, borderRadius: 4, barHeight: '72%' } },
      dataLabels: { enabled: true },
    },
    mixed: {
      stroke: { width: [0, 2, 3], curve: 'smooth' },
      plotOptions: { bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '42%' } },
      fill: { opacity: [0.9, 0.25, 1] },
    },
    donut: { plotOptions: { pie: { donut: { size: '70%' } } }, stroke: { width: 0 } },
    semiDonut: { plotOptions: { pie: { startAngle: -90, endAngle: 90, offsetY: 10, donut: { size: '72%' } } }, stroke: { width: 0 } },
    pie: { stroke: { width: 0 } },
    radialBar: {
      plotOptions: {
        radialBar: {
          hollow: { size: '68%' },
          track: { background: 'var(--color-border)' },
          dataLabels: { name: { fontSize: '12px' }, value: { fontSize: '20px', fontWeight: 700 } },
        },
      },
    },
    gauge: {
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: { size: '68%' },
          track: { background: 'var(--color-border)', strokeWidth: '97%' },
          dataLabels: { name: { offsetY: -10, fontSize: '12px' }, value: { offsetY: -4, fontSize: '22px', fontWeight: 700 } },
        },
      },
    },
    radar: { stroke: { width: 2 }, fill: { opacity: 0.18 }, markers: { size: 3 } },
    polarArea: { stroke: { width: 1 }, fill: { opacity: 0.8 } },
    scatter: { markers: { size: 5 }, xaxis: { tickAmount: 6 } },
    bubble: { fill: { opacity: 0.75 }, xaxis: { tickAmount: 6 } },
    heatmap: { plotOptions: { heatmap: { radius: 4, shadeIntensity: 0.5 } }, dataLabels: { enabled: false } },
    treemap: { plotOptions: { treemap: { distributed: true, enableShades: false } } },
    candlestick: { plotOptions: { candlestick: { colors: { upward: 'var(--color-success)', downward: 'var(--color-error)' } } } },
    boxPlot: { plotOptions: { boxPlot: { colors: { upper: 'var(--chart-1)', lower: 'var(--chart-2)' } } } },
    rangeBar: { plotOptions: { bar: { horizontal: true, borderRadius: 4, rangeBarGroupRows: true } } },
    rangeArea: { stroke: { curve: 'straight', width: [0, 2] }, fill: { opacity: [0.22, 1] }, markers: { hover: { sizeOffset: 4 } } },
    sparkline: {
      chart: { sparkline: { enabled: true } },
      stroke: { curve: 'smooth', width: 2 },
      tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
    },
  };

  return deepMerge(presets[kind] ?? {}, overrides);
}
