<script setup lang="ts">
import { ref, watch } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    fallbackText?: string;
    shape?: 'circle' | 'square';
    maxSizeMb?: number;
    label?: string;
  }>(),
  { modelValue: null, fallbackText: 'RD', shape: 'circle', maxSizeMb: 4, label: 'Upload photo' },
);

const emit = defineEmits<{ change: [file: File | null, previewUrl: string | null] }>();
const inputEl = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(props.modelValue);
const error = ref<string | null>(null);

watch(
  () => props.modelValue,
  (val) => {
    preview.value = val ?? null;
  },
);

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    error.value = `File exceeds ${props.maxSizeMb} MB limit`;
    return;
  }
  error.value = null;
  const url = URL.createObjectURL(file);
  preview.value = url;
  emit('change', file, url);
}

function reset() {
  error.value = null;
  preview.value = null;
  if (inputEl.value) inputEl.value.value = '';
  emit('change', null, null);
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <div
      style="background-color: var(--color-primary-surface); border-color: var(--color-border); color: var(--color-primary)"
      :class="[
        'relative flex size-20 shrink-0 items-center justify-center overflow-hidden border text-lg font-bold',
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
      ]"
    >
      <img v-if="preview" :src="preview" alt="Avatar preview" class="size-full object-cover" />
      <span v-else>{{ fallbackText }}</span>
    </div>
    <div class="space-y-2">
      <input ref="inputEl" type="file" accept="image/*" class="sr-only" @change="onFileChange" />
      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" variant="tonal" tone="primary" size="sm" @click="inputEl?.click()">
          <AppIcon name="upload" :size="14" />
          <span>{{ label }}</span>
        </Button>
        <Button v-if="preview" type="button" variant="ghost" tone="neutral" size="sm" @click="reset">
          Reset
        </Button>
      </div>
      <p :style="{ color: error ? 'var(--color-error)' : 'var(--color-text-muted)' }" class="text-[11px]">
        {{ error || `PNG, JPG or WebP up to ${maxSizeMb} MB` }}
      </p>
    </div>
  </div>
</template>
