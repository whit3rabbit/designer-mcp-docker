<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

const props = defineProps<{
  page: number;
  pageCount: number;
}>();

const emit = defineEmits<{ 'update:page': [page: number] }>();

const pages = computed(() => {
  const total = Math.max(1, props.pageCount);
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | 'ellipsis'> = [1];
  if (props.page > 3) out.push('ellipsis');
  const start = Math.max(2, props.page - 1);
  const end = Math.min(total - 1, props.page + 1);
  for (let i = start; i <= end; i++) out.push(i);
  if (props.page < total - 2) out.push('ellipsis');
  out.push(total);
  return out;
});
</script>

<template>
  <nav aria-label="Pagination" class="flex items-center justify-end gap-1">
    <Button
      variant="outline"
      tone="neutral"
      size="xs"
      icon-only
      aria-label="Previous page"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >
      <AppIcon name="chevron-left" :size="14" class="rtl:rotate-180" />
    </Button>

    <template v-for="(p, idx) in pages" :key="`${p}-${idx}`">
      <span v-if="p === 'ellipsis'" :style="{ color: 'var(--color-text-muted)' }" class="px-1.5 text-xs">
        …
      </span>
      <Button
        v-else
        :variant="p === page ? 'solid' : 'ghost'"
        :tone="p === page ? 'primary' : 'neutral'"
        size="xs"
        :aria-current="p === page ? 'page' : undefined"
        class="tabular-nums min-w-7 px-2"
        @click="emit('update:page', p)"
      >
        {{ p }}
      </Button>
    </template>

    <Button
      variant="outline"
      tone="neutral"
      size="xs"
      icon-only
      aria-label="Next page"
      :disabled="page >= pageCount"
      @click="emit('update:page', page + 1)"
    >
      <AppIcon name="chevron-right" :size="14" class="rtl:rotate-180" />
    </Button>
  </nav>
</template>
