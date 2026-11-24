import { Component, input, output } from '@angular/core';

@Component({
  selector: 'rd-drawer',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex justify-end">
        <div class="fixed inset-0 bg-black/50" (click)="close.emit()"></div>
        <aside
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          style="background-color: var(--color-surface); border-color: var(--color-border)"
          class="relative z-10 flex h-full w-full max-w-md flex-col border-s p-6 shadow-xl"
        >
          <header class="mb-4 flex items-center justify-between gap-4">
            <h2 class="text-base font-semibold">{{ title() }}</h2>
            <button type="button" aria-label="Close drawer" class="cursor-pointer rounded p-1" (click)="close.emit()">✕</button>
          </header>
          <div class="flex-1 overflow-y-auto">
            <ng-content />
          </div>
        </aside>
      </div>
    }
  `,
})
export class DrawerComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly close = output<void>();
}
