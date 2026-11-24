<script setup lang="ts">
import { computed, ref } from 'vue';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt: string;
    fallback?: string;
    size?: AvatarSize;
    status?: AvatarStatus;
  }>(),
  { size: 'md' },
);

const imgError = ref(false);

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-base',
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: 'var(--color-success)',
  offline: 'var(--color-text-muted)',
  busy: 'var(--color-error)',
  away: 'var(--color-warning)',
};

const initials = computed(() => {
  if (props.fallback) return props.fallback;
  return props.alt
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
});
</script>

<template>
  <div
    :style="{
      backgroundColor: 'var(--color-primary-surface)',
      color: 'var(--color-primary)',
      borderColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-full)',
    }"
    :class="[
      'relative inline-flex shrink-0 items-center justify-center font-semibold select-none',
      SIZE_CLASSES[size],
    ]"
  >
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt"
      :style="{ borderRadius: 'var(--radius-full)' }"
      class="size-full object-cover"
      @error="imgError = true"
    />
    <span v-else :aria-label="alt">{{ initials || '?' }}</span>
    <span
      v-if="status"
      :aria-label="`Status: ${status}`"
      :style="{
        backgroundColor: STATUS_COLORS[status],
        borderColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-full)',
      }"
      class="absolute bottom-0 end-0 size-2.5 border-2"
    />
  </div>
</template>
