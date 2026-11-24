import { Component, computed, input } from '@angular/core';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';

@Component({
  selector: 'rd-badge',
  standalone: true,
  template: `
    <span
      [style]="badgeStyle()"
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold leading-tight"
    >
      @if (variant() === 'dot') {
        <span
          aria-hidden="true"
          [style.background-color]="dotColor()"
          style="border-radius: var(--radius-full)"
          class="size-1.5 shrink-0"
        ></span>
      }
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('primary');
  readonly variant = input<BadgeVariant>('tonal');

  readonly dotColor = computed(() =>
    this.tone() === 'neutral' ? 'var(--color-text)' : `var(--color-${this.tone})`,
  );

  readonly badgeStyle = computed(() => {
    const t = this.tone();
    const v = this.variant();
    const color = this.dotColor();
    const surface = t === 'neutral' ? 'var(--color-canvas)' : `var(--color-${t}-surface)`;
    const border = t === 'neutral' ? 'var(--color-border)' : `var(--color-${t}-border)`;

    if (v === 'solid') {
      return { borderRadius: 'var(--radius-full)', backgroundColor: color, color: 'var(--color-on-solid)' };
    }
    if (v === 'outline') {
      return { borderRadius: 'var(--radius-full)', border: `1px solid ${border}`, color, backgroundColor: 'transparent' };
    }
    return { borderRadius: 'var(--radius-full)', backgroundColor: surface, color };
  });
}
