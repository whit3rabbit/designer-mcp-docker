import { Component, computed, input } from '@angular/core';
import { BadgeComponent } from './badge.component';

export type KpiTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'rd-kpi-card',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <article
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm)"
      class="rd-card flex flex-col justify-between gap-4 border p-6"
    >
      <div>
        <p style="color: var(--color-text-muted)" class="truncate text-xs font-medium">{{ label() }}</p>
        <p
          style="color: var(--color-text); font-weight: var(--font-heading-weight)"
          class="tabular-nums mt-1.5 text-2xl tracking-tight"
        >
          {{ value() }}
        </p>
      </div>

      @if (delta() !== undefined) {
        <div class="flex items-center gap-2 text-xs">
          <rd-badge [tone]="delta()! >= 0 ? 'success' : 'error'" variant="tonal">
            <span class="tabular-nums">{{ delta()! >= 0 ? '+' : '' }}{{ formattedDelta() }}%</span>
          </rd-badge>
          @if (deltaLabel()) {
            <span style="color: var(--color-text-muted)">{{ deltaLabel() }}</span>
          }
        </div>
      }
    </article>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input<number>();
  readonly deltaLabel = input<string>();
  readonly tone = input<KpiTone>('primary');

  readonly formattedDelta = computed(() => Math.abs(this.delta() ?? 0).toFixed(1));
}
