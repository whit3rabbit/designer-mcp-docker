import type { ApexOptions } from 'apexcharts';
import type { ChartSeries, SupportedChartType } from './ChartWrapper';

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
  dataUnit?: string;
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

/**
 * Config-as-data chart presets aligned with the designer-dashboards design-system tokens.
 * Consumed by <ChartWrapper options={getChartPreset(...)} /> and generated *.charts.ts files.
 */
export function getChartPreset(kind: ChartPresetKind, overrides?: ApexOptions): ApexOptions {
  const presets: Record<ChartPresetKind, ApexOptions> = {
    line: {
      stroke: { curve: 'smooth', width: 2.5 },
      markers: { size: 0, hover: { size: 5 } },
    },
    dashedLine: {
      stroke: { curve: 'smooth', width: [2.5, 2, 2], dashArray: [0, 6, 4] },
      markers: { size: 0, hover: { size: 5 } },
    },
    stepline: {
      stroke: { curve: 'stepline', width: 2.5 },
      markers: { size: 0, hover: { size: 5 } },
    },
    slope: {
      plotOptions: {
        line: { isSlopeChart: true },
      },
      stroke: { width: 2.5 },
      markers: { size: 5 },
      dataLabels: { enabled: true },
    },
    area: {
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 95, 100] },
      },
    },
    bar: {
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
          columnWidth: '48%',
        },
      },
    },
    bullet: {
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '42%',
        },
      },
    },
    stackedBar: {
      chart: { stacked: true },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
          columnWidth: '44%',
        },
      },
    },
    stackedBar100: {
      chart: { stacked: true, stackType: '100%' },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
          columnWidth: '44%',
        },
      },
    },
    horizontalBar: {
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          borderRadiusApplication: 'end',
          barHeight: '55%',
        },
      },
    },
    dumbbell: {
      plotOptions: {
        bar: {
          isDumbbell: true,
          columnWidth: 4,
          dumbbellColors: [['var(--chart-1)', 'var(--chart-2)']],
        },
      },
      legend: { show: true, showForSingleSeries: true, position: 'bottom' },
    },
    funnel: {
      plotOptions: {
        bar: {
          horizontal: true,
          isFunnel: true,
          distributed: true,
          borderRadius: 4,
          barHeight: '72%',
        },
      },
      dataLabels: { enabled: true },
    },
    mixed: {
      stroke: { width: [0, 2, 3], curve: 'smooth' },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          columnWidth: '42%',
        },
      },
      fill: { opacity: [0.9, 0.25, 1] },
    },
    donut: {
      plotOptions: { pie: { donut: { size: '70%' } } },
      stroke: { width: 0 },
    },
    semiDonut: {
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: { size: '72%' },
        },
      },
      stroke: { width: 0 },
    },
    pie: {
      stroke: { width: 0 },
    },
    radialBar: {
      plotOptions: {
        radialBar: {
          hollow: { size: '68%' },
          track: { background: 'var(--color-border)' },
          dataLabels: {
            name: { fontSize: '12px' },
            value: { fontSize: '20px', fontWeight: 700 },
          },
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
          dataLabels: {
            name: { offsetY: -10, fontSize: '12px' },
            value: { offsetY: -4, fontSize: '22px', fontWeight: 700 },
          },
        },
      },
    },
    radar: {
      stroke: { width: 2 },
      fill: { opacity: 0.18 },
      markers: { size: 3 },
    },
    polarArea: {
      stroke: { width: 1 },
      fill: { opacity: 0.8 },
    },
    scatter: {
      markers: { size: 5 },
      xaxis: { tickAmount: 6 },
    },
    bubble: {
      fill: { opacity: 0.75 },
      xaxis: { tickAmount: 6 },
    },
    heatmap: {
      plotOptions: {
        heatmap: {
          radius: 4,
          shadeIntensity: 0.5,
        },
      },
      dataLabels: { enabled: false },
    },
    treemap: {
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
    },
    candlestick: {
      plotOptions: {
        candlestick: {
          colors: {
            upward: 'var(--color-success)',
            downward: 'var(--color-error)',
          },
        },
      },
    },
    boxPlot: {
      plotOptions: {
        boxPlot: {
          colors: {
            upper: 'var(--chart-1)',
            lower: 'var(--chart-2)',
          },
        },
      },
    },
    rangeBar: {
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          rangeBarGroupRows: true,
        },
      },
    },
    rangeArea: {
      stroke: { curve: 'straight', width: [0, 2] },
      fill: { opacity: [0.22, 1] },
      markers: { hover: { sizeOffset: 4 } },
    },
    sparkline: {
      chart: { sparkline: { enabled: true } },
      stroke: { curve: 'smooth', width: 2 },
      tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
    },
  };

  return deepMerge(presets[kind] ?? {}, overrides);
}

/**
 * Ready-to-render sample specs for every preset kind (used by gallery proof pages & generators).
 */
export function getChartSampleSpec(kind: ChartPresetKind): ChartPresetSpec {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  switch (kind) {
    case 'line':
      return {
        type: 'line',
        height: 280,
        categories: months,
        series: [
          { name: 'Current Period', data: [42, 51, 49, 64, 71, 82] },
          { name: 'Prior Period', data: [34, 41, 44, 50, 56, 61] },
        ],
        options: getChartPreset('line'),
      };
    case 'dashedLine':
      return {
        type: 'dashedLine',
        height: 280,
        categories: months,
        series: [
          { name: 'Actual', data: [38, 46, 52, 61, 69, 78] },
          { name: 'Target', data: [40, 45, 50, 55, 62, 70] },
          { name: 'Baseline', data: [30, 32, 35, 38, 40, 42] },
        ],
        options: getChartPreset('dashedLine'),
      };
    case 'stepline':
      return {
        type: 'stepline',
        height: 280,
        categories: months,
        series: [{ name: 'Active Tier Capacity', data: [20, 20, 45, 45, 80, 100] }],
        options: getChartPreset('stepline'),
      };
    case 'slope':
      return {
        type: 'slope',
        height: 280,
        series: [
          { name: 'North America', data: [{ x: '2024', y: 42 }, { x: '2025', y: 68 }] },
          { name: 'Europe', data: [{ x: '2024', y: 54 }, { x: '2025', y: 61 }] },
          { name: 'APAC', data: [{ x: '2024', y: 28 }, { x: '2025', y: 52 }] },
        ],
        options: getChartPreset('slope'),
      };
    case 'area':
      return {
        type: 'area',
        height: 280,
        categories: months,
        series: [
          { name: 'Organic', data: [31, 40, 38, 55, 62, 74] },
          { name: 'Paid', data: [18, 24, 29, 33, 39, 45] },
        ],
        options: getChartPreset('area'),
      };
    case 'bar':
      return {
        type: 'bar',
        height: 280,
        categories: months,
        series: [
          { name: 'Revenue', data: [44, 55, 57, 68, 72, 85] },
          { name: 'Target', data: [40, 48, 52, 60, 66, 75] },
        ],
        options: getChartPreset('bar'),
      };
    case 'bullet':
      return {
        type: 'bullet',
        height: 280,
        series: [
          {
            name: 'Actual',
            data: [
              { x: 'MRR', y: 84, goals: [{ name: 'Target', value: 90, strokeWidth: 4, strokeColor: 'var(--color-error)' }] } as never,
              { x: 'NPS', y: 72, goals: [{ name: 'Target', value: 65, strokeWidth: 4, strokeColor: 'var(--color-success)' }] } as never,
              { x: 'SLA', y: 98, goals: [{ name: 'Target', value: 99, strokeWidth: 4, strokeColor: 'var(--color-warning)' }] } as never,
              { x: 'Adoption', y: 64, goals: [{ name: 'Target', value: 75, strokeWidth: 4, strokeColor: 'var(--color-error)' }] } as never,
            ],
          },
        ],
        options: getChartPreset('bullet'),
      };
    case 'stackedBar':
      return {
        type: 'bar',
        height: 280,
        categories: months,
        series: [
          { name: 'Direct', data: [22, 28, 25, 34, 38, 42] },
          { name: 'Referral', data: [14, 18, 21, 20, 24, 28] },
          { name: 'Social', data: [9, 12, 11, 15, 17, 19] },
        ],
        options: getChartPreset('stackedBar'),
      };
    case 'stackedBar100':
      return {
        type: 'bar',
        height: 280,
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          { name: 'Enterprise', data: [44, 55, 41, 64] },
          { name: 'Growth', data: [32, 28, 36, 24] },
          { name: 'Starter', data: [24, 17, 23, 12] },
        ],
        options: getChartPreset('stackedBar100'),
      };
    case 'horizontalBar':
      return {
        type: 'bar',
        height: 280,
        categories: ['United States', 'Germany', 'United Kingdom', 'Canada', 'Japan'],
        series: [{ name: 'Active Accounts', data: [420, 310, 265, 190, 145] }],
        options: getChartPreset('horizontalBar'),
      };
    case 'dumbbell':
      return {
        type: 'rangeBar',
        height: 280,
        series: [
          {
            name: 'Salary Band',
            data: [
              { x: 'Engineering', y: [115, 175] },
              { x: 'Product', y: [105, 155] },
              { x: 'Design', y: [95, 142] },
              { x: 'Operations', y: [80, 120] },
            ],
          },
        ],
        options: getChartPreset('dumbbell'),
      };
    case 'funnel':
      return {
        type: 'funnel',
        height: 280,
        categories: ['Visitors', 'Signups', 'Qualified', 'Proposal', 'Closed Won'],
        series: [{ name: 'Conversion', data: [1420, 860, 520, 290, 165] }],
        options: getChartPreset('funnel'),
      };
    case 'mixed':
      return {
        type: 'mixed',
        height: 280,
        categories: months,
        series: [
          { name: 'Orders', type: 'column', data: [38, 46, 42, 54, 61, 70] },
          { name: 'Forecast', type: 'area', data: [34, 42, 45, 51, 58, 66] },
          { name: 'Avg Order Value', type: 'line', data: [48, 52, 49, 58, 63, 72] },
        ],
        options: getChartPreset('mixed'),
      };
    case 'donut':
      return {
        type: 'donut',
        height: 280,
        categories: ['Desktop', 'Mobile', 'Tablet'],
        series: [58, 30, 12],
        donutTitle: 'Total',
        donutText: '100%',
        options: getChartPreset('donut'),
      };
    case 'semiDonut':
      return {
        type: 'semiDonut',
        height: 260,
        categories: ['Direct', 'Organic', 'Referral'],
        series: [48, 34, 18],
        donutTitle: 'Share',
        donutText: '100%',
        options: getChartPreset('semiDonut'),
      };
    case 'pie':
      return {
        type: 'pie',
        height: 280,
        categories: ['North America', 'Europe', 'APAC', 'LATAM'],
        series: [44, 28, 19, 9],
        options: getChartPreset('pie'),
      };
    case 'radialBar':
      return {
        type: 'radialBar',
        height: 280,
        categories: ['Sprint Goal', 'SLA Uptime', 'Test Coverage'],
        series: [84, 96, 72],
        options: getChartPreset('radialBar'),
      };
    case 'gauge':
      return {
        type: 'gauge',
        height: 260,
        categories: ['Capacity'],
        series: [76],
        options: getChartPreset('gauge'),
      };
    case 'radar':
      return {
        type: 'radar',
        height: 280,
        categories: ['Speed', 'Reliability', 'Security', 'UX', 'Cost', 'Scale'],
        series: [
          { name: 'Current', data: [85, 92, 88, 79, 74, 90] },
          { name: 'Benchmark', data: [72, 80, 78, 75, 82, 76] },
        ],
        options: getChartPreset('radar'),
      };
    case 'polarArea':
      return {
        type: 'polarArea',
        height: 280,
        categories: ['Search', 'Direct', 'Social', 'Email', 'Referral'],
        series: [42, 34, 26, 19, 14],
        options: getChartPreset('polarArea'),
      };
    case 'scatter':
      return {
        type: 'scatter',
        height: 280,
        series: [
          {
            name: 'Enterprise',
            data: [
              [12, 44],
              [18, 58],
              [24, 52],
              [31, 74],
              [39, 81],
              [46, 92],
            ],
          },
          {
            name: 'Self-Serve',
            data: [
              [8, 22],
              [15, 34],
              [21, 29],
              [28, 45],
              [35, 51],
              [42, 60],
            ],
          },
        ],
        options: getChartPreset('scatter'),
      };
    case 'bubble':
      return {
        type: 'bubble',
        height: 280,
        series: [
          {
            name: 'Campaign A',
            data: [
              { x: 14, y: 42, z: 24 },
              { x: 26, y: 65, z: 38 },
              { x: 38, y: 54, z: 29 },
              { x: 48, y: 78, z: 45 },
            ],
          },
          {
            name: 'Campaign B',
            data: [
              { x: 18, y: 28, z: 18 },
              { x: 32, y: 48, z: 32 },
              { x: 44, y: 66, z: 26 },
            ],
          },
        ],
        options: getChartPreset('bubble'),
      };
    case 'heatmap':
      return {
        type: 'heatmap',
        height: 280,
        series: [
          {
            name: 'Mon',
            data: [
              { x: '09:00', y: 22 },
              { x: '12:00', y: 48 },
              { x: '15:00', y: 64 },
              { x: '18:00', y: 31 },
            ],
          },
          {
            name: 'Tue',
            data: [
              { x: '09:00', y: 35 },
              { x: '12:00', y: 72 },
              { x: '15:00', y: 58 },
              { x: '18:00', y: 41 },
            ],
          },
          {
            name: 'Wed',
            data: [
              { x: '09:00', y: 44 },
              { x: '12:00', y: 86 },
              { x: '15:00', y: 79 },
              { x: '18:00', y: 52 },
            ],
          },
        ],
        options: getChartPreset('heatmap'),
      };
    case 'treemap':
      return {
        type: 'treemap',
        height: 280,
        series: [
          {
            name: 'Spend by Category',
            data: [
              { x: 'Compute', y: 420 },
              { x: 'Storage', y: 260 },
              { x: 'Bandwidth', y: 185 },
              { x: 'Database', y: 150 },
              { x: 'Auth & Edge', y: 95 },
            ],
          },
        ],
        options: getChartPreset('treemap'),
      };
    case 'candlestick':
      return {
        type: 'candlestick',
        height: 300,
        series: [
          {
            name: 'OHLC',
            data: [
              { x: 'Mon', y: [6120, 6280, 6050, 6210] },
              { x: 'Tue', y: [6210, 6340, 6180, 6290] },
              { x: 'Wed', y: [6290, 6310, 6110, 6150] },
              { x: 'Thu', y: [6150, 6410, 6140, 6380] },
              { x: 'Fri', y: [6380, 6520, 6310, 6490] },
            ],
          },
        ],
        options: getChartPreset('candlestick'),
      };
    case 'boxPlot':
      return {
        type: 'boxPlot',
        height: 280,
        series: [
          {
            name: 'Latency (ms)',
            data: [
              { x: 'API', y: [42, 68, 84, 112, 148] },
              { x: 'Auth', y: [28, 41, 52, 74, 96] },
              { x: 'Search', y: [65, 92, 118, 154, 210] },
              { x: 'Worker', y: [34, 55, 71, 98, 130] },
            ],
          },
        ],
        options: getChartPreset('boxPlot'),
      };
    case 'rangeBar':
      return {
        type: 'rangeBar',
        height: 280,
        series: [
          {
            name: 'Sprint 14',
            data: [
              { x: 'Design', y: [1, 4] },
              { x: 'API', y: [3, 8] },
              { x: 'Frontend', y: [5, 11] },
              { x: 'QA', y: [9, 13] },
            ],
          },
        ],
        options: getChartPreset('rangeBar'),
      };
    case 'rangeArea':
      return {
        type: 'rangeArea',
        height: 280,
        series: [
          {
            name: 'Confidence Band',
            type: 'rangeArea',
            data: [
              { x: 'Jan', y: [24, 38] },
              { x: 'Feb', y: [29, 44] },
              { x: 'Mar', y: [35, 52] },
              { x: 'Apr', y: [40, 58] },
              { x: 'May', y: [46, 66] },
            ],
          },
          {
            name: 'Median',
            type: 'line',
            data: [
              { x: 'Jan', y: 31 },
              { x: 'Feb', y: 37 },
              { x: 'Mar', y: 44 },
              { x: 'Apr', y: 49 },
              { x: 'May', y: 56 },
            ],
          },
        ],
        options: getChartPreset('rangeArea'),
      };
    case 'sparkline':
      return {
        type: 'area',
        height: 64,
        categories: ['1', '2', '3', '4', '5', '6'],
        series: [{ name: 'Trend', data: [18, 24, 21, 32, 29, 41] }],
        options: getChartPreset('sparkline'),
      };
  }
}
