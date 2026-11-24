<script setup lang="ts">
import AppIcon, { type IconName } from '../../@core/icons/AppIcon.vue';
import Badge from './Badge.vue';

export type KpiTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

withDefaults(
  defineProps<{
    label: string;
    value: string;
    delta?: number;
    deltaLabel?: string;
    icon?: IconName;
    tone?: KpiTone;
    loading?: boolean;
  }>(),
  { icon: 'activity', tone: 'primary', loading: false },
);
</script>

<template>
  <article
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
    }"
    class="rd-card flex flex-col justify-between gap-4 border p-6"
  >
    <div v-if="loading" class="space-y-3" aria-busy="true">
      <div class="rd-shimmer h-4 w-24 rounded" />
      <div class="rd-shimmer h-8 w-32 rounded" />
      <div class="rd-shimmer h-4 w-20 rounded" />
    </div>

    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p :style="{ color: 'var(--color-text-muted)' }" class="truncate text-xs font-medium">
            {{ label }}
          </p>
          <p
            :style="{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }"
            class="tabular-nums mt-1.5 text-2xl tracking-tight"
          >
            {{ value }}
          </p>
        </div>
        <span
          aria-hidden="true"
          :style="{
            backgroundColor: `var(--color-${tone}-surface)`,
            color: `var(--color-${tone})`,
            borderRadius: 'var(--radius-md)',
          }"
          class="flex size-10 shrink-0 items-center justify-center"
        >
          <AppIcon :name="icon" :size="20" />
        </span>
      </div>

      <div v-if="delta !== undefined" class="flex items-center gap-2 text-xs">
        <Badge :tone="delta >= 0 ? 'success' : 'error'" variant="tonal">
          <AppIcon :name="delta >= 0 ? 'arrow-up-right' : 'arrow-down-right'" :size="12" />
          <span class="tabular-nums">{{ Math.abs(delta).toFixed(1) }}%</span>
        </Badge>
        <span v-if="deltaLabel" :style="{ color: 'var(--color-text-muted)' }">
          {{ deltaLabel }}
        </span>
      </div>
    </template>
  </article>
</template>
