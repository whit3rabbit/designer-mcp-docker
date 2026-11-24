<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" :style="{ color: 'var(--color-text)' }" class="block text-xs font-semibold">
      {{ label }}
      <span v-if="required" :style="{ color: 'var(--color-error)' }" class="ms-0.5" aria-hidden="true">*</span>
    </label>
    <slot />
    <p v-if="error" :id="`${id}-error`" role="alert" :style="{ color: 'var(--color-error)' }" class="text-xs">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" :style="{ color: 'var(--color-text-muted)' }" class="text-xs">
      {{ hint }}
    </p>
  </div>
</template>
