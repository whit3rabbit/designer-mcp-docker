<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    showValue?: boolean;
  }>(),
  { max: 100, tone: 'primary', size: 'md', showValue: false },
);

const pct = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)));
const heightClass = computed(() =>
  props.size === 'sm' ? 'h-1.5' : props.size === 'lg' ? 'h-3.5' : 'h-2.5',
);
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="label || showValue" class="flex items-center justify-between text-xs">
      <span v-if="label" :style="{ color: 'var(--color-text)' }" class="font-medium">{{ label }}</span>
      <span v-if="showValue" :style="{ color: 'var(--color-text-muted)' }" class="tabular-nums">
        {{ Math.round(pct) }}%
      </span>
    </div>
    <div
      role="progressbar"
      :aria-label="label"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="value"
      :style="{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-full)' }"
      :class="['w-full overflow-hidden', heightClass]"
    >
      <div
        :style="{
          width: `${pct}%`,
          backgroundColor: `var(--color-${tone})`,
          borderRadius: 'var(--radius-full)',
        }"
        class="h-full transition-[width] duration-300"
      />
    </div>
  </div>
</template>
