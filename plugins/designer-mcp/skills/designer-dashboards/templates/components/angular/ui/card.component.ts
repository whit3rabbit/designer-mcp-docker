import { Component, input } from '@angular/core';

@Component({
  selector: 'rd-card',
  standalone: true,
  template: `
    <div
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); color: var(--color-text)"
      class="rd-card border p-6"
    >
      @if (title()) {
        <h3 style="font-weight: var(--font-heading-weight)" class="mb-1 text-base leading-none">
          {{ title() }}
        </h3>
      }
      @if (description()) {
        <p style="color: var(--color-text-muted)" class="mb-4 text-xs">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>();
  readonly description = input<string>();
}
