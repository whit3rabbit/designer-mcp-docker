<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    disabled?: boolean;
  }>(),
  { min: -Infinity, max: Infinity, step: 1, label: 'Quantity', disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
const clamp = (n: number) => Math.max(props.min, Math.min(props.max, n));
</script>

<template>
  <div
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-md)',
    }"
    class="inline-flex h-[38px] items-center overflow-hidden border"
  >
    <button
      type="button"
      :aria-label="`Decrease ${label}`"
      :disabled="disabled || modelValue <= min"
      :style="{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }"
      class="flex h-full w-9 cursor-pointer items-center justify-center border-e text-sm font-semibold hover:bg-[var(--color-canvas)] disabled:opacity-45"
      @click="emit('update:modelValue', clamp(modelValue - step))"
    >
      −
    </button>
    <input
      type="number"
      :aria-label="label"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :style="{ color: 'var(--color-text)' }"
      class="tabular-nums h-full w-16 bg-transparent text-center text-sm font-medium outline-none"
      @input="emit('update:modelValue', clamp(Number(($event.target as HTMLInputElement).value) || 0))"
    />
    <button
      type="button"
      :aria-label="`Increase ${label}`"
      :disabled="disabled || modelValue >= max"
      :style="{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }"
      class="flex h-full w-9 cursor-pointer items-center justify-center border-s text-sm font-semibold hover:bg-[var(--color-canvas)] disabled:opacity-45"
      @click="emit('update:modelValue', clamp(modelValue + step))"
    >
      +
    </button>
  </div>
</template>
