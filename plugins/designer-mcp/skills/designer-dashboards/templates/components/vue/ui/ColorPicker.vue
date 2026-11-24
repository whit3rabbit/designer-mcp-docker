<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';

const DEFAULT_SWATCHES = [
  'var(--color-primary)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
];

const props = withDefaults(
  defineProps<{
    modelValue: string;
    swatches?: string[];
    label?: string;
  }>(),
  { swatches: () => DEFAULT_SWATCHES, label: 'Pick color' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const copied = ref(false);

async function copyColor() {
  try {
    await navigator.clipboard.writeText(props.modelValue);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1500);
  } catch {
    // clipboard unavailable
  }
}
</script>

<template>
  <div class="space-y-2.5">
    <div
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
      class="flex items-center gap-2 border p-1.5"
    >
      <label
        :aria-label="label"
        :style="{ backgroundColor: modelValue, borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }"
        class="relative size-7 shrink-0 cursor-pointer overflow-hidden border"
      >
        <input
          type="color"
          :value="/^#[0-9a-fA-F]{6}$/.test(modelValue) ? modelValue : ''"
          class="absolute inset-0 size-full cursor-pointer opacity-0"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <input
        type="text"
        aria-label="Color value"
        :value="modelValue"
        placeholder="Hex or CSS token"
        style="color: var(--color-text)"
        class="min-w-0 flex-1 bg-transparent px-1.5 font-mono text-xs focus:outline-none"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        aria-label="Copy color value"
        style="color: var(--color-text-muted)"
        class="cursor-pointer p-1 hover:text-[var(--color-text)]"
        @click="copyColor"
      >
        <AppIcon :name="copied ? 'check' : 'copy'" :size="14" />
      </button>
    </div>
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        v-for="swatch in swatches"
        :key="swatch"
        type="button"
        :aria-label="`Select color ${swatch}`"
        :aria-pressed="modelValue === swatch"
        :style="{
          backgroundColor: swatch,
          borderColor: modelValue === swatch ? 'var(--color-text)' : 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
        }"
        class="size-6 cursor-pointer border-2 transition-transform hover:scale-110"
        @click="emit('update:modelValue', swatch)"
      />
    </div>
  </div>
</template>
