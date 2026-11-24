<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    copyLabel?: string;
    readonly?: boolean;
  }>(),
  { copyLabel: 'Copy to clipboard', readonly: true },
);

const copied = ref(false);

async function copyValue() {
  try {
    await navigator.clipboard.writeText(props.modelValue);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1800);
  } catch {
    // clipboard unavailable
  }
}
</script>

<template>
  <div
    style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
    class="flex w-full items-stretch overflow-hidden border"
  >
    <input
      :value="modelValue"
      :readonly="readonly"
      style="color: var(--color-text)"
      class="h-[38px] min-w-0 flex-1 bg-transparent px-3 font-mono text-xs focus:outline-none"
    />
    <button
      type="button"
      :aria-label="copyLabel"
      style="background-color: var(--color-canvas); border-color: var(--color-border); color: var(--color-text)"
      class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-s px-3 text-xs font-semibold transition-colors hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)]"
      @click="copyValue"
    >
      <AppIcon :name="copied ? 'check' : 'copy'" :size="14" />
      <span>{{ copied ? 'Copied' : 'Copy' }}</span>
    </button>
  </div>
</template>
