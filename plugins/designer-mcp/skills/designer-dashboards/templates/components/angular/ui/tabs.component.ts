import { Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'rd-tabs',
  standalone: true,
  template: `
    <div role="tablist" style="border-color: var(--color-border)" class="flex flex-wrap gap-1 border-b">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="activeId() === tab.id"
          [style.border-color]="activeId() === tab.id ? 'var(--color-primary)' : 'transparent'"
          [style.color]="activeId() === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)'"
          class="cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors"
          (click)="activeChange.emit(tab.id)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
  `,
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeId = input.required<string>();
  readonly activeChange = output<string>();
}
