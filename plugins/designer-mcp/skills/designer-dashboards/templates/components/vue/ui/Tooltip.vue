<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    content: string;
    side?: 'top' | 'bottom' | 'start' | 'end';
  }>(),
  { side: 'top' },
);

const visible = ref(false);
const SIDE_CLASSES = {
  top: 'bottom-full start-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full start-1/2 -translate-x-1/2 mt-1.5',
  start: 'end-full top-1/2 -translate-y-1/2 me-1.5',
  end: 'start-full top-1/2 -translate-y-1/2 ms-1.5',
};
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
    @focusin="visible = true"
    @focusout="visible = false"
  >
    <slot />
    <span
      v-if="visible"
      role="tooltip"
      :style="{
        backgroundColor: 'var(--color-text)',
        color: 'var(--color-surface)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 'var(--z-tooltip)',
      }"
      :class="['pointer-events-none absolute whitespace-nowrap px-2.5 py-1 text-[11px] font-medium', SIDE_CLASSES[side]]"
    >
      {{ content }}
    </span>
  </span>
</template>
