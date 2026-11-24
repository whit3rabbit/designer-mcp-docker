<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  { size: 'md' },
);

const emit = defineEmits<{ close: [] }>();

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 flex items-center justify-center p-4"
    :style="{ zIndex: 'var(--z-modal)' }"
  >
    <div aria-hidden="true" class="fixed inset-0 bg-black/45 backdrop-blur-[1px]" @click="emit('close')" />
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
      }"
      :class="['relative z-10 flex max-h-[90vh] w-full flex-col border', SIZE_CLASSES[size]]"
    >
      <header
        :style="{ borderColor: 'var(--color-border)' }"
        class="flex items-start justify-between gap-3 border-b px-6 py-4"
      >
        <div class="min-w-0">
          <h2 class="text-base font-semibold">{{ title }}</h2>
          <p v-if="description" :style="{ color: 'var(--color-text-muted)' }" class="mt-0.5 text-xs">
            {{ description }}
          </p>
        </div>
        <Button variant="ghost" tone="neutral" size="xs" icon-only :aria-label="`Close ${title}`" @click="emit('close')">
          <AppIcon name="x" :size="16" />
        </Button>
      </header>
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
      <footer
        v-if="$slots.footer"
        :style="{ borderColor: 'var(--color-border)' }"
        class="flex items-center justify-end gap-2 border-t px-6 py-3.5"
      >
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
