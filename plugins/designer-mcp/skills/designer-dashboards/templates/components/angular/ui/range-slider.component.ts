import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'rd-range-slider',
  standalone: true,
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        @if (label()) {
          <span style="color: var(--color-text)" class="font-medium">{{ label() }}</span>
        }
        <span style="color: var(--color-text-muted)" class="tabular-nums ms-auto font-medium">
          {{ value()[0] }}{{ unit() }} – {{ value()[1] }}{{ unit() }}
        </span>
      </div>
      <div class="relative flex h-6 items-center">
        <div
          style="background-color: var(--color-canvas); border-radius: var(--radius-full)"
          class="relative h-2 w-full overflow-hidden"
        >
          <div
            [style.backgroundColor]="'var(--color-primary)'"
            [style.insetInlineStart.%]="startPct()"
            [style.width.%]="widthPct()"
            class="absolute top-0 bottom-0"
          ></div>
        </div>
        <input
          type="range"
          [attr.aria-label]="label() ? label() + ' minimum' : 'Minimum value'"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()[0]"
          class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
          (input)="updateLow(+$any($event.target).value)"
        />
        <input
          type="range"
          [attr.aria-label]="label() ? label() + ' maximum' : 'Maximum value'"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()[1]"
          class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
          (input)="updateHigh(+$any($event.target).value)"
        />
      </div>
    </div>
  `,
})
export class RangeSliderComponent {
  readonly value = input<[number, number]>([20, 80]);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly minGap = input(0);
  readonly label = input('');
  readonly unit = input('');
  readonly valueChange = output<[number, number]>();

  readonly span = computed(() => Math.max(1, this.max() - this.min()));
  readonly startPct = computed(() => ((this.value()[0] - this.min()) / this.span()) * 100);
  readonly widthPct = computed(() =>
    Math.max(0, ((this.value()[1] - this.min()) / this.span()) * 100 - this.startPct()),
  );

  updateLow(next: number): void {
    const [, high] = this.value();
    const clamped = Math.min(Math.max(this.min(), next), high - this.minGap());
    this.valueChange.emit([clamped, high]);
  }

  updateHigh(next: number): void {
    const [low] = this.value();
    const clamped = Math.max(Math.min(this.max(), next), low + this.minGap());
    this.valueChange.emit([low, clamped]);
  }
}
