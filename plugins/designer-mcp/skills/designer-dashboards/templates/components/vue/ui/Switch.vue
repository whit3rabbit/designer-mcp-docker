<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
  }>(),
  { disabled: false, size: 'md' },
);

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const trackClass = computed(() => (props.size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'));
const thumbClass = computed(() => (props.size === 'sm' ? 'size-3.5' : 'size-4'));
const translateClass = computed(() => {
  if (props.size === 'sm') {
    return props.modelValue ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0.5 rtl:-translate-x-0.5';
  }
  return props.modelValue ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-1 rtl:-translate-x-1';
});
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div v-if="label || description" class="space-y-0.5">
      <span v-if="label" :style="{ color: 'var(--color-text)' }" class="block text-xs font-medium">{{ label }}</span>
      <span v-if="description" :style="{ color: 'var(--color-text-muted)' }" class="block text-[11px]">
        {{ description }}
      </span>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label || 'Toggle'"
      :disabled="disabled"
      :style="{
        backgroundColor: modelValue ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: 'var(--radius-full)',
      }"
      :class="[
        'relative inline-flex shrink-0 cursor-pointer items-center transition-colors disabled:cursor-not-allowed disabled:opacity-55',
        trackClass,
      ]"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        :style="{ backgroundColor: 'var(--color-on-solid)', borderRadius: 'var(--radius-full)' }"
        :class="['inline-block transition-transform', thumbClass, translateClass]"
      />
    </button>
  </div>
</template>
