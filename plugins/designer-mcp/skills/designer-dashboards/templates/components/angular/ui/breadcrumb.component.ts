import { Component, input } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

@Component({
  selector: 'rd-breadcrumb',
  standalone: true,
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center text-xs">
      <ol class="flex flex-wrap items-center gap-1.5">
        @for (item of items(); track item.label; let idx = $index; let last = $last) {
          <li class="flex items-center gap-1.5">
            @if (idx > 0) {
              <span aria-hidden="true" style="color: var(--color-text-muted)" class="rtl:rotate-180">/</span>
            }
            @if (last) {
              <span aria-current="page" style="color: var(--color-text)" class="font-semibold">
                {{ item.label }}
              </span>
            } @else if (item.href) {
              <a [href]="item.href" style="color: var(--color-text-muted)" class="hover:underline">
                {{ item.label }}
              </a>
            } @else {
              <span style="color: var(--color-text-muted)">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
