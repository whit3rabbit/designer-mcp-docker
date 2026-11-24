<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const props = withDefaults(
  defineProps<{
    tone?: AlertTone;
    title?: string;
    dismissible?: boolean;
  }>(),
  { tone: 'info', dismissible: false },
);

const emit = defineEmits<{ dismiss: [] }>();
const visible = ref(true);

function handleDismiss() {
  visible.value = false;
  emit('dismiss');
}
</script>

<template>
  <div
    v-if="visible"
    :role="tone === 'error' ? 'alert' : 'status'"
    :aria-live="tone === 'error' ? 'assertive' : 'polite'"
    :style="{
      backgroundColor: `var(--color-${tone}-surface)`,
      borderColor: `var(--color-${tone}-border)`,
      color: `var(--color-${tone})`,
      borderRadius: 'var(--radius-md)',
    }"
    class="flex items-start justify-between gap-3 border px-4 py-3 text-sm"
  >
    <div class="min-w-0 space-y-0.5">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <div class="text-xs opacity-90">
        <slot />
      </div>
    </div>
    <Button
      v-if="dismissible"
      variant="ghost"
      :tone="tone"
      size="xs"
      icon-only
      aria-label="Dismiss alert"
      @click="handleDismiss"
    >
      <AppIcon name="x" :size="14" />
    </Button>
  </div>
</template>
