import { Component, input, output } from '@angular/core';

export interface ToggleOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'rd-toggle-group',
  standalone: true,
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="ariaLabel()"
      style="background-color: var(--color-canvas); border-color: var(--color-border); border-radius: var(--radius-md)"
      class="inline-flex items-center gap-1 border p-1"
    >
      @for (opt of options(); track opt.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="value() === opt.value"
          [disabled]="opt.disabled"
          [style.backgroundColor]="value() === opt.value ? 'var(--color-surface)' : 'transparent'"
          [style.color]="value() === opt.value ? 'var(--color-primary)' : 'var(--color-text-muted)'"
          [style.borderRadius]="'var(--radius-sm)'"
          [class]="
            'h-8 cursor-pointer px-3 text-xs font-semibold transition-all hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50 ' +
            (value() === opt.value ? 'shadow-xs' : '')
          "
          (click)="valueChange.emit(opt.value)"
        >
          {{ opt.label }}
        </button>
      }
    </div>
  `,
})
export class ToggleGroupComponent {
  readonly options = input.required<ToggleOption[]>();
  readonly value = input('');
  readonly ariaLabel = input('Toggle options');
  readonly valueChange = output<string>();
}
