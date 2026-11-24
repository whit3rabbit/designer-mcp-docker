<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

const props = defineProps<{
  open: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{ close: [] }>();

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close');
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="open" class="fixed inset-0 flex justify-end" :style="{ zIndex: 'var(--z-drawer)' }">
    <div aria-hidden="true" class="fixed inset-0 bg-black/40" @click="emit('close')" />
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        zIndex: 'var(--z-modal)',
      }"
      class="relative flex h-full w-full max-w-md flex-col border-s shadow-xl"
    >
      <header
        :style="{ borderColor: 'var(--color-border)' }"
        class="flex items-start justify-between gap-3 border-b px-5 py-4"
      >
        <div>
          <h2 class="text-base font-semibold">{{ title }}</h2>
          <p v-if="description" :style="{ color: 'var(--color-text-muted)' }" class="mt-0.5 text-xs">
            {{ description }}
          </p>
        </div>
        <Button variant="ghost" tone="neutral" size="xs" icon-only :aria-label="`Close ${title}`" @click="emit('close')">
          <AppIcon name="x" :size="16" />
        </Button>
      </header>
      <div class="flex-1 overflow-y-auto p-5">
        <slot />
      </div>
    </div>
  </div>
</template>
