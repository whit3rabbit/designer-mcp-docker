import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { navigationConfig } from '../configs/navigation.config';
import { ThemeService } from '../@core/theme/theme.service';
import {
  filterNavByAuthority,
  getCurrentNavItem,
  getHorizontalNav,
  getNavBreadcrumb,
} from '../@menu/use-menu';
import { NavMenuComponent } from '../@menu/nav-menu.component';
import { HorizontalNavComponent } from '../@menu/horizontal-nav.component';
import { BreadcrumbComponent } from '../components/ui/breadcrumb.component';

@Component({
  selector: 'rd-app-shell',
  standalone: true,
  imports: [NavMenuComponent, HorizontalNavComponent, BreadcrumbComponent],
  template: `
    <div style="background-color: var(--color-canvas); color: var(--color-text)" class="flex min-h-screen">
      <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      @if (!isHorizontal() && !isSidebarless()) {
        <aside
          style="background-color: var(--color-surface); border-color: var(--color-border)"
          [class]="isCollapsed() ? 'hidden w-[76px] shrink-0 flex-col border-e p-3 lg:flex' : 'hidden w-[272px] shrink-0 flex-col border-e p-3 lg:flex'"
        >
          <div class="mb-4 px-2 font-bold">
            {{ isCollapsed() ? 'RD' : brandName() }}
          </div>
          <div class="flex-1 overflow-y-auto">
            <rd-nav-menu [items]="mainNav()" [pathname]="pathname()" [collapsed]="isCollapsed()" (navigate)="handleNavigate($event)" />
          </div>
          @if (bottomNav().length) {
            <div style="border-color: var(--color-border)" class="border-t pt-3">
              <rd-nav-menu [items]="bottomNav()" [pathname]="pathname()" [collapsed]="isCollapsed()" [showPinned]="false" (navigate)="handleNavigate($event)" />
            </div>
          }
        </aside>
      }

      @if (mobileOpen()) {
        <div class="fixed inset-0 z-50 flex lg:hidden">
          <div class="fixed inset-0 bg-black/50" (click)="mobileOpen.set(false)"></div>
          <aside style="background-color: var(--color-surface)" class="relative z-10 w-72 p-4">
            <div class="mb-4 flex items-center justify-between">
              <span class="font-bold">{{ brandName() }}</span>
              <button type="button" aria-label="Close menu" (click)="mobileOpen.set(false)">✕</button>
            </div>
            <rd-nav-menu [items]="visibleNav()" [pathname]="pathname()" (navigate)="handleNavigate($event)" />
          </aside>
        </div>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        @if (!currentItem()?.meta?.hideHeader) {
          <header
            style="background-color: var(--color-surface); border-color: var(--color-border)"
            class="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6"
          >
            <div class="flex items-center gap-3">
              <button type="button" class="rounded-md p-2 lg:hidden" aria-label="Open menu" (click)="mobileOpen.set(true)">☰</button>
              @if (isHorizontal()) {
                <span class="font-bold">{{ brandName() }}</span>
                <rd-horizontal-nav [items]="horizontalNav()" [pathname]="pathname()" (navigate)="handleNavigate($event)" />
              }
            </div>
            <div class="flex items-center gap-2 text-xs">
              <button type="button" class="rounded-md border px-2 py-1" (click)="theme.toggleSidebar()">Sidebar</button>
              <button type="button" class="rounded-md border px-2 py-1" (click)="theme.toggleDarkMode()">Theme</button>
              <button type="button" class="rounded-md border px-2 py-1" (click)="theme.toggleDir()">{{ theme.effective().dir.toUpperCase() }}</button>
            </div>
          </header>
        }

        <main
          id="main-content"
          tabindex="-1"
          [class]="theme.effective().contentWidth === 'boxed' ? 'mx-auto w-full max-w-[1400px] flex-1 p-4 focus:outline-none lg:p-6' : 'flex-1 p-4 focus:outline-none lg:p-6'"
        >
          @if (breadcrumbItems().length) {
            <div class="mb-4">
              <rd-breadcrumb [items]="breadcrumbItems()" />
            </div>
          }
          <ng-content />
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  readonly theme = inject(ThemeService);
  readonly brandName = input('Designer Dashboards');
  readonly pathname = input.required<string>();
  readonly userRoles = input<string[]>(['admin', 'user']);
  readonly navigate = output<string>();

  readonly mobileOpen = signal(false);

  readonly visibleNav = computed(() => filterNavByAuthority(navigationConfig, this.userRoles()));
  readonly mainNav = computed(() => this.visibleNav().filter((i) => !i.bottom));
  readonly bottomNav = computed(() => this.visibleNav().filter((i) => i.bottom));
  readonly horizontalNav = computed(() => getHorizontalNav(this.visibleNav()));
  readonly currentItem = computed(() => getCurrentNavItem(this.visibleNav(), this.pathname()));
  readonly breadcrumbItems = computed(() =>
    getNavBreadcrumb(this.visibleNav(), this.pathname()).map((i) => ({ label: i.title, href: i.path })),
  );

  readonly isCollapsed = computed(() => {
    const l = this.theme.effective().layout;
    return l === 'collapsed' || l === 'hover';
  });
  readonly isHorizontal = computed(() => {
    const l = this.theme.effective().layout;
    return l === 'horizontal' || l === 'compact-topbar';
  });
  readonly isSidebarless = computed(() => this.theme.effective().layout === 'sidebarless');

  constructor() {
    effect(() => {
      const item = this.currentItem();
      if (item && typeof document !== 'undefined') {
        document.title = `${item.title} · ${this.brandName()}`;
      }
    });
  }

  handleNavigate(path: string): void {
    this.mobileOpen.set(false);
    this.navigate.emit(path);
  }
}
