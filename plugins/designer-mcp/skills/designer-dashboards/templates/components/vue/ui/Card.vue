<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div
    :style="{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      color: 'var(--color-text)',
    }"
    class="rd-card border"
  >
    <div v-if="title || description || $slots.header" class="flex flex-col gap-1.5 p-6">
      <slot name="header">
        <h3
          v-if="title"
          :style="{ fontWeight: 'var(--font-heading-weight)', color: 'var(--color-text)' }"
          class="text-base leading-none tracking-tight"
        >
          {{ title }}
        </h3>
        <p v-if="description" :style="{ color: 'var(--color-text-muted)' }" class="text-xs leading-relaxed">
          {{ description }}
        </p>
      </slot>
    </div>
    <div class="p-6" :class="{ 'pt-0': title || description || $slots.header }">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      :style="{ borderColor: 'var(--color-border)' }"
      class="flex items-center gap-2 border-t px-6 py-4"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
