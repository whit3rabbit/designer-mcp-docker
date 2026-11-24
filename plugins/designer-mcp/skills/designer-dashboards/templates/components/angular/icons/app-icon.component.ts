import { Component, Input } from '@angular/core';

@Component({
  selector: 'rd-app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="ariaHidden ? 'true' : null"
      [class]="rtlFlip ? 'rtl:rotate-180 ' + className : className"
    >
      <use [attr.href]="'/icons/lucide-dashboard-sprite.svg#' + name" />
    </svg>
  `,
})
export class AppIconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 18;
  @Input() strokeWidth = 1.5;
  @Input() ariaHidden = true;
  @Input() rtlFlip = false;
  @Input() className = '';
}
