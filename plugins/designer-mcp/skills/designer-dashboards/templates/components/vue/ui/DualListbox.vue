<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';

export interface DualListboxOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    options: DualListboxOption[];
    modelValue: string[];
    availableLabel?: string;
    selectedLabel?: string;
  }>(),
  { availableLabel: 'Available', selectedLabel: 'Selected' },
);

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();
const leftQuery = ref('');
const rightQuery = ref('');

const available = computed(() =>
  props.options.filter(
    (o) => !props.modelValue.includes(o.value) && o.label.toLowerCase().includes(leftQuery.value.toLowerCase()),
  ),
);
const selected = computed(() =>
  props.options.filter(
    (o) => props.modelValue.includes(o.value) && o.label.toLowerCase().includes(rightQuery.value.toLowerCase()),
  ),
);
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
    <div
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
      class="flex flex-1 flex-col overflow-hidden border"
    >
      <div
        style="background-color: var(--color-canvas); border-color: var(--color-border)"
        class="flex items-center justify-between border-b px-3 py-2 text-xs font-semibold"
      >
        <span>{{ availableLabel }}</span>
        <span class="tabular-nums">{{ available.length }}</span>
      </div>
      <ul class="max-h-48 min-h-36 flex-1 divide-y divide-[var(--color-border)] overflow-y-auto">
        <li v-for="opt in available" :key="opt.value">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-start text-xs hover:bg-[var(--color-primary-surface)]"
            @click="emit('update:modelValue', [...modelValue, opt.value])"
          >
            <span>{{ opt.label }}</span>
            <AppIcon name="chevron-right" :size="14" class="rtl:rotate-180" />
          </button>
        </li>
      </ul>
    </div>

    <div class="flex flex-row items-center justify-center gap-1.5 sm:flex-col">
      <Button
        type="button"
        variant="outline"
        tone="neutral"
        size="xs"
        icon-only
        aria-label="Select all items"
        @click="emit('update:modelValue', options.map((o) => o.value))"
      >
        <AppIcon name="chevron-right" :size="14" class="rtl:rotate-180" />
      </Button>
      <Button
        type="button"
        variant="outline"
        tone="neutral"
        size="xs"
        icon-only
        aria-label="Remove all items"
        @click="emit('update:modelValue', [])"
      >
        <AppIcon name="chevron-left" :size="14" class="rtl:rotate-180" />
      </Button>
    </div>

    <div
      style="background-color: var(--color-surface); border-color: var(--color-border); border-radius: var(--radius-md)"
      class="flex flex-1 flex-col overflow-hidden border"
    >
      <div
        style="background-color: var(--color-canvas); border-color: var(--color-border)"
        class="flex items-center justify-between border-b px-3 py-2 text-xs font-semibold"
      >
        <span>{{ selectedLabel }}</span>
        <span class="tabular-nums">{{ selected.length }}</span>
      </div>
      <ul class="max-h-48 min-h-36 flex-1 divide-y divide-[var(--color-border)] overflow-y-auto">
        <li v-for="opt in selected" :key="opt.value">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-start text-xs hover:bg-[var(--color-primary-surface)]"
            @click="emit('update:modelValue', modelValue.filter((v) => v !== opt.value))"
          >
            <span>{{ opt.label }}</span>
            <AppIcon name="chevron-left" :size="14" class="rtl:rotate-180" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
