<script setup lang="ts" generic="T">
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

withDefaults(
  defineProps<{
    items: T[];
    addLabel?: string;
    emptyLabel?: string;
    minItems?: number;
    maxItems?: number;
  }>(),
  { addLabel: 'Add item', emptyLabel: 'No items added yet.', minItems: 0 },
);

const emit = defineEmits<{ add: []; remove: [index: number] }>();
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="items.length === 0"
      style="background-color: var(--color-canvas); border-color: var(--color-border); color: var(--color-text-muted); border-radius: var(--radius-md)"
      class="border border-dashed px-4 py-6 text-center text-xs"
    >
      {{ emptyLabel }}
    </div>
    <div v-else class="space-y-2.5">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
        class="flex items-start gap-3 border p-3"
      >
        <div class="min-w-0 flex-1">
          <slot :item="item" :index="idx" />
        </div>
        <Button
          v-if="items.length > minItems"
          type="button"
          variant="ghost"
          tone="error"
          size="xs"
          icon-only
          :aria-label="`Remove item ${idx + 1}`"
          @click="emit('remove', idx)"
        >
          <AppIcon name="trash-2" :size="14" />
        </Button>
      </div>
    </div>

    <Button
      v-if="maxItems === undefined || items.length < maxItems"
      type="button"
      variant="outline"
      tone="primary"
      size="sm"
      @click="emit('add')"
    >
      <AppIcon name="plus" :size="14" />
      <span>{{ addLabel }}</span>
    </Button>
  </div>
</template>
