<script setup lang="ts">
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';
import Input from './Input.vue';

defineProps<{
  search: string;
  searchPlaceholder?: string;
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  reset: [];
}>();
</script>

<template>
  <div
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
    }"
    class="flex flex-wrap items-center justify-between gap-3 border p-4"
  >
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="w-56">
        <Input
          :model-value="search"
          size="sm"
          :placeholder="searchPlaceholder || 'Search...'"
          @update:model-value="emit('update:search', $event)"
        />
      </div>
      <slot />
      <Button variant="ghost" tone="neutral" size="sm" @click="emit('reset')">
        <AppIcon name="rotate-ccw" :size="14" />
        Reset
      </Button>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
