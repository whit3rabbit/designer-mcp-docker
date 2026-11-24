<script setup lang="ts">
import { computed } from 'vue';

export type ButtonVariant = 'solid' | 'outline' | 'tonal' | 'ghost' | 'link';
export type ButtonTone = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    tone?: ButtonTone;
    size?: ButtonSize;
    iconOnly?: boolean;
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'solid',
    tone: 'primary',
    size: 'md',
    iconOnly: false,
    fullWidth: false,
    loading: false,
    disabled: false,
    type: 'button',
  },
);

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-[38px] px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
};

const ICON_ONLY_SIZES: Record<ButtonSize, string> = {
  xs: 'size-7 p-0',
  sm: 'size-8 p-0',
  md: 'size-[38px] p-0',
  lg: 'size-11 p-0',
  xl: 'size-12 p-0',
};

const toneStyles = computed(() => {
  if (props.tone === 'neutral') {
    if (props.variant === 'solid') {
      return { backgroundColor: 'var(--color-text)', color: 'var(--color-surface)' };
    }
    if (props.variant === 'outline') {
      return {
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      };
    }
    if (props.variant === 'tonal') {
      return { backgroundColor: 'var(--color-canvas)', color: 'var(--color-text)' };
    }
    return { backgroundColor: 'transparent', color: 'var(--color-text)' };
  }

  const base = `var(--color-${props.tone})`;
  const surface = `var(--color-${props.tone}-surface)`;
  const border = `var(--color-${props.tone}-border)`;

  switch (props.variant) {
    case 'solid':
      return { backgroundColor: base, color: 'var(--color-on-solid)' };
    case 'outline':
      return { border: `1px solid ${border}`, backgroundColor: 'transparent', color: base };
    case 'tonal':
      return { backgroundColor: surface, color: base };
    case 'ghost':
    case 'link':
      return { backgroundColor: 'transparent', color: base };
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :style="{ borderRadius: 'var(--radius-md)', ...toneStyles }"
    :class="[
      'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 select-none',
      'active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-55',
      variant === 'link' && 'underline-offset-4 hover:underline px-1',
      fullWidth && 'w-full',
      iconOnly ? ICON_ONLY_SIZES[size] : SIZE_CLASSES[size],
    ]"
  >
    <span
      v-if="loading"
      aria-hidden="true"
      class="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>
