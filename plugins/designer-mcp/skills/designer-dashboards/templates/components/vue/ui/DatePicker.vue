<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    min?: string;
    max?: string;
    label?: string;
  }>(),
  { label: 'Select date' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <input
    type="date"
    :aria-label="label"
    :value="modelValue"
    :min="min"
    :max="max"
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text)',
      borderRadius: 'var(--radius-md)',
    }"
    class="h-[38px] border px-3 text-sm"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
