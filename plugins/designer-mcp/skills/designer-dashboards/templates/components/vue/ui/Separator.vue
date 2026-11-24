<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical';
    label?: string;
  }>(),
  { orientation: 'horizontal' },
);
</script>

<template>
  <div
    v-if="orientation === 'vertical'"
    role="separator"
    aria-orientation="vertical"
    :style="{ backgroundColor: 'var(--color-border)' }"
    class="inline-block h-full min-h-4 w-px shrink-0"
  />
  <div v-else-if="label" role="separator" aria-orientation="horizontal" class="flex items-center gap-3">
    <span :style="{ backgroundColor: 'var(--color-border)' }" class="h-px flex-1" />
    <span
      :style="{ color: 'var(--color-text-muted)' }"
      class="text-[11px] font-medium uppercase tracking-wider"
    >
      {{ label }}
    </span>
    <span :style="{ backgroundColor: 'var(--color-border)' }" class="h-px flex-1" />
  </div>
  <div
    v-else
    role="separator"
    aria-orientation="horizontal"
    :style="{ backgroundColor: 'var(--color-border)' }"
    class="h-px w-full shrink-0"
  />
</template>
