import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { ButtonComponent } from './button.component';
import { ChartWrapperComponent } from './chart-wrapper.component';

@Component({
  selector: 'rd-live-chart',
  standalone: true,
  imports: [ButtonComponent, ChartWrapperComponent],
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span
          role="status"
          aria-live="polite"
          [style.color]="paused() ? 'var(--color-text-muted)' : 'var(--color-success)'"
          class="inline-flex items-center gap-1.5 font-medium"
        >
          <span
            aria-hidden="true"
            [style.background-color]="paused() ? 'var(--color-text-muted)' : 'var(--color-success)'"
            style="border-radius: var(--radius-full)"
            class="size-2"
          ></span>
          {{ paused() ? 'Stream paused' : 'Live stream active' }}
        </span>
        <rd-button variant="outline" tone="neutral" size="xs" (click)="paused.set(!paused())">
          {{ paused() ? 'Resume' : 'Pause' }}
        </rd-button>
      </div>
      <rd-chart-wrapper
        [title]="title()"
        [type]="type()"
        [height]="height()"
        [categories]="labels()"
        [series]="chartSeries()"
        [options]="{ chart: { animations: { enabled: false } } }"
      />
    </div>
  `,
})
export class LiveChartComponent {
  readonly title = input.required<string>();
  readonly type = input<'area' | 'line' | 'bar'>('area');
  readonly seriesName = input('Throughput');
  readonly maxPoints = input(20);
  readonly intervalMs = input(2000);
  readonly height = input(280);

  readonly points = signal<number[]>([42, 48, 45, 53, 50, 58, 56, 62, 59, 64]);
  readonly labels = signal<string[]>(['-20s', '-18s', '-16s', '-14s', '-12s', '-10s', '-8s', '-6s', '-4s', '-2s']);
  readonly paused = signal(false);
  readonly chartSeries = computed(() => [{ name: this.seriesName(), data: this.points() }]);

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.paused.set(true);
        return;
      }
      const timer = window.setInterval(() => {
        if (this.paused()) return;
        this.points.update((prev) => {
          const last = prev[prev.length - 1] ?? 50;
          const next = Math.max(10, Math.round(last + (Math.random() - 0.48) * 10));
          return [...prev, next].slice(-this.maxPoints());
        });
        this.labels.update((prev) => {
          const now = new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
          return [...prev, now].slice(-this.maxPoints());
        });
      }, this.intervalMs());
      this.destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }
}
