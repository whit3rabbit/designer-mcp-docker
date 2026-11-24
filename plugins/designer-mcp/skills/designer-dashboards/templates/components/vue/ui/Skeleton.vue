<script setup lang="ts">
withDefaults(
  defineProps<{
    rounded?: 'sm' | 'md' | 'lg' | 'full';
  }>(),
  { rounded: 'md' },
);
</script>

<template>
  <div
    aria-hidden="true"
    :style="{ borderRadius: `var(--radius-${rounded})`, backgroundColor: 'var(--color-border)' }"
    class="rd-shimmer animate-pulse"
  />
</template>
