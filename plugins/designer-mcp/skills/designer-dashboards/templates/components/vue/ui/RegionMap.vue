<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from '../../@core/icons/AppIcon.vue';
import Button from './Button.vue';
import EmptyState from './EmptyState.vue';

export interface RegionMetric {
  code: string;
  name: string;
  value: number;
  formattedValue?: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    regions: RegionMetric[];
    unit?: string;
    height?: number;
    loading?: boolean;
    empty?: boolean;
  }>(),
  { unit: '', height: 280, loading: false, empty: false },
);

const SEQ_TOKENS = [
  'var(--chart-seq-1)',
  'var(--chart-seq-2)',
  'var(--chart-seq-3)',
  'var(--chart-seq-4)',
  'var(--chart-seq-5)',
];

const showTable = ref(false);
const maxVal = computed(() => Math.max(...props.regions.map((r) => r.value), 1));
const totalVal = computed(() => Math.max(props.regions.reduce((s, r) => s + r.value, 0), 1));
const sorted = computed(() => [...props.regions].sort((a, b) => b.value - a.value));

function pickBucketColor(value: number): string {
  const ratio = Math.min(1, Math.max(0, value / maxVal.value));
  const idx = Math.min(SEQ_TOKENS.length - 1, Math.floor(ratio * SEQ_TOKENS.length));
  return SEQ_TOKENS[idx];
}
</script>

<template>
  <EmptyState v-if="!loading && (empty || regions.length === 0)" :title="`No ${title} data`" description="No regional metrics available." />
  <div v-else class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 text-xs" style="color: var(--color-text-muted)">
        <span>Low</span>
        <span class="inline-flex items-center gap-0.5" aria-hidden="true">
          <span
            v-for="(tok, i) in SEQ_TOKENS"
            :key="i"
            :style="{ backgroundColor: tok, borderRadius: 'var(--radius-sm)' }"
            class="inline-block h-2.5 w-4"
          />
        </span>
        <span>High</span>
      </div>
      <Button variant="ghost" tone="neutral" size="xs" :aria-pressed="showTable" @click="showTable = !showTable">
        <AppIcon name="table" :size="14" />
        <span>{{ showTable ? 'Show map' : 'View data table' }}</span>
      </Button>
    </div>

    <div
      v-if="loading"
      role="status"
      :aria-label="`Loading ${title}`"
      :style="{ height: `${height}px`, backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)' }"
      class="rd-shimmer w-full"
    />
    <div
      v-else-if="showTable"
      style="border-color: var(--color-border); border-radius: var(--radius-md)"
      class="overflow-x-auto border"
    >
      <table class="w-full border-collapse text-start text-xs">
        <caption class="sr-only">{{ title }} regional breakdown</caption>
        <thead>
          <tr style="background-color: var(--color-canvas); color: var(--color-text-muted)">
            <th class="px-3 py-2 text-start font-semibold">Region</th>
            <th class="px-3 py-2 text-end font-semibold">Value</th>
            <th class="px-3 py-2 text-end font-semibold">Share</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in sorted"
            :key="r.code"
            style="border-color: var(--color-border); color: var(--color-text)"
            class="border-t"
          >
            <td class="px-3 py-2 font-medium">{{ r.name }}</td>
            <td class="tabular-nums px-3 py-2 text-end">{{ r.formattedValue ?? `${r.value}${unit ? ` ${unit}` : ''}` }}</td>
            <td class="tabular-nums px-3 py-2 text-end">{{ ((r.value / totalVal) * 100).toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else role="region" :aria-label="title" class="space-y-2.5" :style="{ minHeight: `${height}px` }">
      <div v-for="r in sorted" :key="r.code" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span style="color: var(--color-text)" class="font-medium">{{ r.name }}</span>
          <span style="color: var(--color-text-muted)" class="tabular-nums">
            {{ r.formattedValue ?? `${r.value}${unit ? ` ${unit}` : ''}` }}
          </span>
        </div>
        <div
          style="background-color: var(--color-canvas); border-radius: var(--radius-full)"
          class="h-2 w-full overflow-hidden"
        >
          <div
            :style="{
              width: `${Math.max(6, Math.round((r.value / maxVal) * 100))}%`,
              backgroundColor: pickBucketColor(r.value),
              borderRadius: 'var(--radius-full)',
            }"
            class="h-full transition-all"
          />
        </div>
      </div>
    </div>
  </div>
</template>
