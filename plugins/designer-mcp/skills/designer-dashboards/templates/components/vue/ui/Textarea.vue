<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    maxCount?: number;
    id?: string;
  }>(),
  { invalid: false, disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="space-y-1">
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }"
      class="min-h-24 w-full border px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-55"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-if="maxCount !== undefined" :style="{ color: 'var(--color-text-muted)' }" class="tabular-nums text-end text-[11px]">
      {{ modelValue.length }} / {{ maxCount }}
    </div>
  </div>
</template>
