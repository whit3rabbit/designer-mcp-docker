<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <label class="flex cursor-pointer items-start gap-2.5">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :style="{ accentColor: 'var(--color-primary)' }"
      class="mt-0.5 size-4 shrink-0 cursor-pointer rounded"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span v-if="label || description" class="space-y-0.5">
      <span v-if="label" :style="{ color: 'var(--color-text)' }" class="block text-xs font-medium">{{ label }}</span>
      <span v-if="description" :style="{ color: 'var(--color-text-muted)' }" class="block text-[11px]">
        {{ description }}
      </span>
    </span>
  </label>
</template>
