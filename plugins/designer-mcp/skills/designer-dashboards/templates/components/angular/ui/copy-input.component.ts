import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'rd-copy-input',
  standalone: true,
  template: `
    <div
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
      class="flex w-full items-stretch overflow-hidden border"
    >
      <input
        [value]="value()"
        [readonly]="readonly()"
        style="color: var(--color-text)"
        class="h-[38px] min-w-0 flex-1 bg-transparent px-3 font-mono text-xs focus:outline-none"
      />
      <button
        type="button"
        [attr.aria-label]="copyLabel()"
        style="background-color: var(--color-canvas); border-color: var(--color-border); color: var(--color-text)"
        class="inline-flex shrink-0 cursor-pointer items-center border-s px-3 text-xs font-semibold transition-colors hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)]"
        (click)="copyValue()"
      >
        {{ copied() ? 'Copied' : 'Copy' }}
      </button>
    </div>
  `,
})
export class CopyInputComponent {
  readonly value = input('');
  readonly copyLabel = input('Copy to clipboard');
  readonly readonly = input(true);
  readonly copied = signal(false);

  async copyValue(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value());
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }
}
