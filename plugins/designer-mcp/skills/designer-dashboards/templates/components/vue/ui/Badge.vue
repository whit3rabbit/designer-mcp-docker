<script setup lang="ts">
import { computed } from 'vue';

export type BadgeTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeVariant = 'solid' | 'tonal' | 'outline' | 'dot';

const props = withDefaults(
  defineProps<{
    tone?: BadgeTone;
    variant?: BadgeVariant;
  }>(),
  { tone: 'primary', variant: 'tonal' },
);

const color = computed(() =>
  props.tone === 'neutral' ? 'var(--color-text)' : `var(--color-${props.tone})`,
);

const variantStyle = computed(() => {
  const surface =
    props.tone === 'neutral' ? 'var(--color-canvas)' : `var(--color-${props.tone}-surface)`;
  const border =
    props.tone === 'neutral' ? 'var(--color-border)' : `var(--color-${props.tone}-border)`;

  if (props.variant === 'solid') {
    return { backgroundColor: color.value, color: 'var(--color-on-solid)' };
  }
  if (props.variant === 'outline') {
    return { border: `1px solid ${border}`, color: color.value, backgroundColor: 'transparent' };
  }
  return { backgroundColor: surface, color: color.value };
});
</script>

<template>
  <span
    :style="{ borderRadius: 'var(--radius-full)', ...variantStyle }"
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold leading-tight"
  >
    <span
      v-if="variant === 'dot'"
      aria-hidden="true"
      :style="{ backgroundColor: color, borderRadius: 'var(--radius-full)' }"
      class="size-1.5 shrink-0"
    />
    <slot />
  </span>
</template>
