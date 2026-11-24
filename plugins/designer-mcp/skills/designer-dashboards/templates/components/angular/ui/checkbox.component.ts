import { Component, input, output } from '@angular/core';

@Component({
  selector: 'rd-checkbox',
  standalone: true,
  template: `
    <label class="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        style="accent-color: var(--color-primary)"
        class="mt-0.5 size-4 shrink-0 cursor-pointer rounded"
        (change)="checkedChange.emit($any($event.target).checked)"
      />
      @if (label() || description()) {
        <span class="space-y-0.5">
          @if (label()) {
            <span style="color: var(--color-text)" class="block text-xs font-medium">{{ label() }}</span>
          }
          @if (description()) {
            <span style="color: var(--color-text-muted)" class="block text-[11px]">{{ description() }}</span>
          }
        </span>
      }
    </label>
  `,
})
export class CheckboxComponent {
  readonly checked = input(false);
  readonly label = input('');
  readonly description = input('');
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();
}
