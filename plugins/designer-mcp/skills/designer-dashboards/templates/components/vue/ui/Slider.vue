<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    disabled?: boolean;
  }>(),
  { min: 0, max: 100, step: 1, unit: '', disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between text-xs">
      <span v-if="label" :style="{ color: 'var(--color-text)' }" class="font-medium">{{ label }}</span>
      <span :style="{ color: 'var(--color-text-muted)' }" class="tabular-nums font-medium">
        {{ modelValue }}{{ unit }}
      </span>
    </div>
    <input
      type="range"
      :aria-label="label || 'Slider'"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :disabled="disabled"
      :style="{ accentColor: 'var(--color-primary)' }"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-55"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>
