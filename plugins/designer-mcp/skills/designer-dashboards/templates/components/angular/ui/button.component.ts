import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'rd-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [style]="inlineStyle()"
      [class]="buttonClass()"
    >
      @if (loading()) {
        <span
          aria-hidden="true"
          class="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('solid');
  readonly tone = input<ButtonTone>('primary');
  readonly size = input<ButtonSize>('md');
  readonly iconOnly = input(false);
  readonly fullWidth = input(false);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly buttonClass = computed(() => {
    const sizes: Record<ButtonSize, string> = {
      xs: 'h-7 px-2 text-xs gap-1',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-[38px] px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-sm gap-2',
      xl: 'h-12 px-6 text-base gap-2.5',
    };
    const iconSizes: Record<ButtonSize, string> = {
      xs: 'size-7 p-0',
      sm: 'size-8 p-0',
      md: 'size-[38px] p-0',
      lg: 'size-11 p-0',
      xl: 'size-12 p-0',
    };
    return [
      'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 select-none',
      'active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-55',
      this.variant() === 'link' ? 'underline-offset-4 hover:underline px-1' : '',
      this.fullWidth() ? 'w-full' : '',
      this.iconOnly() ? iconSizes[this.size()] : sizes[this.size()],
    ].join(' ');
  });

  readonly inlineStyle = computed(() => {
    const v = this.variant();
    const t = this.tone();
    const base = t === 'neutral' ? 'var(--color-text)' : `var(--color-${t})`;
    const surface = t === 'neutral' ? 'var(--color-canvas)' : `var(--color-${t}-surface)`;
    const border = t === 'neutral' ? 'var(--color-border)' : `var(--color-${t}-border)`;

    if (v === 'solid') {
      return {
        borderRadius: 'var(--radius-md)',
        backgroundColor: base,
        color: t === 'neutral' ? 'var(--color-surface)' : 'var(--color-on-solid)',
      };
    }
    if (v === 'outline') {
      return {
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${border}`,
        backgroundColor: 'transparent',
        color: base,
      };
    }
    if (v === 'tonal') {
      return { borderRadius: 'var(--radius-md)', backgroundColor: surface, color: base };
    }
    return { borderRadius: 'var(--radius-md)', backgroundColor: 'transparent', color: base };
  });
}
