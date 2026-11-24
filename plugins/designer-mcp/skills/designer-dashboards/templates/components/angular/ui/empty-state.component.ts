import { Component, input } from '@angular/core';

@Component({
  selector: 'rd-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-10 text-center">
      <p style="color: var(--color-text)" class="text-sm font-semibold">{{ title() }}</p>
      <p style="color: var(--color-text-muted)" class="mt-1 max-w-xs text-xs">{{ description() }}</p>
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('No data available');
  readonly description = input('Try adjusting your filters or date range.');
}
