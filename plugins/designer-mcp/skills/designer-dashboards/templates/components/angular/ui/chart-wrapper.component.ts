import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
  DestroyRef,
} from '@angular/core';
import type { ApexOptions } from 'apexcharts';
import { ButtonComponent } from './button.component';
import { EmptyStateComponent } from './empty-state.component';
import type { SupportedChartType } from './chart-presets';

export type ChartSeries =
  | Array<{ name: string; type?: 'line' | 'area' | 'column' | 'bar'; data: unknown[] }>
  | number[];

function readCssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function isPlainObj(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function deepMergeOptions(base: ApexOptions, override?: ApexOptions): ApexOptions {
  if (!override) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObj(v) && isPlainObj(out[k])) {
      out[k] = deepMergeOptions(out[k] as ApexOptions, v as ApexOptions);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as ApexOptions;
}

function resolveApexType(type: SupportedChartType): string {
  if (type === 'funnel' || type === 'bullet') return 'bar';
  if (type === 'mixed' || type === 'dashedLine' || type === 'stepline' || type === 'slope') return 'line';
  if (type === 'gauge') return 'radialBar';
  if (type === 'semiDonut') return 'donut';
  return type;
}

@Component({
  selector: 'rd-chart-wrapper',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div
        role="status"
        [attr.aria-label]="'Loading ' + title() + ' chart'"
        [style.height.px]="height()"
        style="background-color: var(--color-canvas); border-radius: var(--radius-md)"
        class="rd-shimmer w-full"
      ></div>
    } @else if (isEmpty()) {
      <rd-empty-state
        [title]="'No ' + title() + ' data'"
        description="No series points available for this period."
      />
    } @else {
      <div class="space-y-3">
        <div class="flex justify-end">
          <rd-button
            variant="ghost"
            tone="neutral"
            size="xs"
            [attr.aria-pressed]="showTable()"
            (click)="showTable.set(!showTable())"
          >
            {{ showTable() ? 'Show chart' : 'View data table' }}
          </rd-button>
        </div>

        @if (showTable()) {
          <div
            style="border-color: var(--color-border); border-radius: var(--radius-md)"
            class="overflow-x-auto border"
          >
            <table class="w-full border-collapse text-start text-xs">
              <caption class="sr-only">{{ title() }} data table</caption>
              <thead>
                <tr style="background-color: var(--color-canvas); color: var(--color-text-muted)">
                  <th class="px-3 py-2 text-start font-semibold">Category</th>
                  @if (isNamedSeries()) {
                    @for (s of namedSeries(); track s.name) {
                      <th class="px-3 py-2 text-end font-semibold">{{ s.name }}</th>
                    }
                  } @else {
                    <th class="px-3 py-2 text-end font-semibold">Value</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (cat of tableLabels(); track $index) {
                  <tr style="border-color: var(--color-border); color: var(--color-text)" class="border-t">
                    <td class="px-3 py-2 font-medium">{{ cat }}</td>
                    @if (isNamedSeries()) {
                      @for (s of namedSeries(); track s.name) {
                        <td class="tabular-nums px-3 py-2 text-end">{{ formatCell(s.data[$index]) }}</td>
                      }
                    } @else {
                      <td class="tabular-nums px-3 py-2 text-end">{{ numericSeries()[$index] ?? '-' }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div role="img" [attr.aria-label]="title() + ' ' + type() + ' chart'">
            <div #chartHost></div>
          </div>
        }
      </div>
    }
  `,
})
export class ChartWrapperComponent {
  readonly title = input.required<string>();
  readonly type = input<SupportedChartType>('line');
  readonly series = input<ChartSeries>([]);
  readonly categories = input<string[]>([]);
  readonly height = input(300);
  readonly options = input<ApexOptions | undefined>(undefined);
  readonly tones = input<Array<'primary' | 'success' | 'warning' | 'error' | 'info'> | undefined>(undefined);
  readonly donutTitle = input<string | undefined>(undefined);
  readonly donutText = input<string | undefined>(undefined);
  readonly dataUnit = input('');
  readonly loading = input(false);
  readonly empty = input(false);

  readonly showTable = signal(false);
  private readonly themeTick = signal(0);
  private readonly chartHost = viewChild<ElementRef<HTMLDivElement>>('chartHost');
  private readonly destroyRef = inject(DestroyRef);
  private chartInstance: { destroy: () => void; updateOptions: (opts: ApexOptions) => void; updateSeries: (s: unknown) => void } | null = null;

  readonly isEmpty = computed(() => this.empty() || !Array.isArray(this.series()) || this.series().length === 0);
  readonly isNamedSeries = computed(() => Array.isArray(this.series()) && typeof this.series()[0] === 'object');
  readonly namedSeries = computed(() => (this.isNamedSeries() ? (this.series() as Array<{ name: string; data: unknown[] }>) : []));
  readonly numericSeries = computed(() => (!this.isNamedSeries() ? (this.series() as number[]) : []));

  readonly tableLabels = computed(() => {
    if (!this.isNamedSeries()) {
      return this.numericSeries().map((_, i) => this.categories()[i] ?? `Item ${i + 1}`);
    }
    if (this.categories().length > 0) return this.categories();
    const firstData = this.namedSeries()[0]?.data ?? [];
    return firstData.map((pt, i) =>
      pt && typeof pt === 'object' && 'x' in pt ? String((pt as { x: unknown }).x) : `Item ${i + 1}`,
    );
  });

  formatCell(raw: unknown): string {
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'y' in raw) {
      const obj = raw as { y: unknown; z?: unknown };
      if (Array.isArray(obj.y)) return obj.y.join(' / ');
      if (obj.z !== undefined) return `${String(obj.y)} (size ${String(obj.z)})`;
      return String(obj.y);
    }
    if (Array.isArray(raw)) return raw.join(', ');
    return raw !== undefined && raw !== null ? String(raw) : '-';
  }

  constructor() {
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.themeTick.update((t) => t + 1));
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class', 'dir'],
      });
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        this.chartInstance?.destroy();
        this.chartInstance = null;
      });
    });

    effect(() => {
      const host = this.chartHost()?.nativeElement;
      const showTbl = this.showTable();
      const empty = this.isEmpty();
      const loading = this.loading();
      void this.themeTick();

      if (!host || showTbl || empty || loading || typeof window === 'undefined') {
        this.chartInstance?.destroy();
        this.chartInstance = null;
        return;
      }

      const type = this.type();
      const apexType = resolveApexType(type);
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark');
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const textMuted = readCssVar('--color-text-muted');
      const gridColor = readCssVar('--chart-grid') || readCssVar('--color-border');
      const borderColor = readCssVar('--color-border');
      const successColor = readCssVar('--color-success');
      const errorColor = readCssVar('--color-error');
      const fontSans = readCssVar('--font-sans');
      const tones = this.tones();
      const palette = tones?.length
        ? tones.map((t) => readCssVar(`--color-${t}`)).filter(Boolean)
        : Array.from({ length: 10 }, (_, i) => readCssVar(`--chart-${i + 1}`)).filter(Boolean);
      const unit = this.dataUnit();

      const merged = deepMergeOptions(
        {
          chart: {
            type: apexType as never,
            height: this.height(),
            toolbar: { show: false },
            fontFamily: fontSans || undefined,
            background: 'transparent',
            animations: { enabled: !reduceMotion },
          },
          theme: { mode: isDark ? 'dark' : 'light' },
          colors: palette.length > 0 ? palette : undefined,
          series: this.series() as never,
          stroke: { curve: type === 'rangeArea' ? 'straight' : 'smooth', width: type === 'bar' || type === 'funnel' ? 0 : 2 },
          grid: { borderColor: gridColor || undefined, strokeDashArray: 4, xaxis: { lines: { show: false } } },
          dataLabels: { enabled: type === 'funnel' },
          plotOptions: {
            ...(type === 'gauge'
              ? { radialBar: { startAngle: -90, endAngle: 90, hollow: { size: '68%' }, track: { background: borderColor || undefined } } }
              : {}),
            ...(type === 'radialBar' && borderColor ? { radialBar: { track: { background: borderColor } } } : {}),
            ...(type === 'candlestick' && successColor && errorColor
              ? { candlestick: { colors: { upward: successColor, downward: errorColor } } }
              : {}),
            ...(type === 'boxPlot' && palette.length >= 2
              ? { boxPlot: { colors: { upper: palette[0], lower: palette[1] } } }
              : {}),
          },
          xaxis: { categories: this.categories(), labels: { style: { colors: textMuted || undefined } } },
          yaxis: {
            opposite: isRtl,
            labels: {
              style: { colors: textMuted || undefined },
              formatter: unit ? (val: number) => `${val} ${unit}` : undefined,
            },
          },
          legend: { show: !(this.isNamedSeries() && this.namedSeries().length === 1), position: 'bottom' },
        },
        this.options(),
      );

      import('apexcharts').then(({ default: ApexCharts }) => {
        if (!host.isConnected) return;
        this.chartInstance?.destroy();
        const instance = new ApexCharts(host, merged);
        instance.render();
        this.chartInstance = instance as unknown as typeof this.chartInstance;
      });
    });
  }
}
