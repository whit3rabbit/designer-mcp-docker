<script setup lang="ts">
export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    items: TabItem[];
    variant?: 'underline' | 'pills' | 'segmented';
  }>(),
  { variant: 'underline' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function triggerStyle(active: boolean) {
  if (!active) return { color: 'var(--color-text-muted)', borderColor: 'transparent' };
  if (props.variant === 'underline') {
    return { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' };
  }
  if (props.variant === 'pills') {
    return {
      backgroundColor: 'var(--color-primary-surface)',
      color: 'var(--color-primary)',
      borderRadius: 'var(--radius-md)',
    };
  }
  return {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxShadow: 'var(--shadow-sm)',
    borderRadius: 'var(--radius-sm)',
  };
}
</script>

<template>
  <div class="w-full">
    <div
      role="tablist"
      :style="{
        borderColor: 'var(--color-border)',
        backgroundColor: variant === 'segmented' ? 'var(--color-canvas)' : undefined,
        borderRadius: variant === 'segmented' ? 'var(--radius-md)' : undefined,
      }"
      :class="[
        'flex items-center gap-1',
        variant === 'underline' && 'border-b',
        variant === 'segmented' && 'inline-flex border p-1',
      ]"
    >
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="modelValue === item.value"
        :disabled="item.disabled"
        :style="triggerStyle(modelValue === item.value)"
        :class="[
          'cursor-pointer px-3 py-2 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
          variant === 'underline' && '-mb-px border-b-2',
        ]"
        @click="emit('update:modelValue', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="pt-4">
      <slot />
    </div>
  </div>
</template>
