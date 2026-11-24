import { Component, computed, input, signal } from '@angular/core';
import { ButtonComponent } from './button.component';
import { EmptyStateComponent } from './empty-state.component';

export interface RegionMetric {
  code: string;
  name: string;
  value: number;
  formattedValue?: string;
}

const SEQ_TOKENS = [
  'var(--chart-seq-1)',
  'var(--chart-seq-2)',
  'var(--chart-seq-3)',
  'var(--chart-seq-4)',
  'var(--chart-seq-5)',
];

@Component({
  selector: 'rd-region-map',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent],
  template: `
    @if (!loading() && (empty() || regions().length === 0)) {
      <rd-empty-state [title]="'No ' + title() + ' data'" description="No regional metrics available." />
    } @else {
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-xs" style="color: var(--color-text-muted)">
            <span>Low</span>
            <span class="inline-flex items-center gap-0.5" aria-hidden="true">
              @for (tok of seqTokens; track $index) {
                <span
                  [style.background-color]="tok"
                  style="border-radius: var(--radius-sm)"
                  class="inline-block h-2.5 w-4"
                ></span>
              }
            </span>
            <span>High</span>
          </div>
          <rd-button
            variant="ghost"
            tone="neutral"
            size="xs"
            [attr.aria-pressed]="showTable()"
            (click)="showTable.set(!showTable())"
          >
            {{ showTable() ? 'Show map' : 'View data table' }}
          </rd-button>
        </div>

        @if (loading()) {
          <div
            role="status"
            [attr.aria-label]="'Loading ' + title()"
            [style.height.px]="height()"
            style="background-color: var(--color-canvas); border-radius: var(--radius-md)"
            class="rd-shimmer w-full"
          ></div>
        } @else if (showTable()) {
          <div
            style="border-color: var(--color-border); border-radius: var(--radius-md)"
            class="overflow-x-auto border"
          >
            <table class="w-full border-collapse text-start text-xs">
              <caption class="sr-only">{{ title() }} regional breakdown</caption>
              <thead>
                <tr style="background-color: var(--color-canvas); color: var(--color-text-muted)">
                  <th class="px-3 py-2 text-start font-semibold">Region</th>
                  <th class="px-3 py-2 text-end font-semibold">Value</th>
                  <th class="px-3 py-2 text-end font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                @for (r of sorted(); track r.code) {
                  <tr style="border-color: var(--color-border); color: var(--color-text)" class="border-t">
                    <td class="px-3 py-2 font-medium">{{ r.name }}</td>
                    <td class="tabular-nums px-3 py-2 text-end">
                      {{ r.formattedValue ?? r.value + (unit() ? ' ' + unit() : '') }}
                    </td>
                    <td class="tabular-nums px-3 py-2 text-end">{{ sharePct(r.value) }}%</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div role="region" [attr.aria-label]="title()" class="space-y-2.5" [style.min-height.px]="height()">
            @for (r of sorted(); track r.code) {
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span style="color: var(--color-text)" class="font-medium">{{ r.name }}</span>
                  <span style="color: var(--color-text-muted)" class="tabular-nums">
                    {{ r.formattedValue ?? r.value + (unit() ? ' ' + unit() : '') }}
                  </span>
                </div>
                <div
                  style="background-color: var(--color-canvas); border-radius: var(--radius-full)"
                  class="h-2 w-full overflow-hidden"
                >
                  <div
                    [style.width.%]="widthPct(r.value)"
                    [style.background-color]="pickBucketColor(r.value)"
                    style="border-radius: var(--radius-full)"
                    class="h-full transition-all"
                  ></div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class RegionMapComponent {
  readonly title = input.required<string>();
  readonly regions = input<RegionMetric[]>([]);
  readonly unit = input('');
  readonly height = input(280);
  readonly loading = input(false);
  readonly empty = input(false);

  readonly seqTokens = SEQ_TOKENS;
  readonly showTable = signal(false);

  readonly sorted = computed(() => [...this.regions()].sort((a, b) => b.value - a.value));
  readonly maxVal = computed(() => Math.max(...this.regions().map((r) => r.value), 1));
  readonly totalVal = computed(() => Math.max(this.regions().reduce((s, r) => s + r.value, 0), 1));

  widthPct(val: number): number {
    return Math.max(6, Math.round((val / this.maxVal()) * 100));
  }

  sharePct(val: number): string {
    return ((val / this.totalVal()) * 100).toFixed(1);
  }

  pickBucketColor(val: number): string {
    const ratio = Math.min(1, Math.max(0, val / this.maxVal()));
    const idx = Math.min(SEQ_TOKENS.length - 1, Math.floor(ratio * SEQ_TOKENS.length));
    return SEQ_TOKENS[idx];
  }
}
