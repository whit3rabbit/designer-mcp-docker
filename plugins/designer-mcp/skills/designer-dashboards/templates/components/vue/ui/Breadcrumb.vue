<script setup lang="ts">
import AppIcon from '../../@core/icons/AppIcon.vue';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

defineProps<{ items: BreadcrumbItem[] }>();
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center text-xs">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li v-for="(item, idx) in items" :key="`${item.label}-${idx}`" class="flex items-center gap-1.5">
        <AppIcon v-if="idx > 0" name="chevron-right" :size="14" class="rtl:rotate-180" />
        <span
          v-if="idx === items.length - 1"
          aria-current="page"
          :style="{ color: 'var(--color-text)' }"
          class="font-semibold"
        >
          {{ item.label }}
        </span>
        <a
          v-else-if="item.href"
          :href="item.href"
          :style="{ color: 'var(--color-text-muted)' }"
          class="transition-colors hover:underline"
        >
          {{ item.label }}
        </a>
        <span v-else :style="{ color: 'var(--color-text-muted)' }">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
