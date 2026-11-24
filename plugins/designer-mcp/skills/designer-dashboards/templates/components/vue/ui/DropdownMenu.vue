<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export interface DropdownItem {
  key: string;
  label: string;
  tone?: 'neutral' | 'error';
  disabled?: boolean;
}

withDefaults(
  defineProps<{
    items: DropdownItem[];
    align?: 'start' | 'end';
  }>(),
  { align: 'end' },
);

const emit = defineEmits<{ select: [key: string] }>();
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
    <span role="button" tabindex="0" aria-haspopup="menu" :aria-expanded="open" class="inline-flex cursor-pointer" @click="open = !open">
      <slot name="trigger" />
    </span>
    <div
      v-if="open"
      role="menu"
      :style="{
        backgroundColor: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-dropdown)',
      }"
      :class="['absolute mt-1.5 min-w-44 border p-1', align === 'end' ? 'end-0' : 'start-0']"
    >
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        role="menuitem"
        :disabled="item.disabled"
        :style="{
          color: item.tone === 'error' ? 'var(--color-error)' : 'var(--color-text)',
          borderRadius: 'var(--radius-sm)',
        }"
        class="flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-start text-xs font-medium hover:bg-[var(--color-canvas)] disabled:opacity-50"
        @click="emit('select', item.key); open = false"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
