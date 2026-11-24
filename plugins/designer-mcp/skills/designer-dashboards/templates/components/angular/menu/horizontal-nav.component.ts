import { Component, input, output, signal } from '@angular/core';
import type { NavItem } from '../configs/navigation.config';
import { isNavActive, isNavSubtreeActive } from './use-menu';

@Component({
  selector: 'rd-horizontal-nav',
  standalone: true,
  template: `
    <nav aria-label="Horizontal menu" class="flex items-center gap-1 overflow-x-auto">
      @for (item of items(); track item.key) {
        <div class="relative">
          @if (item.children?.length) {
            <button
              type="button"
              [attr.aria-expanded]="openKey() === item.key"
              [style.background-color]="isSubtreeActive(item) ? 'var(--color-primary-surface)' : 'transparent'"
              [style.color]="isSubtreeActive(item) ? 'var(--color-primary)' : 'inherit'"
              style="border-radius: var(--radius-md)"
              class="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap"
              (click)="toggle(item.key)"
            >
              <span>{{ item.title }}</span>
              <span aria-hidden="true" class="text-xs">▾</span>
            </button>

            @if (openKey() === item.key) {
              <div
                style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-lg)"
                class="fixed z-50 mt-2 min-w-48 border p-3 shadow-lg"
              >
                @for (child of item.children; track child.key) {
                  @if (child.type === 'title') {
                    <div style="color: var(--color-text-muted)" class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider">
                      {{ child.title }}
                    </div>
                  } @else {
                    <a
                      [href]="child.path ?? '#'"
                      [attr.aria-current]="isActive(child) ? 'page' : null"
                      class="block rounded-md px-3 py-2 text-sm hover:opacity-80"
                      (click)="onItemClick($event, child)"
                    >
                      {{ child.title }}
                    </a>
                  }
                }
              </div>
            }
          } @else {
            <a
              [href]="item.path ?? '#'"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [style.background-color]="isActive(item) ? 'var(--color-primary-surface)' : 'transparent'"
              [style.color]="isActive(item) ? 'var(--color-primary)' : 'inherit'"
              style="border-radius: var(--radius-md)"
              class="flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap"
              (click)="onItemClick($event, item)"
            >
              {{ item.title }}
            </a>
          }
        </div>
      }
    </nav>
  `,
})
export class HorizontalNavComponent {
  readonly items = input.required<NavItem[]>();
  readonly pathname = input.required<string>();
  readonly navigate = output<string>();

  readonly openKey = signal<string | null>(null);

  isActive(item: NavItem): boolean {
    return isNavActive(item, this.pathname());
  }

  isSubtreeActive(item: NavItem): boolean {
    return isNavSubtreeActive(item, this.pathname());
  }

  toggle(key: string): void {
    this.openKey.update((k) => (k === key ? null : key));
  }

  onItemClick(event: MouseEvent, item: NavItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (item.path && !item.isExternalLink) {
      event.preventDefault();
      this.openKey.set(null);
      this.navigate.emit(item.path);
    }
  }
}
