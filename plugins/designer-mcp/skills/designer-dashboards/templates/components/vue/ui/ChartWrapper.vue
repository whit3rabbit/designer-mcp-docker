<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';
import EmptyState from './EmptyState.vue';

export type SupportedChartType =
  | 'line'
  | 'dashedLine'
  | 'stepline'
  | 'slope'
  | 'area'
  | 'bar'
  | 'bullet'
  | 'donut'
  | 'semiDonut'
  | 'pie'
  | 'radialBar'
  | 'gauge'
  | 'radar'
  | 'polarArea'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'candlestick'
  | 'boxPlot'
  | 'rangeBar'
  | 'rangeArea'
  | 'funnel'
  | 'mixed';

const props = withDefaults(
  defineProps<{
    type: SupportedChartType;
    series: unknown[];
    options?: Record<string, unknown>;
    height?: number;
    label: string;
    loading?: boolean;
    empty?: boolean;
    categories?: string[];
    tones?: Array<'primary' | 'success' | 'warning' | 'error' | 'info'>;
    donutTitle?: string;
    donutText?: string;
    dataUnit?: string;
    valueFormatter?: (val: number) => string;
  }>(),
  { height: 280, loading: false, empty: false, categories: () => [], dataUnit: '' },
);

const showTable = ref(false);
const themeTick = ref(0);
const isDark = ref(false);
const isRtl = ref(false);
let observer: MutationObserver | null = null;

function resolveApexType(type: SupportedChartType): string {
  if (type === 'funnel' || type === 'bullet') return 'bar';
  if (type === 'mixed' || type === 'dashedLine' || type === 'stepline' || type === 'slope') return 'line';
  if (type === 'gauge') return 'radialBar';
  if (type === 'semiDonut') return 'donut';
  return type;
}

function readCssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function isPlainObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(base: Record<string, unknown>, override?: Record<string, unknown>): Record<string, unknown> {
  if (!override) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObj(v) && isPlainObj(out[k])) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function syncTheme() {
  isDark.value =
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.documentElement.classList.contains('dark');
  isRtl.value = document.documentElement.getAttribute('dir') === 'rtl';
  themeTick.value += 1;
}

onMounted(() => {
  syncTheme();
  observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class', 'dir'],
  });
});

onUnmounted(() => observer?.disconnect());

const apexType = computed(() => resolveApexType(props.type));

const mergedOptions = computed(() => {
  void themeTick.value;
  const textMuted = readCssVar('--color-text-muted');
  const gridColor = readCssVar('--chart-grid') || readCssVar('--color-border');
  const borderColor = readCssVar('--color-border');
  const successColor = readCssVar('--color-success');
  const errorColor = readCssVar('--color-error');
  const fontSans = readCssVar('--font-sans');
  const palette = props.tones?.length
    ? props.tones.map((t) => readCssVar(`--color-${t}`)).filter(Boolean)
    : Array.from({ length: 10 }, (_, i) => readCssVar(`--chart-${i + 1}`)).filter(Boolean);
  const seqPalette = Array.from({ length: 5 }, (_, i) => readCssVar(`--chart-seq-${i + 1}`)).filter(Boolean);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const singleSeries = Array.isArray(props.series) && props.series.length === 1 && typeof props.series[0] === 'object';
  const formatVal = (val: number) =>
    props.valueFormatter ? props.valueFormatter(val) : `${val}${props.dataUnit ? ` ${props.dataUnit}` : ''}`;

  return deepMerge(
    {
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: fontSans || undefined,
        animations: { enabled: !reduceMotion },
      },
      theme: { mode: isDark.value ? 'dark' : 'light' },
      colors:
        props.type === 'heatmap' && !props.tones?.length && seqPalette.length > 0
          ? [seqPalette[3] || palette[0]]
          : palette.length > 0
            ? palette
            : undefined,
      tooltip: {
        shared: ['line', 'area', 'bar', 'mixed', 'rangeArea'].includes(props.type),
        intersect: false,
        y: props.valueFormatter || props.dataUnit ? { formatter: formatVal } : undefined,
      },
      stroke: {
        curve: props.type === 'rangeArea' ? 'straight' : 'smooth',
        width: props.type === 'bar' || props.type === 'funnel' ? 0 : 2,
      },
      grid: { borderColor: gridColor || undefined, strokeDashArray: 4, xaxis: { lines: { show: false } } },
      dataLabels: { enabled: props.type === 'funnel' },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all',
          ...(props.type === 'funnel' ? { horizontal: true, isFunnel: true, distributed: true, barHeight: '72%' } : {}),
        },
        ...(props.type === 'gauge'
          ? {
              radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: { size: '68%' },
                track: { background: borderColor || undefined },
              },
            }
          : {}),
        ...(props.type === 'radialBar' && borderColor
          ? { radialBar: { track: { background: borderColor } } }
          : {}),
        ...(props.type === 'candlestick' && successColor && errorColor
          ? { candlestick: { colors: { upward: successColor, downward: errorColor } } }
          : {}),
        ...(props.type === 'boxPlot' && palette.length >= 2
          ? { boxPlot: { colors: { upper: palette[0], lower: palette[1] } } }
          : {}),
        pie: {
          donut: {
            size: '68%',
            labels:
              props.donutTitle || props.donutText
                ? {
                    show: true,
                    total: {
                      show: true,
                      label: props.donutTitle ?? 'Total',
                      formatter: props.donutText ? () => props.donutText : undefined,
                    },
                  }
                : undefined,
          },
        },
      },
      xaxis: {
        categories: props.categories,
        labels: { style: { colors: textMuted || undefined } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        opposite: isRtl.value,
        labels: {
          style: { colors: textMuted || undefined },
          formatter: props.valueFormatter || props.dataUnit ? formatVal : undefined,
        },
      },
      legend: { show: !singleSeries, position: 'bottom', labels: { colors: textMuted || undefined } },
      fill:
        props.type === 'area'
          ? {
              type: 'gradient',
              gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 95, 100] },
            }
          : undefined,
    },
    props.options,
  );
});

const isNamedSeries = computed(() => Array.isArray(props.series) && typeof props.series[0] === 'object');
const tableLabels = computed(() => {
  if (!isNamedSeries.value) {
    return (props.series as number[]).map((_, i) => props.categories[i] ?? `Item ${i + 1}`);
  }
  if (props.categories.length > 0) return props.categories;
  const firstData = ((props.series as Array<{ data?: unknown[] }>)[0]?.data ?? []) as unknown[];
  return firstData.map((pt, i) =>
    pt && typeof pt === 'object' && 'x' in pt ? String((pt as { x: unknown }).x) : `Item ${i + 1}`,
  );
});
const needsRemount = computed(() =>
  ['donut', 'pie', 'radialBar', 'gauge', 'heatmap', 'treemap', 'boxPlot'].includes(props.type),
);

function formatCell(raw: unknown): string {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'y' in raw) {
    const obj = raw as { y: unknown; z?: unknown };
    if (Array.isArray(obj.y)) return obj.y.join(' / ');
    if (obj.z !== undefined) return `${String(obj.y)} (size ${String(obj.z)})`;
    return String(obj.y);
  }
  if (Array.isArray(raw)) return raw.join(', ');
  return raw !== undefined && raw !== null ? String(raw) : '-';
}
</script>

<template>
  <div v-if="loading" :style="{ height: `${height}px` }" class="rd-shimmer w-full rounded" aria-busy="true" />
  <EmptyState v-else-if="empty || series.length === 0" title="No chart data" description="No series points match the current filters." />
  <div v-else class="space-y-2">
    <div class="flex justify-end">
      <Button variant="ghost" tone="neutral" size="xs" :aria-pressed="showTable" @click="showTable = !showTable">
        <AppIcon name="table" :size="14" />
        {{ showTable ? 'Chart view' : 'Data table' }}
      </Button>
    </div>

    <div v-if="showTable" class="overflow-x-auto">
      <table class="w-full text-start text-xs">
        <caption class="sr-only">{{ label }} data table</caption>
        <thead>
          <tr :style="{ borderColor: 'var(--color-border)' }" class="border-b">
            <th class="py-2 pe-4 font-semibold">Period</th>
            <template v-if="isNamedSeries">
              <th v-for="(s, idx) in (series as Array<{ name?: string }>)" :key="idx" class="py-2 pe-4 text-end font-semibold">
                {{ s.name ?? `Series ${idx + 1}` }}
              </th>
            </template>
            <th v-else class="py-2 pe-4 text-end font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, rowIdx) in tableLabels" :key="`${cat}-${rowIdx}`" :style="{ borderColor: 'var(--color-border)' }" class="border-b">
            <td class="py-1.5 pe-4 font-medium">{{ cat }}</td>
            <template v-if="isNamedSeries">
              <td v-for="(s, sIdx) in (series as Array<{ data: unknown[] }>)" :key="sIdx" class="tabular-nums py-1.5 pe-4 text-end">
                {{ formatCell(s.data?.[rowIdx]) }}
              </td>
            </template>
            <td v-else class="tabular-nums py-1.5 pe-4 text-end">
              {{ (series as number[])[rowIdx] ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <VueApexCharts
      v-else
      :key="needsRemount ? themeTick : 'chart'"
      :type="apexType"
      :height="height"
      :options="mergedOptions"
      :series="series"
      role="img"
      :aria-label="label"
    />
  </div>
</template>
