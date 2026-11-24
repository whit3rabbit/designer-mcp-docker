import { Component, computed, input, output, signal } from '@angular/core';
import type { NavItem } from '../configs/navigation.config';
import { getPinnedNavItems, isNavActive, isNavSubtreeActive } from './use-menu';

@Component({
  selector: 'rd-nav-menu',
  standalone: true,
  template: `
    <nav [attr.aria-label]="ariaLabel()" class="space-y-1">
      @if (!collapsed() && pinnedItems().length > 0) {
        <div class="mb-3 space-y-1">
          <div style="color: var(--color-text-muted)" class="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider">
            Pinned
          </div>
          @for (item of pinnedItems(); track item.key) {
            <a
              [href]="item.path ?? '#'"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [style.background-color]="isActive(item) ? 'var(--color-primary-surface)' : 'transparent'"
              [style.color]="isActive(item) ? 'var(--color-primary)' : 'inherit'"
              style="border-radius: var(--radius-md)"
              class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
              (click)="onItemClick($event, item)"
            >
              <span class="truncate">{{ item.title }}</span>
            </a>
          }
        </div>
      }

      @for (item of items(); track item.key) {
        @if (item.type === 'title' && !collapsed()) {
          <div style="color: var(--color-text-muted)" class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider">
            {{ item.title }}
          </div>
        } @else if ((item.type === 'collapse' || item.type === 'group') && item.children?.length) {
          <div class="space-y-1">
            <button
              type="button"
              [attr.aria-expanded]="isGroupOpen(item)"
              [attr.title]="collapsed() ? item.title : null"
              [style.background-color]="isSubtreeActive(item) ? 'var(--color-primary-surface)' : 'transparent'"
              [style.color]="isSubtreeActive(item) ? 'var(--color-primary)' : 'inherit'"
              style="border-radius: var(--radius-md)"
              class="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-colors"
              (click)="toggleGroup(item.key)"
            >
              @if (!collapsed()) {
                <span class="truncate">{{ item.title }}</span>
                <span aria-hidden="true" class="text-xs">{{ isGroupOpen(item) ? '▾' : '▸' }}</span>
              } @else {
                <span class="mx-auto text-xs font-semibold">{{ item.title.slice(0, 2) }}</span>
              }
            </button>

            @if (!collapsed() && isGroupOpen(item)) {
              <div class="space-y-0.5 ps-4">
                @for (child of item.children; track child.key) {
                  @if (child.type === 'title') {
                    <div style="color: var(--color-text-muted)" class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase">
                      {{ child.title }}
                    </div>
                  } @else {
                    <a
                      [href]="child.path ?? '#'"
                      [attr.target]="child.isExternalLink ? '_blank' : null"
                      [attr.rel]="child.isExternalLink ? 'noopener noreferrer' : null"
                      [attr.aria-current]="isActive(child) ? 'page' : null"
                      [style.background-color]="isActive(child) ? 'var(--color-primary-surface)' : 'transparent'"
                      [style.color]="isActive(child) ? 'var(--color-primary)' : 'inherit'"
                      style="border-radius: var(--radius-md)"
                      class="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-colors"
                      (click)="onItemClick($event, child)"
                    >
                      <span class="truncate">{{ child.title }}</span>
                      @if (child.badge) {
                        <span
                          [style.background-color]="'var(--color-' + (child.badge.color ?? 'primary') + '-surface)'"
                          [style.color]="'var(--color-' + (child.badge.color ?? 'primary') + ')'"
                          style="border-radius: var(--radius-full)"
                          class="px-2 py-0.5 text-[11px] font-semibold"
                        >
                          {{ child.badge.value }}
                        </span>
                      }
                    </a>
                  }
                }
              </div>
            }
          </div>
        } @else if (item.type === 'item') {
          <a
            [href]="item.path ?? '#'"
            [attr.target]="item.isExternalLink ? '_blank' : null"
            [attr.rel]="item.isExternalLink ? 'noopener noreferrer' : null"
            [attr.title]="collapsed() ? item.title : null"
            [attr.aria-current]="isActive(item) ? 'page' : null"
            [style.background-color]="isActive(item) ? 'var(--color-primary-surface)' : 'transparent'"
            [style.color]="isActive(item) ? 'var(--color-primary)' : 'inherit'"
            style="border-radius: var(--radius-md)"
            class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
            (click)="onItemClick($event, item)"
          >
            @if (!collapsed()) {
              <span class="truncate">{{ item.title }}</span>
            } @else {
              <span class="mx-auto text-xs font-semibold">{{ item.title.slice(0, 2) }}</span>
            }
          </a>
        }
      }
    </nav>
  `,
})
export class NavMenuComponent {
  readonly items = input.required<NavItem[]>();
  readonly pathname = input.required<string>();
  readonly collapsed = input(false);
  readonly showPinned = input(true);
  readonly ariaLabel = input('Sidebar navigation');
  readonly navigate = output<string>();

  private readonly openMap = signal<Record<string, boolean>>({});
  readonly pinnedItems = computed(() => (this.showPinned() ? getPinnedNavItems(this.items()) : []));

  isActive(item: NavItem): boolean {
    return isNavActive(item, this.pathname());
  }

  isSubtreeActive(item: NavItem): boolean {
    return isNavSubtreeActive(item, this.pathname());
  }

  isGroupOpen(item: NavItem): boolean {
    const map = this.openMap();
    if (map[item.key] !== undefined) return map[item.key];
    return Boolean(item.expanded) || this.isSubtreeActive(item);
  }

  toggleGroup(key: string): void {
    this.openMap.update((m) => ({ ...m, [key]: !m[key] }));
  }

  onItemClick(event: MouseEvent, item: NavItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (item.path && !item.isExternalLink) {
      event.preventDefault();
      this.navigate.emit(item.path);
    }
  }
}
