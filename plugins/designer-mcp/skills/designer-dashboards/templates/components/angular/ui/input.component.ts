import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'rd-input',
  standalone: true,
  template: `
    <input
      [id]="id()"
      [type]="type()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [attr.aria-invalid]="invalid() || null"
      [style.backgroundColor]="'var(--color-surface)'"
      [style.borderColor]="invalid() ? 'var(--color-error)' : 'var(--color-border)'"
      [style.color]="'var(--color-text)'"
      [style.borderRadius]="'var(--radius-md)'"
      [class]="
        'w-full border px-3 transition-colors placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-55 ' +
        sizeClass()
      "
      (input)="valueChange.emit($any($event.target).value)"
    />
  `,
})
export class InputComponent {
  readonly id = input('');
  readonly type = input('text');
  readonly value = input('');
  readonly placeholder = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  readonly sizeClass = computed(() =>
    this.size() === 'sm' ? 'h-8 text-xs' : this.size() === 'lg' ? 'h-11 text-sm' : 'h-[38px] text-sm',
  );
}
