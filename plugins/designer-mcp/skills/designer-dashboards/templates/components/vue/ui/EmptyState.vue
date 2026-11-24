<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'No data available',
    description: 'Try adjusting your filters or date range.',
  },
);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 text-center">
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true" class="mb-3">
      <circle cx="28" cy="28" r="24" fill="var(--color-primary-surface)" />
      <rect x="17" y="19" width="22" height="18" rx="3" stroke="var(--color-primary)" stroke-width="2" />
      <path d="M21 25H35M21 30H29" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" />
    </svg>
    <p :style="{ color: 'var(--color-text)' }" class="text-sm font-semibold">{{ title }}</p>
    <p :style="{ color: 'var(--color-text-muted)' }" class="mt-1 max-w-xs text-xs">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
