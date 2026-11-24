<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ChartWrapper from './ChartWrapper.vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    type?: 'area' | 'line' | 'bar';
    seriesName?: string;
    initialPoints?: number[];
    maxPoints?: number;
    intervalMs?: number;
    height?: number;
  }>(),
  {
    type: 'area',
    seriesName: 'Throughput',
    initialPoints: () => [42, 48, 45, 53, 50, 58, 56, 62, 59, 64],
    maxPoints: 20,
    intervalMs: 2000,
    height: 280,
  },
);

const points = ref<number[]>([...props.initialPoints]);
const labels = ref<string[]>(
  props.initialPoints.map((_, i) => `-${(props.initialPoints.length - i) * (props.intervalMs / 1000)}s`),
);
const paused = ref(false);
let timer: number | undefined;

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    paused.value = true;
    return;
  }
  timer = window.setInterval(() => {
    if (paused.value) return;
    const prev = points.value[points.value.length - 1] ?? 50;
    const nextVal = Math.max(10, Math.round(prev + (Math.random() - 0.48) * 10));
    points.value = [...points.value, nextVal].slice(-props.maxPoints);
    const now = new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
    labels.value = [...labels.value, now].slice(-props.maxPoints);
  }, props.intervalMs);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs">
      <span
        role="status"
        aria-live="polite"
        :style="{ color: paused ? 'var(--color-text-muted)' : 'var(--color-success)' }"
        class="inline-flex items-center gap-1.5 font-medium"
      >
        <span
          aria-hidden="true"
          :style="{
            backgroundColor: paused ? 'var(--color-text-muted)' : 'var(--color-success)',
            borderRadius: 'var(--radius-full)',
          }"
          class="size-2"
        />
        {{ paused ? 'Stream paused' : 'Live stream active' }}
      </span>
      <Button variant="outline" tone="neutral" size="xs" @click="paused = !paused">
        {{ paused ? 'Resume' : 'Pause' }}
      </Button>
    </div>
    <ChartWrapper
      :label="title"
      :type="type"
      :height="height"
      :categories="labels"
      :series="[{ name: seriesName, data: points }]"
      :options="{ chart: { animations: { enabled: false } } }"
    />
  </div>
</template>
