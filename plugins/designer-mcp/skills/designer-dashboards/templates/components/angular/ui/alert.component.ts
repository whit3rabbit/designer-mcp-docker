import { Component, input } from '@angular/core';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'rd-alert',
  standalone: true,
  template: `
    <div
      [attr.role]="tone() === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="tone() === 'error' ? 'assertive' : 'polite'"
      [style.background-color]="'var(--color-' + tone() + '-surface)'"
      [style.border-color]="'var(--color-' + tone() + '-border)'"
      [style.color]="'var(--color-' + tone() + ')'"
      style="border-radius: var(--radius-md)"
      class="flex items-start justify-between gap-3 border px-4 py-3 text-sm"
    >
      <div class="min-w-0 space-y-0.5">
        @if (title()) {
          <p class="font-semibold">{{ title() }}</p>
        }
        <div class="text-xs opacity-90">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AlertComponent {
  readonly tone = input<AlertTone>('info');
  readonly title = input<string>();
}
