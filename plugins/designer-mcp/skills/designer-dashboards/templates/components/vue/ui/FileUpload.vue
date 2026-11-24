<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    files: File[];
    accept?: string;
    multiple?: boolean;
    maxSizeMb?: number;
    label?: string;
  }>(),
  { multiple: true, maxSizeMb: 10, label: 'Drop files here or click to browse' },
);

const emit = defineEmits<{ 'update:files': [files: File[]] }>();
const inputRef = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

function acceptFiles(incoming: FileList | null) {
  if (!incoming) return;
  const maxBytes = props.maxSizeMb * 1024 * 1024;
  const valid = Array.from(incoming).filter((f) => f.size <= maxBytes);
  emit('update:files', props.multiple ? [...props.files, ...valid] : valid.slice(0, 1));
}
</script>

<template>
  <div class="space-y-3">
    <div
      role="button"
      tabindex="0"
      :style="{
        backgroundColor: dragging ? 'var(--color-primary-surface)' : 'var(--color-canvas)',
        borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }"
      class="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition-colors"
      @click="inputRef?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="dragging = false; acceptFiles($event.dataTransfer?.files ?? null)"
    >
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="sr-only"
        @change="acceptFiles(($event.target as HTMLInputElement).files)"
      />
      <AppIcon name="download" :size="24" class="mb-2 rotate-180" />
      <p :style="{ color: 'var(--color-text)' }" class="text-xs font-semibold">{{ label }}</p>
      <p :style="{ color: 'var(--color-text-muted)' }" class="mt-1 text-[11px]">
        Max file size {{ maxSizeMb }} MB
      </p>
    </div>

    <ul v-if="files.length > 0" class="space-y-2">
      <li
        v-for="(file, idx) in files"
        :key="`${file.name}-${idx}`"
        :style="{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }"
        class="flex items-center justify-between gap-3 border px-3 py-2 text-xs"
      >
        <span :style="{ color: 'var(--color-text)' }" class="truncate font-medium">{{ file.name }}</span>
        <Button
          variant="ghost"
          tone="neutral"
          size="xs"
          icon-only
          :aria-label="`Remove ${file.name}`"
          @click="emit('update:files', files.filter((_, i) => i !== idx))"
        >
          <AppIcon name="x" :size="14" />
        </Button>
      </li>
    </ul>
  </div>
</template>
