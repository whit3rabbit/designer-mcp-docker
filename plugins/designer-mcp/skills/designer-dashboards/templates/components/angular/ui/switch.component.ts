import { Component, input, output } from '@angular/core';

@Component({
  selector: 'rd-switch',
  standalone: true,
  template: `
    <div class="flex items-center justify-between gap-3">
      @if (label() || description()) {
        <div class="space-y-0.5">
          @if (label()) {
            <span style="color: var(--color-text)" class="block text-xs font-medium">{{ label() }}</span>
          }
          @if (description()) {
            <span style="color: var(--color-text-muted)" class="block text-[11px]">{{ description() }}</span>
          }
        </div>
      }
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || 'Toggle switch'"
        [disabled]="disabled()"
        [style.backgroundColor]="checked() ? 'var(--color-primary)' : 'var(--color-border)'"
        [style.borderRadius]="'var(--radius-full)'"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center transition-colors disabled:cursor-not-allowed disabled:opacity-55"
        (click)="checkedChange.emit(!checked())"
      >
        <span
          style="background-color: var(--color-surface); border-radius: var(--radius-full)"
          [class]="
            'inline-block size-4 shadow-xs transition-transform ' +
            (checked() ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1')
          "
        ></span>
      </button>
    </div>
  `,
})
export class SwitchComponent {
  readonly checked = input(false);
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();
}
