<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: [number, number];
    min?: number;
    max?: number;
    step?: number;
    minGap?: number;
    label?: string;
    unit?: string;
    disabled?: boolean;
  }>(),
  { min: 0, max: 100, step: 1, minGap: 0, unit: '', disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: [number, number]] }>();

const span = computed(() => Math.max(1, props.max - props.min));
const startPct = computed(() => ((props.modelValue[0] - props.min) / span.value) * 100);
const endPct = computed(() => ((props.modelValue[1] - props.min) / span.value) * 100);

function updateLow(next: number) {
  const clamped = Math.min(Math.max(props.min, next), props.modelValue[1] - props.minGap);
  emit('update:modelValue', [clamped, props.modelValue[1]]);
}

function updateHigh(next: number) {
  const clamped = Math.max(Math.min(props.max, next), props.modelValue[0] + props.minGap);
  emit('update:modelValue', [props.modelValue[0], clamped]);
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs">
      <span v-if="label" style="color: var(--color-text)" class="font-medium">{{ label }}</span>
      <span style="color: var(--color-text-muted)" class="tabular-nums ms-auto font-medium">
        {{ modelValue[0] }}{{ unit }} – {{ modelValue[1] }}{{ unit }}
      </span>
    </div>
    <div class="relative flex h-6 items-center">
      <div
        style="background-color: var(--color-canvas); border-radius: var(--radius-full)"
        class="relative h-2 w-full overflow-hidden"
      >
        <div
          :style="{
            backgroundColor: 'var(--color-primary)',
            insetInlineStart: `${startPct}%`,
            width: `${Math.max(0, endPct - startPct)}%`,
          }"
          class="absolute top-0 bottom-0"
        />
      </div>
      <input
        type="range"
        :aria-label="label ? `${label} minimum` : 'Minimum value'"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue[0]"
        :disabled="disabled"
        class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
        @input="updateLow(Number(($event.target as HTMLInputElement).value))"
      />
      <input
        type="range"
        :aria-label="label ? `${label} maximum` : 'Maximum value'"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue[1]"
        :disabled="disabled"
        class="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
        @input="updateHigh(Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </div>
</template>
