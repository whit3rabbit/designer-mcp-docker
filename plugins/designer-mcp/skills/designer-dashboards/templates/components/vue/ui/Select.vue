<script setup lang="ts">
import AppIcon from '../../@core/icons/AppIcon.vue';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

withDefaults(
  defineProps<{
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    id?: string;
  }>(),
  { invalid: false, disabled: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: invalid ? 'var(--color-error)' : 'var(--color-border)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-md)',
      }"
      class="h-[38px] w-full appearance-none border ps-3 pe-9 text-sm disabled:cursor-not-allowed disabled:opacity-55"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
        {{ opt.label }}
      </option>
    </select>
    <span :style="{ color: 'var(--color-text-muted)' }" class="pointer-events-none absolute inset-y-0 end-3 flex items-center">
      <AppIcon name="chevron-down" :size="16" />
    </span>
  </div>
</template>
