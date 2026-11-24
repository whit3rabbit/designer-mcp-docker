<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

withDefaults(defineProps<{ align?: 'start' | 'end' }>(), { align: 'start' });

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

function onPointer(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false;
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false;
}

onMounted(() => {
  document.addEventListener('mousedown', onPointer);
  window.addEventListener('keydown', onKey);
});
onUnmounted(() => {
  document.removeEventListener('mousedown', onPointer);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <span role="button" tabindex="0" :aria-expanded="open" class="inline-flex cursor-pointer" @click="open = !open">
      <slot name="trigger" />
    </span>
    <div
      v-if="open"
      :style="{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-dropdown)',
      }"
      :class="['absolute mt-2 min-w-64 border p-4', align === 'end' ? 'end-0' : 'start-0']"
    >
      <slot />
    </div>
  </div>
</template>
