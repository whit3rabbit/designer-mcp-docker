import { Component, input, output } from '@angular/core';

@Component({
  selector: 'rd-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" (click)="close.emit()"></div>
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)"
          class="relative z-10 w-full max-w-lg border p-6 shadow-xl"
        >
          <header class="mb-4 flex items-center justify-between gap-4">
            <h2 class="text-base font-semibold">{{ title() }}</h2>
            <button type="button" aria-label="Close dialog" class="cursor-pointer rounded p-1" (click)="close.emit()">✕</button>
          </header>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly close = output<void>();
}
