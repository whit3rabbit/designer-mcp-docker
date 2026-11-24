<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';
import EmptyState from './EmptyState.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    loading?: boolean;
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    allowFullscreen?: boolean;
    allowPin?: boolean;
  }>(),
  {
    loading: false,
    empty: false,
    emptyTitle: 'No data available',
    emptyDescription: 'Try adjusting your filters or date range.',
    allowFullscreen: false,
    allowPin: false,
  },
);

const fullscreen = ref(false);
const pinned = ref(false);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && fullscreen.value) fullscreen.value = false;
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <section
    :aria-label="title"
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: pinned ? 'var(--color-primary-border)' : 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      zIndex: fullscreen ? 'var(--z-modal)' : undefined,
    }"
    :class="['rd-card flex flex-col border transition-shadow', fullscreen && 'fixed inset-4 overflow-auto']"
  >
    <header
      :style="{ borderColor: 'var(--color-border)' }"
      class="flex items-start justify-between gap-3 border-b px-6 py-4"
    >
      <div class="min-w-0">
        <h2
          :style="{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }"
          class="truncate text-base leading-snug"
        >
          {{ title }}
        </h2>
        <p v-if="subtitle" :style="{ color: 'var(--color-text-muted)' }" class="mt-0.5 text-xs">
          {{ subtitle }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <slot name="actions" />
        <Button
          v-if="allowPin"
          :variant="pinned ? 'tonal' : 'ghost'"
          :tone="pinned ? 'primary' : 'neutral'"
          size="xs"
          icon-only
          :aria-label="pinned ? `Unpin ${title}` : `Pin ${title}`"
          :aria-pressed="pinned"
          @click="pinned = !pinned"
        >
          <AppIcon name="pin" :size="14" />
        </Button>
        <Button
          v-if="allowFullscreen"
          variant="ghost"
          tone="neutral"
          size="xs"
          icon-only
          :aria-label="fullscreen ? `Exit fullscreen for ${title}` : `Fullscreen ${title}`"
          @click="fullscreen = !fullscreen"
        >
          <AppIcon :name="fullscreen ? 'minimize' : 'maximize'" :size="14" />
        </Button>
      </div>
    </header>

    <div class="flex-1 p-6">
      <div v-if="loading" class="space-y-3" aria-busy="true">
        <div class="rd-shimmer h-5 w-1/3 rounded" />
        <div class="rd-shimmer h-40 w-full rounded" />
      </div>
      <EmptyState v-else-if="empty" :title="emptyTitle" :description="emptyDescription" />
      <slot v-else />
    </div>

    <footer
      v-if="$slots.footer"
      :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }"
      class="border-t px-6 py-3 text-xs"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>
