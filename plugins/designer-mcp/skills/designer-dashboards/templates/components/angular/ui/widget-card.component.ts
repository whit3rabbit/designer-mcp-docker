import { Component, input } from '@angular/core';

@Component({
  selector: 'rd-widget-card',
  standalone: true,
  template: `
    <section
      [attr.aria-label]="title()"
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm)"
      class="rd-card flex flex-col border"
    >
      <header style="border-color: var(--color-border)" class="border-b px-6 py-4">
        <h2
          style="color: var(--color-text); font-weight: var(--font-heading-weight)"
          class="truncate text-base leading-snug"
        >
          {{ title() }}
        </h2>
        @if (subtitle()) {
          <p style="color: var(--color-text-muted)" class="mt-0.5 text-xs">{{ subtitle() }}</p>
        }
      </header>
      <div class="flex-1 p-6">
        <ng-content />
      </div>
    </section>
  `,
})
export class WidgetCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
