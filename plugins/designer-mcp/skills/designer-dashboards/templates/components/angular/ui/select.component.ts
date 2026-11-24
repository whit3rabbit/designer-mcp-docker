import { Component, input, output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'rd-select',
  standalone: true,
  template: `
    <select
      [value]="value()"
      [attr.aria-label]="ariaLabel()"
      style="background-color: var(--color-surface); border-color: var(--color-border); color: var(--color-text); border-radius: var(--radius-md)"
      class="w-full border px-3 py-2 text-sm focus:outline-none"
      (change)="valueChange.emit($any($event.target).value)"
    >
      @for (opt of options(); track opt.value) {
        <option [value]="opt.value">{{ opt.label }}</option>
      }
    </select>
  `,
})
export class SelectComponent {
  readonly options = input.required<SelectOption[]>();
  readonly value = input('');
  readonly ariaLabel = input('Select option');
  readonly valueChange = output<string>();
}
